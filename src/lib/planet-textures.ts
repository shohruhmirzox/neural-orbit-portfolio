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
  // single equirectangular nebula painted as background gradient + nebula clouds
  const c = makeCanvas(2048, 1024);
  const ctx = c.getContext("2d")!;
  // base radial gradient deep indigo -> black
  const bg = ctx.createLinearGradient(0, 0, 0, c.height);
  bg.addColorStop(0, "#0a0420");
  bg.addColorStop(0.5, "#150935");
  bg.addColorStop(1, "#020210");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, c.width, c.height);

  // nebula blobs
  const blobs = [
    { x: 0.18, y: 0.35, r: 380, c1: "rgba(140,80,255,0.55)", c2: "rgba(140,80,255,0)" },
    { x: 0.55, y: 0.55, r: 520, c1: "rgba(60,150,255,0.45)", c2: "rgba(60,150,255,0)" },
    { x: 0.82, y: 0.3, r: 300, c1: "rgba(255,90,180,0.45)", c2: "rgba(255,90,180,0)" },
    { x: 0.4, y: 0.78, r: 420, c1: "rgba(80,200,220,0.35)", c2: "rgba(80,200,220,0)" },
    { x: 0.7, y: 0.85, r: 260, c1: "rgba(200,120,255,0.4)", c2: "rgba(200,120,255,0)" },
  ];
  ctx.globalCompositeOperation = "screen";
  for (const b of blobs) {
    const g = ctx.createRadialGradient(b.x * c.width, b.y * c.height, 0, b.x * c.width, b.y * c.height, b.r);
    g.addColorStop(0, b.c1);
    g.addColorStop(1, b.c2);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x * c.width, b.y * c.height, b.r, 0, Math.PI * 2); ctx.fill();
  }
  // bright stars
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * c.width;
    const y = Math.random() * c.height;
    const r = Math.random() < 0.97 ? Math.random() * 1.1 : 1.5 + Math.random() * 2.2;
    const a = 0.4 + Math.random() * 0.6;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
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
