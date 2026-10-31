import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PageMeta } from '@dogadopt/contracts';
import { Button } from './ui/button';

export function PaginationControls({ meta, onPage }: { meta: PageMeta; onPage: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;
  const first = (meta.page - 1) * meta.pageSize + 1;
  const last = Math.min(meta.page * meta.pageSize, meta.total);
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Showing {first}–{last} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPage(meta.page - 1)} disabled={meta.page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
        </Button>
        <span className="text-sm" aria-current="page">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPage(meta.page + 1)} disabled={meta.page >= meta.totalPages} aria-label="Next page">
          Next <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
