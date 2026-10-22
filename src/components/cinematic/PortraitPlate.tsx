import { AmbientVideo } from "./AmbientVideo";

/**
 * A graded photographic plate: the real portrait (or a clip, with the
 * portrait as its poster) behind a soft ink falloff and a caption rule.
 * Parent sections animate `.plate-media` for the scroll push-in.
 */
export function PortraitPlate({
  photo,
  alt,
  videoSrc,
  position = "50% 30%",
  caption,
  aside,
  className,
  captionClassName,
}: {
  photo: string;
  alt: string;
  videoSrc?: string;
  position?: string;
  caption?: string;
  aside?: string;
  className?: string;
  captionClassName?: string;
}) {
  return (
    <figure className={`relative overflow-hidden bg-ink ${className ?? ""}`}>
      <div className="plate-media absolute inset-0 will-change-transform">
        <img
          src={photo}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
        {videoSrc && (
          <div className="absolute inset-0">
            <AmbientVideo src={videoSrc} poster={photo} />
          </div>
        )}
      </div>

      {/* Grade: blacks sink into the page ink, a faint emerald cast in the shadows */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[#0a6b42] opacity-[0.12] mix-blend-color" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cream/10" />

      {(caption || aside) && (
        <figcaption
          className={`${captionClassName ?? ""} absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 border-t border-cream/15 pt-3 font-body text-[10px] uppercase tracking-[0.26em] text-cream/70 md:inset-x-5 md:bottom-5`}
        >
          <span>{caption}</span>
          {aside && <span className="text-right text-emerald">{aside}</span>}
        </figcaption>
      )}
    </figure>
  );
}
