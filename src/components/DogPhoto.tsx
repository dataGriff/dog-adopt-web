import { useState } from 'react';
import type { Dog } from '@dogadopt/contracts';
import { breedLine, initialOf } from '@/lib/format';
import { cn } from '@/lib/utils';
import { tintFor } from '@/lib/tint';

interface Props {
  dog: Pick<Dog, 'id' | 'name' | 'imageUrl' | 'breeds' | 'unresolvedBreeds'>;
  /**
   * card: a 16:9 frame for both photos and placeholders, so a card's height
   * does not depend on whether the rescue linked a photo (and the loading
   * skeleton matches). page: photos at 4:3, placeholder at 16:9.
   */
  size?: 'card' | 'page';
  /** Zoom the photo slightly when the surrounding `group` is hovered. */
  zoomOnHover?: boolean;
}

/**
 * The dog's photo when the rescue provides a link to one, otherwise (or if
 * that link fails to load) a panel with the dog's initial. Images are only
 * ever linked, never copied.
 */
export function DogPhoto({ dog, size = 'card', zoomOnHover = false }: Props) {
  // Remember which URL failed, so a different photo for the same dog is tried again.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageUrl = dog.imageUrl && dog.imageUrl !== failedUrl ? dog.imageUrl : null;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${dog.name}, ${breedLine(dog)}`}
        loading={size === 'card' ? 'lazy' : undefined}
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(imageUrl)}
        className={cn(
          'w-full object-cover',
          size === 'card' ? 'aspect-video object-[center_30%]' : 'aspect-[4/3]',
          zoomOnHover && 'transition-transform duration-500 group-hover:scale-105',
        )}
      />
    );
  }
  return (
    <div data-testid="photo-placeholder" className={cn('flex aspect-video w-full flex-col items-center justify-center gap-2', tintFor(dog.id))}>
      <span
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-full bg-white/70 font-display font-semibold',
          size === 'card' ? 'h-16 w-16 text-3xl' : 'h-24 w-24 text-5xl',
        )}
      >
        {initialOf(dog.name)}
      </span>
      <span className={cn('font-medium', size === 'card' ? 'text-xs' : 'text-sm')}>Photo on the rescue's website</span>
    </div>
  );
}
