
export interface AttachedImage {
  id: string;
  data: string; // Base64 string without prefix for API, or with prefix for display? We will store with prefix for display ease.
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface RefineResult {
  refinedPrompt: string;
  analysis: string;
}

export interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
}

export interface HistoryItem {
  id: string;
  originalPrompt: string;
  refinedPrompt: string;
  timestamp: number;
}
