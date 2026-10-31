import type { Dog } from '@dogadopt/contracts';
import { DogCard, DogCardSkeleton } from './DogCard';

export function DogGrid({ dogs, loading, emptyMessage }: { dogs: Dog[] | undefined; loading: boolean; emptyMessage: string }) {
  if (loading && !dogs) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading dogs">
        {Array.from({ length: 6 }, (_, i) => (
          <DogCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!dogs?.length) {
    return <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">{emptyMessage}</p>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy={loading}>
      {dogs.map((dog) => (
        <DogCard key={dog.id} dog={dog} />
      ))}
    </div>
  );
}
