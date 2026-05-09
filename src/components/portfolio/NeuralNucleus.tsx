import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  onHover: (hover: boolean) => void;
  onClick: () => void;
}

export function NeuralNucleus({ onHover, onClick }: Props) {
  const coreRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.15;
      const s = 1 + Math.sin(t * 1.6) * 0.04;
      coreRef.current.scale.setScalar(s);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z = t * 0.3;
      const s = 1 + Math.sin(t * 2.2) * 0.08;
      haloRef.current.scale.setScalar(s);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z = t * 0.25;
    }
  });

  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { onHover(false); document.body.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* core */}
      <Sphere ref={coreRef} args={[1.4, 64, 64]}>
        <meshStandardMaterial
          color="#c4b5fd"
          emissive="#a78bfa"
          emissiveIntensity={2.4}
          roughness={0.2}
          metalness={0.4}
        />
      </Sphere>

      {/* inner glow */}
      <Sphere args={[1.7, 32, 32]}>
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* halo */}
      <Sphere ref={haloRef} args={[2.4, 32, 32]}>
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>

      {/* synapse ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.0, 0.012, 16, 128]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* point light from nucleus */}
      <pointLight color="#a78bfa" intensity={3} distance={20} decay={2} />
    </group>
  );
}
