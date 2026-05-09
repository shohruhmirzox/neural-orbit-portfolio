import { useRef, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Trail } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetData } from "@/lib/portfolio-data";

interface Props {
  data: PlanetData;
  onHover: (hover: boolean) => void;
  onClick: () => void;
  active: boolean;
  paused: boolean;
  scale?: number;
  getAudioLevel?: () => number;
}

export interface PlanetHandle {
  getWorldPosition: () => THREE.Vector3;
}

export const Planet = forwardRef<PlanetHandle, Props>(function Planet(
  { data, onHover, onClick, active, paused, scale = 1, getAudioLevel },
  ref
) {
  const groupRef = useRef<THREE.Group>(null!);
  const planetRef = useRef<THREE.Mesh>(null!);
  const atmoRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const trailAnchor = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(data.angle);
  const tmp = useRef(new THREE.Vector3());

  useImperativeHandle(ref, () => ({
    getWorldPosition: () => {
      if (planetRef.current) planetRef.current.getWorldPosition(tmp.current);
      return tmp.current;
    },
  }));

  const radius = data.orbitRadius * scale;

  useFrame((state, delta) => {
    if (!paused) angleRef.current += delta * data.orbitSpeed;
    const a = angleRef.current;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    const bob = Math.sin(state.clock.elapsedTime * 1.2 + data.angle * 3) * 0.25;
    if (groupRef.current) {
      groupRef.current.position.set(x, bob + data.tilt * 2, z);
    }
    const audio = getAudioLevel ? getAudioLevel() : 0;
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.3;
      const targetScale = (active ? 1.25 : 1) + audio * 0.45;
      const s = THREE.MathUtils.lerp(planetRef.current.scale.x, targetScale, 0.18);
      planetRef.current.scale.setScalar(s);
    }
    if (matRef.current) {
      const baseE = active ? 1.3 : 0.7;
      matRef.current.emissiveIntensity = baseE + audio * 2.4;
    }
    if (atmoRef.current) {
      const atmoMat = atmoRef.current.material as THREE.MeshBasicMaterial;
      atmoMat.opacity = 0.18 + audio * 0.45;
      const s = 1 + audio * 0.35;
      atmoRef.current.scale.setScalar(s);
    }
    if (ringRef.current && data.texture === "wave") {
      const wob = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.08 + audio * 0.6;
      ringRef.current.scale.setScalar(wob);
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.5 + audio * 0.5;
    }
    if (ring2Ref.current && data.texture === "wave") {
      const wob = 1 + Math.sin(state.clock.elapsedTime * 4 + 1) * 0.1 + audio * 0.9;
      ring2Ref.current.scale.setScalar(wob);
      const m = ring2Ref.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.25 + audio * 0.5;
    }
  });

  const isChrome = data.texture === "chrome";

  return (
    <group ref={groupRef}>
      {/* trail anchored to planet center */}
      <Trail
        width={data.size * 1.8}
        length={6}
        color={new THREE.Color(data.emissive)}
        attenuation={(t) => t * t}
        decay={1.4}
      >
        <mesh ref={trailAnchor} visible={false}>
          <sphereGeometry args={[0.001, 4, 4]} />
          <meshBasicMaterial />
        </mesh>
      </Trail>

      <group
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { onHover(false); document.body.style.cursor = "default"; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <Sphere ref={planetRef} args={[data.size, 48, 48]}>
          <meshStandardMaterial
            ref={matRef}
            color={data.color}
            emissive={data.emissive}
            emissiveIntensity={active ? 1.2 : 0.6}
            roughness={isChrome ? 0.08 : 0.45}
            metalness={isChrome ? 0.95 : 0.3}
          />
        </Sphere>

        {/* fresnel-like atmosphere glow */}
        <Sphere ref={atmoRef} args={[data.size * 1.35, 32, 32]}>
          <meshBasicMaterial
            color={data.emissive}
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* dual wave rings for acoustify */}
        {data.texture === "wave" && (
          <>
            <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0, 0]}>
              <torusGeometry args={[data.size * 1.6, 0.018, 16, 96]} />
              <meshBasicMaterial color={data.color} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh ref={ring2Ref} rotation={[Math.PI / 2.2, 0.6, 0]}>
              <torusGeometry args={[data.size * 2.1, 0.012, 16, 96]} />
              <meshBasicMaterial color={data.emissive} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
});
