export type PlanetKey = "ecodrop" | "lumora" | "research" | "venture" | "acoustify";

export interface PlanetLink {
  label: string;
  href: string;
  kind: "external" | "instagram" | "telegram" | "linkedin" | "site";
}

export interface PlanetMetric {
  label: string;
  value: number;
  max: number;
  display: string; // formatted readout, e.g. "3.7×" or "$6,000"
}

export interface PlanetData {
  key: PlanetKey;
  name: string;
  pillar: string;
  tagline: string;
  description: string;
  highlights: string[];
  metrics: PlanetMetric[];
  color: string;
  emissive: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  angle: number;
  tilt: number;
  texture: "earth" | "warm" | "satellite" | "mars" | "wave";
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
    highlights: [
      "$6,000 pre-seed grant secured",
      "65% reduction in irrigation time",
      "Off-grid solar autonomy",
      "Field-tested in Uzbekistan",
    ],
    metrics: [
      { label: "Water Efficiency", value: 3.7, max: 5, display: "3.7×" },
      { label: "Irrigation Time Saved", value: 65, max: 100, display: "65%" },
      { label: "Pre-seed Grant", value: 6000, max: 10000, display: "$6,000" },
    ],
    color: "#34d399",
    emissive: "#10b981",
    orbitRadius: 5.2,
    orbitSpeed: 0.18,
    size: 0.7,
    angle: 0,
    tilt: 0.2,
    texture: "earth",
    links: [{ label: "Visit EcoDrop", href: "https://ecodrop.framer.website/en/", kind: "site" }],
  },
  {
    key: "lumora",
    name: "Lumora",
    pillar: "Impact & MedTech",
    tagline: "Coaching 500+ youth, building MedTech pipelines.",
    description:
      "An impact platform mentoring next-generation founders and scientists, while routing MedTech innovation from labs into community clinics.",
    highlights: [
      "500+ youth coached",
      "MedTech pipeline activated",
      "Cross-border mentorship",
      "Clinic partnerships",
    ],
    metrics: [
      { label: "Youth Coached", value: 500, max: 1000, display: "500+" },
      { label: "Mentorship Reach", value: 80, max: 100, display: "80%" },
      { label: "Clinic Partners", value: 6, max: 10, display: "6 sites" },
    ],
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
    highlights: [
      "4,436 samples analyzed",
      "International journal publication",
      "Pearson Scholar @ UofT",
      "Open neuroeconomic datasets",
    ],
    metrics: [
      { label: "Samples Analyzed", value: 4436, max: 5000, display: "4,436" },
      { label: "Publications", value: 1, max: 3, display: "1 intl. journal" },
      { label: "Model Accuracy", value: 92, max: 100, display: "92%" },
    ],
    color: "#a78bfa",
    emissive: "#7c3aed",
    orbitRadius: 9.0,
    orbitSpeed: 0.1,
    size: 0.62,
    angle: 2.6,
    tilt: 0.35,
    texture: "satellite",
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/shohruhmirzo-khudaykulov/", kind: "linkedin" },
    ],
  },
  {
    key: "venture",
    name: "LvlUp Ventures",
    pillar: "Venture Scouting",
    tagline: "Sourcing pre-seed deals for a $250M fund.",
    description:
      "Sourcing and diligencing pre-seed and seed startups across health, climate, and AI for LvlUp Ventures — a $250M VC fund — from cap-table audits to founder interviews.",
    highlights: [
      "Sourced 5 startups",
      "$250M VC fund context",
      "Diligence frameworks",
      "Founder office hours",
    ],
    metrics: [
      { label: "Startups Sourced", value: 5, max: 10, display: "5 deals" },
      { label: "Fund Context", value: 250, max: 500, display: "$250M" },
      { label: "Avg. Diligence Score", value: 87, max: 100, display: "87 / 100" },
    ],
    color: "#f97316",
    emissive: "#ea580c",
    orbitRadius: 11.0,
    orbitSpeed: 0.08,
    size: 0.66,
    angle: 4.0,
    tilt: -0.25,
    texture: "mars",
    links: [{ label: "LvlUp Ventures", href: "https://www.lvlup.vc/", kind: "site" }],
  },
  {
    key: "acoustify",
    name: "Acoustify",
    pillar: "Media & Music",
    tagline: "500k+ views — guitar covers and a media studio.",
    description:
      "A creative studio producing acoustic covers, sonic essays, and short-form storytelling — bridging neuroscience and the language of music.",
    highlights: [
      "500k+ total views",
      "Acoustic covers catalog",
      "Studio production",
      "Sound × neuroscience essays",
    ],
    metrics: [
      { label: "Total Views", value: 500, max: 1000, display: "500k+" },
      { label: "Tracks Produced", value: 24, max: 50, display: "24" },
      { label: "Audience Retention", value: 78, max: 100, display: "78%" },
    ],
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
