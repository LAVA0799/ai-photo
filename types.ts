export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
}

export interface GenerationSettings {
  count: number; // 10, 20, 30
  gender: 'male' | 'female' | 'auto';
}

export interface GenerationPlan {
  physicalDescription: string;
  scenarios: Scenario[];
}

export interface Scenario {
  outfit: string;
  location: string;
  lighting: string;
  pose: string;
  styleName: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
