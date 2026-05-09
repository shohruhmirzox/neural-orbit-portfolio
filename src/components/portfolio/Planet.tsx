import { useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetData } from "@/lib/portfolio-data";

interface Props {
  data: PlanetData;
  onHover: (hover: boolean) => void;
  onClick: () => void;
  active: boolean;
  paused: boolean;
}

export interface PlanetHandle {
  getWorldPosition: () => THREE.Vector3;
}

export const Planet = forwardRef<PlanetHandle, Props>(function Planet(
  { data, onHover, onClick, active, paused },
  ref
) {
  const groupRef = useRef<THREE.Group>(null!);
  const planetRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(data.angle);
  const tmp = useRef(new THREE.Vector3());

  useImperativeHandle(ref, () => ({
    getWorldPosition: () => {
      if (planetRef.current) planetRef.current.getWorldPosition(tmp.current);
      return tmp.current;
    },
  }));

  useFrame((state, delta) => {
    if (!paused) angleRef.current += delta * data.orbitSpeed;
    const a = angleRef.current;
    const x = Math.cos(a) * data.orbitRadius;
    const z = Math.sin(a) * data.orbitRadius;
    const bob = Math.sin(state.clock.elapsedTime * 1.2 + data.angle * 3) * 0.25;
    if (groupRef.current) {
      groupRef.current.position.set(x, bob + data.tilt * 2, z);
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.3;
      const targetScale = active ? 1.25 : 1;
      const s = THREE.MathUtils.lerp(planetRef.current.scale.x, targetScale, 0.08);
      planetRef.current.scale.setScalar(s);
    }
    if (ringRef.current && data.texture === "wave") {
      const wob = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.08;
      ringRef.current.scale.setScalar(wob);
    }
  });

  const isChrome = data.texture === "chrome";

  return (
    <group ref={groupRef}>
      <group
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { onHover(false); document.body.style.cursor = "default"; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <Sphere ref={planetRef} args={[data.size, 48, 48]}>
          <meshStandardMaterial
            color={data.color}
            emissive={data.emissive}
            emissiveIntensity={active ? 1.2 : 0.6}
            roughness={isChrome ? 0.08 : 0.45}
            metalness={isChrome ? 0.95 : 0.3}
          />
        </Sphere>

        {/* atmosphere glow */}
        <Sphere args={[data.size * 1.35, 32, 32]}>
          <meshBasicMaterial
            color={data.emissive}
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </Sphere>

        {/* wave ring for acoustify */}
        {data.texture === "wave" && (
          <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[data.size * 1.6, 0.015, 16, 64]} />
            <meshBasicMaterial color={data.color} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
          </mesh>
        )}
      </group>
    </group>
  );
});
