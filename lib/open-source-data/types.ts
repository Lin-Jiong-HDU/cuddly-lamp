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
