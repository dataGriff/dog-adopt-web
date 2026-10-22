import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/test/render';
import { failing, json, mockApi } from '@/test/mockApi';
import { BELLA, DOT, MAX, page } from '@/test/fixtures';
import { SEARCH_DEBOUNCE_MS } from '@/components/SearchBar';

describe('Feature: Browsing dogs on the website', () => {
  it('Scenario: The home page lists enquirable dogs', async () => {
    const api = mockApi();
    renderApp('/');
    const cards = await screen.findAllByTestId('dog-card');
    expect(cards).toHaveLength(3);
    expect(api.last('/v1/dogs')).toBeDefined();

    const bella = cards[0]!;
    expect(within(bella).getByRole('heading', { name: 'Bella' })).toBeInTheDocument();
    expect(within(bella).getByText('Staffordshire Bull Terrier')).toBeInTheDocument();
    expect(within(bella).getByText('Adult')).toBeInTheDocument();
    expect(within(bella).getByText('Medium')).toBeInTheDocument();
    expect(within(bella).getByText('Female')).toBeInTheDocument();
    expect(within(bella).getByRole('link', { name: 'Cardiff Dogs Home' })).toBeInTheDocument();
    expect(within(bella).getByRole('link', { name: /Rescue profile/ })).toHaveAttribute('href', BELLA.profileUrl);

    // Dot has no profileUrl so no profile link.
    const dot = cards[2]!;
    expect(within(dot).queryByRole('link', { name: /Rescue profile/ })).not.toBeInTheDocument();
  });

  it('Scenario: Filters narrow the list through the API', async () => {
    const api = mockApi((url) => (url.pathname === '/v1/dogs' && url.searchParams.get('size') === 'Small' ? json(page([DOT])) : undefined));
    const { router } = renderApp('/');
    const user = userEvent.setup();
    await screen.findAllByTestId('dog-card');

    await user.selectOptions(screen.getByLabelText('Size'), 'Small');
    await user.selectOptions(screen.getByLabelText('Gender'), 'Female');

    await waitFor(() => {
      const last = api.last('/v1/dogs')!;
      expect(last.url.searchParams.get('size')).toBe('Small');
      expect(last.url.searchParams.get('gender')).toBe('Female');
    });
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get('size')).toBe('Small');
    expect(params.get('gender')).toBe('Female');
    await waitFor(() => expect(screen.getAllByTestId('dog-card')).toHaveLength(1));
    expect(screen.getByRole('heading', { name: 'Dot' })).toBeInTheDocument();
  });

  it('Scenario: Searching by name or breed', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const api = mockApi();
      const { router } = renderApp('/');
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await screen.findAllByTestId('dog-card');
      const before = api.all('/v1/dogs').length;

      await user.type(screen.getByLabelText('Search by name or breed'), 'staff');
      // Nothing is sent while typing.
      expect(api.all('/v1/dogs').length).toBe(before);

      await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS + 50);
      await waitFor(() => expect(api.last('/v1/dogs')!.url.searchParams.get('q')).toBe('staff'));
      expect(new URLSearchParams(router.state.location.search).get('q')).toBe('staff');
    } finally {
      vi.useRealTimers();
    }
  });

  it('Scenario: Near me orders dogs by distance', async () => {
    const withDistance = [
      { ...BELLA, distanceKm: 3.26 },
      { ...MAX, distanceKm: 3.26 },
      DOT, // no coordinates: no distanceKm, shown last as the API ordered it
    ];
    const api = mockApi((url) => (url.pathname === '/v1/dogs' && url.searchParams.has('lat') ? json(page(withDistance)) : undefined));
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (ok: PositionCallback) => ok({ coords: { latitude: 51.5, longitude: -3.2 } } as GeolocationPosition),
      },
    });
    const { router } = renderApp('/');
    const user = userEvent.setup();
    await screen.findAllByTestId('dog-card');

    await user.click(screen.getByRole('button', { name: /Near me/ }));

    await waitFor(() => {
      const last = api.last('/v1/dogs')!;
      expect(last.url.searchParams.get('lat')).toBe('51.5');
      expect(last.url.searchParams.get('lng')).toBe('-3.2');
    });
    expect(new URLSearchParams(router.state.location.search).get('lat')).toBe('51.5');
    const cards = await screen.findAllByTestId('dog-card');
    expect(within(cards[0]!).getByText('3.3 km')).toBeInTheDocument();
    expect(within(cards[2]!).getByRole('heading', { name: 'Dot' })).toBeInTheDocument();
    expect(within(cards[2]!).queryByText(/km$/)).not.toBeInTheDocument();
  });

  it('Scenario: Near me can be cleared and does not snap back', async () => {
    const api = mockApi();
    vi.stubGlobal('navigator', {
      ...navigator,
      geolocation: {
        getCurrentPosition: (ok: PositionCallback) => ok({ coords: { latitude: 51.5, longitude: -3.2 } } as GeolocationPosition),
      },
    });
    const { router } = renderApp('/');
    const user = userEvent.setup();
    await screen.findAllByTestId('dog-card');

    await user.click(screen.getByRole('button', { name: /Near me/ }));
    await waitFor(() => expect(new URLSearchParams(router.state.location.search).get('lat')).toBe('51.5'));

    // Clear every filter from the sidebar: the location must go and stay gone.
    await user.click(screen.getByRole('button', { name: /Clear/ }));
    await waitFor(() => expect(router.state.location.search).toBe(''));
    await waitFor(() => expect(api.last('/v1/dogs')!.url.searchParams.has('lat')).toBe(false));
    expect(screen.getByRole('button', { name: /Near me/ })).toBeInTheDocument();

    // Back to the located URL and forward again: history is not trapped.
    await router.navigate(-1);
    await waitFor(() => expect(new URLSearchParams(router.state.location.search).get('lat')).toBe('51.5'));
    await router.navigate(-1);
    await waitFor(() => expect(router.state.location.search).toBe(''));
    await new Promise((r) => setTimeout(r, 50));
    expect(router.state.location.search).toBe('');
  });

  it('Scenario: Active filters show as chips that remove one filter each', async () => {
    const api = mockApi();
    const { router } = renderApp('/?size=Small&goodWithCats=true&page=2');
    const user = userEvent.setup();
    const chips = await screen.findByTestId('active-filters');
    expect(within(chips).getByText('Small')).toBeInTheDocument();
    expect(within(chips).getByText('Good with cats')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove filter: Small' }));
    await waitFor(() => {
      const params = new URLSearchParams(router.state.location.search);
      expect(params.get('size')).toBeNull();
      expect(params.get('goodWithCats')).toBe('true');
      expect(params.get('page')).toBeNull();
    });
    await waitFor(() => expect(api.last('/v1/dogs')!.url.searchParams.has('size')).toBe(false));

    await user.click(screen.getByRole('button', { name: 'Remove filter: Good with cats' }));
    await waitFor(() => expect(router.state.location.search).toBe(''));
    expect(screen.queryByTestId('active-filters')).not.toBeInTheDocument();
  });

  it('Scenario: On small screens the filters sit behind a toggle', async () => {
    mockApi();
    renderApp('/?size=Small');
    const user = userEvent.setup();
    await screen.findAllByTestId('dog-card');
    const toggle = screen.getByRole('button', { name: /Filters/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'filters-panel');
    expect(within(toggle).getByText('1')).toBeInTheDocument();
    expect(document.getElementById('filters-panel')).toHaveClass('hidden', 'lg:block');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('filters-panel')).not.toHaveClass('hidden');
  });

  it('Scenario: Paging through results', async () => {
    const api = mockApi((url) => {
      if (url.pathname !== '/v1/dogs') return undefined;
      const p = Number(url.searchParams.get('page') ?? 1);
      return json(page(p === 1 ? [BELLA, MAX] : [DOT], p, 2, 6));
    });
    const { router } = renderApp('/');
    const user = userEvent.setup();
    await screen.findAllByTestId('dog-card');
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => expect(api.last('/v1/dogs')!.url.searchParams.get('page')).toBe('2'));
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('2');
    await screen.findByText('Page 2 of 3');
  });

  it('Scenario: Errors from the API are shown, not hidden', async () => {
    let broken = true;
    mockApi((url) => (url.pathname === '/v1/dogs' && broken ? failing(url, undefined) : undefined));
    renderApp('/');
    const user = userEvent.setup();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Dogs could not be loaded');

    broken = false;
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findAllByTestId('dog-card')).toHaveLength(3);
  });

  it('Scenario: Data freshness is disclosed', async () => {
    mockApi();
    renderApp('/about');
    const disclaimer = screen.getByTestId('freshness-disclaimer');
    expect(disclaimer).toHaveTextContent(/gathered from rescue websites and may lag behind them/);
    expect(within(disclaimer).getByRole('link', { name: 'rescue' })).toHaveAttribute('href', '/rescues');
  });

  it('Scenario: Data freshness is disclosed (each dog shows when it was last seen listed)', async () => {
    mockApi();
    renderApp('/');
    const cards = await screen.findAllByTestId('dog-card');
    expect(within(cards[0]!).getByText(/Last seen listed/)).toBeInTheDocument();
  });
});
