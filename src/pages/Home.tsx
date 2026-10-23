import { useCallback, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { useAllRescues, useDogs } from '@/api/queries';
import { activeFilterChips, countActiveFilters, filtersFromSearchParams, filtersToSearchParams, type DogFilters } from '@/lib/dogFilters';
import { cn } from '@/lib/utils';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { useGeolocation } from '@/lib/useGeolocation';
import { pageTitle } from '@/lib/format';
import { ActiveFilters } from '@/components/ActiveFilters';
import { DogGrid } from '@/components/DogGrid';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ErrorState';
import { FilterSidebar } from '@/components/FilterSidebar';
import { PaginationControls } from '@/components/PaginationControls';
import { SearchBar } from '@/components/SearchBar';

export function HomePage() {
  useDocumentTitle(pageTitle('Find a rescue dog'));
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const geo = useGeolocation();
  const rescues = useAllRescues();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const update = useCallback(
    (patch: Partial<DogFilters>, resetPage = true) => {
      const next = { ...filters, ...patch };
      if (resetPage) next.page = 1;
      setSearchParams(filtersToSearchParams(next));
    },
    [filters, setSearchParams],
  );

  // Locating is a one-shot: the position goes into the URL once, so the view is
  // shareable and Clear or Back can remove it without it snapping back.
  const nearMe = useCallback(async () => {
    const coords = await geo.locate();
    if (coords) update({ lat: coords.lat, lng: coords.lng });
  }, [geo, update]);

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

  const activeCount = countActiveFilters(filters);
  const rescueNames = useMemo(() => new Map((rescues.data ?? []).map((r) => [r.id, r.name])), [rescues.data]);
  const chips = useMemo(() => activeFilterChips(filters, (id) => rescueNames.get(id)), [filters, rescueNames]);
  const clearAll = () => {
    geo.reset();
    setSearchParams(new URLSearchParams());
  };

  const nearMeStatus = filters.lat !== undefined ? 'on' : geo.state.status === 'locating' ? 'locating' : geo.state.status === 'denied' ? 'denied' : 'idle';

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
              nearMe={nearMeStatus}
              onNearMe={() => void nearMe()}
              onClearNearMe={() => update({ lat: undefined, lng: undefined })}
              locationMessage={geo.state.status === 'denied' ? geo.state.message : undefined}
            />
          </div>
        </div>
      </section>

      <section id="dogs" className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[280px_1fr] lg:gap-8">
        <div className="lg:hidden">
          <Button variant="outline" className="w-full" aria-expanded={filtersOpen} aria-controls="filters-panel" onClick={() => setFiltersOpen((o) => !o)}>
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {filtersOpen ? 'Hide filters' : 'Filters'}
            {activeCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{activeCount}</span>}
          </Button>
        </div>

        <div id="filters-panel" className={cn(filtersOpen ? 'block' : 'hidden', 'lg:block')}>
          <FilterSidebar filters={filters} onChange={(patch) => update(patch)} onClear={clearAll} activeCount={activeCount} />
        </div>

        <div>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-semibold">Dogs looking for a home</h2>
            {dogs.data && (
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {dogs.data.meta.total} {dogs.data.meta.total === 1 ? 'dog' : 'dogs'}
              </p>
            )}
          </div>

          <ActiveFilters chips={chips} onRemove={(chip) => update(chip.remove)} onClearAll={clearAll} />

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
