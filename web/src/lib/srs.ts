import type { Word, WordStatus } from './types';

const DAY = 86400000;

export function todayISO(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);
}

export function isDue(word: Word): boolean {
  return word.nextReview <= todayISO();
}

/**
 * SuperMemo-2. quality: 0–5.
 * Flashcard mapping: "몰라요" → 2, "알아요" → 4.
 */
export function applySm2(word: Word, quality: number): Partial<Word> {
  let { easeFactor, interval, repetitions } = word;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );
  easeFactor = Math.round(easeFactor * 100) / 100;

  return { easeFactor, interval, repetitions, nextReview: todayISO(interval) };
}

export function computeStatus(knowCount: number, dontCount: number): WordStatus {
  if (knowCount === 0 && dontCount === 0) return 'new';
  if (knowCount <= dontCount) return 'learning';
  if (knowCount >= 3) return 'mastered';
  if (knowCount >= 2) return 'review';
  return 'learning';
}

/** Records an answer and returns the fields to merge into the word. */
export function recordAnswer(word: Word, correct: boolean): Partial<Word> {
  const knowCount = word.knowCount + (correct ? 1 : 0);
  const dontCount = word.dontCount + (correct ? 0 : 1);
  const sm2 = applySm2(word, correct ? 4 : 2);
  return { knowCount, dontCount, status: computeStatus(knowCount, dontCount), ...sm2 };
}

/** Weight per status for word-set progress. */
export function statusWeight(status: WordStatus): number {
  return { new: 0, learning: 0.5, review: 0.7, mastered: 1 }[status];
}
