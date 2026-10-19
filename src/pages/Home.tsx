import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { useDogs } from '@/api/queries';
import { countActiveFilters, filtersFromSearchParams, filtersToSearchParams, type DogFilters } from '@/lib/dogFilters';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useGeolocation } from '@/lib/useGeolocation';
import { pageTitle } from '@/lib/format';
import { DogGrid } from '@/components/DogGrid';
import { ErrorState } from '@/components/ErrorState';
import { FilterSidebar } from '@/components/FilterSidebar';
import { PaginationControls } from '@/components/PaginationControls';
import { SearchBar } from '@/components/SearchBar';

export function HomePage() {
  useDocumentTitle(pageTitle('Find a rescue dog'));
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const geo = useGeolocation();

  const update = useCallback(
    (patch: Partial<DogFilters>, resetPage = true) => {
      const next = { ...filters, ...patch };
      if (resetPage) next.page = 1;
      setSearchParams(filtersToSearchParams(next));
    },
    [filters, setSearchParams],
  );

  // When the browser grants a position, put it in the URL so the view is shareable.
  useEffect(() => {
    if (geo.state.status !== 'granted') return;
    const { lat, lng } = geo.state.coords;
    if (filters.lat !== lat || filters.lng !== lng) update({ lat, lng });
  }, [geo.state, filters.lat, filters.lng, update]);

  const dogs = useDogs({
    page: filters.page,
    q: filters.q,
    size: filters.size,
    age: filters.age,
    gender: filters.gender,
    breed: filters.breed,
    region: filters.region,
    rescueId: filters.rescueId,
    goodWithKids: filters.goodWithKids,
    goodWithDogs: filters.goodWithDogs,
    goodWithCats: filters.goodWithCats,
    lat: filters.lat,
    lng: filters.lng,
  });

  const nearMe = filters.lat !== undefined ? 'on' : geo.state.status === 'locating' ? 'locating' : geo.state.status === 'denied' ? 'denied' : 'idle';

  return (
    <>
      <section className="bg-hero">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            Find a rescue dog <span className="text-primary">near you</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Dogs listed by rescue organisations across the UK, gathered in one place so adopting is as easy as buying.
          </p>
          <div className="mt-6 max-w-2xl">
            <SearchBar
              value={filters.q ?? ''}
              onSearch={(q) => update({ q: q || undefined })}
              nearMe={nearMe}
              onNearMe={geo.locate}
              onClearNearMe={() => {
                geo.reset();
                update({ lat: undefined, lng: undefined });
              }}
              locationMessage={geo.state.status === 'denied' ? geo.state.message : undefined}
            />
          </div>
        </div>
      </section>

      <section id="dogs" className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[280px_1fr]">
        <FilterSidebar filters={filters} onChange={(patch) => update(patch)} onClear={() => setSearchParams(new URLSearchParams())} activeCount={countActiveFilters(filters)} />

        <div>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold">Dogs looking for a home</h2>
            {dogs.data && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {dogs.data.meta.total} {dogs.data.meta.total === 1 ? 'dog' : 'dogs'}
              </p>
            )}
          </div>

          {dogs.isError ? (
            <ErrorState what="Dogs" detail={dogs.error.message} onRetry={() => dogs.refetch()} />
          ) : (
            <>
              <DogGrid dogs={dogs.data?.items} loading={dogs.isFetching} emptyMessage="No dogs match these filters. Try widening your search." />
              {dogs.data && <PaginationControls meta={dogs.data.meta} onPage={(page) => update({ page }, false)} />}
            </>
          )}
        </div>
      </section>
    </>
  );
}
