import { useState } from "react";

/**
 * Plays a generated Seedance clip as an ambient, muted background loop.
 * Tries the local file first (e.g. /media/builder.mp4), then the remote
 * Higgsfield CDN URL; if neither loads, stays invisible so the CSS/WebGL
 * fallback behind it shows through.
 */
export function AmbientVideo({
  src,
  remoteSrc,
  className,
  brightness = 1.15,
}: {
  src: string;
  remoteSrc?: string;
  className?: string;
  /** Slight lift so the clip reads clearly behind the dark overlays. */
  brightness?: number;
}) {
  const [ok, setOk] = useState(false);
  const [current, setCurrent] = useState(src);

  const onError = () => {
    if (remoteSrc && current !== remoteSrc) {
      setCurrent(remoteSrc);
    } else {
      setOk(false);
    }
  };

  return (
    <video
      key={current}
      src={current}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      onLoadedData={() => setOk(true)}
      onCanPlay={() => setOk(true)}
      onError={onError}
      style={{ filter: `brightness(${brightness}) saturate(1.1)` }}
      className={`${className ?? ""} h-full w-full object-cover transition-opacity duration-1000 ${
        ok ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
