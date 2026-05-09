import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ExternalLink, Send, Globe, Music, Pause, Play, Upload } from "lucide-react";

const InstagramIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);
const LinkedinIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 13v4" />
  </svg>
);
import { useEffect, useRef, useState } from "react";
import type { PlanetData, PlanetLink } from "@/lib/portfolio-data";
import { audioReactive, playClick } from "@/lib/audio-reactive";

interface Props {
  planet: PlanetData | null;
  onClose: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 24, rotateX: -20 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring" as const, stiffness: 220, damping: 22 } },
};

function LinkIcon({ kind }: { kind: PlanetLink["kind"] }) {
  const cls = "size-4";
  if (kind === "instagram") return <InstagramIcon className={cls} />;
  if (kind === "telegram") return <Send className={cls} />;
  if (kind === "linkedin") return <LinkedinIcon className={cls} />;
  if (kind === "site") return <Globe className={cls} />;
  return <ExternalLink className={cls} />;
}

function AcoustifyAudioPanel({ color }: { color: string }) {
  const [state, setState] = useState({ playing: false, trackName: null as string | null });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = audioReactive.subscribe(setState);
    return () => { unsub(); };
  }, []);

  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center gap-2">
        <Music size={14} style={{ color }} />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Audio-reactive · feed the planet a track
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={() => { playClick(); fileRef.current?.click(); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs hover:bg-white/[0.08]"
        >
          <Upload size={12} /> Load track
        </button>
        <button
          onClick={() => { playClick(); audioReactive.toggle(); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs hover:bg-white/[0.08]"
          aria-label={state.playing ? "Pause" : "Play"}
        >
          {state.playing ? <Pause size={12} /> : <Play size={12} />}
          {state.playing ? "Pause" : "Play"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) audioReactive.loadFile(f);
          }}
        />
      </div>
      {state.trackName && (
        <p className="mt-2 truncate font-mono text-[10px] text-muted-foreground">
          ♪ {state.trackName}
        </p>
      )}
    </div>
  );
}

export function PlanetCard({ planet, onClose }: Props) {
  return (
    <AnimatePresence mode="wait">
      {planet && (
        <motion.div
          key={planet.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-30 flex items-end justify-end p-4 md:items-center md:p-10"
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: 30, transition: { duration: 0.25 } }}
            style={{ perspective: 1200 }}
            className="glass pointer-events-auto relative w-full max-w-md rounded-2xl p-6 md:p-8"
          >
            <motion.button
              variants={item}
              onClick={() => { playClick(); onClose(); }}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              aria-label="Close"
            >
              <X size={18} />
            </motion.button>

            <motion.div variants={item} className="mb-2 flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: planet.color, boxShadow: `0 0 14px ${planet.color}` }}
              />
              <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {planet.pillar}
              </span>
            </motion.div>

            <motion.h2
              variants={item}
              className="font-display text-3xl font-semibold tracking-tight text-glow md:text-4xl"
              style={{ color: planet.color }}
            >
              {planet.name}
            </motion.h2>

            <motion.p variants={item} className="mt-2 text-sm text-foreground/80">
              {planet.tagline}
            </motion.p>

            <motion.p variants={item} className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {planet.description}
            </motion.p>

            <motion.ul variants={item} className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {planet.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-foreground/85"
                >
                  <Sparkles size={12} className="mt-0.5 flex-none" style={{ color: planet.color }} />
                  <span>{h}</span>
                </li>
              ))}
            </motion.ul>

            {planet.key === "acoustify" && <AcoustifyAudioPanel color={planet.color} />}

            <motion.div variants={item} className="mt-5 flex flex-wrap gap-2">
              {planet.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playClick()}
                  className="group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition"
                  style={{
                    borderColor: `${planet.color}55`,
                    background: `linear-gradient(135deg, ${planet.color}1f, transparent)`,
                    color: planet.color,
                  }}
                >
                  <LinkIcon kind={l.kind} />
                  <span className="font-mono uppercase tracking-[0.18em]">{l.label}</span>
                </a>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
