import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'secondary' | 'warm' | 'success' | 'muted' | 'outline' | 'destructive';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  warm: 'bg-accent text-accent-foreground',
  success: 'bg-success/15 text-success',
  muted: 'bg-muted text-muted-foreground',
  outline: 'border border-border text-foreground',
  destructive: 'bg-destructive/15 text-destructive',
};

export function Badge({ className, variant = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)} {...props} />;
}
