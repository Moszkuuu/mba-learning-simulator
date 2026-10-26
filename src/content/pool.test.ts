import { describe, it, expect } from 'vitest';
import { getLessons } from './index';
import { POOL_TARGET } from '../lib/quiz';


describe('question pools', () => {
  it('every lesson has at least 30 questions in its pool', () => {
    for (const l of getLessons('en')) expect(l.questions.length, l.id).toBeGreaterThanOrEqual(POOL_TARGET);
  });
  it('has no duplicate prompts within a lesson (English)', () => {
    for (const l of getLessons('en')) {
      const prompts = l.questions.map((q) => `${q.scenario ?? ''}|${q.prompt}`);
      const dup = prompts.find((x, i) => prompts.indexOf(x) !== i);
      expect(dup, `${l.id} duplicate prompt`).toBeUndefined();
    }
  });
  it('multiple-choice questions have four distinct options in both languages', () => {
    for (const lang of ['en', 'th'] as const) {
      for (const l of getLessons(lang)) {
        for (const q of l.questions) {
          if (q.type !== 'mcq') continue;
          expect(q.options.length, q.id).toBe(4);
          expect(new Set(q.options.map((o) => o.text)).size, q.id).toBe(4);
        }
      }
    }
  });
});
