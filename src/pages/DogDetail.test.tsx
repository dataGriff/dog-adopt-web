import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderApp } from '@/test/render';
import { mockApi } from '@/test/mockApi';
import { BELLA } from '@/test/fixtures';

describe('Feature: Browsing dogs on the website', () => {
  it('Scenario: A dog has its own page', async () => {
    const api = mockApi();
    renderApp(`/dogs/${BELLA.id}`);

    expect(await screen.findByRole('heading', { level: 1, name: 'Bella' })).toBeInTheDocument();
    expect(api.last(`/v1/dogs/${BELLA.id}`)).toBeDefined();

    // Compatibility as yes / no / not known.
    expect(screen.getByText('Good with kids').closest('div')).toHaveTextContent('Yes');
    expect(screen.getByText('Good with dogs').closest('div')).toHaveTextContent('Not known');
    expect(screen.getByText('Good with cats').closest('div')).toHaveTextContent('No');

    // Rescue block.
    expect(screen.getByRole('link', { name: 'Cardiff Dogs Home' })).toHaveAttribute('href', `/rescues/${BELLA.rescue.id}`);
    expect(screen.getByText('South Wales')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Rescue website/ })).toHaveAttribute('href', BELLA.rescue.website);
    expect(screen.getByRole('link', { name: /profile/ })).toHaveAttribute('href', BELLA.profileUrl);
    expect(screen.getByTestId('last-seen')).toBeInTheDocument();

    await waitFor(() => expect(document.title).toBe('Bella at Cardiff Dogs Home | Dog Adopt'));
  });

  it('Scenario: An unknown dog shows not found', async () => {
    mockApi();
    renderApp('/dogs/00000000-0000-4000-8000-000000000000');
    expect(await screen.findByRole('heading', { name: /couldn't find that dog/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to all dogs/ })).toHaveAttribute('href', '/');
  });
});
