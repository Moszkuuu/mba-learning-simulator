import { it } from 'vitest';
// @ts-ignore - node types are not installed; this dev-only report runs under vitest (node)
import { mkdirSync, writeFileSync } from 'node:fs';
import { SUBJECT_CONTENT, getLessons } from './index';
import { POOL_TARGET } from '../lib/quiz';

/** Writes .claude/pool-report.txt (git-ignored) with each lesson's pool size, so authors can see what is still missing. */
it('writes the pool report', () => {
  const lessons = getLessons('en');
  const lines: string[] = [];
  for (const [sid, s] of Object.entries(SUBJECT_CONTENT)) {
    for (const lk of s.lessons) {
      const l = lessons.find((x) => x.id === lk.id)!;
      const n = l.questions.length;
      const by = (lv: number) => l.questions.filter((q) => q.level === lv).length;
      lines.push(`${n >= POOL_TARGET ? 'ok  ' : `need ${POOL_TARGET - n}`}\t${sid}\t${l.id}\t${n} (L1 ${by(1)} L2 ${by(2)} L3 ${by(3)})`);
    }
  }
  mkdirSync('.claude', { recursive: true });
  writeFileSync('.claude/pool-report.txt', lines.join('\n'));
});
