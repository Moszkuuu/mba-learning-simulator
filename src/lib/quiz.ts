import { shuffle } from './shuffle';

/** Number of questions in one lesson quiz. */
export const QUIZ_SIZE = 10;
/** Target number of questions per lesson pool. */
export const POOL_TARGET = 30;
/** Preferred mix for a quiz of ten: three easy, four medium, three hard (adjusted when a level has too few questions). */
const LEVEL_TARGET: Record<1 | 2 | 3, number> = { 1: 3, 2: 4, 3: 3 };

export interface PoolItem { id: string; level: 1 | 2 | 3; type: 'mcq' | 'numeric' | 'written' }

/**
 * Draws a quiz at random from a lesson's pool: balanced across difficulty levels, at most one written
 * (self-assessed) question, never repeating a question. Pools smaller than the quiz size return the whole pool.
 */
export function drawQuiz(pool: readonly PoolItem[], size = QUIZ_SIZE): string[] {
  if (pool.length <= size) return shuffle(pool.map((q) => q.id));
  const picked: PoolItem[] = [];
  let writtenCount = 0;
  const take = (q: PoolItem): boolean => {
    if (picked.includes(q) || (q.type === 'written' && writtenCount >= 1)) return false;
    picked.push(q);
    if (q.type === 'written') writtenCount++;
    return true;
  };
  for (const level of [1, 2, 3] as const) {
    let need = LEVEL_TARGET[level];
    for (const q of shuffle(pool.filter((p) => p.level === level))) {
      if (need === 0) break;
      if (take(q)) need--;
    }
  }
  for (const q of shuffle(pool)) {
    if (picked.length >= size) break;
    take(q);
  }
  return shuffle(picked.map((q) => q.id));
}
