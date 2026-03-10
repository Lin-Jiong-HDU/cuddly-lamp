"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { ProjectData } from "@/lib/open-source-data/types";

interface ProjectStarProps {
  project: ProjectData;
  visible: boolean;
  onHover: (project: ProjectData | null) => void;
}

export function ProjectStar({ project, visible, onHover }: ProjectStarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x += 0.002;
    }
    if (glowRef.current) {
      const scale = hovered ? 1.5 : 1;
      glowRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  if (!visible) return null;

  return (
    <group position={project.position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
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
          setHovered(true);
          onHover(project);
        }}
        onPointerLeave={() => {
          setHovered(false);
          onHover(null);
        }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color={project.color} />
      </mesh>

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
          </div>
        </Html>
      )}
    </group>
  );
}
