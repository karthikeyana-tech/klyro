import { create } from "zustand";

export interface AnalysisResult {
  id: string;
  atsScore: number;
  overallRating: string;
  skills: {
    found: string[];
    missing: string[];
    matchPercentage: number;
  };
  sections: Record<string, { score: number; feedback: string }>;
  keywords: {
    matched: string[];
    missing: string[];
    density: number;
  };
  suggestions: Array<{
    category: string;
    priority: string;
    suggestion: string;
    example: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  languageIssues?: {
    jargon: Array<{ word: string; context: string; fix: string }>;
    weakVerbs: Array<{ word: string; context: string; fix: string }>;
    missingMetrics: Array<{ sentence: string; fix: string }>;
    grammar: Array<{ issue: string; context: string; fix: string }>;
  };
  jobTitle?: string;
  fileName?: string;
  createdAt?: string;
}

interface AppState {
  // Analysis state
  currentAnalysis: AnalysisResult | null;
  isAnalyzing: boolean;
  analysisHistory: AnalysisResult[];
  
  // Actions
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  setIsAnalyzing: (value: boolean) => void;
  setAnalysisHistory: (history: AnalysisResult[]) => void;
  addToHistory: (analysis: AnalysisResult) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentAnalysis: null,
  isAnalyzing: false,
  analysisHistory: [],

  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setAnalysisHistory: (history) => set({ analysisHistory: history }),
  addToHistory: (analysis) =>
    set((state) => ({
      analysisHistory: [analysis, ...state.analysisHistory],
    })),
}));
