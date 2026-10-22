import { AGE_CATEGORIES, DOG_SIZES, GENDERS, type AgeCategory, type DogSize, type Gender } from '@dogadopt/contracts';

/**
 * Every filter the home page supports, as it appears in the URL query
 * string. The URL is the single source of truth so a view can be shared.
 */
export interface DogFilters {
  q?: string;
  size?: DogSize;
  age?: AgeCategory;
  gender?: Gender;
  breed?: string;
  region?: string;
  rescueId?: string;
  goodWithKids?: true;
  goodWithDogs?: true;
  goodWithCats?: true;
  lat?: number;
  lng?: number;
  page: number;
}

const ENUMS = {
  size: DOG_SIZES,
  age: AGE_CATEGORIES,
  gender: GENDERS,
} as const;

export function filtersFromSearchParams(params: URLSearchParams): DogFilters {
  const pick = <T extends string>(key: string, allowed: readonly T[]): T | undefined => {
    const v = params.get(key);
    return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
  };
  const text = (key: string) => params.get(key)?.trim() || undefined;
  const flag = (key: string) => (params.get(key) === 'true' ? (true as const) : undefined);
  const num = (key: string) => {
    const v = params.get(key);
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const page = num('page');
  const lat = num('lat');
  const lng = num('lng');
  return {
    q: text('q'),
    size: pick('size', ENUMS.size),
    age: pick('age', ENUMS.age),
    gender: pick('gender', ENUMS.gender),
    breed: text('breed'),
    region: text('region'),
    rescueId: text('rescueId'),
    goodWithKids: flag('goodWithKids'),
    goodWithDogs: flag('goodWithDogs'),
    goodWithCats: flag('goodWithCats'),
    lat: lat !== undefined && lng !== undefined ? lat : undefined,
    lng: lat !== undefined && lng !== undefined ? lng : undefined,
    page: page && page >= 1 ? Math.floor(page) : 1,
  };
}

export function filtersToSearchParams(filters: DogFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '' || (key === 'page' && value === 1)) continue;
    params.set(key, String(value));
  }
  return params;
}

/** Query parameters for listDogs, minus page handling which the caller adds. */
export function filtersToQuery(filters: DogFilters) {
  const { page, ...rest } = filters;
  return { ...rest, page };
}

export function countActiveFilters(filters: DogFilters): number {
  return Object.entries(filters).filter(([key, value]) => key !== 'page' && key !== 'lng' && value !== undefined).length;
}

export interface FilterChip {
  key: string;
  label: string;
  /** The change that removes just this filter. */
  remove: Partial<DogFilters>;
}

/**
 * One chip per active filter, in the order the controls appear, with a
 * readable label. `rescueName` turns a rescue id into its name.
 */
export function activeFilterChips(filters: DogFilters, rescueName: (id: string) => string | undefined = () => undefined): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.q) chips.push({ key: 'q', label: `Search: ${filters.q}`, remove: { q: undefined } });
  if (filters.lat !== undefined) chips.push({ key: 'near', label: 'Near me', remove: { lat: undefined, lng: undefined } });
  if (filters.size) chips.push({ key: 'size', label: filters.size, remove: { size: undefined } });
  if (filters.age) chips.push({ key: 'age', label: filters.age, remove: { age: undefined } });
  if (filters.gender) chips.push({ key: 'gender', label: filters.gender, remove: { gender: undefined } });
  if (filters.breed) chips.push({ key: 'breed', label: filters.breed, remove: { breed: undefined } });
  if (filters.region) chips.push({ key: 'region', label: filters.region, remove: { region: undefined } });
  if (filters.rescueId) chips.push({ key: 'rescueId', label: rescueName(filters.rescueId) ?? 'Selected rescue', remove: { rescueId: undefined } });
  if (filters.goodWithKids) chips.push({ key: 'goodWithKids', label: 'Good with children', remove: { goodWithKids: undefined } });
  if (filters.goodWithDogs) chips.push({ key: 'goodWithDogs', label: 'Good with other dogs', remove: { goodWithDogs: undefined } });
  if (filters.goodWithCats) chips.push({ key: 'goodWithCats', label: 'Good with cats', remove: { goodWithCats: undefined } });
  return chips;
}
