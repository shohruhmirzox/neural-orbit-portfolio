// Singleton audio-reactive engine. Holds an AudioContext, an <audio> element,
// and an AnalyserNode. The 3D scene polls getLevel() each frame.

type Listener = (state: { playing: boolean; trackName: string | null }) => void;

class AudioReactiveEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private el: HTMLAudioElement | null = null;
  private data: Uint8Array = new Uint8Array(64);
  private smoothed = 0;
  private listeners = new Set<Listener>();
  private trackName: string | null = null;

  private ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AC();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.75;
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
    this.el = new Audio();
    this.el.crossOrigin = "anonymous";
    this.el.loop = true;
    this.source = this.ctx.createMediaElementSource(this.el);
    this.source.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.el.addEventListener("play", () => this.emit());
    this.el.addEventListener("pause", () => this.emit());
    this.el.addEventListener("ended", () => this.emit());
  }

  private emit() {
    const state = { playing: !!this.el && !this.el.paused, trackName: this.trackName };
    this.listeners.forEach((l) => l(state));
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    l({ playing: !!this.el && !this.el.paused, trackName: this.trackName });
    return () => this.listeners.delete(l);
  }

  async loadFile(file: File) {
    this.ensure();
    if (!this.el || !this.ctx) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    const url = URL.createObjectURL(file);
    this.el.src = url;
    this.trackName = file.name;
    await this.el.play().catch(() => {});
    this.emit();
  }

  async loadUrl(url: string, name?: string) {
    this.ensure();
    if (!this.el || !this.ctx) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.el.src = url;
    this.trackName = name ?? url.split("/").pop() ?? "Stream";
    await this.el.play().catch(() => {});
    this.emit();
  }

  async toggle() {
    this.ensure();
    if (!this.el || !this.ctx) return;
    if (this.ctx.state === "suspended") await this.ctx.resume();
    if (this.el.paused) await this.el.play().catch(() => {});
    else this.el.pause();
    this.emit();
  }

  /** Returns smoothed bass-weighted level 0..1 */
  getLevel(): number {
    if (!this.analyser || !this.el || this.el.paused) {
      this.smoothed *= 0.92;
      return this.smoothed;
    }
    this.analyser.getByteFrequencyData(this.data as unknown as Uint8Array<ArrayBuffer>);
    // weight low frequencies more
    let sum = 0;
    let weight = 0;
    for (let i = 0; i < this.data.length; i++) {
      const w = 1 - i / this.data.length;
      sum += this.data[i] * w;
      weight += 255 * w;
    }
    const v = weight > 0 ? sum / weight : 0;
    this.smoothed = this.smoothed * 0.7 + v * 0.3;
    return this.smoothed;
  }
}

export const audioReactive = new AudioReactiveEngine();

// ---------- UI sound effects (synthesized — no asset deps) ----------
let sfxCtx: AudioContext | null = null;
function sfxCtxGet() {
  if (sfxCtx) return sfxCtx;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  sfxCtx = new AC();
  return sfxCtx;
}

export function playClick() {
  const ctx = sfxCtxGet();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(880, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.13);
}

// Cinematic low-pass whoosh + deep resonance hum, powered by Tone.js
import * as Tone from "tone";
let toneStarted = false;
async function ensureTone() {
  if (!toneStarted) {
    await Tone.start();
    toneStarted = true;
  }
}

export async function playWhoosh() {
  await ensureTone();
  const now = Tone.now();
  // Low-pass cinematic whoosh
  const noise = new Tone.Noise("pink").start(now);
  const filter = new Tone.Filter({ type: "lowpass", frequency: 200, Q: 4 });
  const gain = new Tone.Gain(0).toDestination();
  noise.connect(filter);
  filter.connect(gain);
  gain.gain.linearRampTo(0.45, 0.08, now);
  gain.gain.linearRampTo(0.0, 0.85, now + 0.08);
  filter.frequency.exponentialRampTo(2400, 0.7, now);
  noise.stop(now + 1.0);
  setTimeout(() => { noise.dispose(); filter.dispose(); gain.dispose(); }, 1300);

  // Deep resonance sub-hum
  const sub = new Tone.Oscillator(48, "sine").start(now);
  const subGain = new Tone.Gain(0).toDestination();
  sub.connect(subGain);
  subGain.gain.linearRampTo(0.22, 0.12, now);
  subGain.gain.linearRampTo(0.0, 1.1, now + 0.12);
  sub.stop(now + 1.3);
  setTimeout(() => { sub.dispose(); subGain.dispose(); }, 1600);
}

// Ambient pad — two detuned oscillators + slow LFO on a lowpass.
let ambient: { stop: () => void } | null = null;
export function toggleAmbient(): boolean {
  if (ambient) {
    ambient.stop();
    ambient = null;
    return false;
  }
  const ctx = sfxCtxGet();
  const master = ctx.createGain();
  master.gain.value = 0.0;
  master.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.2);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 700;
  const oscs: OscillatorNode[] = [];
  [55, 82.4, 110].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 2 ? "triangle" : "sawtooth";
    o.frequency.value = f;
    o.detune.value = (i - 1) * 8;
    const g = ctx.createGain();
    g.gain.value = 0.5 / (i + 1);
    o.connect(g).connect(lp);
    o.start();
    oscs.push(o);
  });
  // slow LFO on filter
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 250;
  lfo.connect(lfoGain).connect(lp.frequency);
  lfo.start();
  lp.connect(master).connect(ctx.destination);
  ambient = {
    stop: () => {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.6);
      setTimeout(() => {
        oscs.forEach((o) => o.stop());
        lfo.stop();
      }, 700);
    },
  };
  return true;
}

export function isAmbientPlaying() {
  return !!ambient;
}
