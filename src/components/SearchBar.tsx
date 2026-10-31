import { useEffect, useState } from 'react';
import { LocateFixed, Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface Props {
  value: string;
  onSearch: (q: string) => void;
  nearMe: 'idle' | 'locating' | 'on' | 'denied';
  onNearMe: () => void;
  onClearNearMe: () => void;
  locationMessage?: string;
}

export const SEARCH_DEBOUNCE_MS = 350;

export function SearchBar({ value, onSearch, nearMe, onNearMe, onClearNearMe, locationMessage }: Props) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  const debounced = useDebouncedValue(text, SEARCH_DEBOUNCE_MS);

  // Keep the box in step if the URL changes from elsewhere (back button, clear).
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => {
    if (debounced.trim() !== value) onSearch(debounced.trim());
    // onSearch is stable enough for our purposes; we only want to fire on the debounced text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          aria-label="Search by name or breed"
          placeholder="Search by name or breed"
          className="pl-9"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {nearMe === 'on' ? (
        <Button variant="secondary" onClick={onClearNearMe} aria-pressed="true">
          <LocateFixed className="h-4 w-4" aria-hidden /> Near me <X className="h-4 w-4" aria-hidden />
        </Button>
      ) : (
        <Button variant="outline" onClick={onNearMe} disabled={nearMe === 'locating'} aria-pressed="false">
          <LocateFixed className="h-4 w-4" aria-hidden /> {nearMe === 'locating' ? 'Locating…' : 'Near me'}
        </Button>
      )}
      {nearMe === 'denied' && locationMessage && (
        <p role="status" className="text-sm text-muted-foreground sm:self-center">
          {locationMessage}
        </p>
      )}
    </div>
  );
}
