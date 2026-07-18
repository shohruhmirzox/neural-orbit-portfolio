# Seedance 2.0 video pipeline

The site is built so the three Higgsfield/Seedance clips drop in with zero
code changes. Until they exist, the hero renders a WebGL particle portrait
and the other sections use holographic CSS backdrops.

## Generation settings (Higgsfield MCP)

- Model: `seedance_2_0` · mode `std` · `1080p` · `16:9` · 8s · `generate_audio: false`
- Pass the identity photo as `image_references` on **every** generation so the
  face stays consistent.
- Wardrobe lock (include in every prompt): black t-shirt under a dark
  overshirt.
- Cost at these settings: **72 credits per clip · 216 credits for all three**
  (fast/720p preview mode: 28 per clip).

### Clip 1 — HERO ORBIT (`hero-orbit.mp4`)

> A confident 17-year-old young man with dark hair, wearing a black t-shirt
> under a dark overshirt, stands centered in a pure black void studio with
> arms crossed. Vivid emerald green rim lighting outlines his silhouette from
> both sides. The camera performs one slow, perfectly smooth 360-degree orbit
> around him at chest height. He holds still, calm and self-assured, subtle
> confident expression. Cinematic, film grain, shallow depth of field,
> anamorphic look, no camera shake, seamless loop-friendly start and end.

### Clip 2 — THE BUILDER (`builder.mp4`)

> The same young man in a black t-shirt and dark overshirt sits at a dark
> minimal desk in a black studio, surrounded by floating holographic emerald
> screens showing brain scans, startup dashboards and code. Slow cinematic
> push-in toward him as he works, holographic light reflecting on his face.
> Moody, high contrast, emerald and black palette, film grain, cinematic.

### Clip 3 — THE CLOSER (`closer.mp4`)

> The same young man in a black t-shirt and dark overshirt walks slowly and
> confidently toward the camera down a dark gallery corridor lined with tall
> glowing emerald screens on both walls. He stops in a hero pose and looks
> directly into the lens. Low-key lighting, emerald accents, volumetric haze,
> film grain, cinematic tracking shot, 24fps feel.

## Integration

1. **Hero orbit (scroll-scrubbed):**
   `node scripts/extract-hero-frames.mjs hero-orbit.mp4`
   → writes `public/sequences/hero/frame_XXXX.webp` + `manifest.json`.
   The hero detects the manifest and switches from particles to the frame
   scrub automatically.
2. **Builder & Closer (ambient loops):** drop the MP4s at
   `public/media/builder.mp4` and `public/media/closer.mp4`. The sections
   fade them in automatically.

## Identity reference

`public/media/portrait.png` is the extracted resume headshot. From this
sandbox, direct upload to `upload.higgsfield.ai` is blocked by the egress
policy — use `media_import_url` with the raw GitHub URL of this file once
the repo is public, or upload any of the higher-resolution photos via the
Higgsfield widget/app.
