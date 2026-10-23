import { useQuery } from '@tanstack/react-query';
import type { Breed, Dog, DogPage, Problem, Rescue, RescuePage, operations } from '@dogadopt/contracts';
import { api } from './client';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: Problem | undefined,
  ) {
    super(problem?.detail ?? problem?.title ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
  }
  get notFound() {
    return this.status === 404;
  }
}

function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || result.data === undefined) {
    throw new ApiError(result.response.status, result.error as Problem | undefined);
  }
  return result.data;
}

/** Query params exactly as the OpenAPI operations type them. */
export type ListDogsQuery = NonNullable<operations['listDogs']['parameters']['query']>;
export type ListRescuesQuery = NonNullable<operations['listRescues']['parameters']['query']>;
export type ListRescueDogsQuery = NonNullable<operations['listRescueDogs']['parameters']['query']>;

/** Retry policy for the QueryClient: never retry a 4xx, retry a 5xx or network error twice. */
export const retryUnlessClientError = (failureCount: number, error: unknown) =>
  !(error instanceof ApiError && error.status < 500) && failureCount < 2;

export function useDogs(query: ListDogsQuery) {
  return useQuery<DogPage, ApiError>({
    queryKey: ['dogs', query],
    queryFn: async () => unwrap(await api.GET('/v1/dogs', { params: { query } })),
    placeholderData: (previous) => previous,
  });
}

export function useDog(dogId: string | undefined) {
  return useQuery<Dog, ApiError>({
    queryKey: ['dog', dogId],
    queryFn: async () => unwrap(await api.GET('/v1/dogs/{dogId}', { params: { path: { dogId: dogId! } } })),
    enabled: Boolean(dogId),
  });
}

export function useRescues(query: ListRescuesQuery) {
  return useQuery<RescuePage, ApiError>({
    queryKey: ['rescues', query],
    queryFn: async () => unwrap(await api.GET('/v1/rescues', { params: { query } })),
    placeholderData: (previous) => previous,
  });
}

/** Every rescue, for filter dropdowns. Pages through the API's maximum page size. */
export function useAllRescues() {
  return useQuery<Rescue[], ApiError>({
    queryKey: ['rescues', 'all'],
    queryFn: async () => {
      const items: Rescue[] = [];
      let page = 1;
      for (;;) {
        const data = unwrap(await api.GET('/v1/rescues', { params: { query: { page, pageSize: 100 } } }));
        items.push(...data.items);
        if (page >= data.meta.totalPages) break;
        page += 1;
      }
      return items;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useRescue(rescueId: string | undefined) {
  return useQuery<Rescue, ApiError>({
    queryKey: ['rescue', rescueId],
    queryFn: async () => unwrap(await api.GET('/v1/rescues/{rescueId}', { params: { path: { rescueId: rescueId! } } })),
    enabled: Boolean(rescueId),
  });
}

export function useRescueDogs(rescueId: string | undefined, query: ListRescueDogsQuery) {
  return useQuery<DogPage, ApiError>({
    queryKey: ['rescue', rescueId, 'dogs', query],
    queryFn: async () => unwrap(await api.GET('/v1/rescues/{rescueId}/dogs', { params: { path: { rescueId: rescueId! }, query } })),
    enabled: Boolean(rescueId),
    placeholderData: (previous) => previous,
  });
}

export function useBreeds() {
  return useQuery<Breed[], ApiError>({
    queryKey: ['breeds'],
    queryFn: async () => unwrap(await api.GET('/v1/breeds')).items,
    staleTime: 60 * 60 * 1000,
  });
}
