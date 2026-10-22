import { Link } from 'react-router';
import { ExternalLink, MapPin } from 'lucide-react';
import type { Rescue } from '@dogadopt/contracts';
import { Badge } from './ui/badge';
import { buttonClasses } from './ui/button-classes';

export function RescueCard({ rescue }: { rescue: Rescue }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-card" data-testid="rescue-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">
          <Link to={`/rescues/${rescue.id}`} className="hover:text-primary">
            {rescue.name}
          </Link>
        </h3>
        <Badge variant={rescue.dogCount > 0 ? 'success' : 'muted'} className="shrink-0">
          {rescue.dogCount} {rescue.dogCount === 1 ? 'dog' : 'dogs'}
        </Badge>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" aria-hidden /> {rescue.region}
        {rescue.postcode && <span aria-hidden>·</span>}
        {rescue.postcode && <span>{rescue.postcode}</span>}
      </p>
      <div className="mt-auto flex gap-2 pt-1">
        <Link to={`/rescues/${rescue.id}`} className={buttonClasses('secondary', 'sm', 'flex-1')}>
          View dogs
        </Link>
        {rescue.website && (
          <a href={rescue.website} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline', 'sm', 'flex-1')}>
            Website <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}
