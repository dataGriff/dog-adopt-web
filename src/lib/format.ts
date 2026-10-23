import type { Compatibility, Dog, DogStatus } from '@dogadopt/contracts';

export const STATUS_LABELS: Record<DogStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  fostered: 'In foster',
  on_hold: 'On hold',
  adopted: 'Adopted',
  withdrawn: 'No longer listed',
};

export function formatStatus(status: DogStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/** The three words the feature file requires for a compatibility flag. */
export function compatibilityWord(value: Compatibility): 'Yes' | 'No' | 'Not known' {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return 'Not known';
}

export function breedLine(dog: Pick<Dog, 'breeds' | 'unresolvedBreeds'>): string {
  const names = [...dog.breeds, ...dog.unresolvedBreeds];
  return names.length ? names.join(' / ') : 'Breed not stated';
}

export function formatDistance(km: number | undefined): string | null {
  if (km === undefined || Number.isNaN(km)) return null;
  return `${km.toFixed(1)} km`;
}

const DAY = 24 * 60 * 60 * 1000;

/** "today", "yesterday", "3 days ago", or a date for anything older than a month. */
export function relativeDay(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return 'unknown';
  const days = Math.floor((startOfDay(now) - startOfDay(then)) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 31) return `${days} days ago`;
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function startOfDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function pageTitle(...parts: (string | null | undefined)[]): string {
  return [...parts.filter(Boolean), 'Dog Adopt'].join(' | ');
}
