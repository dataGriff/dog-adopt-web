import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { DogPhoto } from './DogPhoto';
import { DogCard } from './DogCard';
import { initialOf } from '@/lib/format';
import { BELLA, DOT } from '@/test/fixtures';

describe('DogPhoto', () => {
  it('shows the linked photo, and falls back to the placeholder if it fails to load', () => {
    render(<DogPhoto dog={{ ...BELLA, imageUrl: 'https://rescue.example/bella.jpg' }} />);
    const img = screen.getByRole('img', { name: /Bella/ });
    expect(screen.queryByTestId('photo-placeholder')).not.toBeInTheDocument();

    fireEvent.error(img);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByTestId('photo-placeholder')).toHaveTextContent('B');
  });

  it('tries again when the dog gets a different photo link', () => {
    const { rerender } = render(<DogPhoto dog={{ ...BELLA, imageUrl: 'https://rescue.example/old.jpg' }} />);
    fireEvent.error(screen.getByRole('img'));
    rerender(<DogPhoto dog={{ ...BELLA, imageUrl: 'https://rescue.example/new.jpg' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://rescue.example/new.jpg');
  });
});

describe('initialOf', () => {
  it.each([
    ['Bella', 'B'],
    ['  bella', 'B'],
    ['🐾 Bella', 'B'],
    ['"Bella"', 'B'],
    ['(Rex)', 'R'],
    ['Élodie', 'É'],
    ['007', '0'],
    ['🐾', '?'],
  ])('%s -> %s', (name, expected) => {
    expect(initialOf(name)).toBe(expected);
  });
});

describe('DogCard photo link', () => {
  const renderCard = (dog: typeof BELLA) =>
    render(<RouterProvider router={createMemoryRouter([{ path: '/', element: <DogCard dog={dog} /> }])} />);

  it('is a mouse shortcut only: out of the tab order and the accessibility tree', () => {
    const { container } = renderCard(DOT);
    const photoLink = container.querySelector('[data-testid="photo-placeholder"]')!.closest('a')!;
    expect(photoLink).toHaveAttribute('tabindex', '-1');
    expect(photoLink).toHaveAttribute('aria-hidden', 'true');
    // The links assistive tech sees are the name link and Details, both to the same page.
    const links = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === `/dogs/${DOT.id}`);
    expect(links.map((a) => a.textContent?.trim())).toEqual([DOT.name, 'Details']);
  });

  it('keeps the status and distance badges readable', () => {
    renderCard({ ...BELLA, distanceKm: 3.26 });
    expect(screen.getByText('Available')).toBeVisible();
    expect(screen.getByText('Available').closest('[aria-hidden="true"]')).toBeNull();
    expect(screen.getByText('3.3 km').closest('[aria-hidden="true"]')).toBeNull();
  });
});
