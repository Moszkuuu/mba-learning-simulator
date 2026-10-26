import { describe, it, expect } from 'vitest';
import { drawQuiz, QUIZ_SIZE, type PoolItem } from './quiz';

const mk = (n: number): PoolItem[] =>
  Array.from({ length: n }, (_, i) => ({ id: `q${i}`, level: ((i % 3) + 1) as 1 | 2 | 3, type: i % 10 === 9 ? 'written' : i % 2 ? 'numeric' : 'mcq' }));

describe('drawQuiz', () => {
  it('draws ten distinct questions from a pool of thirty, with a balanced level mix and at most one written', () => {
    for (let run = 0; run < 50; run++) {
      const pool = mk(30);
      const ids = drawQuiz(pool);
      expect(ids).toHaveLength(QUIZ_SIZE);
      expect(new Set(ids).size).toBe(QUIZ_SIZE);
      const picked = pool.filter((p) => ids.includes(p.id));
      expect(picked.filter((p) => p.type === 'written').length).toBeLessThanOrEqual(1);
      for (const level of [1, 2, 3]) expect(picked.filter((p) => p.level === level).length).toBeGreaterThanOrEqual(3);
    }
  });
  it('returns different quizzes on different draws', () => {
    const pool = mk(30);
    const seen = new Set(Array.from({ length: 20 }, () => drawQuiz(pool).sort().join(',')));
    expect(seen.size).toBeGreaterThan(1);
  });
  it('returns the whole pool when it is no larger than the quiz size', () => {
    expect(drawQuiz(mk(6)).sort()).toEqual(mk(6).map((q) => q.id).sort());
  });
  it('fills the quiz even when one level is short or written questions dominate', () => {
    const pool: PoolItem[] = [...Array.from({ length: 14 }, (_, i): PoolItem => ({ id: `a${i}`, level: 1, type: 'mcq' })), ...Array.from({ length: 4 }, (_, i): PoolItem => ({ id: `w${i}`, level: 3, type: 'written' }))];
    const ids = drawQuiz(pool);
    expect(ids).toHaveLength(QUIZ_SIZE);
    expect(ids.filter((i) => i.startsWith('w')).length).toBeLessThanOrEqual(1);
  });
});
