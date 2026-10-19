import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, PawPrint, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/', label: 'Find a dog' },
  { to: '/rescues', label: 'Rescues' },
  { to: '/about', label: 'About' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('font-medium transition-colors hover:text-foreground', isActive ? 'text-foreground' : 'text-muted-foreground');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PawPrint className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-semibold">
            dogadopt<span className="text-primary">.co.uk</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="rounded-xl p-2 hover:bg-accent md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-border bg-card px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === '/'} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
