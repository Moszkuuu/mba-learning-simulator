import { describe, expect, it } from 'vitest';
import { labEn } from './text-en';
import { labTh } from './text-th';
import { CHECKS, FIELDS, RUBRIC, Y2, cashFromDso, ccc, dio, dpo, dso } from './case';

const numberTokens = (s: string): string[] => (s.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) ?? []).map((x) => x.replace(/,/g, '')).sort();
const thai = /[฀-๿]/;

/** Shape signature: keys, array lengths and placeholders, so the two languages cannot drift apart. */
const shape = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(shape) : typeof v === 'object' && v !== null ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : (String(v).match(/\{\w+\}/g) ?? []).sort();

describe('Consulting Lab wording', () => {
  it('has the same structure, placeholders and numbers in English and Thai', () => {
    expect(shape(labTh)).toEqual(shape(labEn));
    expect(numberTokens(JSON.stringify(labTh))).toEqual(numberTokens(JSON.stringify(labEn)));
  });

  it('is really Thai in Thai (no English copy left in the main text)', () => {
    for (const p of [...labTh.company, ...labTh.model, ...labTh.briefing.beginner, ...labTh.briefing.intermediate, ...labTh.briefing.advanced]) expect(thai.test(p)).toBe(true);
    expect(thai.test(labTh.hubIntro + labTh.tagline + labTh.title)).toBe(true);
  });

  it('has text for every check, field and rubric item the case uses, and a 13-step workflow', () => {
    for (const lvl of Object.values(CHECKS)) for (const c of lvl) {
      for (const t of [labEn, labTh]) { expect(t.tasks[c.id]?.prompt, c.id).toBeTruthy(); expect(t.explanations[c.id], c.id).toBeTruthy(); }
    }
    for (const t of [labEn, labTh]) {
      expect(t.explanations.consistency).toBeTruthy();
      for (const l of Object.values(FIELDS)) for (const f of l) expect(t.fields[f.id]?.label, f.id).toBeTruthy();
      for (const r of RUBRIC) expect(t.rubric[r.id]?.strong, r.id).toBeTruthy();
      expect(t.steps.length).toBe(13);
    }
  });

  it('gives Beginner a formula and a hint for every guided number; numbers only used at higher levels carry none', () => {
    for (const c of CHECKS.beginner) { expect(labEn.tasks[c.id]!.formula, c.id).toBeTruthy(); expect(labEn.tasks[c.id]!.hint, c.id).toBeTruthy(); }
    const beginnerIds = new Set(CHECKS.beginner.map((c) => c.id));
    // Shared numbers (such as ocf) keep their formula in the text, but the page shows formulas and hints at Beginner level only.
    for (const c of [...CHECKS.intermediate, ...CHECKS.advanced].filter((x) => !beginnerIds.has(x.id))) expect(labEn.tasks[c.id]!.formula, c.id).toBeUndefined();
  });
  it('quotes figures in the explanations and model answer that match the computed case', () => {
    const text = [...Object.values(labEn.explanations), ...labEn.model].join(' ');
    for (const claim of [dso(Y2).toFixed(1), dio(Y2).toFixed(1), dpo(Y2).toFixed(1), ccc(Y2).toFixed(1)]) expect(text).toContain(claim);
    expect(text).toContain('230,100');
    expect(Math.round(cashFromDso(15) / 100) * 100).toBe(230_100);
    // Model-answer arithmetic: the three working-capital actions and the factoring cost.
    const days = (n: number, base: number) => (n * base) / 365;
    const release = Math.round(days(15, Y2.revenue) / 100) * 100 + Math.round(days(12, Y2.cogs) / 100) * 100 + Math.round(days(5, Y2.cogs) / 100) * 100;
    expect(release).toBe(412_700);
    expect(text).toContain('128,900');
    expect(text).toContain('53,700');
    expect(text).toContain('412,700');
    expect(Math.round(((0.025 / 0.975) * 365) / 30 * 100)).toBe(31);
    expect(text).toContain('31%');
  });

  it('is honest about what the app can and cannot assess', () => {
    const t = labEn.hubAssess.join(' ');
    expect(t).toMatch(/NOT graded/);
    expect(t).toMatch(/self-assessed/);
    expect(t).toMatch(/saved in this browser/);
    expect(t).toMatch(/saved to your account/);
    expect(labEn.totalNote).toMatch(/Only the first part is verified/);
  });
});
