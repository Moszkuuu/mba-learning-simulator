import { describe, expect, it } from 'vitest';
import { checkConsistency, completeness, emptyLab, labKey, loadLab, quotedFigures, saveLab, selfPoints, verifiedPoints, verifiedResults, wordCount } from './lab';

const right = { ocf: '-647,500', dso: '75', dio: '81.9', dpo: '40', ccc2: '116.9', release: '230,100' };

describe('Consulting Lab scoring', () => {
  it('checks the guided numbers with sensible rounding and counts only correct ones', () => {
    const r = verifiedResults('beginner', right);
    expect(r.every((x) => x.correct)).toBe(true);
    expect(verifiedPoints(r)).toBe(25);
    const wrong = verifiedResults('beginner', { ...right, ocf: '647500', dio: '', release: 'lots' });
    expect(wrong.filter((x) => x.correct).map((x) => x.id)).toEqual(['dso', 'dpo', 'ccc2']);
    expect(verifiedPoints(wrong)).toBe(12.5);
  });

  it('never invents points for an empty submission', () => {
    expect(verifiedPoints(verifiedResults('advanced', {}))).toBe(0);
    expect(selfPoints({})).toBe(0);
  });

  it('checks the student\'s own claim against the student\'s own target (consistency), not a fixed answer', () => {
    // Year 2 DSO is 74.955 days and revenue per day is 15,342.47: a target of 60 days releases about 229,500.
    expect(checkConsistency({ targetDso: '60', release: '229,500' }).correct).toBe(true);
    expect(checkConsistency({ targetDso: '60', release: '300,000' }).correct).toBe(false);
    expect(checkConsistency({ targetDso: '70', release: '76,400' }).correct).toBe(true);
    expect(checkConsistency({ targetDso: '80', release: '1' }).correct).toBe(false); // a target above today's DSO releases nothing
    expect(checkConsistency({ release: '229,500' }).correct).toBe(false);
  });

  it('adds the consistency check to the Intermediate and Advanced levels only', () => {
    expect(verifiedResults('beginner', {}).map((r) => r.id)).not.toContain('consistency');
    expect(verifiedResults('intermediate', {}).map((r) => r.id)).toContain('consistency');
    expect(verifiedResults('advanced', {}).map((r) => r.id)).toContain('consistency');
    expect(verifiedResults('advanced', {}).length).toBe(6);
  });

  it('turns self-ratings into points out of 75 and ignores invalid ratings', () => {
    const top = { diagnosis: 3, reasoning: 3, recommendations: 3, risk: 3, feasibility: 3, communication: 3 };
    expect(selfPoints(top)).toBe(75);
    expect(selfPoints({ ...top, diagnosis: 9, risk: -1, communication: 1.5 })).toBe(75 - 20 - 10 - 5);
    expect(selfPoints({ diagnosis: 2 })).toBeCloseTo(13.3, 1);
  });

  it('runs only mechanical completeness checks on text and says nothing about quality', () => {
    expect(wordCount('  one two  three ')).toBe(3);
    const c = completeness('beginner', { 'text.why': 'a b c d e f g h i j k', 'text.movers': 'x' });
    expect(c.find((x) => x.id === 'why')!.ok).toBe(true);
    expect(c.find((x) => x.id === 'movers')!.ok).toBe(false);
    // Quoting figures is a mechanical match on numbers from the case, not a judgement of the argument.
    expect(quotedFigures('DSO rose to 75.0 days and OCF was -647,500; receivables are 1,150,000.', [74.955, 647_500, 1_150_000, 880_000])).toBe(3);
    expect(quotedFigures('Nothing numeric here', [1_150_000])).toBe(0);
  });
});

describe('Consulting Lab saving', () => {
  const store = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, m }; };

  it('round-trips a draft and a submission under its own key, separate from progress', () => {
    const s = store();
    const key = labKey('mba-learning-simulator:v1:user:abc');
    expect(key).toBe('mba-learning-simulator:v1:user:abc:lab');
    const state = { ...emptyLab(), drafts: { beginner: { answers: { dso: '75' }, ratings: { diagnosis: 2 }, reflection: 'x' } }, submissions: [{ at: '2026-10-28T00:00:00.000Z', level: 'beginner' as const, verified: 12.5, self: 30, total: 42.5, correctIds: ['ocf'] }] };
    expect(saveLab(s, key, state)).toBe(true);
    expect(loadLab(s, key)).toEqual(state);
    expect(s.m.size).toBe(1);
  });

  it('survives unreadable data and unavailable storage without throwing or losing the app', () => {
    const bad = { getItem: () => '{not json' };
    expect(loadLab(bad, 'k')).toEqual(emptyLab());
    expect(loadLab({ getItem: () => JSON.stringify({ version: 2 }) }, 'k')).toEqual(emptyLab());
    expect(loadLab(undefined, 'k')).toEqual(emptyLab());
    expect(saveLab({ setItem: () => { throw new Error('quota'); } }, 'k', emptyLab())).toBe(false);
    expect(saveLab(undefined, 'k', emptyLab())).toBe(false);
  });

  it('drops malformed entries instead of trusting them', () => {
    const s = store();
    s.setItem('k', JSON.stringify({ version: 1, drafts: { beginner: { answers: { a: 'ok', b: 5 }, ratings: { r: 2, q: 'x' }, reflection: 3 }, hacker: {} }, submissions: [{ nope: true }, { at: 'x', level: 'advanced', verified: 1, self: 2, total: 3, correctIds: [] }] }));
    const l = loadLab(s, 'k');
    expect(l.drafts.beginner).toEqual({ answers: { a: 'ok' }, ratings: { r: 2 }, reflection: '' });
    expect(l.submissions.length).toBe(1);
  });
});
