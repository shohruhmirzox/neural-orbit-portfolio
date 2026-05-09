import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import type { PlanetData } from "@/lib/portfolio-data";

interface Props {
  planet: PlanetData | null;
  onClose: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24, rotateX: -20 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 22 },
  },
};

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
              onClick={onClose}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
