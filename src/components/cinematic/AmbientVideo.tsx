import { useState } from "react";

/**
 * Plays a generated Seedance clip as an ambient, muted background loop when
 * the file exists (e.g. /media/builder.mp4); until then renders nothing and
 * lets the CSS/WebGL fallback behind it show through.
 */
export function AmbientVideo({ src, className }: { src: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <video
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      onCanPlay={() => setOk(true)}
      onError={() => setOk(false)}
      className={`${className ?? ""} h-full w-full object-cover transition-opacity duration-1000 ${
        ok ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
