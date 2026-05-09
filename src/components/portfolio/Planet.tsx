import { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Trail } from "@react-three/drei";
import * as THREE from "three";
import type { PlanetData } from "@/lib/portfolio-data";
import {
  makeEarthTexture,
  makeEarthNightTexture,
  makeCloudsTexture,
  makeMarsTexture,
  makeMoonTexture,
} from "@/lib/planet-textures";

interface Props {
  data: PlanetData;
  onHover: (hover: boolean) => void;
  onClick: () => void;
  active: boolean;
  paused: boolean;
  scale?: number;
  timeScale?: number;
  getAudioLevel?: () => number;
}

export interface PlanetHandle {
  getWorldPosition: () => THREE.Vector3;
}

export const Planet = forwardRef<PlanetHandle, Props>(function Planet(
  { data, onHover, onClick, active, paused, scale = 1, timeScale = 1, getAudioLevel },
  ref
) {
  const groupRef = useRef<THREE.Group>(null!);
  const planetRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const nightRef = useRef<THREE.Mesh>(null!);
  const atmoRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const satGroup = useRef<THREE.Group>(null!);
  const angleRef = useRef(data.angle);
  const tmp = useRef(new THREE.Vector3());

  useImperativeHandle(ref, () => ({
    getWorldPosition: () => {
      if (planetRef.current) planetRef.current.getWorldPosition(tmp.current);
      return tmp.current;
    },
  }));

  // Shared procedural textures (cached per-planet instance)
  const earth = useMemo(() => (data.texture === "earth" ? makeEarthTexture() : null), [data.texture]);
  const earthNight = useMemo(() => (data.texture === "earth" ? makeEarthNightTexture() : null), [data.texture]);
  const clouds = useMemo(() => (data.texture === "earth" ? makeCloudsTexture() : null), [data.texture]);
  const mars = useMemo(() => (data.texture === "mars" ? makeMarsTexture() : null), [data.texture]);
  const moon = useMemo(() => (data.texture === "satellite" ? makeMoonTexture() : null), [data.texture]);

  const radius = data.orbitRadius * scale;

  useFrame((state, delta) => {
    if (!paused) angleRef.current += delta * data.orbitSpeed * timeScale;
    const a = angleRef.current;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    const bob = Math.sin(state.clock.elapsedTime * 1.2 + data.angle * 3) * 0.25;
    if (groupRef.current) {
      groupRef.current.position.set(x, bob + data.tilt * 2, z);
    }
    const audio = getAudioLevel ? getAudioLevel() : 0;
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.3 * timeScale;
      const targetScale = (active ? 1.25 : 1) + audio * 0.45;
      const s = THREE.MathUtils.lerp(planetRef.current.scale.x, targetScale, 0.18);
      planetRef.current.scale.setScalar(s);
    }
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.06 * timeScale;
    if (nightRef.current) nightRef.current.rotation.y = planetRef.current?.rotation.y ?? 0;
    if (satGroup.current) {
      satGroup.current.rotation.y += delta * 0.8 * timeScale;
      satGroup.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
    }
    if (matRef.current) {
      const baseE = active ? 0.9 : 0.4;
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

  return (
    <group ref={groupRef}>
      {/* trail anchored to planet center */}
      <Trail
        width={data.size * 1.6}
        length={6}
        color={new THREE.Color(data.emissive)}
        attenuation={(t) => t * t}
        decay={1.4}
      >
        <mesh visible={false}>
          <sphereGeometry args={[0.001, 4, 4]} />
          <meshBasicMaterial />
        </mesh>
      </Trail>

      <group
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { onHover(false); document.body.style.cursor = "default"; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {/* Planet body — material varies per texture variant */}
        <Sphere ref={planetRef} args={[data.size, 64, 64]}>
          {data.texture === "earth" && earth ? (
            <meshStandardMaterial
              ref={matRef}
              map={earth}
              emissive={data.emissive}
              emissiveIntensity={0.25}
              roughness={0.85}
              metalness={0.05}
            />
          ) : data.texture === "mars" && mars ? (
            <meshStandardMaterial
              ref={matRef}
              map={mars}
              emissive={data.emissive}
              emissiveIntensity={0.35}
              roughness={0.95}
              metalness={0.02}
            />
          ) : data.texture === "satellite" && moon ? (
            <meshStandardMaterial
              ref={matRef}
              map={moon}
              emissive={data.emissive}
              emissiveIntensity={0.4}
              roughness={0.95}
              metalness={0.05}
            />
          ) : (
            <meshStandardMaterial
              ref={matRef}
              color={data.color}
              emissive={data.emissive}
              emissiveIntensity={active ? 1.0 : 0.55}
              roughness={0.45}
              metalness={0.3}
            />
          )}
        </Sphere>

        {/* Earth night-lights overlay (additive) */}
        {data.texture === "earth" && earthNight && (
          <Sphere ref={nightRef} args={[data.size * 1.005, 64, 64]}>
            <meshBasicMaterial
              map={earthNight}
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </Sphere>
        )}

        {/* Earth cloud layer */}
        {data.texture === "earth" && clouds && (
          <Sphere ref={cloudsRef} args={[data.size * 1.04, 48, 48]}>
            <meshStandardMaterial
              map={clouds}
              transparent
              opacity={0.6}
              depthWrite={false}
              roughness={1}
            />
          </Sphere>
        )}

        {/* Satellite orbiting structure for Research */}
        {data.texture === "satellite" && (
          <group ref={satGroup}>
            <mesh position={[data.size * 1.6, 0, 0]}>
              <boxGeometry args={[0.16, 0.08, 0.08]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} emissive="#1e293b" />
            </mesh>
            <mesh position={[data.size * 1.6, 0, -0.18]}>
              <boxGeometry args={[0.4, 0.02, 0.18]} />
              <meshStandardMaterial color="#1e3a8a" emissive="#3b82f6" emissiveIntensity={0.8} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[data.size * 1.6, 0, 0.18]}>
              <boxGeometry args={[0.4, 0.02, 0.18]} />
              <meshStandardMaterial color="#1e3a8a" emissive="#3b82f6" emissiveIntensity={0.8} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* dish */}
            <mesh position={[data.size * 1.6, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.02, 0.04, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        )}

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
