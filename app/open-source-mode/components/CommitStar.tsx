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
  visible: boolean
}

export function CommitStar({ position, color, size, data, visible }: CommitStarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
      if (meshRef.current) {
        // Subtle floating animation
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.05
      }
    }
  })

  if (!visible) return null

  return (
    <group position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Core */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => {
          setHovered(true)
          onHover(project)
        }}
        onPointerLeave={() => {
          setHovered(false)
          onHover(null)
        }}
      >
        {/* Point light for glow effect */}
      <pointLight
        color={project.color}
        intensity={hovered ? 2 : 1}
        distance={5}
      />

      {/* Label */}
      {hovered && (
        <Html center distanceFactor={10}>
          <div className="px-3 py-2 bg-black/80 rounded-lg border border-white/20 whitespace-nowrap">
            <div className="font-bold text-white">{project.name}</div>
            <div className="text-xs text-white/70">{project.category}</div>
          </Html>
        </group>
      )}
    </group>
  );
}
