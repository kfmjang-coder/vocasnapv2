import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExtractedWord, Word, WordSet } from '../lib/types';
import { computeStatus, isDue, statusWeight, todayISO } from '../lib/srs';

const COLORS = ['#9D8CFF', '#2EE6A6', '#FF7C95', '#FFB454', '#5DCAA5'];
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

interface WordsState {
  wordSets: WordSet[];
  words: Word[];
  createWordSet: (name: string) => WordSet;
  todaySet: () => WordSet;
  addExtracted: (wordSetId: string, items: ExtractedWord[]) => void;
  updateWord: (id: string, patch: Partial<Word>) => void;
  deleteWordSet: (id: string) => void;
  wordsOf: (wordSetId?: string) => Word[];
  progressOf: (wordSetId: string) => number;
  dueWords: (wordSetId?: string) => Word[];
}

export const useWords = create<WordsState>()(
  persist(
    (set, get) => ({
      wordSets: [],
      words: [],

      createWordSet: (name) => {
        const existing = get().wordSets.find((w) => w.name === name);
        if (existing) return existing;
        const ws: WordSet = {
          id: uid('ws'),
          name,
          color: COLORS[get().wordSets.length % COLORS.length],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ wordSets: [ws, ...s.wordSets] }));
        return ws;
      },

      todaySet: () => {
        const name = `${new Date().toLocaleDateString('ko-KR')} 단어`;
        return get().createWordSet(name);
      },

      addExtracted: (wordSetId, items) => {
        const words: Word[] = items.map((it) => ({
          id: uid('w'),
          wordSetId,
          en: it.en,
          ko: it.ko,
          pos: it.pos,
          phonetic: it.phonetic,
          example: it.example,
          difficulty: it.difficulty ?? 3,
          status: 'new',
          knowCount: 0,
          dontCount: 0,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReview: todayISO(),
        }));
        set((s) => ({ words: [...s.words, ...words] }));
      },

      updateWord: (id, patch) =>
        set((s) => ({ words: s.words.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),

      deleteWordSet: (id) =>
        set((s) => ({
          wordSets: s.wordSets.filter((w) => w.id !== id),
          words: s.words.filter((w) => w.wordSetId !== id),
        })),

      wordsOf: (wordSetId) =>
        wordSetId ? get().words.filter((w) => w.wordSetId === wordSetId) : get().words,

      progressOf: (wordSetId) => {
        const ws = get().wordsOf(wordSetId);
        if (!ws.length) return 0;
        const sum = ws.reduce((a, w) => a + statusWeight(computeStatus(w.knowCount, w.dontCount)), 0);
        return Math.round((sum / ws.length) * 100);
      },

      // "이어서 학습" priority: due review → due learning → learning → new (exclude mastered)
      dueWords: (wordSetId) => {
        const ws = get().wordsOf(wordSetId);
        const rank = (w: Word) => {
          if (w.status === 'review' && isDue(w)) return 0;
          if (w.status === 'learning' && isDue(w)) return 1;
          if (w.status === 'learning') return 2;
          if (w.status === 'new') return 3;
          return 9; // mastered
        };
        return ws.filter((w) => rank(w) < 9).sort((a, b) => rank(a) - rank(b));
      },
    }),
    { name: 'vs-words' },
  ),
);
