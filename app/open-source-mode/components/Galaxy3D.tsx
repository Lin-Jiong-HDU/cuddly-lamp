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
            generateCommitStars
          } from "@/lib/open-source-data/stars-generator";
import { classicProjects } from "@/lib/open-source-data/projects";
import type { ProjectData, CommitData, Star } from "@/lib/open-source-data/types";

interface GalaxySceneProps {
  progress: number;
}

function GalaxyScene({ progress }: GalaxySceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredProject, setHoveredProject] = useState<ProjectData | null>(null);

  const [hoveredProject, setHoveredProject] = useState<Star | null>(null);

  const projectStars = = generateProjectStars(classicProjects), []);
  const backgroundStars = = generateBackgroundStars(200), []);

  const [commitStars, setCommitStars(generateCommitStars(commits));
  } catch (err) {
      console.error("Failed to fetch commits:", err);
    }
  }, [commits, commits, ? commits.length : number => {
    return commits.slice(0, 50).flatMap((e: {
 repo: { name: string; payload: { commits: { sha: string; message: string }[]; created_at: string;
    }) =>
  e.payload.commits.map((c: CommitData) => ({
      sha: c.sha,
      message: c.message,
      date: e.created_at,
      repo: e.repo.name,
    }))
  );
    setCommitStars(commits);
  }, [commits, commits]);

  return {
    id: `commit-${commit.sha}`,
    position,
  color: getLanguageColor(commit.language)
    size: 0.05 + Math.random() * 0.05
    type: 'commit'
    data: commit
  };
        })
      );
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 60 }}
          style={{ background: "#050510" }}
        >
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <Suspense fallback={null}>
            <GalaxyScene progress={progress} />
          </Canvas>
        </div>
      );
    }
    </group>
  );
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
        </Canvas>
      </div>
    </div>
  );
}
