import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE, SOCIALS } from "@/lib/site-data";
import { MEDIA } from "@/lib/media-config";
import { AmbientVideo } from "./AmbientVideo";

function GalleryBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* A dark gallery of glowing panels receding toward the viewer */}
      {[...Array(6)].map((_, i) => (
        <div key={i}>
          <div
            className="absolute w-[2px] bg-gradient-to-b from-transparent via-emerald/35 to-transparent"
            style={{ left: `${6 + i * 7}%`, top: "10%", height: "80%", opacity: 0.5 - i * 0.06 }}
          />
          <div
            className="absolute w-[2px] bg-gradient-to-b from-transparent via-emerald/35 to-transparent"
            style={{ right: `${6 + i * 7}%`, top: "10%", height: "80%", opacity: 0.5 - i * 0.06 }}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(23,227,136,0.12),transparent_55%)]" />
    </div>
  );
}

export function FinaleSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".finale-word", {
        yPercent: 110,
        stagger: 0.09,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: root, start: "top 62%", once: true },
      });
      gsap.from(".finale-cta", {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 45%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const words = ["LET'S", "BUILD", "WHAT'S", "NEXT."];

  return (
    <section
      ref={rootRef}
      id="contact"
      className="relative overflow-hidden bg-ink-soft pt-28 md:pt-40"
    >
      <GalleryBackdrop />
      <div className="absolute inset-0">
        <AmbientVideo src="/media/closer.mp4" remoteSrc={MEDIA.CLOSER_URL} />
      </div>
      <div className="vignette pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <h2 className="display-huge text-[15vw] text-cream md:text-[10rem]">
          {words.map((w, i) => (
            <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-top">
              <span className={`finale-word inline-block ${i === 3 ? "text-emerald" : ""}`}>
                {w}
              </span>
            </span>
          ))}
        </h2>
        <p className="mt-6 max-w-2xl font-serif-accent text-xl italic text-cream/70 md:text-2xl">
          Open to research collaborations, ventures worth obsessing over, and conversations about
          brains, startups and cinema.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${SITE.email}`}
            className="finale-cta group relative overflow-hidden rounded-full bg-emerald px-9 py-4 font-body text-xs font-semibold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:scale-[1.04]"
          >
            Work with me
          </a>
          <a
            href="https://t.me/shohruhmirzox"
            target="_blank"
            rel="noreferrer"
            className="finale-cta rounded-full border border-cream/25 px-9 py-4 font-body text-xs font-semibold uppercase tracking-[0.24em] text-cream transition-colors duration-300 hover:border-emerald hover:text-emerald"
          >
            Follow the journey
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-cream/10 pb-10 pt-10 md:mt-32">
          <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
            <div>
              <p className="font-display text-2xl uppercase text-cream">{SITE.name}</p>
              <p className="mt-2 font-body text-xs leading-relaxed text-cream/50">
                Neuroscience · Ventures · Storytelling
                <br />
                {SITE.location}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="group font-body text-xs text-cream/60 transition-colors hover:text-cream"
                >
                  <span className="mr-2 text-emerald opacity-0 transition-opacity group-hover:opacity-100">
                    →
                  </span>
                  <span className="uppercase tracking-[0.2em]">{s.label}</span>
                  <span className="block truncate pl-5 text-[11px] text-cream/35 group-hover:text-emerald">
                    {s.handle}
                  </span>
                </a>
              ))}
            </div>
          </div>
          <p className="mt-14 font-body text-[10px] uppercase tracking-[0.3em] text-cream/30">
            © 2026 {SITE.name} — Karshi → Toronto. Built with obsession.
          </p>
        </footer>
      </div>
    </section>
  );
}
