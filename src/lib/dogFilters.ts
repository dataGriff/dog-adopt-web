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
