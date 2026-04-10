import { create } from 'zustand';

export interface SearchResult {
  position: number;
  title: string;
  url: string;
  snippet: string;
}

export interface RankCheckResult {
  is_listed: boolean;
  position: number | null;
  feedback: string;
  matched_url?: string;
}

interface SearchState {
  keyword: string;
  results: SearchResult[];
  isSearching: boolean;
  rankCheck: RankCheckResult | null;
  isCheckingRank: boolean;
  targetUrl: string;
  setKeyword: (keyword: string) => void;
  setResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  setRankCheck: (result: RankCheckResult | null) => void;
  setIsCheckingRank: (isChecking: boolean) => void;
  setTargetUrl: (url: string) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  results: [],
  isSearching: false,
  rankCheck: null,
  isCheckingRank: false,
  targetUrl: '',
  setKeyword: (keyword) => set({ keyword }),
  setResults: (results) => set({ results, isSearching: false }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setRankCheck: (rankCheck) => set({ rankCheck, isCheckingRank: false }),
  setIsCheckingRank: (isCheckingRank) => set({ isCheckingRank }),
  setTargetUrl: (targetUrl) => set({ targetUrl }),
  reset: () => set({ keyword: '', results: [], rankCheck: null, targetUrl: '', isSearching: false, isCheckingRank: false }),
}));
