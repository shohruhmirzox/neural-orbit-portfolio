import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PILLARS, SITE } from "@/lib/site-data";
import { MEDIA } from "@/lib/media-config";
import { PortraitPlate } from "./PortraitPlate";

export function PillarsSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    // Reduced motion: the motion-reduce: classes lay the pillars out as a
    // plain stacked section, so there is nothing to animate.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".pillar-panel");
      const steps = gsap.utils.toArray<HTMLElement>(".pillar-step");
      const bars = gsap.utils.toArray<HTMLElement>(".pillar-step-bar");

      let active = -1;
      const sync = (time: number) => {
        const i = Math.min(panels.length - 1, Math.max(0, Math.floor(time)));
        if (i !== active) {
          active = i;
          steps.forEach((s, k) => (s.dataset.active = String(k === i)));
        }
        bars.forEach((b, k) => {
          b.style.transform = `scaleX(${Math.min(1, Math.max(0, time - k))})`;
        });
      };
      sync(0);

      // The plate wipes up into frame as the section arrives
      gsap.fromTo(
        ".pillars-plate",
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "power4.out",
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        },
      );

      // Sync from the timeline itself: with a smoothed scrub it keeps easing
      // after the last scroll event, so ScrollTrigger's onUpdate would lag.
      const tl = gsap.timeline({
        onUpdate: () => sync(tl.time()),
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=280%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // Slow photographic push-in across all three pillars
      tl.fromTo(
        ".pillars-plate .plate-media",
        { scale: 1.2, yPercent: 4 },
        { scale: 1.02, yPercent: -2, ease: "none", duration: panels.length },
        0,
      );

      panels.forEach((panel, i) => {
        const title = panel.querySelector(".pillar-title");
        const rows = panel.querySelectorAll(".pillar-row");
        tl.fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, i)
          .fromTo(
            title,
            { yPercent: 105 },
            { yPercent: 0, duration: 0.22, ease: "power3.out" },
            i + 0.01,
          )
          .fromTo(
            rows,
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.2, ease: "power3.out" },
            i + 0.1,
          );
        if (i < panels.length - 1) {
          tl.to(title, { yPercent: -105, duration: 0.14, ease: "power2.in" }, i + 0.84).to(
            rows,
            { y: -30, autoAlpha: 0, duration: 0.12, ease: "power2.in" },
            i + 0.84,
          );
          tl.set(panel, { autoAlpha: 0 }, i + 0.99);
        }
      });
      // Hold the final pillar on screen before the pin releases
      tl.to({}, { duration: 0.4 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="pillars"
      className="relative h-screen w-full overflow-hidden bg-ink-soft motion-reduce:h-auto motion-reduce:overflow-visible"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_60%,rgba(23,227,136,0.08),transparent_55%)]"
      />

      {/* Phones: the portrait sits behind the copy. Desktop: a framed plate on the right. */}
      <div className="pillars-plate absolute inset-0 opacity-35 md:inset-auto md:bottom-[11%] md:right-10 md:top-[14%] md:w-[30vw] md:max-w-[480px] md:opacity-100 lg:right-16">
        <PortraitPlate
          photo={MEDIA.PORTRAIT}
          videoSrc={MEDIA.BUILDER_URL || undefined}
          alt={`Portrait of ${SITE.name}`}
          position="50% 24%"
          caption={SITE.name}
          aside="UofT '30"
          captionClassName="max-md:hidden"
          className="h-full w-full"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-ink/50 md:hidden" />

      <div className="absolute left-6 top-20 z-10 md:left-16 md:top-24 lg:left-24 motion-reduce:relative motion-reduce:left-auto motion-reduce:top-auto motion-reduce:px-6 motion-reduce:pt-24">
        <p className="font-body text-[10px] uppercase tracking-[0.34em] text-emerald">
          Three pillars
        </p>
      </div>

      {PILLARS.map((p) => (
        <div
          key={p.index}
          className="pillar-panel invisible absolute inset-0 z-10 flex items-center opacity-0 motion-reduce:visible motion-reduce:relative motion-reduce:py-16 motion-reduce:opacity-100"
        >
          <div className="w-full px-6 md:pl-16 md:pr-[calc(min(30vw,480px)+6rem)] lg:pl-24 lg:pr-[calc(min(30vw,480px)+8rem)]">
            <div className="overflow-hidden pb-[0.04em]">
              <h2 className="pillar-title display-huge text-[12.5vw] text-cream md:text-[clamp(4.5rem,8.2vw,9.5rem)]">
                {p.title}
              </h2>
            </div>
            <div className="mt-6 grid gap-5 md:mt-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
              <p className="pillar-row font-serif-accent text-2xl italic leading-snug text-emerald md:text-3xl lg:text-4xl">
                {p.hook}
              </p>
              <div>
                <p className="pillar-row max-w-xl font-body text-sm leading-relaxed text-cream/80 md:text-[15px]">
                  {p.body}
                </p>
                <div className="pillar-row mt-6 flex flex-wrap gap-2">
                  {p.meta.map((m) => (
                    <span
                      key={m}
                      className="rounded-full border border-cream/15 bg-ink/40 px-3 py-1 font-body text-[10px] uppercase tracking-[0.18em] text-cream/70"
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

      {/* Progress: which pillar is on screen */}
      <ol className="absolute bottom-6 left-6 right-6 z-20 grid grid-cols-3 gap-3 md:bottom-10 md:left-16 md:right-auto md:w-[min(46vw,560px)] lg:left-24 motion-reduce:hidden">
        {PILLARS.map((p) => (
          <li
            key={p.index}
            data-active="false"
            className="pillar-step text-cream/35 transition-colors duration-500 data-[active=true]:text-cream"
          >
            <div className="h-px w-full overflow-hidden bg-cream/15">
              <div className="pillar-step-bar h-full w-full origin-left scale-x-0 bg-emerald" />
            </div>
            <p className="mt-3 flex gap-2 font-body text-[10px] uppercase tracking-[0.26em]">
              <span className="text-emerald">{p.index}</span>
              <span className="hidden sm:inline">{p.title}</span>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
