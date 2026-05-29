import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayISO } from '../lib/srs';

const TIERS = [
  { name: 'Diamond', min: 100 },
  { name: 'Platinum', min: 50 },
  { name: 'Gold', min: 30 },
  { name: 'Silver', min: 10 },
  { name: 'Bronze', min: 1 },
];

export function levelOf(xp: number) {
  return Math.floor(xp / 100) + 1;
}
export function tierOf(level: number) {
  return TIERS.find((t) => level >= t.min)?.name ?? 'Bronze';
}

interface GameState {
  xp: number;
  streak: number;
  bestStreak: number;
  lastStudy: string;
  todayDate: string;
  todayCount: number;
  totalAnswered: number;
  totalCorrect: number;
  addXp: (n: number) => void;
  recordStudy: (correct: boolean) => void;
  replaceAll: (g: Partial<GameData>) => void;
}

export type GameData = Pick<
  GameState,
  'xp' | 'streak' | 'bestStreak' | 'lastStudy' | 'todayDate' | 'todayCount' | 'totalAnswered' | 'totalCorrect'
>;

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      bestStreak: 0,
      lastStudy: '',
      todayDate: todayISO(),
      todayCount: 0,
      totalAnswered: 0,
      totalCorrect: 0,

      addXp: (n) => set((s) => ({ xp: s.xp + n })),

      replaceAll: (g) => set((s) => ({ ...s, ...g })),

      recordStudy: (correct) => {
        const today = todayISO();
        const s = get();

        // streak: continue if last study was yesterday, reset if older
        let streak = s.streak;
        if (s.lastStudy !== today) {
          const gap = (Date.parse(today) - Date.parse(s.lastStudy || today)) / 86400000;
          streak = s.lastStudy && gap === 1 ? s.streak + 1 : 1;
        }

        const rollover = s.todayDate !== today;
        set({
          lastStudy: today,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          todayDate: today,
          todayCount: (rollover ? 0 : s.todayCount) + 1,
          totalAnswered: s.totalAnswered + 1,
          totalCorrect: s.totalCorrect + (correct ? 1 : 0),
        });
      },
    }),
    { name: 'vs-game' },
  ),
);
