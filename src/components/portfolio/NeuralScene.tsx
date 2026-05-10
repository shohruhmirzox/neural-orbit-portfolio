import { Suspense, useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { NeuralNucleus } from "./NeuralNucleus";
import { Planet, type PlanetHandle } from "./Planet";
import { SynapticConnection } from "./SynapticConnection";
import { NeuralStarfield } from "./NeuralStarfield";
import { PLANETS, type PlanetData, type PlanetKey } from "@/lib/portfolio-data";
import { audioReactive } from "@/lib/audio-reactive";
import { makeNebulaSkybox, makeFlareTexture } from "@/lib/planet-textures";

interface Props {
  activeKey: PlanetKey | null;
  timeScale: number;
  reducedMotion?: boolean;
  onSelectPlanet: (p: PlanetData | null) => void;
  onHoverNucleus: (h: boolean) => void;
}

const NUCLEUS = new THREE.Vector3(0, 0, 0);
const DEFAULT_POS = new THREE.Vector3(0, 8, 22);

export function NeuralScene({ activeKey, timeScale, reducedMotion = false, onSelectPlanet, onHoverNucleus }: Props) {
  const planetRefs = useRef<Record<string, PlanetHandle | null>>({});
  const [, force] = useState(0);

  const setRef = useCallback(
    (key: string) => (h: PlanetHandle | null) => {
      planetRefs.current[key] = h;
      force((n) => n + 1);
    },
    []
  );

  const computeTarget = useMemo(
    () => () => {
      if (!activeKey) return null;
      return planetRefs.current[activeKey]?.getWorldPosition() ?? null;
    },
    [activeKey]
  );

  const getAudio = useCallback(() => audioReactive.getLevel(), []);
  const nebula = useMemo(() => makeNebulaSkybox(), []);
  const flare = useMemo(() => makeFlareTexture(), []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 8, 22], fov: 55, near: 0.1, far: 600 }}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneBackground texture={nebula} />
      <fog attach="fog" args={["#0b0726", 60, 150]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#a78bfa" />

      <Suspense fallback={null}>
        <Stars radius={220} depth={120} count={9000} factor={4} saturation={0.8} fade speed={0.4} />
        <NeuralStarfield count={1400} />

        {/* anime-style meteor sparkles drifting through the scene */}
        {!reducedMotion && (
          <>
            <Sparkles count={120} scale={[80, 40, 80]} size={3} speed={0.6} color="#c4b5fd" opacity={0.8} />
            <Sparkles count={50} scale={[60, 30, 60]} size={2} speed={1.2} color="#7dd3fc" opacity={0.7} />
          </>
        )}

        <NeuralNucleus
          onHover={onHoverNucleus}
          onClick={() => onSelectPlanet(null)}
        />

        {/* Lens flare sprite at the nucleus */}
        <sprite scale={[6, 6, 1]} renderOrder={2}>
          <spriteMaterial
            map={flare}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>

        <ResponsivePlanets
          activeKey={activeKey}
          timeScale={timeScale}
          reducedMotion={reducedMotion}
          onSelectPlanet={onSelectPlanet}
          setRef={setRef}
          getAudio={getAudio}
          planetRefs={planetRefs}
        />
      </Suspense>

      <LiveCameraRig
        defaultPosition={DEFAULT_POS}
        defaultLookAt={NUCLEUS}
        computeTarget={computeTarget}
        locked={!!activeKey}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}

function SceneBackground({ texture }: { texture: THREE.Texture }) {
  const { scene } = useThree();
  useEffect(() => {
    const prev = scene.background;
    scene.background = texture;
    return () => { scene.background = prev; };
  }, [scene, texture]);
  return null;
}

function ResponsivePlanets({
  activeKey,
  timeScale,
  reducedMotion = false,
  onSelectPlanet,
  setRef,
  getAudio,
  planetRefs,
}: {
  activeKey: PlanetKey | null;
  timeScale: number;
  reducedMotion?: boolean;
  onSelectPlanet: (p: PlanetData | null) => void;
  setRef: (key: string) => (h: PlanetHandle | null) => void;
  getAudio: () => number;
  planetRefs: React.MutableRefObject<Record<string, PlanetHandle | null>>;
}) {
  const { size } = useThree();
  const scale = size.width < 640 ? 0.55 : size.width < 1024 ? 0.78 : 1;

  return (
    <>
      {PLANETS.map((p) => (
        <Planet
          key={p.key}
          ref={setRef(p.key)}
          data={p}
          paused={false}
          active={activeKey === p.key}
          scale={scale}
          timeScale={timeScale}
          getAudioLevel={p.key === "acoustify" ? getAudio : undefined}
          onHover={() => {}}
          onClick={() => onSelectPlanet(p)}
        />
      ))}

      {PLANETS.map((p) => {
        const handle = planetRefs.current[p.key];
        if (!handle) return null;
        return (
          <SynapticConnection
            key={`syn-${p.key}`}
            start={() => NUCLEUS}
            end={() => handle.getWorldPosition()}
            color={p.color}
            pulseColor={p.emissive}
            pulseSpeed={0.35 + p.orbitSpeed}
            pulseCount={3}
            reducedMotion={reducedMotion}
          />
        );
      })}
    </>
  );
}

function LiveCameraRig({
  defaultPosition,
  defaultLookAt,
  computeTarget,
  locked,
  distance = 3.0,
  reducedMotion = false,
}: {
  defaultPosition: THREE.Vector3;
  defaultLookAt: THREE.Vector3;
  computeTarget: () => THREE.Vector3 | null;
  locked: boolean;
  distance?: number;
  reducedMotion?: boolean;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const desiredPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.copy(defaultPosition);
    desiredTarget.current.copy(defaultLookAt);
    if (controlsRef.current) {
      controlsRef.current.target.copy(defaultLookAt);
      controlsRef.current.update();
    }
  }, [camera, defaultPosition, defaultLookAt]);

  useFrame(() => {
    const t = computeTarget();
    const controls = controlsRef.current;
    // In reduced-motion mode, snap instantly instead of lerping the camera.
    const posLerp = reducedMotion ? 1 : 0.08;
    const tgtLerp = reducedMotion ? 1 : 0.12;
    const idleLerp = reducedMotion ? 1 : 0.05;
    if (t) {
      const dir = camera.position.clone().sub(t).normalize();
      desiredPos.current.copy(t).add(dir.multiplyScalar(distance));
      desiredPos.current.y += 1.0;
      desiredTarget.current.copy(t);
      camera.position.lerp(desiredPos.current, posLerp);
      if (controls) {
        controls.target.lerp(desiredTarget.current, tgtLerp);
        controls.update();
      }
    } else if (controls) {
      controls.target.lerp(defaultLookAt, idleLerp);
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={!locked}
      enableZoom
      enableRotate
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={120}
      makeDefault
    />
  );
}
