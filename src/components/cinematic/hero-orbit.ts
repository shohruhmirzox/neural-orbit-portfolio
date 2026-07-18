import * as THREE from "three";

/**
 * Hero "orbit" engine. Two interchangeable backends behind one interface:
 *
 * - SequenceOrbit: scrubs a pre-extracted video frame sequence
 *   (public/sequences/hero/manifest.json) — used once the Seedance clips
 *   are generated and split into frames.
 * - ParticleOrbit: a WebGL particle portrait built from the identity photo,
 *   rotating a full 360° with scroll. Ships as the default.
 */
export interface OrbitEngine {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  resize(): void;
  dispose(): void;
}

export type SequenceManifest = {
  count: number;
  pattern: string; // e.g. "/sequences/hero/frame_%04d.webp"
  fps?: number;
};

export async function loadManifest(url: string): Promise<SequenceManifest | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const m = (await res.json()) as SequenceManifest;
    if (!m || !m.count || !m.pattern) return null;
    return m;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Frame-sequence scrubber                                             */
/* ------------------------------------------------------------------ */

export class SequenceOrbit implements OrbitEngine {
  private ctx: CanvasRenderingContext2D;
  private frames: (HTMLImageElement | null)[];
  private current = 0;
  private target = 0;
  private raf = 0;
  private disposed = false;

  constructor(
    private canvas: HTMLCanvasElement,
    private manifest: SequenceManifest,
    private onFirstFrame?: () => void,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.frames = new Array(manifest.count).fill(null);
    this.preload();
    this.loop();
  }

  private frameUrl(i: number) {
    return this.manifest.pattern.replace(/%0(\d)d/, (_, w) =>
      String(i + 1).padStart(Number(w), "0"),
    );
  }

  private preload() {
    // First frame eagerly, the rest in small waves to keep the network calm.
    const load = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.frames[i] = img;
          if (i === 0) this.onFirstFrame?.();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = this.frameUrl(i);
      });
    void load(0).then(async () => {
      const batch = 12;
      for (let s = 0; s < this.manifest.count; s += batch) {
        if (this.disposed) return;
        await Promise.all(
          Array.from({ length: Math.min(batch, this.manifest.count - s) }, (_, j) =>
            this.frames[s + j] ? Promise.resolve() : load(s + j),
          ),
        );
      }
    });
  }

  setProgress(p: number) {
    this.target = Math.max(0, Math.min(1, p)) * (this.manifest.count - 1);
  }

  setPointer() {}

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;
  }

  private draw() {
    // Ease toward the target frame, then snap to the nearest loaded one.
    this.current += (this.target - this.current) * 0.22;
    let idx = Math.round(this.current);
    while (idx > 0 && !this.frames[idx]) idx--;
    const img = this.frames[idx];
    if (!img) return;
    const { width: cw, height: ch } = this.canvas;
    const scale = Math.max(cw / img.width, ch / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  private loop = () => {
    if (this.disposed) return;
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
  }
}

/* ------------------------------------------------------------------ */
/* Particle portrait                                                   */
/* ------------------------------------------------------------------ */

const INK = new THREE.Color("#050605");
const EMERALD = new THREE.Color("#17e388");
const EMERALD_DEEP = new THREE.Color("#0a6b42");
const CREAM = new THREE.Color("#f2efe4");

export class ParticleOrbit implements OrbitEngine {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private group = new THREE.Group();
  private ring?: THREE.Points;
  private raf = 0;
  private disposed = false;
  private progress = 0;
  private rotY = 0;
  private pointer = { x: 0, y: 0 };
  private pointerSmooth = { x: 0, y: 0 };
  private baseZ = 215;
  private clock = new THREE.Clock();
  private disposables: { dispose(): void }[] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    portraitUrl: string,
    private onReady?: () => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.camera = new THREE.PerspectiveCamera(38, 1, 1, 2000);
    this.camera.position.set(0, 0, 215);
    this.scene.fog = new THREE.FogExp2(INK, 0.0016);
    this.scene.add(this.group);
    this.resize();
    this.buildBackGlow();
    this.buildRing();
    void this.buildPortrait(portraitUrl);
    this.loop();
  }

  /** Soft emerald light plane floating behind the figure — the "rim light". */
  private buildBackGlow() {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, "rgba(23,227,136,0.55)");
    grad.addColorStop(0.45, "rgba(23,227,136,0.12)");
    grad.addColorStop(1, "rgba(23,227,136,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.setScalar(360);
    sprite.position.z = -70;
    this.scene.add(sprite);
    this.disposables.push(tex, mat);
  }

  /** Orbiting particle ring around the portrait. */
  private buildRing() {
    const N = 2400;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const R = 118;
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = R + (Math.random() - 0.5) * 26 * Math.random();
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = Math.sin(a) * r;
      const c = EMERALD_DEEP.clone().lerp(EMERALD, Math.random() * Math.random());
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.ring = new THREE.Points(geo, mat);
    this.ring.rotation.x = 0.16;
    this.scene.add(this.ring);
    this.disposables.push(geo, mat);
  }

  private async buildPortrait(url: string) {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    }).catch(() => null);
    if (!img || this.disposed) return;

    const S = 220; // sampling grid
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, 0, 0, S, S);
    const data = g.getImageData(0, 0, S, S).data;

    // Estimate background color from the top corners so the flat studio
    // backdrop drops out and only the figure remains.
    const corner = (x0: number, y0: number) => {
      let r = 0,
        gr = 0,
        b = 0,
        n = 0;
      for (let y = y0; y < y0 + 12; y++)
        for (let x = x0; x < x0 + 12; x++) {
          const k = (y * S + x) * 4;
          r += data[k];
          gr += data[k + 1];
          b += data[k + 2];
          n++;
        }
      return [r / n, gr / n, b / n];
    };
    const c1 = corner(0, 0);
    const c2 = corner(S - 12, 0);
    const bg = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2, (c1[2] + c2[2]) / 2];

    const H = 132; // world height of the portrait
    const depth = 26;
    const positions: number[] = [];
    const colors: number[] = [];
    const seeds: number[] = [];

    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const k = (y * S + x) * 4;
        const r = data[k];
        const gr = data[k + 1];
        const b = data[k + 2];
        const dBg = Math.hypot(r - bg[0], gr - bg[1], b - bg[2]);
        if (dBg < 42) continue; // background pixel
        const lum = (0.2126 * r + 0.7152 * gr + 0.0722 * b) / 255;
        const px = (x / S - 0.5) * H;
        const py = (0.5 - y / S) * H;
        const pz = lum * depth - depth * 0.35 + (Math.random() - 0.5) * 2.4;

        // Front shell
        positions.push(px, py, pz);
        // Back shell for volume when seen edge-on
        positions.push(px, py, -pz - 4);

        // Duotone: shadows sink into deep emerald, highlights lift to cream.
        const base = EMERALD_DEEP.clone().lerp(CREAM, Math.pow(lum, 1.25));
        // Fake rim light on the silhouette edges
        const edge = Math.min(1, Math.abs(px) / (H * 0.5) + 0.08);
        const rim = Math.pow(edge, 3.2) * 0.85;
        const col = base.lerp(EMERALD, rim);
        for (let s = 0; s < 2; s++) {
          colors.push(col.r, col.g, col.b);
          seeds.push(Math.random());
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSize: { value: 2.1 } },
      vertexShader: /* glsl */ `
        attribute vec3 color;
        attribute float aSeed;
        uniform float uTime;
        uniform float uSize;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec3 p = position;
          // Slow particle drift — the figure "breathes"
          p.x += sin(uTime * 0.8 + aSeed * 40.0) * 0.45;
          p.y += cos(uTime * 0.7 + aSeed * 60.0) * 0.45;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = uSize * (240.0 / -mv.z) * (0.7 + aSeed * 0.6);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.12, d);
          gl_FragColor = vec4(vColor, a * 0.9);
        }
      `,
    });

    const points = new THREE.Points(geo, mat);
    this.group.add(points);
    this.disposables.push(geo, mat);
    this.onReady?.();
  }

  setProgress(p: number) {
    this.progress = Math.max(0, Math.min(1, p));
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  resize() {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Pull back on portrait screens so the figure isn't over-cropped
    this.baseZ = this.camera.aspect < 0.8 ? 330 : this.camera.aspect < 1.1 ? 260 : 215;
    this.camera.updateProjectionMatrix();
  }

  private loop = () => {
    if (this.disposed) return;
    const t = this.clock.getElapsedTime();
    const mat = this.group.children[0] as THREE.Points | undefined;
    if (mat && (mat.material as THREE.ShaderMaterial).uniforms) {
      (mat.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    }

    // One full orbit across the scroll range, softly damped.
    const target = this.progress * Math.PI * 2;
    this.rotY += (target - this.rotY) * 0.09;
    this.group.rotation.y = this.rotY;
    this.group.position.y = Math.sin(t * 0.5) * 2.2;

    if (this.ring) this.ring.rotation.y = -this.rotY * 0.5 + t * 0.03;

    // Camera: gentle dolly through the middle of the orbit + pointer parallax
    this.pointerSmooth.x += (this.pointer.x - this.pointerSmooth.x) * 0.05;
    this.pointerSmooth.y += (this.pointer.y - this.pointerSmooth.y) * 0.05;
    const dolly = Math.sin(this.progress * Math.PI) * 28;
    this.camera.position.z = this.baseZ - dolly;
    this.camera.position.x = this.pointerSmooth.x * 9;
    this.camera.position.y = this.pointerSmooth.y * -6;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.loop);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
