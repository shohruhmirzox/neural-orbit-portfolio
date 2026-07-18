import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/site-data";
import { MEDIA } from "@/lib/media-config";
import {
  loadManifest,
  ParticleOrbit,
  SequenceOrbit,
  VideoScrubOrbit,
  type OrbitEngine,
} from "./hero-orbit";

function Line({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className ?? ""}`}>
      <span className="hero-line block">
        {text.split("").map((ch, i) => (
          <span key={i} className="hero-letter inline-block will-change-transform">
            {ch}
          </span>
        ))}
      </span>
    </span>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const degRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let engine: OrbitEngine | null = null;
    let cancelled = false;
    const engines: OrbitEngine[] = [];

    const boot = async () => {
      const manifest = await loadManifest("/sequences/hero/manifest.json");
      if (cancelled) return;
      if (manifest !== null) {
        engine = new SequenceOrbit(canvas, manifest);
        engines.push(engine);
      } else {
        // Particles render immediately; the generated orbit clip takes over
        // once buffered. If the CDN fails, particles simply stay.
        const particle = new ParticleOrbit(canvas, "/media/portrait.png");
        engines.push(particle);
        engine = particle;
        if (MEDIA.HERO_ORBIT_URL) {
          const scrub: VideoScrubOrbit = new VideoScrubOrbit(section, MEDIA.HERO_ORBIT_URL, {
            onReady: () => {
              if (cancelled) return;
              engine = scrub;
              canvas.style.transition = "opacity 0.9s ease";
              canvas.style.opacity = "0";
              setTimeout(() => particle.dispose(), 1000);
            },
            onError: () => scrub.dispose(),
          });
          engines.push(scrub);
        }
      }
      engine.resize();
      if (reduced) engine.setProgress(0.12);
    };
    void boot();

    const onResize = () => engine?.resize();
    window.addEventListener("resize", onResize);

    const onPointer = (e: PointerEvent) => {
      engine?.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener("pointermove", onPointer);

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(".hero-letter", { yPercent: 0 });
        return;
      }

      // Intro: letters rise in one by one behind the preloader curtain
      gsap.set(".hero-letter", { yPercent: 120, rotate: 6 });
      gsap.to(".hero-letter", {
        yPercent: 0,
        rotate: 0,
        duration: 1.15,
        ease: "power4.out",
        stagger: 0.04,
        delay: 1.35,
      });
      if (subRef.current)
        gsap.from(subRef.current, {
          opacity: 0,
          y: 24,
          duration: 1,
          ease: "power3.out",
          delay: 2.2,
        });
      if (cueRef.current)
        gsap.from(cueRef.current, {
          opacity: 0,
          duration: 1,
          delay: 2.6,
        });

      // One pinned timeline drives everything: the 360° orbit scrub, the HUD
      // readout and the kinetic type exit.
      gsap
        .timeline({
          defaults: { duration: 0.5 },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              engine?.setProgress(self.progress);
              if (degRef.current)
                degRef.current.textContent = `${String(Math.round(self.progress * 360)).padStart(3, "0")}°`;
              if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        })
        .to(".hero-line-1", { xPercent: -16, ease: "none" }, 0)
        .to(".hero-line-2", { xPercent: 16, ease: "none" }, 0)
        .to(subRef.current, { opacity: 0, y: -30, ease: "none" }, 0)
        .to(cueRef.current, { opacity: 0, ease: "none" }, 0)
        .to(titleRef.current, { opacity: 0, ease: "power1.in" }, 0.28)
        .fromTo(".hero-outro", { opacity: 0, y: 60 }, { opacity: 1, y: 0, ease: "none" }, 0.55)
        .to(".hero-outro", { opacity: 0, y: -40, ease: "none" }, 0.88);
    }, section);

    return () => {
      cancelled = true;
      ctx.revert();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      engines.forEach((e) => e.dispose());
    };
  }, []);

  return (
    <section ref={sectionRef} id="top" className="relative h-screen w-full overflow-hidden">
      {/* Orbit canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="vignette pointer-events-none absolute inset-0" />

      {/* Name */}
      <div
        ref={titleRef}
        className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center"
      >
        <h1 className="display-huge text-center text-[13.5vw] leading-[0.86] md:text-[11vw]">
          <Line text={SITE.firstName} className="hero-line-1" />
          <Line text={SITE.lastName} className="hero-line-2 text-outline-emerald" />
        </h1>
        <p
          ref={subRef}
          className="mt-6 max-w-xl px-6 text-center font-body text-[11px] uppercase tracking-[0.34em] text-cream/70 md:text-xs"
        >
          {SITE.tagline}
        </p>
      </div>

      {/* Mid-orbit interstitial */}
      <div className="hero-outro pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0">
        <p className="max-w-3xl px-6 text-center">
          <span className="font-serif-accent text-3xl italic leading-snug text-cream/90 md:text-5xl">
            I build at the intersection of <span className="text-emerald emerald-glow">brains</span>
            , <span className="text-emerald emerald-glow">ventures</span> and{" "}
            <span className="text-emerald emerald-glow">stories</span>.
          </span>
        </p>
      </div>

      {/* HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between px-5 pb-5 md:px-10 md:pb-8">
        <div ref={cueRef} className="flex items-center gap-3">
          <div className="h-10 w-px overflow-hidden bg-cream/20">
            <div className="h-1/2 w-full animate-pulse bg-emerald" />
          </div>
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-cream/60">
            Scroll to orbit
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-cream/60">
            Orbit
          </span>
          <span ref={degRef} className="font-display text-lg tabular-nums text-emerald">
            000°
          </span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 h-px bg-cream/10">
        <div ref={barRef} className="h-full w-full origin-left scale-x-0 bg-emerald" />
      </div>
    </section>
  );
}
