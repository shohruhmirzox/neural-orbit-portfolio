import { SITE } from "@/lib/site-data";

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
