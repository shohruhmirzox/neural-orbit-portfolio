export const SITE = {
  name: "Shohruhmirzo Khudaykulov",
  firstName: "SHOHRUHMIRZO",
  lastName: "KHUDAYKULOV",
  tagline: "Neuroscience × AI × Ventures — Lester B. Pearson Scholar, University of Toronto '30",
  location: "Karshi, Uzbekistan ⇄ Toronto, Canada",
  email: "shohruhxudoyqulov787@gmail.com",
};

export type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  detail: string;
};

export const STATS: Stat[] = [
  {
    value: 500,
    suffix: "+",
    label: "Young founders coached",
    detail: "through Lumora, across 11 regions of Uzbekistan",
  },
  {
    value: 700,
    suffix: "K+",
    label: "Video views produced",
    detail: "250+ cinematic short films since 2021",
  },
  {
    value: 1500,
    suffix: "+",
    label: "Community subscribers",
    detail: "CapitalSense — teen investing & behavioral finance",
  },
  {
    value: 2,
    label: "Peer-reviewed publications",
    detail: "epidemiology & pediatric nutrition research",
  },
  {
    value: 400,
    prefix: "$",
    suffix: "K",
    label: "Pearson Scholarship (CAD)",
    detail: "37 scholars worldwide, <1% acceptance",
  },
];

export type Pillar = {
  index: string;
  title: string;
  hook: string;
  body: string;
  meta: string[];
};

export const PILLARS: Pillar[] = [
  {
    index: "01",
    title: "NEUROSCIENCE",
    hook: "Research that ships.",
    body: "Neuroscience freshman at the University of Toronto and published researcher — from a 4,436-sample epidemiology study to modeling dopamine–cortisol dynamics in financial decisions. I run the Neuroscience Department at UN Research Academy, walking students from first question to first publication.",
    meta: ["UofT '30", "2 publications", "Dept. head @ UN Research Academy"],
  },
  {
    index: "02",
    title: "VENTURES",
    hook: "Zero to one, repeatedly.",
    body: "Currently building Admitra.cloud. Co-founded Lumora, a nonprofit that has coached 500+ first-gen youth into medtech founders — 5 ventures, 15 innovations, 30+ competition runs. On the side, I scout early-stage startups for LvlUp Ventures, a $250M fund.",
    meta: ["Admitra.cloud", "Lumora — 500+ coached", "Venture Scout @ LvlUp ($250M)"],
  },
  {
    index: "03",
    title: "STORYTELLING",
    hook: "Craft people feel.",
    body: "Founder of Acoustify.music and Aylanay Media Studio — cinematic guitar covers under the album 'Midnight Pieces', 250+ short films, 700K+ views and 80K+ interactions. Every frame color-graded, every cut intentional. It's the same obsession this site is built with.",
    meta: ["Acoustify.music", "250+ films produced", "80K+ interactions"],
  },
];

export type Project = {
  mark: string;
  title: string;
  role: string;
  pitch: string;
  link: string;
  linkLabel: string;
  accent: string;
};

export const PROJECTS: Project[] = [
  {
    mark: "A.",
    title: "Admitra.cloud",
    role: "Founder — now building",
    pitch:
      "A cloud platform helping ambitious students navigate global university admissions — built from a <1%-acceptance journey.",
    link: "https://admitra.cloud",
    linkLabel: "admitra.cloud",
    accent: "#31f2a0",
  },
  {
    mark: "L.",
    title: "Lumora",
    role: "Co-Founder",
    pitch:
      "A nonprofit turning first-gen youth into medtech founders — 500+ coached, 5 ventures launched, a pipeline into a $250M fund.",
    link: "https://t.me/thelumoraa",
    linkLabel: "t.me/thelumoraa",
    accent: "#8ef2c8",
  },
  {
    mark: "C$",
    title: "CapitalSense",
    role: "Founder",
    pitch:
      "A teen investing community built on behavioral finance — a real 6× portfolio, Wharton top-5% global finish, 1,500+ subscribers.",
    link: "https://t.me/CapitalSense",
    linkLabel: "t.me/CapitalSense",
    accent: "#e8fadf",
  },
  {
    mark: "Ac",
    title: "Acoustify.music",
    role: "Founder, Director & Performer",
    pitch:
      "Cinematic guitar covers under 'Midnight Pieces' — 80K+ interactions, every piece produced with custom grading and visual storytelling.",
    link: "https://www.instagram.com/acoustify.music/",
    linkLabel: "@acoustify.music",
    accent: "#5ce8a8",
  },
];

export type Social = { label: string; href: string; handle: string };

export const SOCIALS: Social[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shohruhmirzoxudaykulov/",
    handle: "shohruhmirzoxudaykulov",
  },
  {
    label: "Telegram",
    href: "https://t.me/shohruhmirzox",
    handle: "@shohruhmirzox",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/acoustify.music/",
    handle: "@acoustify.music",
  },
  {
    label: "Admitra",
    href: "https://admitra.cloud",
    handle: "admitra.cloud",
  },
  {
    label: "Website",
    href: "https://shohrukh.my.canva.site/",
    handle: "shohrukh.my.canva.site",
  },
  {
    label: "Email",
    href: "mailto:shohruhxudoyqulov787@gmail.com",
    handle: "shohruhxudoyqulov787@gmail.com",
  },
];

export const MARQUEE_ITEMS = [
  "NEUROSCIENCE",
  "VENTURES",
  "STORYTELLING",
  "UNIVERSITY OF TORONTO",
  "PEARSON SCHOLAR",
  "ADMITRA.CLOUD",
  "LUMORA",
  "CAPITALSENSE",
  "ACOUSTIFY",
];
