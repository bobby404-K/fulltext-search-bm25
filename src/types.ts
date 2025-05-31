export interface DocumentRecord {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  score: number;
  matchedTokens: string[];
}
