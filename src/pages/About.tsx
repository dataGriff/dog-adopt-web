import { Link } from 'react-router';
import { Heart, Search, ShieldCheck } from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { pageTitle } from '@/lib/format';
import { buttonClasses } from '@/components/ui/button-classes';

export function AboutPage() {
  useDocumentTitle(pageTitle('About'));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold">Why adopt?</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Thousands of dogs are waiting in UK rescues right now. Finding them means visiting dozens of websites one by one. Dog Adopt gathers
        what those websites list into one place, so the search is as easy as buying a puppy, and the dog you find already needs a home.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { Icon: Search, title: 'One search', body: 'Filter every listed dog by size, age, breed, region and who they get on with.' },
          { Icon: ShieldCheck, title: 'Only the facts', body: 'We show what the rescue says: name, age, size, breed and compatibility, with a link to their page. Photos and stories stay on their site.' },
          { Icon: Heart, title: 'Non-profit', body: 'No fees, no adverts, no middleman. Enquiries go straight to the rescue.' },
        ].map(({ Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
            <Icon className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-semibold">How current is it?</h2>
      <p className="mt-2 text-muted-foreground">
        Listings are gathered from each rescue's website on a schedule, so a dog may be reserved or rehomed before we catch up. Every dog
        shows when it was last seen listed. If you're set on one, contact the rescue first.
      </p>

      <Link to="/" className={buttonClasses('default', 'lg', 'mt-8')}>
        Start looking
      </Link>
    </div>
  );
}
