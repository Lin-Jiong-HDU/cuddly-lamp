"use client";

import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { ProjectStar } from "./ProjectStar";
import { CommitStar } from "./CommitStar";
import {
  generateProjectStars,
  generateBackgroundStars,
  generateCommitStars,
} from "@/lib/open-source-data/stars-generator";
import { classicProjects } from "@/lib/open-source-data/projects";
import type { ProjectData, CommitData, Star } from "@/lib/open-source-data/types";

interface GalaxySceneProps {
  progress: number;
}

function GalaxyScene({ progress }: GalaxySceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [, setHoveredProject] = useState<ProjectData | null>(null);
  const [commitStars, setCommitStars] = useState<Star[]>([]);

  // Generate stars
  const projectStars = useMemo(() => generateProjectStars(classicProjects), []);
  const backgroundStars = useMemo(() => generateBackgroundStars(200), []);

  // Fetch user commits
  useEffect(() => {
    async function fetchCommits() {
      try {
        const response = await fetch(
          "https://api.github.com/users/Lin-Jiong-HDU/events/public"
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const events = await response.json();
        const commits: CommitData[] = events
          .filter((e: { type: string }) => e.type === "PushEvent")
          .slice(0, 50)
          .flatMap((e: { repo: { name: string }; payload: { commits: { sha: string; message: string }[] }; created_at: string }) =>
            e.payload.commits.map((c) => ({
              sha: c.sha,
              message: c.message,
              date: e.created_at,
              repo: e.repo.name,
            }))
          );
        setCommitStars(generateCommitStars(commits));
      } catch (err) {
        console.error("Failed to fetch commits:", err);
      }
    }
    fetchCommits();
  }, []);

  // Auto-rotate based on scroll progress
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Calculate visibility based on progress
  const backgroundVisible = progress > 0;
  const projectsVisible = progress > 0.2;
  const commitsVisible = progress > 0.5;

  return (
    <group ref={groupRef}>
      {/* Ambient background stars */}
      <Stars radius={20} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

      {/* Background decorative stars */}
      {backgroundStars.map((star) => (
        <CommitStar
          key={star.id}
          position={star.position}
          color={star.color}
          size={star.size}
          visible={backgroundVisible}
        />
      ))}

      {/* Project stars (classic open source projects) */}
      {projectStars.map((star) =>
        star.type === 'project' && star.data ? (
          <ProjectStar
            key={star.id}
            project={star.data as ProjectData}
            visible={projectsVisible}
            onHover={setHoveredProject}
          />
        ) : null
      )}

      {/* User commit stars */}
      {commitStars.map((star) => (
        <CommitStar
          key={star.id}
          position={star.position}
          color={star.color}
          size={star.size}
          data={star.data as CommitData}
          visible={commitsVisible}
        />
      ))}
    </group>
  );
}

interface Galaxy3DProps {
  progress: number;
}

export default function Galaxy3D({ progress }: Galaxy3DProps) {
  return (
    <div className="w-full h-screen sticky top-0">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{ background: "#050510" }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Suspense fallback={null}>
          <GalaxyScene progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
