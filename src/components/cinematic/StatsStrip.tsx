import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MARQUEE_ITEMS, STATS } from "@/lib/site-data";

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-cream/10 py-3">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-display px-6 text-sm uppercase tracking-wide text-cream/50">
              {item}
            </span>
            <span className="text-emerald">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function StatsStrip() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const numbers = gsap.utils.toArray<HTMLElement>(".stat-number");
      numbers.forEach((el) => {
        const target = Number(el.dataset.value ?? 0);
        if (reduced) {
          el.textContent = target.toLocaleString("en-US");
          return;
        }
        const counter = { v: 0 };
        gsap.to(counter, {
          v: target,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(counter.v).toLocaleString("en-US");
          },
        });
      });

      if (!reduced) {
        gsap.from(".stat-cell", {
          y: 60,
          opacity: 0,
          stagger: 0.08,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative bg-ink">
      <Marquee />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 px-6 py-20 md:grid-cols-5 md:py-28">
        {STATS.map((s) => (
          <div key={s.label} className="stat-cell">
            <p className="font-display text-5xl leading-none text-cream md:text-6xl">
              {s.prefix && <span className="text-emerald">{s.prefix}</span>}
              <span className="stat-number tabular-nums" data-value={s.value}>
                0
              </span>
              {s.suffix && <span className="text-emerald">{s.suffix}</span>}
            </p>
            <p className="mt-3 font-body text-[11px] uppercase tracking-[0.22em] text-cream">
              {s.label}
            </p>
            <p className="mt-1.5 font-body text-[11px] leading-relaxed text-cream/50">{s.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
