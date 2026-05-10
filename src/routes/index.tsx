import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, GraduationCap, Volume2, VolumeX, Gauge, Telescope, Accessibility } from "lucide-react";
import { NeuralScene } from "@/components/portfolio/NeuralScene";
import { PlanetCard } from "@/components/portfolio/PlanetCard";
import { NeuralLoader } from "@/components/portfolio/NeuralLoader";
import { Slider } from "@/components/ui/slider";
import { PLANETS, type PlanetData, type PlanetKey } from "@/lib/portfolio-data";
import { playClick, playWhoosh, toggleAmbient } from "@/lib/audio-reactive";

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
  const [ambientOn, setAmbientOn] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
    }
    const t = setTimeout(() => setLoading(false), 1900);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (p: PlanetData | null) => {
    playClick();
    if (p && p.key !== activeKey) playWhoosh();
    setActiveKey(p ? p.key : null);
  };

  const activePlanet: PlanetData | null =
    PLANETS.find((p) => p.key === activeKey) ?? null;

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <AnimatePresence>{loading && <NeuralLoader key="loader" />}</AnimatePresence>

      {/* Top bar */}
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

        <div className="pointer-events-auto flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.6 }}
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur md:flex"
          >
            <GraduationCap size={14} className="text-[var(--gold)]" />
            Lester B. Pearson Scholar — University of Toronto
          </motion.div>
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.15, duration: 0.6 }}
            onClick={() => { playClick(); setAmbientOn(toggleAmbient()); }}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:text-foreground"
            aria-label="Toggle ambient space sound"
          >
            {ambientOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">{ambientOn ? "Ambient on" : "Ambient off"}</span>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.18, duration: 0.6 }}
            onClick={() => { playClick(); setReducedMotion((v) => !v); }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs backdrop-blur transition ${
              reducedMotion
                ? "border-white/30 bg-white/10 text-foreground"
                : "border-white/10 bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={reducedMotion}
            aria-label="Toggle reduced motion"
            title="Reduced motion: disables meteors, synaptic pulses, and camera fly animations"
          >
            <Accessibility size={14} />
            <span className="hidden sm:inline">{reducedMotion ? "Reduced motion" : "Full motion"}</span>
          </motion.button>
        </div>
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
            : "Drag to rotate · scroll to zoom · click a planet"}
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

      {/* Left: System Overview HUD */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="pointer-events-auto absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 md:block"
      >
        <div className="glass min-w-[220px] rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Telescope size={14} className="text-[var(--synapse)]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              System Overview
            </p>
          </div>
          <ul className="flex flex-col gap-1">
            {PLANETS.map((p) => {
              const isActive = activeKey === p.key;
              return (
                <li key={p.key}>
                  <button
                    onClick={() => handleSelect(isActive ? null : p)}
                    className={`group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${
                      isActive
                        ? "border-white/30 bg-white/10"
                        : "border-transparent hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 flex-none rounded-full transition group-hover:scale-125"
                        style={{ background: p.color, boxShadow: `0 0 12px ${p.color}` }}
                      />
                      <div className="leading-tight">
                        <p className="text-xs font-semibold tracking-tight text-foreground">
                          {p.name}
                        </p>
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                          {p.pillar}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.aside>

      {/* Bottom-left: Time Scale Controller */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.3, duration: 0.6 }}
        className="pointer-events-auto absolute bottom-16 left-4 z-20 md:bottom-20"
      >
        <div className="glass w-[230px] rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge size={13} className="text-[var(--bio)]" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Time Scale
              </p>
            </div>
            <p
              className="font-mono text-xs tabular-nums text-foreground"
              style={{ textShadow: "0 0 10px var(--bio)" }}
            >
              {timeScale.toFixed(2)}×
            </p>
          </div>
          <Slider
            value={[timeScale]}
            min={0}
            max={4}
            step={0.05}
            onValueChange={(v) => setTimeScale(v[0])}
          />
          <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
            <span>Pause</span>
            <span>1×</span>
            <span>4×</span>
          </div>
        </div>
      </motion.div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
        <NeuralScene
          activeKey={activeKey}
          timeScale={timeScale}
          onSelectPlanet={handleSelect}
          onHoverNucleus={setHoverNucleus}
        />
      </div>

      <PlanetCard planet={activePlanet} onClose={() => handleSelect(null)} />
    </main>
  );
}
