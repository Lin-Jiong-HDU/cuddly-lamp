# Open Source Mode Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an immersive 3D open source themed easter egg page with Git commit burst animation, galaxy visualization, and classic open source projects showcase.

**Architecture:** Progressive trigger (3 clicks → burst animation → 2 more clicks → 3D galaxy page). Uses React Three Fiber for 3D rendering, Framer Motion for scroll-driven animations. Follows the same patterns as the existing F1 mode.

**Tech Stack:** React Three Fiber, @react-three/drei, @react-three/postprocessing, Framer Motion, Next.js App Router, Tailwind CSS

---

## File Structure

```
app/
  open-source-mode/
    page.tsx                    # Main page with scroll-driven 3D scene
    components/
      Galaxy3D.tsx              # 3D galaxy scene with stars and connections
      ProjectStar.tsx           # Classic project "star" (large glowing sphere)
      CommitStar.tsx            # User commit "star" (small point)
      ProjectGallery.tsx        # Section 2: Project cards
      ContributionTimeline.tsx  # Section 3: Recent commits timeline

components/
  easter-eggs/
    OpenSourceMode.tsx          # Git commit burst animation + trigger logic

lib/
  open-source-data/
    types.ts                    # Type definitions
    projects.ts                 # Classic open source projects data
    stars-generator.ts          # Generate star positions from GitHub data
```

---

## Chunk 1: Data Layer & Types

### Task 1: Create Type Definitions

**Files:**
- Create: `lib/open-source-data/types.ts`

- [ ] **Step 1: Create types.ts with all necessary interfaces**

```typescript
// lib/open-source-data/types.ts

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  github?: string;
  position: [number, number, number];
}

export interface CommitData {
  sha: string;
  message: string;
  date: string;
  repo: string;
  language?: string;
}

export interface Star {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  type: 'project' | 'commit';
  data?: CommitData | ProjectData;
}

export interface CommitBurstItem {
  id: string;
  hash: string;
  message: string;
  type: 'feat' | 'fix' | 'docs' | 'refactor' | 'test' | 'chore';
  x: number;
  y: number;
  rotation: number;
  delay: number;
}
```

- [ ] **Step 2: Commit types**

```bash
git add lib/open-source-data/types.ts
git commit -m "feat(open-source-mode): add type definitions"
```

---

### Task 2: Create Classic Projects Data

**Files:**
- Create: `lib/open-source-data/projects.ts`

- [ ] **Step 1: Create projects.ts with classic open source projects**

```typescript
// lib/open-source-data/projects.ts

import type { ProjectData } from './types';

export const classicProjects: ProjectData[] = [
  {
    id: 'linux',
    name: 'Linux',
    description: '改变世界的操作系统内核',
    category: '操作系统',
    color: '#e54b4b',
    github: 'https://github.com/torvalds/linux',
    position: [-4, 1, 0],
  },
  {
    id: 'git',
    name: 'Git',
    description: '分布式版本控制系统',
    category: '版本控制',
    color: '#f05032',
    github: 'https://github.com/git/git',
    position: [3, 2, -2],
  },
  {
    id: 'react',
    name: 'React',
    description: '声明式、高效的 JavaScript UI 库',
    category: '前端框架',
    color: '#61dafb',
    github: 'https://github.com/facebook/react',
    position: [4, 0, 2],
  },
  {
    id: 'python',
    name: 'Python',
    description: '优雅而强大的编程语言',
    category: '编程语言',
    color: '#3776ab',
    github: 'https://github.com/python/cpython',
    position: [-3, -1, 3],
  },
  {
    id: 'vscode',
    name: 'VS Code',
    description: '轻量但强大的开源代码编辑器',
    category: '开发工具',
    color: '#007acc',
    github: 'https://github.com/microsoft/vscode',
    position: [2, -2, -3],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'JavaScript 运行时环境',
    category: '运行时',
    color: '#339933',
    github: 'https://github.com/nodejs/node',
    position: [-2, 2, -1],
  },
  {
    id: 'docker',
    name: 'Docker',
    description: '容器化应用平台',
    category: '容器化',
    color: '#2496ed',
    github: 'https://github.com/moby/moby',
    position: [0, -1, -4],
  },
  {
    id: 'rust',
    name: 'Rust',
    description: '安全、并发、高效的系统编程语言',
    category: '编程语言',
    color: '#dea584',
    github: 'https://github.com/rust-lang/rust',
    position: [-1, 1, 4],
  },
];
```

- [ ] **Step 2: Commit projects data**

```bash
git add lib/open-source-data/projects.ts
git commit -m "feat(open-source-mode): add classic open source projects data"
```

---

### Task 3: Create Stars Generator Utility

**Files:**
- Create: `lib/open-source-data/stars-generator.ts`

- [ ] **Step 1: Create stars-generator.ts with star generation logic**

```typescript
// lib/open-source-data/stars-generator.ts

import type { Star, CommitData, ProjectData } from './types';
import { classicProjects } from './projects';

// Generate random position around a center point
function randomPositionAround(
  center: [number, number, number],
  minRadius: number,
  maxRadius: number
): [number, number, number] {
  const radius = minRadius + Math.random() * (maxRadius - minRadius);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);

  return [
    center[0] + radius * Math.sin(phi) * Math.cos(theta),
    center[1] + radius * Math.sin(phi) * Math.sin(theta),
    center[2] + radius * Math.cos(phi),
  ];
}

// Get color based on language
function getLanguageColor(language?: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Go: '#00add8',
    Rust: '#dea584',
    Java: '#b07219',
    C: '#555555',
    'C++': '#f34b7d',
    Ruby: '#701516',
    PHP: '#4f5d95',
  };
  return colors[language || ''] || '#8b949e';
}

// Generate commit stars from GitHub data
export function generateCommitStars(
  commits: CommitData[],
  projects: ProjectData[] = classicProjects
): Star[] {
  return commits.map((commit, index) => {
    // Find nearest project star to orbit around
    const nearestProject = projects[index % projects.length];
    const position = randomPositionAround(nearestProject.position, 1.5, 3.5);

    return {
      id: `commit-${commit.sha}`,
      position,
      color: getLanguageColor(commit.language),
      size: 0.05 + Math.random() * 0.05,
      type: 'commit',
      data: commit,
    };
  });
}

// Generate project stars
export function generateProjectStars(
  projects: ProjectData[] = classicProjects
): Star[] {
  return projects.map((project) => ({
    id: `project-${project.id}`,
    position: project.position,
    color: project.color,
    size: 0.3,
    type: 'project' as const,
    data: project,
  }));
}

// Generate background stars (decorative)
export function generateBackgroundStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const radius = 15 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    stars.push({
      id: `bg-${i}`,
      position: [
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      ],
      color: '#ffffff',
      size: 0.02 + Math.random() * 0.03,
      type: 'commit',
    });
  }
  return stars;
}
```

- [ ] **Step 2: Commit stars generator**

```bash
git add lib/open-source-data/stars-generator.ts
git commit -m "feat(open-source-mode): add stars generator utility"
```

---

## Chunk 2: Transition Animation Component

### Task 4: Create Git Commit Burst Animation

**Files:**
- Create: `components/easter-eggs/OpenSourceMode.tsx`

- [ ] **Step 1: Create OpenSourceMode.tsx with burst animation**

```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CommitBurstItem } from "@/lib/open-source-data/types";

interface OpenSourceModeProps {
  triggerRef: React.RefObject<HTMLElement | null>;
}

const commitMessages = [
  { type: 'feat' as const, message: 'Add new feature' },
  { type: 'feat' as const, message: 'Implement user auth' },
  { type: 'fix' as const, message: 'Fix memory leak' },
  { type: 'fix' as const, message: 'Resolve race condition' },
  { type: 'docs' as const, message: 'Update README' },
  { type: 'refactor' as const, message: 'Clean up code' },
  { type: 'feat' as const, message: 'Add dark mode' },
  { type: 'test' as const, message: 'Add unit tests' },
  { type: 'chore' as const, message: 'Update dependencies' },
  { type: 'feat' as const, message: 'Add API endpoint' },
];

const typeColors: Record<string, string> = {
  feat: '#3fb950',
  fix: '#58a6ff',
  docs: '#d29922',
  refactor: '#a371f7',
  test: '#f778ba',
  chore: '#8b949e',
};

function generateHash(): string {
  return Math.random().toString(16).substring(2, 9);
}

function generateBurstItems(count: number): CommitBurstItem[] {
  const items: CommitBurstItem[] = [];
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const distance = 100 + Math.random() * 300;
    const commit = commitMessages[Math.floor(Math.random() * commitMessages.length)];

    items.push({
      id: `burst-${i}`,
      hash: generateHash(),
      message: commit.message,
      type: commit.type,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      rotation: Math.random() * 30 - 15,
      delay: i * 30,
    });
  }
  return items;
}

export function OpenSourceMode({ triggerRef }: OpenSourceModeProps) {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [burstItems, setBurstItems] = useState<CommitBurstItem[]>([]);
  const clickCountRef = useRef(0);
  const extraClickCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const trigger = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    setBurstItems(generateBurstItems(20));
    setActive(true);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = setTimeout(() => {
      setActive(false);
      extraClickCountRef.current = 0;
    }, 2500);
  }, []);

  const triggerOpenSourceMode = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setActive(false);
    router.push("/open-source-mode");
  }, [router]);

  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const handleClick = () => {
      if (active) {
        extraClickCountRef.current++;
        if (extraClickCountRef.current >= 2) {
          triggerOpenSourceMode();
          clickCountRef.current = 0;
          extraClickCountRef.current = 0;
        }
        return;
      }

      clickCountRef.current++;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (clickCountRef.current >= 3) {
        trigger();
        clickCountRef.current = 0;
      } else {
        timeoutRef.current = setTimeout(() => {
          clickCountRef.current = 0;
        }, 500);
      }
    };

    element.addEventListener("click", handleClick);
    return () => {
      element.removeEventListener("click", handleClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [triggerRef, trigger, triggerOpenSourceMode, active]);

  return (
    <>
      <audio ref={audioRef} src="/sounds/keyboard.mp3" preload="auto" />
      {active && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden bg-black/50">
          {burstItems.map((item) => (
            <div
              key={item.id}
              className="absolute animate-burst-out"
              style={{
                left: item.x,
                top: item.y,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                animationDelay: `${item.delay}ms`,
              }}
            >
              <div
                className="px-3 py-1.5 rounded-md font-mono text-sm whitespace-nowrap shadow-lg"
                style={{
                  backgroundColor: `${typeColors[item.type]}20`,
                  borderLeft: `3px solid ${typeColors[item.type]}`,
                  color: typeColors[item.type],
                }}
              >
                <span className="opacity-60">{item.hash}</span>
                <span className="mx-2 opacity-40">|</span>
                <span>{item.message}</span>
              </div>
            </div>
          ))}

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/70 text-sm animate-pulse">
            Keep clicking to enter Open Source Mode!
          </div>

          <style jsx>{`
            @keyframes burst-out {
              0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
              }
              20% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
              80% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
              100% {
                opacity: 0;
                transform: translate(-50%, -50%) translateY(50px) scale(0.8);
              }
            }
            .animate-burst-out {
              animation: burst-out 2.5s ease-out forwards;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit transition component**

```bash
git add components/easter-eggs/OpenSourceMode.tsx
git commit -m "feat(open-source-mode): add git commit burst animation component"
```

---

## Chunk 3: 3D Galaxy Scene

### Task 5: Create ProjectStar Component

**Files:**
- Create: `app/open-source-mode/components/ProjectStar.tsx`

- [ ] **Step 1: Create ProjectStar.tsx for classic project stars**

```typescript
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

  useFrame((state) => {
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
```

- [ ] **Step 2: Commit ProjectStar component**

```bash
git add app/open-source-mode/components/ProjectStar.tsx
git commit -m "feat(open-source-mode): add ProjectStar 3D component"
```

---

### Task 6: Create CommitStar Component

**Files:**
- Create: `app/open-source-mode/components/CommitStar.tsx`

- [ ] **Step 1: Create CommitStar.tsx for user commit stars**

```typescript
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
```

- [ ] **Step 2: Commit CommitStar component**

```bash
git add app/open-source-mode/components/CommitStar.tsx
git commit -m "feat(open-source-mode): add CommitStar 3D component"
```

---

### Task 7: Create Galaxy3D Main Scene

**Files:**
- Create: `app/open-source-mode/components/Galaxy3D.tsx`

- [ ] **Step 1: Create Galaxy3D.tsx with full scene**

```typescript
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
  const [hoveredProject, setHoveredProject] = useState<ProjectData | null>(null);

  // Generate stars
  const projectStars = useMemo(() => generateProjectStars(classicProjects), []);
  const backgroundStars = useMemo(() => generateBackgroundStars(200), []);
  const [commitStars, setCommitStars] = useState<Star[]>([]);

  // Fetch user commits
  useEffect(() => {
    async function fetchCommits() {
      try {
        const response = await fetch(
          "https://api.github.com/users/Lin-Jiong-HDU/events/public"
        );
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
      {commitStars.map((star) =>
        star.type === 'commit' ? (
          <CommitStar
            key={star.id}
            position={star.position}
            color={star.color}
            size={star.size}
            data={star.data as CommitData}
            visible={commitsVisible}
          />
        ) : null
      )}
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
```

- [ ] **Step 2: Commit Galaxy3D component**

```bash
git add app/open-source-mode/components/Galaxy3D.tsx
git commit -m "feat(open-source-mode): add Galaxy3D main scene component"
```

---

## Chunk 4: Page & UI Components

### Task 8: Create ProjectGallery Component

**Files:**
- Create: `app/open-source-mode/components/ProjectGallery.tsx`

- [ ] **Step 1: Create ProjectGallery.tsx**

```typescript
"use client";

import { motion } from "framer-motion";
import { classicProjects } from "@/lib/open-source-data/projects";

export default function ProjectGallery() {
  return (
    <section className="py-20 px-6 bg-[#050510]">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl text-white mb-12 text-center"
        >
          开源恒星系统
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {classicProjects.map((project, index) => (
            <motion.a
              key={project.id}
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-all"
            >
              <div
                className="w-3 h-3 rounded-full mb-4"
                style={{ backgroundColor: project.color }}
              />
              <h3 className="font-serif text-lg text-white mb-2 group-hover:text-white/80">
                {project.name}
              </h3>
              <p className="text-sm text-white/50 mb-2">{project.description}</p>
              <span className="text-xs text-white/30">{project.category}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit ProjectGallery component**

```bash
git add app/open-source-mode/components/ProjectGallery.tsx
git commit -m "feat(open-source-mode): add ProjectGallery component"
```

---

### Task 9: Create ContributionTimeline Component

**Files:**
- Create: `app/open-source-mode/components/ContributionTimeline.tsx`

- [ ] **Step 1: Create ContributionTimeline.tsx**

```typescript
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Commit {
  sha: string;
  message: string;
  repo: string;
  date: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ContributionTimeline() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommits() {
      try {
        const response = await fetch(
          "https://api.github.com/users/Lin-Jiong-HDU/events/public"
        );
        const events = await response.json();
        const allCommits: Commit[] = events
          .filter((e: { type: string }) => e.type === "PushEvent")
          .slice(0, 10)
          .flatMap((e: { repo: { name: string }; payload: { commits: { sha: string; message: string }[] }; created_at: string }) =>
            e.payload.commits.map((c) => ({
              sha: c.sha,
              message: c.message,
              repo: e.repo.name,
              date: e.created_at,
            }))
          )
          .slice(0, 8);
        setCommits(allCommits);
      } catch (err) {
        console.error("Failed to fetch commits:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommits();
  }, []);

  return (
    <section className="py-20 px-6 bg-[#0a0a12]">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl text-white mb-12 text-center"
        >
          你的贡献轨迹
        </motion.h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

            {/* Commits */}
            <div className="space-y-4">
              {commits.map((commit, index) => (
                <motion.div
                  key={commit.sha}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline node */}
                  <div className="relative z-10 w-4 h-4 mt-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-[#0a0a12] flex-shrink-0" />

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <code className="text-sm font-mono text-green-400">
                        {commit.sha.substring(0, 7)}
                      </code>
                      <span className="text-xs text-white/30">
                        {formatRelativeTime(commit.date)}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-1">
                      {commit.message}
                    </p>
                    <span className="text-xs text-white/40">{commit.repo}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit ContributionTimeline component**

```bash
git add app/open-source-mode/components/ContributionTimeline.tsx
git commit -m "feat(open-source-mode): add ContributionTimeline component"
```

---

### Task 10: Create Main Page

**Files:**
- Create: `app/open-source-mode/page.tsx`

- [ ] **Step 1: Create page.tsx with scroll-driven 3D scene**

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ProjectGallery from "./components/ProjectGallery";
import ContributionTimeline from "./components/ContributionTimeline";

// Dynamic import for 3D component
const Galaxy3D = dynamic(() => import("./components/Galaxy3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#050510] flex items-center justify-center">
      <div className="text-purple-400 text-xl animate-pulse">Loading Galaxy...</div>
    </div>
  ),
});

export default function OpenSourceModePage() {
  const [mounted, setMounted] = useState(false);
  const galaxySectionRef = useRef<HTMLElement>(null);
  const [galaxyProgress, setGalaxyProgress] = useState(0);
  const router = useRouter();
  const previousThemeRef = useRef<string | null>(null);

  const { scrollYProgress: galaxyScrollProgress } = useScroll({
    target: galaxySectionRef,
    offset: ["start start", "end end"],
  });

  const drawProgress = useTransform(galaxyScrollProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    previousThemeRef.current = currentTheme;
    document.documentElement.setAttribute("data-theme", "dark");

    return () => {
      if (previousThemeRef.current) {
        document.documentElement.setAttribute("data-theme", previousThemeRef.current);
      }
    };
  }, []);

  const handleBack = () => {
    if (previousThemeRef.current) {
      document.documentElement.setAttribute("data-theme", previousThemeRef.current);
    }
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
    const unsubscribe = drawProgress.on("change", (v) => setGalaxyProgress(v));
    return () => unsubscribe();
  }, [drawProgress]);

  return (
    <div className="bg-[#050510] min-h-screen">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 px-4 py-2 text-sm text-white/70 hover:text-white border border-white/20 hover:border-purple-500 rounded-full transition-all duration-300"
      >
        ← Back
      </button>

      {/* Section 1: 3D Galaxy */}
      <section ref={galaxySectionRef} className="relative h-[200vh]">
        {mounted && <Galaxy3D progress={galaxyProgress} />}

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: galaxyProgress > 0.8 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="sticky top-[70vh] flex justify-center pointer-events-none z-10"
        >
          <div className="text-center">
            <div className="text-4xl md:text-6xl font-serif text-white tracking-widest">
              OPEN SOURCE
            </div>
            <div className="text-sm text-purple-400 tracking-[0.3em] mt-2">
              CODE IS ART
            </div>
          </div>
        </motion.div>
      </section>

      {/* Section 2: Project Gallery */}
      <ProjectGallery />

      {/* Section 3: Contribution Timeline */}
      <ContributionTimeline />

      {/* Footer */}
      <div className="py-20 flex justify-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-purple-500/50" />
          <div className="text-sm text-gray-500">OPEN SOURCE MODE</div>
          <div className="w-12 h-px bg-purple-500/50" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit main page**

```bash
git add app/open-source-mode/page.tsx
git commit -m "feat(open-source-mode): add main page with scroll-driven 3D scene"
```

---

## Chunk 5: Integration

### Task 11: Update Homepage with Trigger

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update page.tsx to add OpenSourceMode trigger**

Modify `app/page.tsx` to split the identity text and add the trigger:

```typescript
"use client";

import { useRef } from "react";
import Link from "next/link";
import { F1Racer } from "@/components/easter-eggs/F1Racer";
import { OpenSourceMode } from "@/components/easter-eggs/OpenSourceMode";

export default function Home() {
	const f1TriggerRef = useRef<HTMLSpanElement>(null);
	const openSourceTriggerRef = useRef<HTMLSpanElement>(null);

	return (
		<>
			<F1Racer triggerRef={f1TriggerRef} />
			<OpenSourceMode triggerRef={openSourceTriggerRef} />
			<div className="min-h-screen flex items-center justify-center px-6">
				<div className="max-w-3xl text-center">
					{/* Decorative element */}
					<div className="mb-8 opacity-0 animate-fade-in">
						<div className="w-16 h-px bg-[var(--color-accent)] mx-auto" />
					</div>

					{/* Main heading */}
					<h1 className="font-serif text-5xl md:text-7xl font-normal text-[var(--color-text)] mb-6 opacity-0 animate-fade-in-up delay-100">
						JohnLin
					</h1>

					{/* Subtitle - Split for separate triggers */}
					<p className="text-lg md:text-xl text-[var(--color-text-secondary)] mb-4 opacity-0 animate-fade-in-up delay-200">
						<span className="text-[var(--color-text-muted)]">大学生 / </span>
						<span
							ref={openSourceTriggerRef}
							className="cursor-default select-none hover:text-[var(--color-accent)] transition-colors"
							title="Click 3 times..."
						>
							开源爱好者
						</span>
						<span className="text-[var(--color-text-muted)]"> / </span>
						<span
							ref={f1TriggerRef}
							className="cursor-default select-none hover:text-[var(--color-accent)] transition-colors"
							title="Click 3 times..."
						>
							F1爱好者
						</span>
					</p>

					<p className="text-base text-[var(--color-text-muted)] max-w-lg mx-auto mb-16 opacity-0 animate-fade-in-up delay-300">
						热衷于探索新技术，享受用技术解决问题。这里记录了我的成长与思考。
					</p>

					{/* Rest of the page remains the same */}
					<div className="mb-16 opacity-0 animate-fade-in delay-300">
						<div className="flex items-center justify-center gap-4">
							<div className="w-8 h-px bg-[var(--color-border)]" />
							<div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
							<div className="w-8 h-px bg-[var(--color-border)]" />
						</div>
					</div>

					<div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto opacity-0 animate-fade-in-up delay-400">
						<Link href="/about" className="card p-8 rounded-lg text-left group">
							<div className="font-serif text-2xl mb-3 text-[var(--color-text)] group-hover:text-[var(--color-accent-dark)] transition-colors">
								About
							</div>
							<p className="text-sm text-[var(--color-text-muted)]">
								我的技术栈、项目经历与学习历程
							</p>
						</Link>

						<Link href="/blog" className="card p-8 rounded-lg text-left group">
							<div className="font-serif text-2xl mb-3 text-[var(--color-text)] group-hover:text-[var(--color-accent-dark)] transition-colors">
								Blog
							</div>
							<p className="text-sm text-[var(--color-text-muted)]">
								技术探索、开源项目介绍与心得
							</p>
						</Link>
					</div>

					<div className="mt-20 opacity-0 animate-fade-in delay-500">
						<div className="flex items-center justify-center gap-4">
							<div className="w-8 h-px bg-[var(--color-border)]" />
							<div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
							<div className="w-8 h-px bg-[var(--color-border)]" />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
```

- [ ] **Step 2: Commit homepage update**

```bash
git add app/page.tsx
git commit -m "feat(open-source-mode): integrate OpenSourceMode trigger on homepage"
```

---

### Task 12: Add Keyboard Sound Effect

**Files:**
- Add: `public/sounds/keyboard.mp3`

- [ ] **Step 1: Add keyboard sound file**

Find or create a keyboard typing sound effect and place it at `public/sounds/keyboard.mp3`.

Note: If no sound file is available, the animation will still work without audio.

---

### Task 13: Final Testing & Verification

- [ ] **Step 1: Verify the feature works**

1. Navigate to homepage
2. Click "开源爱好者" 3 times quickly → Should see commit burst animation
3. During animation, click 2 more times → Should navigate to `/open-source-mode`
4. Scroll through the 3D galaxy page → Stars should appear progressively
5. Hover over stars → Should show tooltips
6. Click "← Back" → Should return to homepage
7. Press ESC → Should return to homepage

- [ ] **Step 2: Run type check**

```bash
pnpm tsc --noEmit
```

Expected: No type errors

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: No lint errors

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete open source mode easter egg feature"
```

---

## Summary

This implementation plan creates a complete "Open Source Mode" easter egg feature with:

1. **Git Commit Burst Animation** - Triggered by 3 clicks on "开源爱好者"
2. **3D Galaxy Visualization** - Classic open source projects as stars, user commits as smaller stars
3. **Progressive Reveal** - Scroll-driven star appearance
4. **Project Gallery** - Cards showcasing classic open source projects
5. **Contribution Timeline** - Recent commit history

The feature follows the same patterns as the existing F1 mode for consistency.
