import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAllRescues, useRescues } from '@/api/queries';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { pageTitle } from '@/lib/format';
import { ErrorState } from '@/components/ErrorState';
import { PaginationControls } from '@/components/PaginationControls';
import { RescueCard } from '@/components/RescueCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export function RescuesPage() {
  useDocumentTitle(pageTitle('Rescue organisations'));
  const [searchParams, setSearchParams] = useSearchParams();
  const region = searchParams.get('region') ?? undefined;
  const q = searchParams.get('q') ?? '';
  const hasDogs = searchParams.get('hasDogs') === 'true';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [text, setText] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  const debounced = useDebouncedValue(text, 350);
  if (q !== lastQ) {
    setLastQ(q);
    setText(q);
  }

  const set = (patch: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    if (debounced.trim() !== q) set({ q: debounced.trim() || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const all = useAllRescues();
  const regions = useMemo(() => Array.from(new Set((all.data ?? []).map((r) => r.region))).sort((a, b) => a.localeCompare(b)), [all.data]);
  const rescues = useRescues({ page, region, q: q || undefined, hasDogs: hasDogs || undefined });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold md:text-4xl">Rescue organisations</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every rescue we gather listings from. Dog counts are the dogs currently listed on their website that you can enquire about.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px_auto] sm:items-end">
        <div>
          <Label htmlFor="rescue-q">Name</Label>
          <Input id="rescue-q" type="search" placeholder="Search rescues" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rescue-region">Region</Label>
          <Select id="rescue-region" value={region ?? ''} onChange={(e) => set({ region: e.target.value || undefined })}>
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div className="pb-2">
          <Checkbox label="Only rescues with dogs" checked={hasDogs} onChange={(e) => set({ hasDogs: e.target.checked ? 'true' : undefined })} />
        </div>
      </div>

      <div className="mt-8">
        {rescues.isError ? (
          <ErrorState what="Rescues" detail={rescues.error.message} onRetry={() => rescues.refetch()} />
        ) : rescues.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : rescues.data.items.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No rescues match.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">{rescues.data.meta.total} rescues</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={rescues.isFetching}>
              {rescues.data.items.map((r) => (
                <RescueCard key={r.id} rescue={r} />
              ))}
            </div>
            <PaginationControls meta={rescues.data.meta} onPage={(p) => set({ page: String(p) }, false)} />
          </>
        )}
      </div>
    </div>
  );
}
