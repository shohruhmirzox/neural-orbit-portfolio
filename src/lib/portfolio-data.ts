export type PlanetKey = "ecodrop" | "lumora" | "research" | "venture" | "acoustify";

export interface PlanetLink {
  label: string;
  href: string;
  kind: "external" | "instagram" | "telegram" | "linkedin" | "site";
}

export interface PlanetData {
  key: PlanetKey;
  name: string;
  pillar: string;
  tagline: string;
  description: string;
  highlights: string[];
  color: string;
  emissive: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  angle: number;
  tilt: number;
  texture: "lush" | "warm" | "violet" | "chrome" | "wave";
  links: PlanetLink[];
}

export const PLANETS: PlanetData[] = [
  {
    key: "ecodrop",
    name: "EcoDrop",
    pillar: "AgTech Innovation",
    tagline: "Solar-powered irrigation saving 3.7× more water.",
    description:
      "An autonomous, solar-powered drip irrigation system engineered for arid climates. Soil-moisture telemetry and predictive scheduling cut waste while keeping yields high.",
    highlights: ["3.7× water efficiency", "Off-grid solar", "IoT soil telemetry", "Field-tested in Uzbekistan"],
    color: "#34d399",
    emissive: "#10b981",
    orbitRadius: 5.2,
    orbitSpeed: 0.18,
    size: 0.55,
    angle: 0,
    tilt: 0.2,
    texture: "lush",
    links: [{ label: "Visit EcoDrop", href: "https://ecodrop.framer.website/en/", kind: "site" }],
  },
  {
    key: "lumora",
    name: "Lumora",
    pillar: "Impact & MedTech",
    tagline: "Coaching 500+ youth, building MedTech pipelines.",
    description:
      "An impact platform mentoring next-generation founders and scientists, while routing MedTech innovation from labs into community clinics.",
    highlights: ["500+ youth coached", "MedTech pipeline", "Cross-border mentorship", "Clinic partnerships"],
    color: "#fbbf24",
    emissive: "#f59e0b",
    orbitRadius: 7.0,
    orbitSpeed: 0.13,
    size: 0.6,
    angle: 1.3,
    tilt: -0.15,
    texture: "warm",
    links: [{ label: "Lumora on Telegram", href: "https://t.me/thelumoraa", kind: "telegram" }],
  },
  {
    key: "research",
    name: "Research",
    pillar: "Neuroscience",
    tagline: "HAT pathology & neuroeconomics simulations.",
    description:
      "Computational neuroscience research on Human African Trypanosomiasis (HAT) and decision-making models bridging neural circuits with economic behavior.",
    highlights: ["HAT mechanism modeling", "Neuroeconomics sims", "Pearson Scholar @ UofT", "Open datasets"],
    color: "#a78bfa",
    emissive: "#7c3aed",
    orbitRadius: 9.0,
    orbitSpeed: 0.1,
    size: 0.7,
    angle: 2.6,
    tilt: 0.35,
    texture: "violet",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/shohruhmirzo-khudaykulov/", kind: "linkedin" },
    ],
  },
  {
    key: "venture",
    name: "LvlUp Ventures",
    pillar: "Venture Scouting",
    tagline: "Evaluating million-dollar early-stage deals.",
    description:
      "Sourcing and diligencing pre-seed and seed startups across health, climate, and AI — from cap-table audits to founder interviews.",
    highlights: ["$1M+ deal review", "Global scouting net", "Diligence frameworks", "Founder office hours"],
    color: "#e5e7eb",
    emissive: "#94a3b8",
    orbitRadius: 11.0,
    orbitSpeed: 0.08,
    size: 0.58,
    angle: 4.0,
    tilt: -0.25,
    texture: "chrome",
    links: [{ label: "LvlUp Ventures", href: "https://www.lvlup.vc/", kind: "site" }],
  },
  {
    key: "acoustify",
    name: "Acoustify",
    pillar: "Media & Music",
    tagline: "500k+ views — guitar covers and a media studio.",
    description:
      "A creative studio producing acoustic covers, sonic essays, and short-form storytelling — bridging neuroscience and the language of music.",
    highlights: ["500k+ total views", "Acoustic covers", "Studio production", "Sound × neuroscience essays"],
    color: "#22d3ee",
    emissive: "#06b6d4",
    orbitRadius: 13.2,
    orbitSpeed: 0.06,
    size: 0.5,
    angle: 5.4,
    tilt: 0.1,
    texture: "wave",
    links: [{ label: "Instagram @acoustify.music", href: "https://www.instagram.com/acoustify.music/", kind: "instagram" }],
  },
];
