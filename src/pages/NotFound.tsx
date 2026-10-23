import { Link } from 'react-router';
import { useDocumentTitle } from '@/lib/useDocumentTitle';
import { pageTitle } from '@/lib/format';
import { buttonClasses } from '@/components/ui/button-classes';

export function NotFoundPage() {
  useDocumentTitle(pageTitle('Page not found'));
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold">That page doesn't exist</h1>
      <Link to="/" className={buttonClasses('default', 'lg', 'mt-6')}>
        Back to all dogs
      </Link>
    </div>
  );
}
