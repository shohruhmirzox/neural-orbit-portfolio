import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PILLARS } from "@/lib/site-data";
import { MEDIA } from "@/lib/media-config";
import { AmbientVideo } from "./AmbientVideo";
import { ClipFrame } from "./ClipFrame";

const HOLO_SCREENS = [
  { top: "12%", left: "6%", w: 190, h: 120, delay: 0, speed: -18 },
  { top: "62%", left: "10%", w: 150, h: 95, delay: 1.2, speed: -32 },
  { top: "18%", left: "78%", w: 220, h: 130, delay: 0.6, speed: -24 },
  { top: "68%", left: "74%", w: 170, h: 110, delay: 1.8, speed: -40 },
  { top: "40%", left: "88%", w: 120, h: 80, delay: 0.3, speed: -14 },
  { top: "44%", left: "2%", w: 130, h: 85, delay: 2.2, speed: -26 },
];

function HoloBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(23,227,136,0.14),transparent_60%)]" />
      {HOLO_SCREENS.map((s, i) => (
        <div
          key={i}
          data-speed={s.speed}
          className="holo-screen absolute rounded-sm border border-emerald/25 bg-emerald/[0.045] backdrop-blur-[2px]"
          style={{
            top: s.top,
            left: s.left,
            width: s.w,
            height: s.h,
            animation: `holo-flicker 7s ease-in-out ${s.delay}s infinite`,
          }}
        >
          <div className="scanline absolute inset-0 opacity-40" />
          <div className="absolute left-2 top-2 h-1 w-8 bg-emerald/50" />
          <div className="absolute bottom-2 left-2 right-6 space-y-1.5">
            <div className="h-px w-3/4 bg-emerald/30" />
            <div className="h-px w-1/2 bg-emerald/20" />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes holo-flicker {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.9; }
          52% { opacity: 0.4; }
          54% { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

export function PillarsSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(".pillar-panel", { autoAlpha: 1, position: "relative" });
        return;
      }

      // Floating hologram parallax
      gsap.utils.toArray<HTMLElement>(".holo-screen").forEach((el) => {
        gsap.to(el, {
          y: Number(el.dataset.speed ?? -20) * 6,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      const panels = gsap.utils.toArray<HTMLElement>(".pillar-panel");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=280%",
          pin: true,
          scrub: true,
          anticipatePin: 1,
        },
      });

      panels.forEach((panel, i) => {
        const title = panel.querySelector(".pillar-title");
        const rows = panel.querySelectorAll(".pillar-row");
        tl.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, i)
          .fromTo(
            title,
            { yPercent: 60, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.2, ease: "power3.out" },
            i + 0.02,
          )
          .fromTo(
            rows,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.04, duration: 0.18, ease: "power3.out" },
            i + 0.1,
          );
        if (i < panels.length - 1) {
          tl.to(panel, { autoAlpha: 0, y: -60, duration: 0.14 }, i + 0.86);
        }
      });
      // Hold the final pillar on screen before the pin releases
      tl.to({}, { duration: 0.6 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="pillars"
      className="relative h-screen w-full overflow-hidden bg-ink-soft"
    >
      {/* Backdrop: generated clip when present, holographic set until then */}
      <HoloBackdrop />
      <div className="absolute inset-0 opacity-60">
        <AmbientVideo src="/media/builder.mp4" remoteSrc={MEDIA.BUILDER_URL} />
      </div>
      {/* Lighter readability scrim (left→right) instead of a full dark vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />

      <div className="absolute left-5 top-20 z-10 md:left-10 md:top-24">
        <p className="font-body text-[10px] uppercase tracking-[0.34em] text-emerald">
          Three pillars
        </p>
      </div>

      {/* Always-visible framed clip so the footage is unmistakable */}
      <div className="pointer-events-none absolute bottom-6 right-4 z-20 w-[46vw] max-w-[420px] md:bottom-10 md:right-10 md:w-[34vw]">
        <ClipFrame
          src="/media/builder.mp4"
          remoteSrc={MEDIA.BUILDER_URL}
          reel="Reel 02 · Live"
          title="The Builder"
        />
      </div>

      {PILLARS.map((p) => (
        <div
          key={p.index}
          className="pillar-panel invisible absolute inset-0 z-10 flex items-center opacity-0"
        >
          <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
            <div className="overflow-hidden">
              <h2 className="pillar-title display-huge text-[12.5vw] text-cream md:text-[9.5rem]">
                <span className="mr-4 align-top font-body text-base tracking-[0.3em] text-emerald md:text-xl">
                  {p.index}
                </span>
                {p.title}
              </h2>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1.2fr]">
              <p className="pillar-row font-serif-accent text-2xl italic leading-snug text-emerald md:text-4xl">
                {p.hook}
              </p>
              <div>
                <p className="pillar-row max-w-xl font-body text-sm leading-relaxed text-cream/80 md:text-base">
                  {p.body}
                </p>
                <div className="pillar-row mt-6 flex flex-wrap gap-2">
                  {p.meta.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-emerald/30 px-3 py-1 font-body text-[10px] uppercase tracking-[0.18em] text-cream/70"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
