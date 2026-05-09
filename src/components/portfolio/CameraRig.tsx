import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect } from "react";

interface Props {
  target: THREE.Vector3 | null;
  distance?: number;
  defaultPosition: THREE.Vector3;
  defaultLookAt: THREE.Vector3;
}

export function CameraRig({ target, distance = 3.5, defaultPosition, defaultLookAt }: Props) {
  const { camera } = useThree();
  const desiredPos = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.position.copy(defaultPosition);
    camera.lookAt(defaultLookAt);
    currentLook.current.copy(defaultLookAt);
  }, [camera, defaultPosition, defaultLookAt]);

  useFrame(() => {
    if (target) {
      const dir = target.clone().normalize();
      desiredPos.current.copy(target).add(dir.multiplyScalar(distance)).add(new THREE.Vector3(0, 1.2, 0));
      desiredLook.current.copy(target);
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
