import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

export function ErrorState({ what, onRetry, detail }: { what: string; onRetry: () => void; detail?: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-destructive" aria-hidden />
      <p className="font-semibold">{what} could not be loaded.</p>
      {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
      <Button className="mt-4" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
