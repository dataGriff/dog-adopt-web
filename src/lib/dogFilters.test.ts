import { describe, expect, it } from 'vitest';
import { activeFilterChips, filtersFromSearchParams } from './dogFilters';

describe('activeFilterChips', () => {
  it('has no chips when nothing is filtered', () => {
    expect(activeFilterChips(filtersFromSearchParams(new URLSearchParams('page=3')))).toEqual([]);
  });

  it('labels every active filter readably and knows how to remove it', () => {
    const filters = filtersFromSearchParams(
      new URLSearchParams('q=staff&lat=51.5&lng=-3.2&size=Small&age=Puppy&gender=Female&breed=Beagle&region=London&rescueId=r1&goodWithKids=true&goodWithDogs=true&goodWithCats=true'),
    );
    const chips = activeFilterChips(filters, (id) => (id === 'r1' ? 'Battersea' : undefined));
    expect(chips.map((c) => c.label)).toEqual([
      'Search: staff',
      'Near me',
      'Small',
      'Puppy',
      'Female',
      'Beagle',
      'London',
      'Battersea',
      'Good with children',
      'Good with other dogs',
      'Good with cats',
    ]);
    expect(chips.find((c) => c.key === 'near')!.remove).toEqual({ lat: undefined, lng: undefined });
    expect(chips.find((c) => c.key === 'size')!.remove).toEqual({ size: undefined });
  });

  it('falls back to a generic label when the rescue name is not loaded yet', () => {
    const chips = activeFilterChips(filtersFromSearchParams(new URLSearchParams('rescueId=unknown')));
    expect(chips[0]!.label).toBe('Selected rescue');
  });
});
