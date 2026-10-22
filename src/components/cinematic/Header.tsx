import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/site-data";

/** Hairline across the top of the viewport showing overall page progress. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[95] h-[2px]">
      <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-emerald" />
    </div>
  );
}

const LINKS = [
  { label: "Pillars", href: "#pillars" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-[90] mix-blend-difference">
      <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-xl leading-none text-cream">SK</span>
          <span className="hidden font-body text-[10px] uppercase tracking-[0.3em] text-cream/60 md:inline">
            {SITE.location}
          </span>
        </a>
        <nav className="flex items-center gap-5 md:gap-8">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="link-underline font-body text-[11px] uppercase tracking-[0.28em] text-cream/80 transition-colors hover:text-cream"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
