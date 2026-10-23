import { Link, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { useRescue, useRescueDogs } from '@/api/queries';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { pageTitle } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { buttonClasses } from '@/components/ui/button-classes';
import { Skeleton } from '@/components/ui/skeleton';
import { DogGrid } from '@/components/DogGrid';
import { ErrorState } from '@/components/ErrorState';
import { PaginationControls } from '@/components/PaginationControls';

export function RescueDetailPage() {
  const { rescueId } = useParams<{ rescueId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const rescue = useRescue(rescueId);
  const dogs = useRescueDogs(rescueId, { page });
  useDocumentTitle(rescue.data ? pageTitle(rescue.data.name) : pageTitle('Rescue'));

  if (rescue.isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    );
  }
  if (rescue.isError) {
    if (rescue.error.notFound) {
      return (
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-bold">We couldn't find that rescue</h1>
          <Link to="/rescues" className={buttonClasses('default', 'lg', 'mt-6')}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> All rescues
          </Link>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorState what="This rescue" detail={rescue.error.message} onRetry={() => rescue.refetch()} />
      </div>
    );
  }

  const r = rescue.data;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/rescues" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All rescues
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{r.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden /> {r.region}
            {r.type === 'Provisional' && <Badge variant="muted">Provisional ADCH member</Badge>}
          </p>
        </div>
        <Badge variant={r.dogCount > 0 ? 'success' : 'muted'} className="text-sm">
          {r.dogCount} {r.dogCount === 1 ? 'dog' : 'dogs'} listed
        </Badge>
      </div>

      <section aria-label="Contact details" className="mt-6 grid gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:grid-cols-2">
        {r.website && (
          <a href={r.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary">
            <Globe className="h-4 w-4 shrink-0" aria-hidden /> <span className="truncate">{r.website.replace(/^https?:\/\//, '')}</span>
          </a>
        )}
        {r.phone && (
          <a href={`tel:${r.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 hover:text-primary">
            <Phone className="h-4 w-4 shrink-0" aria-hidden /> {r.phone}
          </a>
        )}
        {r.email && (
          <a href={`mailto:${r.email}`} className="flex items-center gap-2 hover:text-primary">
            <Mail className="h-4 w-4 shrink-0" aria-hidden /> <span className="truncate">{r.email}</span>
          </a>
        )}
        {r.address && (
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <span>{r.address}</span>
          </p>
        )}
        {r.charityNumber && <p className="text-sm text-muted-foreground sm:col-span-2">Registered charity {r.charityNumber}</p>}
        {r.contactNotes && <p className="text-sm text-muted-foreground sm:col-span-2">{r.contactNotes}</p>}
        {!r.website && !r.phone && !r.email && !r.address && <p className="text-muted-foreground sm:col-span-2">No contact details held yet.</p>}
      </section>

      <h2 className="mt-10 text-2xl font-semibold">Dogs at {r.name}</h2>
      <div className="mt-4">
        {dogs.isError ? (
          <ErrorState what="Dogs" detail={dogs.error.message} onRetry={() => dogs.refetch()} />
        ) : (
          <>
            <DogGrid dogs={dogs.data?.items} loading={dogs.isFetching} emptyMessage="No dogs listed at the moment. Check the rescue's own website too." />
            {dogs.data && (
              <PaginationControls
                meta={dogs.data.meta}
                onPage={(p) => {
                  const next = new URLSearchParams(searchParams);
                  if (p > 1) next.set('page', String(p));
                  else next.delete('page');
                  setSearchParams(next);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
