import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/test/render';
import { json, mockApi } from '@/test/mockApi';
import { CARDIFF, DOGS_TRUST, page } from '@/test/fixtures';

describe('Feature: Browsing dogs on the website', () => {
  it('Scenario: Rescues are listed with their dog counts', async () => {
    const api = mockApi((url) => (url.pathname === '/v1/rescues' && url.searchParams.get('region') === 'National' ? json(page([DOGS_TRUST])) : undefined));
    const { router } = renderApp('/rescues');
    const user = userEvent.setup();

    const cards = await screen.findAllByTestId('rescue-card');
    expect(cards).toHaveLength(2);
    expect(within(cards[0]!).getByText('2 dogs')).toBeInTheDocument();
    expect(within(cards[1]!).getByText('1 dog')).toBeInTheDocument();

    await user.selectOptions(await screen.findByLabelText('Region'), 'National');
    await waitFor(() => expect(api.last('/v1/rescues')!.url.searchParams.get('region')).toBe('National'));
    expect(new URLSearchParams(router.state.location.search).get('region')).toBe('National');
    await waitFor(() => expect(screen.getAllByTestId('rescue-card')).toHaveLength(1));
  });

  it('Scenario: A rescue page lists its dogs and contact details', async () => {
    const api = mockApi();
    renderApp(`/rescues/${CARDIFF.id}`);

    expect(await screen.findByRole('heading', { level: 1, name: 'Cardiff Dogs Home' })).toBeInTheDocument();
    const contact = screen.getByRole('region', { name: 'Contact details' });
    expect(within(contact).getByText(CARDIFF.phone!)).toBeInTheDocument();
    expect(within(contact).getByText(CARDIFF.email!)).toBeInTheDocument();
    expect(within(contact).getByText(CARDIFF.address!)).toBeInTheDocument();
    expect(within(contact).getByRole('link', { name: 'www.cardiffdogshome.co.uk' })).toHaveAttribute('href', CARDIFF.website);

    const cards = await screen.findAllByTestId('dog-card');
    expect(cards).toHaveLength(2);
    expect(api.last(`/v1/rescues/${CARDIFF.id}/dogs`)).toBeDefined();
  });
});
