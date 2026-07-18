#!/usr/bin/env node
/**
 * Splits the generated hero-orbit clip into a scroll-scrubbable frame
 * sequence and writes the manifest the site auto-detects.
 *
 * Usage:  node scripts/extract-hero-frames.mjs path/to/hero-orbit.mp4 [fps]
 *
 * Requires ffmpeg. Defaults to 12 fps → ~96 frames for an 8s clip, which
 * scrubs smoothly while keeping the payload small. Frames are emitted as
 * WebP at 1280px wide.
 */
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , input, fpsArg] = process.argv;
if (!input) {
  console.error("Usage: node scripts/extract-hero-frames.mjs <clip.mp4> [fps]");
  process.exit(1);
}
const fps = Number(fpsArg ?? 12);
const outDir = join(process.cwd(), "public", "sequences", "hero");
mkdirSync(outDir, { recursive: true });

execSync(
  `ffmpeg -y -i "${input}" -vf "fps=${fps},scale=1280:-2" -c:v libwebp -quality 82 "${join(outDir, "frame_%04d.webp")}"`,
  { stdio: "inherit" },
);

const count = readdirSync(outDir).filter((f) => f.endsWith(".webp")).length;
writeFileSync(
  join(outDir, "manifest.json"),
  JSON.stringify({ count, pattern: "/sequences/hero/frame_%04d.webp", fps }, null, 2),
);
console.log(`Wrote ${count} frames + manifest.json to public/sequences/hero`);
