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
