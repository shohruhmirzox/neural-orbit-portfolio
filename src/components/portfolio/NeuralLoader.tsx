import { Brain } from "lucide-react";
import { motion } from "framer-motion";

export function NeuralLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "radial-gradient(ellipse at center, #1e1b4b 0%, #020617 70%)" }}
    >
      <div className="relative flex h-40 w-40 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[oklch(0.5_0.25_290/0.25)] blur-3xl" />
        <Brain className="neuro-pulse text-[var(--neuro)]" size={88} strokeWidth={1.2} />
        <svg
          viewBox="0 0 200 200"
          className="brain-scan absolute inset-0 h-full w-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          style={{ color: "var(--synapse)" }}
        >
          <circle cx="100" cy="100" r="70" />
          <path d="M30 100 Q100 30 170 100 Q100 170 30 100" />
        </svg>
      </div>
      <p className="mt-8 font-mono text-xs uppercase tracking-[0.4em] text-[var(--synapse)]">
        Mapping Neural Pathways
      </p>
      <div className="mt-3 h-px w-40 overflow-hidden rounded bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[var(--neuro)] via-[var(--synapse)] to-[var(--neuro)]"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{ width: "60%" }}
        />
      </div>
    </motion.div>
  );
}
