import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useWords } from '../store/useWords';
import { useGame, type GameData } from '../store/useGame';
import type { Word, WordSet } from './types';

let stop: (() => void) | null = null;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

function mergeById<T extends { id: string }>(remote: T[], local: T[]): T[] {
  const map = new Map<string, T>();
  local.forEach((x) => map.set(x.id, x));
  remote.forEach((x) => map.set(x.id, x)); // remote wins on same id
  return [...map.values()];
}

function mergeGame(remote: Partial<GameData>, local: GameData): GameData {
  const maxN = (a = 0, b = 0) => Math.max(a, b);
  return {
    xp: maxN(remote.xp, local.xp),
    streak: maxN(remote.streak, local.streak),
    bestStreak: maxN(remote.bestStreak, local.bestStreak),
    totalAnswered: maxN(remote.totalAnswered, local.totalAnswered),
    totalCorrect: maxN(remote.totalCorrect, local.totalCorrect),
    todayCount: maxN(remote.todayCount, local.todayCount),
    lastStudy: (remote.lastStudy ?? '') > (local.lastStudy ?? '') ? remote.lastStudy! : local.lastStudy,
    todayDate: (remote.todayDate ?? '') > (local.todayDate ?? '') ? remote.todayDate! : local.todayDate,
  };
}

function currentGame(): GameData {
  const g = useGame.getState();
  return {
    xp: g.xp, streak: g.streak, bestStreak: g.bestStreak, lastStudy: g.lastStudy,
    todayDate: g.todayDate, todayCount: g.todayCount, totalAnswered: g.totalAnswered, totalCorrect: g.totalCorrect,
  };
}

async function push(uid: string) {
  if (!db) return;
  const { wordSets, words } = useWords.getState();
  await setDoc(doc(db, 'users', uid), { wordSets, words, game: currentGame(), updatedAt: Date.now() });
}

/** Called on login: pull remote, merge with local (guest) data, then keep syncing. */
export async function loadAndSync(uid: string) {
  if (!db) return;
  const snap = await getDoc(doc(db, 'users', uid));

  if (snap.exists()) {
    const d = snap.data() as { wordSets?: WordSet[]; words?: Word[]; game?: Partial<GameData> };
    const local = useWords.getState();
    useWords.getState().replaceAll(
      mergeById(d.wordSets ?? [], local.wordSets),
      mergeById(d.words ?? [], local.words),
    );
    useGame.getState().replaceAll(mergeGame(d.game ?? {}, currentGame()));
    await push(uid); // persist merged result
  } else {
    // new account → migrate existing guest data up
    await push(uid);
  }

  startAutoPush(uid);
}

function startAutoPush(uid: string) {
  stopSync();
  const schedule = () => {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => push(uid).catch(() => {}), 1500);
  };
  const u1 = useWords.subscribe(schedule);
  const u2 = useGame.subscribe(schedule);
  stop = () => {
    u1();
    u2();
    clearTimeout(pushTimer);
  };
}

export function stopSync() {
  if (stop) {
    stop();
    stop = null;
  }
}
