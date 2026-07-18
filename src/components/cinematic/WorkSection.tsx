import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS, type Project } from "@/lib/site-data";

function ProjectCard({ p }: { p: Project }) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, {
      rotateY: x * 7,
      rotateX: -y * 7,
      y: -6,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 900,
    });
  };
  const onLeave = () => {
    if (ref.current)
      gsap.to(ref.current, {
        rotateX: 0,
        rotateY: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.6)",
      });
  };

  return (
    <a
      ref={ref}
      href={p.link}
      target="_blank"
      rel="noreferrer"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="work-card group relative block overflow-hidden rounded-md border border-cream/10 bg-card p-7 transition-colors duration-500 hover:border-emerald/50 md:p-9"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at 30% 20%, ${p.accent}14, transparent 65%)`,
        }}
      />
      <div className="flex items-start justify-between">
        {/* Project mark */}
        <span
          className="font-display flex h-14 w-14 items-center justify-center rounded-full border text-xl transition-transform duration-500 group-hover:scale-110"
          style={{ borderColor: `${p.accent}55`, color: p.accent }}
        >
          {p.mark}
        </span>
        <span className="font-body text-lg text-cream/30 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-emerald">
          ↗
        </span>
      </div>
      <h3 className="font-display mt-8 text-3xl uppercase text-cream md:text-4xl">{p.title}</h3>
      <p className="mt-1 font-body text-[10px] uppercase tracking-[0.28em] text-emerald">
        {p.role}
      </p>
      <p className="mt-4 max-w-md font-body text-sm leading-relaxed text-cream/65">{p.pitch}</p>
      <p className="link-underline mt-6 inline-block font-body text-xs tracking-wide text-cream/50 group-hover:text-cream">
        {p.linkLabel}
      </p>
    </a>
  );
}

export function WorkSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".work-heading .hero-letter", {
        yPercent: 120,
        stagger: 0.03,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: { trigger: root, start: "top 70%", once: true },
      });
      gsap.from(".work-card", {
        y: 90,
        opacity: 0,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".work-grid", start: "top 82%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="work" className="relative bg-ink py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="font-body text-[10px] uppercase tracking-[0.34em] text-emerald">
          Selected work
        </p>
        <h2 className="work-heading display-huge mt-4 text-[13vw] text-cream md:text-[8rem]">
          <span className="block overflow-hidden">
            <span className="block">
              {"THE WORK".split("").map((ch, i) => (
                <span key={i} className="hero-letter inline-block">
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </span>
          </span>
        </h2>
        <div className="work-grid mt-14 grid gap-5 md:grid-cols-2">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.title} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
