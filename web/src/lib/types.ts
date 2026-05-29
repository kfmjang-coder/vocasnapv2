export type WordStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface Word {
  id: string;
  wordSetId: string;
  en: string;
  ko: string;
  pos: string;
  phonetic: string;
  example: string;
  difficulty: number;
  status: WordStatus;
  knowCount: number;
  dontCount: number;
  // SM-2
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string; // ISO date
}

export interface WordSet {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

/** Raw word as returned by the AI extractor (before becoming a stored Word). */
export interface ExtractedWord {
  en: string;
  ko: string;
  pos: string;
  phonetic: string;
  example: string;
  difficulty: number;
}
