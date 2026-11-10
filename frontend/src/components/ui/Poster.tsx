import React from 'react';

interface PosterProps {
  src: string;
  alt: string;
  className?: string;
  /** Load eagerly with high priority (above-the-fold images only). */
  priority?: boolean;
}

// Local PNG posters have optimized WebP siblings in /public
function webpFor(src: string) {
  return /^\/[^/].*\.png$/i.test(src) ? src.replace(/\.png$/i, '.webp') : null;
}

// Cap remote Unsplash images at a sensible display width
function sized(src: string) {
  return src.includes('images.unsplash.com') && !/[?&]w=/.test(src) ? `${src}&w=900` : src;
}

/**
 * Shows the whole poster (object-contain) inside a fixed aspect box, filling the
 * letterbox with a blurred copy of the same image so posters are never cropped.
 */
export const Poster: React.FC<PosterProps> = ({ src, alt, className = '', priority = false }) => {
  const webp = webpFor(src);
  const url = sized(src);
  const loading = priority ? 'eager' : 'lazy';

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      <img
        src={webp ?? url}
        alt=""
        aria-hidden="true"
        loading={loading}
        decoding="async"
        className="absolute inset-0 size-full scale-110 object-cover opacity-50 blur-2xl"
      />
      <picture className="relative block size-full">
        {webp && <source srcSet={webp} type="image/webp" />}
        <img
          src={url}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className="size-full object-contain"
        />
      </picture>
    </div>
  );
};
