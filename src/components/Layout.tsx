import { Outlet, ScrollRestoration } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-xl bg-primary font-medium text-primary-foreground shadow-card focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
