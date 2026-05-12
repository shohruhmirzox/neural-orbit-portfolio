import * as THREE from "three";

// Procedural canvas-based textures so we don't depend on external GLTF assets.
// Each returns a CanvasTexture sized for a sphere (2:1 equirectangular).

function makeCanvas(w = 1024, h = 512) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function noise(x: number, y: number, seed = 1) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.123) * 43758.5453;
  return s - Math.floor(s);
}

function smoothNoise(x: number, y: number, seed = 1) {
  let v = 0;
  let amp = 1;
  let freq = 1;
  let total = 0;
  for (let o = 0; o < 5; o++) {
    v += noise(x * freq, y * freq, seed + o) * amp;
    total += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return v / total;
}

export function makeEarthTexture(): THREE.CanvasTexture {
  const c = makeCanvas(1024, 512);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const u = x / c.width;
      const v = y / c.height;
      const lat = (v - 0.5) * Math.PI;
      const n = smoothNoise(u * 8, v * 4, 7) * 0.6 + smoothNoise(u * 24, v * 12, 11) * 0.4;
      const land = n > 0.52;
      const ice = Math.abs(lat) > 1.15 || (Math.abs(lat) > 1.0 && n > 0.5);
      const i = (y * c.width + x) * 4;
      if (ice) {
        img.data[i] = 230; img.data[i + 1] = 240; img.data[i + 2] = 250;
      } else if (land) {
        const veg = smoothNoise(u * 20, v * 10, 3);
        img.data[i] = 40 + veg * 60;
        img.data[i + 1] = 90 + veg * 80;
        img.data[i + 2] = 30 + veg * 40;
      } else {
        const depth = smoothNoise(u * 6, v * 3, 5);
        img.data[i] = 8 + depth * 20;
        img.data[i + 1] = 30 + depth * 40;
        img.data[i + 2] = 80 + depth * 90;
      }
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makeEarthNightTexture(): THREE.CanvasTexture {
  const c = makeCanvas(1024, 512);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);
  // City lights along land masses (rough approximation using same noise)
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * c.width;
    const y = Math.random() * c.height;
    const u = x / c.width;
    const v = y / c.height;
    const n = smoothNoise(u * 8, v * 4, 7) * 0.6 + smoothNoise(u * 24, v * 12, 11) * 0.4;
    if (n > 0.55) {
      const r = Math.random() * 1.6 + 0.4;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, "rgba(255,210,140,0.95)");
      g.addColorStop(1, "rgba(255,180,80,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeCloudsTexture(): THREE.CanvasTexture {
  const c = makeCanvas(1024, 512);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const u = x / c.width;
      const v = y / c.height;
      const n = smoothNoise(u * 6, v * 3, 21) * 0.6 + smoothNoise(u * 18, v * 9, 27) * 0.4;
      const a = Math.max(0, n - 0.55) * 480;
      const i = (y * c.width + x) * 4;
      img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 255;
      img.data[i + 3] = Math.min(220, a);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeMarsTexture(): THREE.CanvasTexture {
  const c = makeCanvas(1024, 512);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const u = x / c.width;
      const v = y / c.height;
      const n =
        smoothNoise(u * 10, v * 5, 1) * 0.5 +
        smoothNoise(u * 30, v * 15, 4) * 0.3 +
        smoothNoise(u * 80, v * 40, 9) * 0.2;
      const r = 150 + n * 90;
      const g = 60 + n * 60;
      const b = 30 + n * 30;
      const i = (y * c.width + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
  }
  // craters
  for (let k = 0; k < 80; k++) {
    const cx = Math.random() * c.width;
    const cy = Math.random() * c.height;
    const r = 6 + Math.random() * 22;
    const grad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
    grad.addColorStop(0, "rgba(40,15,5,0.55)");
    grad.addColorStop(1, "rgba(255,180,120,0)");
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    const id = ctx.getImageData(0, 0, c.width, c.height);
    img.data.set(id.data);
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makeMoonTexture(): THREE.CanvasTexture {
  const c = makeCanvas(1024, 512);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const u = x / c.width;
      const v = y / c.height;
      const n = smoothNoise(u * 10, v * 5, 33) * 0.6 + smoothNoise(u * 40, v * 20, 41) * 0.4;
      const g = 130 + n * 90;
      const i = (y * c.width + x) * 4;
      img.data[i] = g; img.data[i + 1] = g - 4; img.data[i + 2] = g - 12; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeNebulaSkybox(): THREE.Texture {
  // High-resolution (6K-class) equirectangular Makoto Shinkai-inspired nebula skybox.
  // Cap at 6144 to respect common WebGL MAX_TEXTURE_SIZE (8192) with safety margin.
  const maxTex = (() => {
    try {
      const gl = document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl");
      // @ts-ignore
      return gl ? (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).MAX_TEXTURE_SIZE) as number : 4096;
    } catch { return 4096; }
  })();
  const W = Math.min(6144, maxTex);
  const H = W / 2;
  const c = makeCanvas(W, H);
  const ctx = c.getContext("2d")!;

  // 1. Deep base — vertical gradient from indigo void to twilight magenta
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0.0, "#04020f");
  bg.addColorStop(0.25, "#0a0530");
  bg.addColorStop(0.55, "#1a0a48");
  bg.addColorStop(0.8, "#2a0f4a");
  bg.addColorStop(1.0, "#070318");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 2. Soft horizontal aurora bands (Shinkai-style atmospheric color wash)
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 6; i++) {
    const y = (i / 6) * H + Math.random() * 80;
    const grad = ctx.createLinearGradient(0, y - 90, 0, y + 90);
    const hue = ["rgba(120,70,255,0.18)", "rgba(255,90,200,0.14)", "rgba(80,180,255,0.16)"][i % 3];
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.5, hue);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 90, W, 180);
  }

  // 3. Large nebula blobs — deep purples, magentas, cyan accents
  const blobs = [
    { x: 0.12, y: 0.35, r: W * 0.22, c1: "rgba(150,80,255,0.65)" },
    { x: 0.30, y: 0.62, r: W * 0.18, c1: "rgba(220,90,200,0.55)" },
    { x: 0.55, y: 0.45, r: W * 0.26, c1: "rgba(80,120,255,0.55)" },
    { x: 0.78, y: 0.30, r: W * 0.20, c1: "rgba(255,100,190,0.55)" },
    { x: 0.88, y: 0.70, r: W * 0.22, c1: "rgba(120,80,255,0.55)" },
    { x: 0.45, y: 0.85, r: W * 0.16, c1: "rgba(90,210,230,0.40)" },
    { x: 0.65, y: 0.15, r: W * 0.14, c1: "rgba(180,120,255,0.50)" },
  ];
  for (const b of blobs) {
    const cx = b.x * W, cy = b.y * H;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r);
    g.addColorStop(0, b.c1);
    g.addColorStop(0.5, b.c1.replace(/,[\d.]+\)/, ",0.15)"));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, b.r, 0, Math.PI * 2); ctx.fill();
  }

  // 4. Wispy nebula filaments using procedural noise blotches
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 30 + Math.random() * 140;
    const palette = [
      "rgba(180,120,255,0.10)",
      "rgba(255,140,220,0.09)",
      "rgba(120,180,255,0.09)",
      "rgba(220,180,255,0.08)",
    ];
    const col = palette[i % palette.length];
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // 5. Star clusters — dense Milky Way style band
  ctx.globalCompositeOperation = "lighter";
  const bandY = H * 0.5;
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * W;
    const dy = (Math.random() - 0.5) * H * 0.18;
    const y = bandY + dy + Math.sin(x / W * Math.PI * 2) * 40;
    const r = 0.4 + Math.random() * 1.0;
    ctx.fillStyle = `rgba(255,240,220,${0.3 + Math.random() * 0.4})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // 6. Stylized stars with cross/halo (anime sparkle)
  const starCount = Math.floor(W * 1.8);
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 0.9;
    const a = 0.35 + Math.random() * 0.55;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // 7. Bright hero stars with glow + 4-point cross flare (Shinkai signature)
  const heroCount = 90;
  for (let i = 0; i < heroCount; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const tint = ["255,240,220", "200,220,255", "255,200,230", "220,200,255"][i % 4];
    const halo = ctx.createRadialGradient(x, y, 0, x, y, 18);
    halo.addColorStop(0, `rgba(${tint},1)`);
    halo.addColorStop(0.2, `rgba(${tint},0.6)`);
    halo.addColorStop(1, `rgba(${tint},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
    // cross flare
    ctx.strokeStyle = `rgba(${tint},0.55)`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - 22, y); ctx.lineTo(x + 22, y);
    ctx.moveTo(x, y - 22); ctx.lineTo(x, y + 22);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function makeFlareTexture(): THREE.CanvasTexture {
  const c = makeCanvas(256, 256);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,240,220,1)");
  g.addColorStop(0.15, "rgba(200,160,255,0.7)");
  g.addColorStop(0.5, "rgba(120,80,255,0.15)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
