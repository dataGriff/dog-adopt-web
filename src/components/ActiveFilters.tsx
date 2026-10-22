import { X } from 'lucide-react';
import type { FilterChip } from '@/lib/dogFilters';
import { Button } from './ui/button';

interface Props {
  chips: FilterChip[];
  onRemove: (chip: FilterChip) => void;
  onClearAll: () => void;
}

/** The filters narrowing the list, each removable on its own. */
export function ActiveFilters({ chips, onRemove, onClearAll }: Props) {
  if (chips.length === 0) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" data-testid="active-filters">
      <h3 className="sr-only">Active filters</h3>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li key={chip.key}>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card py-1 pl-3 pr-1 text-sm">
              {chip.label}
              <button
                type="button"
                onClick={() => onRemove(chip)}
                aria-label={`Remove filter: ${chip.label}`}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          </li>
        ))}
      </ul>
      {chips.length > 1 && (
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      )}
    </div>
  );
}
