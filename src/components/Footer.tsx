import { Link } from 'react-router';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 bg-foreground py-12 text-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="font-display text-xl font-semibold">
            dogadopt<span className="text-brand">.co.uk</span>
          </p>
          <p className="mt-3 max-w-md text-background/70">
            A non-profit place to find rescue dogs across the UK, so that adopting is as easy as buying.
          </p>
          <p className="mt-3 max-w-md text-sm text-background/70" data-testid="freshness-disclaimer">
            Listings are gathered from rescue websites and may lag behind them. Always check with the{' '}
            <Link to="/rescues" className="underline hover:text-brand">
              rescue
            </Link>{' '}
            before travelling. Each dog shows when it was last seen listed.
          </p>
        </div>
        <div>
          <h2 className="mb-3 font-display text-base font-semibold">Explore</h2>
          <ul className="space-y-2 text-background/70">
            <li>
              <Link to="/" className="hover:text-brand">
                Find a dog
              </Link>
            </li>
            <li>
              <Link to="/rescues" className="hover:text-brand">
                Rescue organisations
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brand">
                Why adopt?
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-background/20 px-4 pt-6 text-sm text-background/50">
        © {new Date().getFullYear()} dogadopt.co.uk. Made with <Heart className="inline h-4 w-4 text-brand" fill="currentColor" aria-label="love" /> for rescue dogs everywhere.{' '}
        <span className="text-brand">#AdoptDontShop</span>
      </div>
    </footer>
  );
}
