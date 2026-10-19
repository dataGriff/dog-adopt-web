import { Link } from 'react-router';
import { ExternalLink, MapPin } from 'lucide-react';
import type { Dog } from '@dogadopt/contracts';
import { breedLine, formatDistance, formatStatus, relativeDay } from '@/lib/format';
import { Badge } from './ui/badge';
import { buttonClasses } from './ui/button-classes';
import { CompatibilityBadges } from './CompatibilityBadges';

export function DogCard({ dog }: { dog: Dog }) {
  const distance = formatDistance(dog.distanceKm);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-hover" data-testid="dog-card">
      <Link to={`/dogs/${dog.id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={dog.imageUrl ?? '/placeholder-dog.svg'}
          alt={dog.imageUrl ? `${dog.name}, ${breedLine(dog)}` : ''}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant={dog.status === 'available' ? 'success' : 'warm'}>{formatStatus(dog.status)}</Badge>
          {distance && (
            <Badge variant="secondary" className="gap-1">
              <MapPin className="h-3 w-3" aria-hidden />
              {distance}
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-xl font-semibold">
            <Link to={`/dogs/${dog.id}`} className="hover:text-primary">
              {dog.name}
            </Link>
          </h3>
          <p className="text-muted-foreground">{breedLine(dog)}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <Badge variant="outline">{dog.age}</Badge>
          <Badge variant="outline">{dog.size}</Badge>
          <Badge variant="outline">{dog.gender}</Badge>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">
            <Link to={`/rescues/${dog.rescue.id}`} className="hover:text-foreground">
              {dog.rescue.name}
            </Link>
            <span className="mx-1">·</span>
            {dog.rescue.region}
          </span>
        </p>

        <CompatibilityBadges dog={dog} />

        <p className="text-xs text-muted-foreground">Last seen listed {relativeDay(dog.lastSeenAt)}</p>

        <div className="mt-auto flex gap-2 pt-1">
          <Link to={`/dogs/${dog.id}`} className={buttonClasses('secondary', 'md', 'flex-1')}>
            Details
          </Link>
          {dog.profileUrl && (
            <a href={dog.profileUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('default', 'md', 'flex-1')}>
              Rescue profile <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function DogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
