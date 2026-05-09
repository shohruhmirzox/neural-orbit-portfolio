import { Suspense, useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { NeuralNucleus } from "./NeuralNucleus";
import { Planet, type PlanetHandle } from "./Planet";
import { SynapticConnection } from "./SynapticConnection";
import { NeuralStarfield } from "./NeuralStarfield";
import { PLANETS, type PlanetData, type PlanetKey } from "@/lib/portfolio-data";
import { audioReactive } from "@/lib/audio-reactive";

interface Props {
  activeKey: PlanetKey | null;
  onSelectPlanet: (p: PlanetData | null) => void;
  onHoverNucleus: (h: boolean) => void;
}

const NUCLEUS = new THREE.Vector3(0, 0, 0);
const DEFAULT_POS = new THREE.Vector3(0, 8, 22);

export function NeuralScene({ activeKey, onSelectPlanet, onHoverNucleus }: Props) {
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

  const getAudio = useCallback(() => audioReactive.getLevel() / 100, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 8, 22], fov: 55, near: 0.1, far: 400 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#0b0726", 45, 110]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.45} color="#a78bfa" />

      <Suspense fallback={null}>
        {/* deep space skybox */}
        <Stars radius={150} depth={80} count={6000} factor={4} saturation={0.6} fade speed={0.4} />
        <NeuralStarfield count={1400} />

        <NeuralNucleus
          onHover={onHoverNucleus}
          onClick={() => onSelectPlanet(null)}
        />

        <ResponsivePlanets
          activeKey={activeKey}
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
      />
    </Canvas>
  );
}

function ResponsivePlanets({
  activeKey,
  onSelectPlanet,
  setRef,
  getAudio,
  planetRefs,
}: {
  activeKey: PlanetKey | null;
  onSelectPlanet: (p: PlanetData | null) => void;
  setRef: (key: string) => (h: PlanetHandle | null) => void;
  getAudio: () => number;
  planetRefs: React.MutableRefObject<Record<string, PlanetHandle | null>>;
}) {
  const { size } = useThree();
  // shrink the orbits on narrow viewports so the whole system fits
  const scale = size.width < 640 ? 0.55 : size.width < 1024 ? 0.78 : 1;

  return (
    <>
      {PLANETS.map((p) => (
        <Planet
          key={p.key}
          ref={setRef(p.key)}
          data={p}
          paused={!!activeKey}
          active={activeKey === p.key}
          scale={scale}
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
  distance = 3.2,
}: {
  defaultPosition: THREE.Vector3;
  defaultLookAt: THREE.Vector3;
  computeTarget: () => THREE.Vector3 | null;
  locked: boolean;
  distance?: number;
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
    if (t) {
      // place camera offset relative to current camera direction so user-rotated
      // angle is preserved when locking onto the planet
      const dir = camera.position.clone().sub(t).normalize();
      desiredPos.current.copy(t).add(dir.multiplyScalar(distance));
      desiredPos.current.y += 1.2;
      desiredTarget.current.copy(t);
      camera.position.lerp(desiredPos.current, 0.08);
      if (controls) {
        controls.target.lerp(desiredTarget.current, 0.12);
        controls.update();
      }
    } else if (controls) {
      controls.target.lerp(defaultLookAt, 0.05);
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
      minDistance={4}
      maxDistance={60}
      makeDefault
    />
  );
}
