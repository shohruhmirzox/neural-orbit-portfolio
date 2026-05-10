import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  start: THREE.Vector3 | (() => THREE.Vector3);
  end: THREE.Vector3 | (() => THREE.Vector3);
  color: string;
  pulseColor?: string;
  pulseSpeed?: number;
  pulseCount?: number;
  reducedMotion?: boolean;
}

export function SynapticConnection({
  start,
  end,
  color,
  pulseColor,
  pulseSpeed = 0.35,
  pulseCount = 3,
  reducedMotion = false,
}: Props) {
  const effectivePulseCount = reducedMotion ? 0 : pulseCount;
  const lineRef = useRef<THREE.Line>(null!);
  const pulseRefs = useRef<THREE.Mesh[]>([]);
  const tmp = useRef(new THREE.Vector3());

  const segments = 60;

  const { geometry, curveRef, lineObject } = useMemo(() => {
    const curveRef = { current: null as THREE.CatmullRomCurve3 | null };
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array((segments + 1) * 3), 3)
    );
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lineObject = new THREE.Line(geometry, mat);
    return { geometry, curveRef, lineObject };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    const s = typeof start === "function" ? start() : start;
    const e = typeof end === "function" ? end() : end;

    // arched control points for synaptic curve
    const mid1 = s.clone().lerp(e, 0.33);
    const mid2 = s.clone().lerp(e, 0.66);
    const lift = 1.2;
    mid1.y += lift;
    mid2.y -= lift * 0.4;

    const curve = new THREE.CatmullRomCurve3([s.clone(), mid1, mid2, e.clone()]);
    curveRef.current = curve;

    const positions = (geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    for (let i = 0; i <= segments; i++) {
      curve.getPoint(i / segments, tmp.current);
      positions[i * 3] = tmp.current.x;
      positions[i * 3 + 1] = tmp.current.y;
      positions[i * 3 + 2] = tmp.current.z;
    }
    (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // animate pulses
    const t = state.clock.elapsedTime * pulseSpeed;
    pulseRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const u = ((t + i / pulseCount) % 1 + 1) % 1;
      curve.getPoint(u, tmp.current);
      mesh.position.copy(tmp.current);
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 4 + i);
      mesh.scale.setScalar(0.06 + pulse * 0.05);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.6 + pulse * 0.4;
    });
  });

  const pulseHex = pulseColor ?? color;

  return (
    <group>
      <primitive object={lineObject} ref={lineRef as unknown as React.Ref<THREE.Object3D>} />
      {Array.from({ length: pulseCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) pulseRefs.current[i] = m;
          }}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial
            color={pulseHex}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
