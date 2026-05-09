import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function NeuralStarfield({ count = 1200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const { positions, phases, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // distribute on a large sphere
      const r = 40 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 0.05 + Math.random() * 0.18;
    }
    return { positions, phases, sizes };
  }, [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [positions, phases, sizes]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float aPhase;
        attribute float aSize;
        varying float vTwinkle;
        uniform float uTime;
        void main() {
          float t = sin(uTime * 2.5 + aPhase) * 0.5 + 0.5;
          vTwinkle = t;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (200.0 / -mv.z) * (0.6 + t);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * (0.4 + vTwinkle * 0.9);
          vec3 col = mix(vec3(0.55, 0.7, 1.0), vec3(0.85, 0.6, 1.0), vTwinkle);
          gl_FragColor = vec4(col, a);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}
