import { AGE_CATEGORIES, DOG_SIZES, GENDERS } from '@dogadopt/contracts';
import { useAllRescues, useBreeds } from '@/api/queries';
import type { DogFilters } from '@/lib/dogFilters';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select } from './ui/select';

interface Props {
  filters: DogFilters;
  onChange: (patch: Partial<DogFilters>) => void;
  onClear: () => void;
  activeCount: number;
}

export function FilterSidebar({ filters, onChange, onClear, activeCount }: Props) {
  const breeds = useBreeds();
  const rescues = useAllRescues();
  const regions = Array.from(new Set((rescues.data ?? []).map((r) => r.region))).sort((a, b) => a.localeCompare(b));
  const rescuesInRegion = (rescues.data ?? []).filter((r) => !filters.region || r.region === filters.region);

  return (
    <aside aria-label="Filters" className="space-y-5 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear ({activeCount})
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor="filter-size">Size</Label>
        <Select id="filter-size" value={filters.size ?? ''} onChange={(e) => onChange({ size: (e.target.value || undefined) as DogFilters['size'] })}>
          <option value="">Any size</option>
          {DOG_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-age">Age</Label>
        <Select id="filter-age" value={filters.age ?? ''} onChange={(e) => onChange({ age: (e.target.value || undefined) as DogFilters['age'] })}>
          <option value="">Any age</option>
          {AGE_CATEGORIES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-gender">Gender</Label>
        <Select id="filter-gender" value={filters.gender ?? ''} onChange={(e) => onChange({ gender: (e.target.value || undefined) as DogFilters['gender'] })}>
          <option value="">Any gender</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-breed">Breed</Label>
        <Select id="filter-breed" value={filters.breed ?? ''} onChange={(e) => onChange({ breed: e.target.value || undefined })} disabled={breeds.isPending}>
          <option value="">Any breed</option>
          {(breeds.data ?? []).map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-region">Region</Label>
        <Select id="filter-region" value={filters.region ?? ''} onChange={(e) => onChange({ region: e.target.value || undefined, rescueId: undefined })} disabled={rescues.isPending}>
          <option value="">Anywhere in the UK</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="filter-rescue">Rescue</Label>
        <Select id="filter-rescue" value={filters.rescueId ?? ''} onChange={(e) => onChange({ rescueId: e.target.value || undefined })} disabled={rescues.isPending}>
          <option value="">Any rescue</option>
          {rescuesInRegion.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1.5 text-sm font-medium">Good with</legend>
        <Checkbox label="Children" checked={Boolean(filters.goodWithKids)} onChange={(e) => onChange({ goodWithKids: e.target.checked || undefined })} />
        <Checkbox label="Other dogs" checked={Boolean(filters.goodWithDogs)} onChange={(e) => onChange({ goodWithDogs: e.target.checked || undefined })} />
        <Checkbox label="Cats" checked={Boolean(filters.goodWithCats)} onChange={(e) => onChange({ goodWithCats: e.target.checked || undefined })} />
      </fieldset>
    </aside>
  );
}
