import { AmbientVideo } from "./AmbientVideo";

/**
 * A clearly-visible, framed cinematic video "monitor" — emerald hairline
 * border, corner label and a live dot — so the generated clips read as
 * deliberate footage instead of a dim background wash.
 */
export function ClipFrame({
  src,
  remoteSrc,
  reel,
  title,
  className,
}: {
  src: string;
  remoteSrc?: string;
  reel: string;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative aspect-video overflow-hidden rounded-md border border-emerald/40 bg-black shadow-[0_25px_80px_-20px_rgba(23,227,136,0.45)] ${className ?? ""}`}
    >
      <AmbientVideo src={src} remoteSrc={remoteSrc} brightness={1.25} />

      {/* Scanline + inner glow so it reads as a screen */}
      <div className="scanline pointer-events-none absolute inset-0 opacity-20" />
      <div className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]" />

      {/* Corner label */}
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="flex h-2 w-2">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
        </span>
        <span className="font-body text-[9px] uppercase tracking-[0.28em] text-cream/90">
          {reel}
        </span>
      </div>
      <div className="absolute bottom-3 left-3">
        <span className="font-display text-sm uppercase tracking-wide text-cream drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          {title}
        </span>
      </div>

      {/* Corner ticks */}
      <span className="absolute right-2 top-2 h-3 w-3 border-r border-t border-emerald/60" />
      <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-emerald/60" />
    </div>
  );
}
