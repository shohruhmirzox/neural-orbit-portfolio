import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, GraduationCap } from "lucide-react";
import { NeuralScene } from "@/components/portfolio/NeuralScene";
import { PlanetCard } from "@/components/portfolio/PlanetCard";
import { NeuralLoader } from "@/components/portfolio/NeuralLoader";
import { PLANETS, type PlanetData, type PlanetKey } from "@/lib/portfolio-data";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Shohruhmirzo Khudaykulov — Neural Solar System" },
      {
        name: "description",
        content:
          "An immersive 3D portfolio of Shohruhmirzo Khudaykulov — incoming Lester B. Pearson Scholar at the University of Toronto, Neuroscience & AI entrepreneur.",
      },
      { property: "og:title", content: "Shohruhmirzo Khudaykulov — Neural Solar System" },
      {
        property: "og:description",
        content: "Explore the Neural Nucleus and orbiting Knowledge Planets.",
      },
    ],
  }),
});

function Index() {
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<PlanetKey | null>(null);
  const [hoverNucleus, setHoverNucleus] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1900);
    return () => clearTimeout(t);
  }, []);

  const activePlanet: PlanetData | null =
    PLANETS.find((p) => p.key === activeKey) ?? null;

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <AnimatePresence>{loading && <NeuralLoader key="loader" />}</AnimatePresence>

      {/* Top-left brand */}
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between p-5 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="pointer-events-auto flex items-center gap-2.5"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[var(--neuro)] opacity-40 blur-xl" />
            <Brain size={22} className="relative text-[var(--neuro)]" />
          </div>
          <div className="leading-tight">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Neural System v1
            </p>
            <p className="text-sm font-semibold tracking-tight">Shohruhmirzo Khudaykulov</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.6 }}
          className="pointer-events-auto hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur md:flex"
        >
          <GraduationCap size={14} className="text-[var(--gold)]" />
          Lester B. Pearson Scholar — University of Toronto
        </motion.div>
      </header>

      {/* Bottom hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8 }}
        className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center"
      >
        <div className="rounded-full border border-white/10 bg-black/30 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground backdrop-blur">
          {activePlanet
            ? "Click nucleus or close to return"
            : "Click a planet — orbit a knowledge pillar"}
        </div>
      </motion.div>

      {/* Nucleus tooltip */}
      <AnimatePresence>
        {hoverNucleus && !activePlanet && (
          <motion.div
            key="nuc-tip"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute left-1/2 top-[58%] z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="glass max-w-xs rounded-xl px-4 py-3 text-center">
              <p className="text-sm font-semibold tracking-tight text-glow text-[var(--neuro)]">
                Shohruhmirzo Khudaykulov
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Incoming Lester B. Pearson Scholar at University of Toronto · Neuroscience & AI Entrepreneur
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planet quick-nav */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="pointer-events-auto absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 md:flex"
      >
        {PLANETS.map((p) => {
          const isActive = activeKey === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setActiveKey(isActive ? null : p.key)}
              className={`group flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-xs backdrop-blur transition ${
                isActive
                  ? "border-white/40 bg-white/10 text-foreground"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full transition group-hover:scale-125"
                style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }}
              />
              <span className="font-mono uppercase tracking-[0.18em]">{p.name}</span>
            </button>
          );
        })}
      </motion.aside>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
        <NeuralScene
          activeKey={activeKey}
          onSelectPlanet={(p) => setActiveKey(p ? p.key : null)}
          onHoverNucleus={setHoverNucleus}
        />
      </div>

      <PlanetCard planet={activePlanet} onClose={() => setActiveKey(null)} />
    </main>
  );
}
