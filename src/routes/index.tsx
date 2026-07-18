import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Preloader } from "@/components/cinematic/Preloader";
import { Header } from "@/components/cinematic/Header";
import { HeroSection } from "@/components/cinematic/HeroSection";
import { StatsStrip } from "@/components/cinematic/StatsStrip";
import { PillarsSection } from "@/components/cinematic/PillarsSection";
import { WorkSection } from "@/components/cinematic/WorkSection";
import { FinaleSection } from "@/components/cinematic/FinaleSection";
import { GrainOverlay } from "@/components/cinematic/GrainOverlay";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Shohruhmirzo Khudaykulov — Neuroscience × Ventures × Storytelling" },
      {
        name: "description",
        content:
          "Cinematic portfolio of Shohruhmirzo Khudaykulov — Lester B. Pearson Scholar at the University of Toronto, neurotech entrepreneur, founder of Admitra.cloud, Lumora and Acoustify.music.",
      },
      {
        property: "og:title",
        content: "Shohruhmirzo Khudaykulov — Portfolio",
      },
      {
        property: "og:description",
        content:
          "Neuroscience × AI × Ventures. One scroll, one orbit — the work of a Pearson Scholar building what's next.",
      },
    ],
  }),
});

/** Lenis smooth scroll wired into GSAP's ticker + ScrollTrigger. */
function useSmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
    };
    document.addEventListener("click", onClick);

    // Recalculate pin positions once fonts/canvases have settled
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      clearTimeout(t);
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}

function Index() {
  useSmoothScroll();

  return (
    <main className="relative bg-ink text-cream">
      <Preloader />
      <Header />
      <HeroSection />
      <StatsStrip />
      <PillarsSection />
      <WorkSection />
      <FinaleSection />
      <GrainOverlay />
    </main>
  );
}
