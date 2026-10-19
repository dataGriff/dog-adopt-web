import { Baby, Cat, Dog as DogIcon } from 'lucide-react';
import type { Compatibility, Dog } from '@dogadopt/contracts';
import { compatibilityWord } from '@/lib/format';
import { Badge, type BadgeVariant } from './ui/badge';

const variantFor = (value: Compatibility): BadgeVariant => (value === true ? 'success' : value === false ? 'destructive' : 'muted');

const items = (dog: Pick<Dog, 'goodWithKids' | 'goodWithDogs' | 'goodWithCats'>) => [
  { key: 'kids', label: 'Kids', value: dog.goodWithKids, Icon: Baby },
  { key: 'dogs', label: 'Dogs', value: dog.goodWithDogs, Icon: DogIcon },
  { key: 'cats', label: 'Cats', value: dog.goodWithCats, Icon: Cat },
];

/** Compact row for cards: an icon per flag, coloured by yes / no / not known. */
export function CompatibilityBadges({ dog }: { dog: Pick<Dog, 'goodWithKids' | 'goodWithDogs' | 'goodWithCats'> }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Good with">
      {items(dog).map(({ key, label, value, Icon }) => (
        <li key={key}>
          <Badge variant={variantFor(value)} className="gap-1" title={`${label}: ${compatibilityWord(value)}`}>
            <Icon className="h-3 w-3" aria-hidden />
            {label}: {compatibilityWord(value)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/** Full list for the dog page. */
export function CompatibilityList({ dog }: { dog: Pick<Dog, 'goodWithKids' | 'goodWithDogs' | 'goodWithCats'> }) {
  return (
    <dl className="grid grid-cols-3 gap-3">
      {items(dog).map(({ key, label, value, Icon }) => (
        <div key={key} className="rounded-xl bg-muted p-3 text-center">
          <dt className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5" aria-hidden /> Good with {label.toLowerCase()}
          </dt>
          <dd className="mt-1 font-semibold">{compatibilityWord(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
