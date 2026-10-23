import { describe, it, expect } from 'vitest';
import { competencyStat, revisionPriorities, unmetPrerequisites, type AttemptLike } from './mastery';
import { dueQuestionIds, updateCard } from './srs';
import { emptyProgress, reducer, parseProgress, quizAccuracy, levelInfo, xp, STORAGE_KEY } from './progress';

const DAY = 86_400_000;
const T0 = new Date('2026-01-01T09:00:00Z').getTime();
const at = (days: number) => new Date(T0 + days * DAY).toISOString();
const att = (q: string, level: 1 | 2 | 3, correct: boolean, day: number, comp = 'fa.working-capital'): AttemptLike =>
  ({ questionId: q, competency: comp, level, correct, score: correct ? 1 : 0, at: at(day) });
const WC = 'fa.working-capital';

describe('mastery', () => {
  const now = new Date(at(20));
  const eight = ['q1', 'q2', 'q3', 'q4'].map((q) => att(q, 1, true, 0)).concat(['q5', 'q6', 'q7', 'q8'].map((q) => att(q, 2, true, 0)));

  it('a competency with no attempts is new', () => {
    expect(competencyStat([], WC, now).status).toBe('new');
  });

  it('a perfect first session is NOT mastery', () => {
    const a = ['q1', 'q2', 'q3', 'q4', 'q5'].map((q, i) => att(q, 1, true, i * 0.001));
    const s = competencyStat(a, WC, now);
    expect(s.accuracy).toBe(1);
    expect(s.status).toBe('learning');
  });

  it('is mastered only with 8+ attempts, 2+ levels, >=80% and a delayed correct answer', () => {
    expect(competencyStat(eight, WC, now).status).toBe('learning'); // no delayed recall yet
    const withDelay = [...eight, att('q1', 1, true, 10)];
    const s = competencyStat(withDelay, WC, now);
    expect(s.delayedCorrect).toBe(true);
    expect(s.status).toBe('mastered');
    const oneLevel = withDelay.map((a) => ({ ...a, level: 1 as const }));
    expect(competencyStat(oneLevel, WC, now).status).toBe('learning');
  });

  it('does not count a quick retry as delayed recall', () => {
    const quickRetry = [...eight, att('q1', 1, true, 2)];
    expect(competencyStat(quickRetry, WC, now).delayedCorrect).toBe(false);
  });

  it('mastery goes stale after 60 days without practice', () => {
    const a = [...eight, att('q1', 1, true, 10)];
    expect(competencyStat(a, WC, new Date(at(100))).status).toBe('stale');
  });

  it('flags weak competencies and prioritises them for revision', () => {
    const s = competencyStat([att('q1', 1, false, 0), att('q2', 1, false, 0), att('q3', 1, true, 0)], WC, now);
    expect(s.status).toBe('weak');
    expect(revisionPriorities([s])[0].competency).toBe(WC);
  });

  it('weights harder levels more and uses rubric scores for written answers', () => {
    const easyRight = [att('q1', 1, true, 0), att('q2', 3, false, 0)];
    const hardRight = [att('q1', 1, false, 0), att('q2', 3, true, 0)];
    expect(competencyStat(hardRight, WC, now).accuracy!).toBeGreaterThan(competencyStat(easyRight, WC, now).accuracy!);
    const partial: AttemptLike = { ...att('w1', 3, false, 0), score: 0.6 };
    expect(competencyStat([partial], WC, now).accuracy).toBeCloseTo(0.6, 10);
  });

  it('reports unmet available prerequisites only', () => {
    const none = ['fa.financial-statements', 'fa.working-capital', 'fa.cash-flow'].map((c) => competencyStat([], c, now));
    expect(unmetPrerequisites('fa.cash-flow', none)).toEqual([WC]);
    // fa.financial-statements requires fa.double-entry, which is not available yet -> ignored
    expect(unmetPrerequisites('fa.financial-statements', none)).toEqual([]);
  });
});

describe('spaced repetition', () => {
  it('promotes on success and resets on failure', () => {
    let c = updateCard(undefined, true, at(0));
    expect(c.box).toBe(1);
    c = updateCard(c, true, at(3));
    expect(c.box).toBe(2);
    expect(new Date(c.due).getTime() - new Date(at(3)).getTime()).toBe(7 * DAY);
    c = updateCard(c, false, at(10));
    expect(c.box).toBe(0);
    expect(new Date(c.due).getTime() - new Date(at(10)).getTime()).toBe(1 * DAY);
    expect(c.firstAt).toBe(at(0));
    expect(c.seen).toBe(3);
  });

  it('caps at the longest interval', () => {
    let c: ReturnType<typeof updateCard> | undefined;
    for (let i = 0; i < 10; i++) c = updateCard(c, true, at(i));
    expect(c!.box).toBe(4);
  });

  it('lists only due cards, most overdue first', () => {
    const cards = { a: updateCard(undefined, false, at(0)), b: updateCard(undefined, true, at(0)), c: updateCard(undefined, false, at(5)) };
    // a due day 1, c due day 6, b due day 3
    expect(dueQuestionIds(cards, new Date(at(0.5)))).toEqual([]);
    expect(dueQuestionIds(cards, new Date(at(1.5)))).toEqual(['a']);
    expect(dueQuestionIds(cards, new Date(at(7)))).toEqual(['a', 'b', 'c']);
  });
});

describe('progress reducer and storage', () => {
  it('records attempts with competency/level and schedules the question', () => {
    let p = emptyProgress();
    p = reducer(p, { type: 'attempt', questionId: 'l3q2', correct: false, given: '60', context: 'lesson', now: at(0) });
    expect(p.attempts[0]).toMatchObject({ competency: WC, level: 1, correct: false, score: 0 });
    expect(p.cards.l3q2.box).toBe(0);
    expect(quizAccuracy(p)).toBe(0);
  });

  it('stores rubric fraction for written answers', () => {
    const p = reducer(emptyProgress(), { type: 'attempt', questionId: 'l3w1', correct: false, score: 0.6, given: 'x', context: 'practice' });
    expect(p.attempts[0].score).toBe(0.6);
    expect(p.attempts[0].level).toBe(3);
  });

  it('ignores unknown question ids', () => {
    expect(reducer(emptyProgress(), { type: 'attempt', questionId: 'nope', correct: true, given: '', context: 'lesson' })).toEqual(emptyProgress());
  });

  it('completes lessons once, adds XP, and resets', () => {
    let p = reducer(emptyProgress(), { type: 'completeLesson', lessonId: 'l1-gross-profit', correct: 4, total: 5 });
    p = reducer(p, { type: 'completeLesson', lessonId: 'l1-gross-profit', correct: 5, total: 5 });
    expect(p.completedLessons).toEqual(['l1-gross-profit']);
    expect(p.lessonScores['l1-gross-profit'].correct).toBe(5);
    expect(xp(p)).toBe(100);
    expect(reducer(p, { type: 'reset' })).toEqual(emptyProgress());
  });

  it('records exam results', () => {
    const p = reducer(emptyProgress(), { type: 'examResult', correct: 8, total: 12, byCompetency: { 'fa.cash-flow': { correct: 2, total: 3 } } });
    expect(p.exams[0]).toMatchObject({ correct: 8, total: 12 });
    expect(p.activity[0].kind).toBe('exam');
  });

  it('parses corrupt storage safely', () => {
    expect(parseProgress('{not json')).toEqual(emptyProgress());
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress('{"version":9,"attempts":[]}')).toEqual(emptyProgress());
  });

  it('migrates v1 progress without losing anything', () => {
    const v1 = {
      version: 1,
      completedLessons: ['l1-gross-profit'],
      lessonScores: { 'l1-gross-profit': { correct: 3, total: 5, at: at(0) } },
      attempts: [
        { id: 'a1', questionId: 'l1q2', lessonId: 'l1-gross-profit', concept: 'Gross profit calculation', correct: true, given: '157500', at: at(0), context: 'lesson' },
        { id: 'a2', questionId: 'l1q3', lessonId: 'l1-gross-profit', concept: 'x', correct: false, given: '53', at: at(0), context: 'lesson' },
        { id: 'a3', questionId: 'gone-question', lessonId: 'x', concept: 'x', correct: true, given: '', at: at(0), context: 'lesson' },
      ],
      simResults: [{ id: 's1', at: at(1), months: 12, status: 'completed', finalCash: 1, finalEquity: 2, cumulativeProfit: 3, totalRevenue: 4, lostUnits: 0, minCash: 0 }],
      simState: null,
      activity: [{ id: 'x1', at: at(0), text: 'Completed lesson "T" - scored 3/5' }],
    };
    const p = parseProgress(JSON.stringify(v1));
    expect(p.version).toBe(2);
    expect(p.completedLessons).toEqual(['l1-gross-profit']);
    expect(p.attempts).toHaveLength(2); // the unknown question is dropped
    expect(p.attempts[0]).toMatchObject({ competency: 'fa.financial-statements', level: 1, score: 1 });
    expect(p.attempts[1].score).toBe(0);
    expect(p.cards.l1q2.box).toBe(1);
    expect(p.cards.l1q3.box).toBe(0);
    expect(p.simResults).toHaveLength(1);
    expect(p.activity[0]).toMatchObject({ kind: 'legacy', params: { text: 'Completed lesson "T" - scored 3/5' } });
    expect(parseProgress(JSON.stringify(p))).toEqual(p); // round-trip is stable
  });

  it('keeps the existing storage key and computes levels', () => {
    expect(STORAGE_KEY).toBe('mba-learning-simulator:v1');
    expect(levelInfo(0).name).toBe('Newcomer');
    expect(levelInfo(400).name).toBe('Associate');
    expect(levelInfo(5000).pct).toBe(100);
  });
});
