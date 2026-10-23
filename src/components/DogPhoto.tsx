import type { Dog } from '@dogadopt/contracts';
import { breedLine } from '@/lib/format';
import { cn } from '@/lib/utils';
import { tintFor } from '@/lib/tint';

interface Props {
  dog: Pick<Dog, 'id' | 'name' | 'imageUrl' | 'breeds' | 'unresolvedBreeds'>;
  size?: 'card' | 'page';
  className?: string;
}

/**
 * The dog's photo when the rescue provides a link to one (4:3), otherwise a
 * shorter 16:9 panel with the dog's initial. Images are only ever linked.
 */
export function DogPhoto({ dog, size = 'card', className }: Props) {
  if (dog.imageUrl) {
    return (
      <img
        src={dog.imageUrl}
        alt={`${dog.name}, ${breedLine(dog)}`}
        loading={size === 'card' ? 'lazy' : undefined}
        referrerPolicy="no-referrer"
        className={cn('aspect-[4/3] w-full object-cover', className)}
      />
    );
  }
  return (
    <div data-testid="photo-placeholder" className={cn('flex aspect-video w-full flex-col items-center justify-center gap-2', tintFor(dog.id), className)}>
      <span
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-full bg-white/70 font-display font-semibold',
          size === 'card' ? 'h-16 w-16 text-3xl' : 'h-24 w-24 text-5xl',
        )}
      >
        {dog.name.trim().charAt(0).toUpperCase()}
      </span>
      <span className={cn('font-medium', size === 'card' ? 'text-xs' : 'text-sm')}>Photo on the rescue's website</span>
    </div>
  );
}
