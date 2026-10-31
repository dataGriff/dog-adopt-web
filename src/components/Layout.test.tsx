import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '@/test/render';
import { mockApi } from '@/test/mockApi';

describe('Keyboard navigation', () => {
  it('the first Tab stop is a skip link that targets the main content', async () => {
    mockApi();
    renderApp('/about');
    const user = userEvent.setup();
    await screen.findByRole('heading', { level: 1 });

    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute('href', '#main');
    expect(document.getElementById('main')?.tagName).toBe('MAIN');
  });
});
