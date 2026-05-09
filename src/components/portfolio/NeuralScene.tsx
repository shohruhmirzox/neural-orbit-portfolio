import { Suspense, useRef, useState, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { NeuralNucleus } from "./NeuralNucleus";
import { Planet, type PlanetHandle } from "./Planet";
import { SynapticConnection } from "./SynapticConnection";
import { NeuralStarfield } from "./NeuralStarfield";
import { CameraRig } from "./CameraRig";
import { PLANETS, type PlanetData, type PlanetKey } from "@/lib/portfolio-data";

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

  // ensure refs available after mount
  const setRef = useCallback((key: string) => (h: PlanetHandle | null) => {
    planetRefs.current[key] = h;
    force((n) => n + 1);
  }, []);

  const target = useMemo(() => {
    if (!activeKey) return null;
    return () => planetRefs.current[activeKey]?.getWorldPosition() ?? null;
  }, [activeKey]);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 8, 22], fov: 55, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#0b0726", 30, 90]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} color="#a78bfa" />

      <Suspense fallback={null}>
        <NeuralStarfield count={1400} />
        <NeuralNucleus
          onHover={onHoverNucleus}
          onClick={() => onSelectPlanet(null)}
        />

        {PLANETS.map((p) => (
          <Planet
            key={p.key}
            ref={setRef(p.key)}
            data={p}
            paused={!!activeKey}
            active={activeKey === p.key}
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
              pulseSpeed={0.3 + p.orbitSpeed}
              pulseCount={3}
            />
          );
        })}
      </Suspense>

      <ActiveTargetRig
        activeKey={activeKey}
        getTarget={target}
        defaultPos={DEFAULT_POS}
        defaultLook={NUCLEUS}
      />
    </Canvas>
  );
}

function ActiveTargetRig({
  activeKey,
  getTarget,
  defaultPos,
  defaultLook,
}: {
  activeKey: PlanetKey | null;
  getTarget: (() => THREE.Vector3 | null) | null;
  defaultPos: THREE.Vector3;
  defaultLook: THREE.Vector3;
}) {
  const tmp = useRef(new THREE.Vector3());
  // Build a target vector each frame via CameraRig's prop expectation: it takes a Vector3 or null
  // We'll wrap by polling each render — but better to feed a stable Vector3 we mutate.
  // Use a ref vector and update via useFrame inside a tiny helper.
  return (
    <CameraRigDynamic
      activeKey={activeKey}
      getTarget={getTarget}
      defaultPos={defaultPos}
      defaultLook={defaultLook}
      tmp={tmp.current}
    />
  );
}

function CameraRigDynamic({
  activeKey,
  getTarget,
  defaultPos,
  defaultLook,
  tmp,
}: {
  activeKey: PlanetKey | null;
  getTarget: (() => THREE.Vector3 | null) | null;
  defaultPos: THREE.Vector3;
  defaultLook: THREE.Vector3;
  tmp: THREE.Vector3;
}) {
  // Use a small custom rig that reads a live target each frame
  const ref = useRef(new THREE.Vector3());
  return (
    <LiveCameraRig
      defaultPosition={defaultPos}
      defaultLookAt={defaultLook}
      computeTarget={() => {
        if (!activeKey || !getTarget) return null;
        const v = getTarget();
        if (!v) return null;
        ref.current.copy(v);
        return ref.current;
      }}
    />
  );
}

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";

function LiveCameraRig({
  defaultPosition,
  defaultLookAt,
  computeTarget,
  distance = 3.2,
}: {
  defaultPosition: THREE.Vector3;
  defaultLookAt: THREE.Vector3;
  computeTarget: () => THREE.Vector3 | null;
  distance?: number;
}) {
  const { camera } = useThree();
  const desiredPos = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.copy(defaultPosition);
    currentLook.current.copy(defaultLookAt);
    camera.lookAt(currentLook.current);
  }, [camera, defaultPosition, defaultLookAt]);

  useFrame(() => {
    const t = computeTarget();
    if (t) {
      const offsetDir = t.clone().sub(new THREE.Vector3(0, 0, 0)).normalize();
      desiredPos.current.copy(t).add(offsetDir.multiplyScalar(distance));
      desiredPos.current.y += 1.4;
      desiredLook.current.copy(t);
    } else {
      desiredPos.current.copy(defaultPosition);
      desiredLook.current.copy(defaultLookAt);
    }
    camera.position.lerp(desiredPos.current, 0.06);
    currentLook.current.lerp(desiredLook.current, 0.08);
    camera.lookAt(currentLook.current);
  });

  return null;
}
