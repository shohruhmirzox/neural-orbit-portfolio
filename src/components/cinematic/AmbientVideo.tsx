import { useState } from "react";

/**
 * Plays a generated clip as a muted loop. Stays invisible until it can play,
 * so whatever sits behind it (usually the poster photo) shows through if the
 * clip is slow or fails.
 */
export function AmbientVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const [ok, setOk] = useState(false);

  return (
    <video
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      onLoadedData={() => setOk(true)}
      onError={() => setOk(false)}
      className={`${className ?? ""} h-full w-full object-cover transition-opacity duration-1000 ${
        ok ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
