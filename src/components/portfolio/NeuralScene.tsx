import { Suspense, useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { NeuralNucleus } from "./NeuralNucleus";
import { Planet, type PlanetHandle } from "./Planet";
import { SynapticConnection } from "./SynapticConnection";
import { NeuralStarfield } from "./NeuralStarfield";
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

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 8, 22], fov: 55, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#0b0726", 35, 95]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.45} color="#a78bfa" />

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
              pulseSpeed={0.35 + p.orbitSpeed}
              pulseCount={3}
            />
          );
        })}
      </Suspense>

      <LiveCameraRig
        defaultPosition={DEFAULT_POS}
        defaultLookAt={NUCLEUS}
        computeTarget={computeTarget}
      />
    </Canvas>
  );
}

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
      const offsetDir = t.clone().normalize();
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
