import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(true);
      return;
    }
    const counter = { v: 0 };
    const tl = gsap.timeline({ onComplete: () => setDone(true) });
    tl.to(counter, {
      v: 100,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => {
        if (numRef.current)
          numRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
      },
    })
      .to(".preloader-label", { yPercent: -120, duration: 0.5, ease: "power3.in" })
      .to(rootRef.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.15");
    return () => {
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] flex items-end justify-between bg-ink px-6 pb-6 md:px-12 md:pb-10"
    >
      <div className="overflow-hidden">
        <p className="preloader-label font-display text-2xl uppercase tracking-tight text-cream md:text-4xl">
          Shohruhmirzo Khudaykulov
        </p>
      </div>
      <p className="font-display text-6xl text-emerald md:text-8xl">
        <span ref={numRef}>000</span>
      </p>
    </div>
  );
}
