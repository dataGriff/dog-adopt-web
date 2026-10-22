import { Link, useParams } from 'react-router';
import { ArrowLeft, ExternalLink, Globe, MapPin } from 'lucide-react';
import { useDog } from '@/api/queries';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { breedLine, formatStatus, pageTitle, relativeDay } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button-classes';
import { Skeleton } from '@/components/ui/skeleton';
import { CompatibilityList } from '@/components/CompatibilityBadges';
import { ErrorState } from '@/components/ErrorState';

export function DogDetailPage() {
  const { dogId } = useParams<{ dogId: string }>();
  const dog = useDog(dogId);
  useDocumentTitle(dog.data ? pageTitle(`${dog.data.name} at ${dog.data.rescue.name}`) : pageTitle('Dog'));

  if (dog.isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8" aria-busy="true">
        <Skeleton className="aspect-[4/3] w-full" />
        <Skeleton className="mt-6 h-8 w-1/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
      </div>
    );
  }

  if (dog.isError) {
    if (dog.error.notFound) {
      return (
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">We couldn't find that dog</h1>
          <p className="mt-2 text-muted-foreground">It may have found a home already, or the link may be wrong.</p>
          <Link to="/" className={buttonClasses('default', 'lg', 'mt-6')}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to all dogs
          </Link>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <ErrorState what="This dog" detail={dog.error.message} onRetry={() => dog.refetch()} />
      </div>
    );
  }

  const d = dog.data;
  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All dogs
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="self-start overflow-hidden rounded-2xl bg-muted md:sticky md:top-24">
          <img src={d.imageUrl ?? '/placeholder-dog.svg'} alt={d.imageUrl ? `${d.name}, ${breedLine(d)}` : ''} referrerPolicy="no-referrer" className="aspect-[4/3] w-full object-cover" />
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant={d.status === 'available' ? 'success' : 'warm'}>{formatStatus(d.status)}</Badge>
            <Badge variant="outline">{d.age}</Badge>
            <Badge variant="outline">{d.size}</Badge>
            <Badge variant="outline">{d.gender}</Badge>
          </div>
          <div>
            <h1 className="text-4xl font-bold">{d.name}</h1>
            <p className="text-lg text-muted-foreground">{breedLine(d)}</p>
          </div>

          <CompatibilityList dog={d} />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {d.birthYear && (
              <>
                <dt className="text-muted-foreground">Born</dt>
                <dd>{[d.birthDay, d.birthMonth, d.birthYear].filter(Boolean).join('/')}</dd>
              </>
            )}
            {d.rescueSinceDate && (
              <>
                <dt className="text-muted-foreground">With the rescue since</dt>
                <dd>{new Date(d.rescueSinceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
              </>
            )}
            {d.statusNotes && (
              <>
                <dt className="text-muted-foreground">Status notes</dt>
                <dd>{d.statusNotes}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Last seen listed</dt>
            <dd data-testid="last-seen">{relativeDay(d.lastSeenAt)}</dd>
          </dl>

          {d.description && <p className="leading-relaxed">{d.description}</p>}

          <section aria-labelledby="rescue-heading" className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <h2 id="rescue-heading" className="text-sm font-medium text-muted-foreground">
              Held by
            </h2>
            <p className="mt-1 text-xl font-semibold">
              <Link to={`/rescues/${d.rescue.id}`} className="hover:text-primary">
                {d.rescue.name}
              </Link>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden /> {d.rescue.region}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              {d.profileUrl && (
                <a href={d.profileUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('default', 'md', 'sm:flex-1')}>
                  View {d.name}'s profile <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              )}
              {d.rescue.website && (
                <a href={d.rescue.website} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline', 'md', 'sm:flex-1')}>
                  <Globe className="h-4 w-4" aria-hidden /> Rescue website
                </a>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Enquiries go to the rescue directly. We only list what their website shows.</p>
          </section>
        </div>
      </div>
    </article>
  );
}
