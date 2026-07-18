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
}: {
  src: string;
  remoteSrc?: string;
  className?: string;
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
      onCanPlay={() => setOk(true)}
      onError={onError}
      className={`${className ?? ""} h-full w-full object-cover transition-opacity duration-1000 ${
        ok ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
