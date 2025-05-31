import { DocumentRecord, SearchResult } from './types.js';

export class BM25SearchEngine {
  private docs = new Map<string, { length: number; record: DocumentRecord }>();
  private invertedIndex = new Map<string, Map<string, number>>(); // token -> docId -> termFreq
  private totalWords = 0;
  private k1 = 1.2;
  private b = 0.75;

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  addDocument(doc: DocumentRecord): void {
    const tokens = this.tokenize(doc.text);
    this.docs.set(doc.id, { length: tokens.length, record: doc });
    this.totalWords += tokens.length;

    for (const token of tokens) {
      let posting = this.invertedIndex.get(token);
      if (!posting) {
        posting = new Map();
        this.invertedIndex.set(token, posting);
      }
      posting.set(doc.id, (posting.get(doc.id) || 0) + 1);
    }
  }

  search(query: string, limit = 5): SearchResult[] {
    const queryTokens = this.tokenize(query);
    const nDocs = this.docs.size;
    if (nDocs === 0) return [];
    const avgdl = this.totalWords / nDocs;

    const scores = new Map<string, { score: number; matched: Set<string> }>();

    for (const token of queryTokens) {
      const posting = this.invertedIndex.get(token);
      if (!posting) continue;

      const df = posting.size;
      const idf = Math.log((nDocs - df + 0.5) / (df + 0.5) + 1);

      for (const [docId, tf] of posting.entries()) {
        const docLen = this.docs.get(docId)!.length;
        const score = idf * ((tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (docLen / avgdl))));

        let entry = scores.get(docId);
        if (!entry) {
          entry = { score: 0, matched: new Set() };
          scores.set(docId, entry);
        }
        entry.score += score;
        entry.matched.add(token);
      }
    }

    return Array.from(scores.entries())
      .map(([id, val]) => ({ id, score: val.score, matchedTokens: Array.from(val.matched) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
