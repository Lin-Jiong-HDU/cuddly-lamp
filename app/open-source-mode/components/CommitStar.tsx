"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { CommitData } from "@/lib/open-source-data/types";

interface CommitStarProps {
  position: [number, number, number];
  color: string;
  size: number;
  data?: CommitData;
  visible: boolean;
}

export function CommitStar({ position, color, size, data, visible }: CommitStarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
    }
  });

    if (!visible) return null;

    return (
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <sphereGeometry args={[hovered ? size * 1.5 : size, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={hovered ? 1 : 0.8}
          />
        </mesh>

        {hovered && data && (
          <Html center distanceFactor={15}>
            <div className="px-2 py-1 bg-black/80 rounded border border-white/20 whitespace-nowrap text-xs">
              <code className="text-green-400">{data.sha.substring(0, 7)}</code>
              <div className="text-white/70 mt-1">{data.message}</div>
            </div>
          </Html>
        )}
      </group>
    );
}
