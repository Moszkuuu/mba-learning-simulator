import { describe, expect, it } from 'vitest';
import { ALL_LESSON_KEYS, ALL_QUESTION_KEYS, getAllQuestions, getLessons, questionKey } from './index';
import { PILOT_STUDY } from './pilot';
import { SKILLS, type Question } from './types';
import { relatedLesson, skillOf, skillResults } from '../lib/feedback';
import { isWithinTolerance, parseNumericInput } from '../lib/numeric';

const PILOT = Object.keys(PILOT_STUDY);
const enL = (id: string) => getLessons('en').find((l) => l.id === id)!;
const thL = (id: string) => getLessons('th').find((l) => l.id === id)!;

describe('Phase 3.1 pilot lessons', () => {
  it('are the three intended lessons, flagged full, with the teaching sections in both languages', () => {
    expect(PILOT.sort()).toEqual(['l2-operating-profit', 'l4-inventory-wc', 'l5-operating-cash-flow']);
    for (const id of PILOT) {
      expect(ALL_LESSON_KEYS.find((l) => l.id === id)?.status, id).toBe('full');
      for (const l of [enL(id), thL(id)]) {
        expect(l.teaching, id).toBeTruthy();
        expect(l.workedExamples.length, id).toBeGreaterThanOrEqual(2);
        expect(l.teaching!.check.length, id).toBeGreaterThanOrEqual(3);
        expect(l.teaching!.takeaways.length, id).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('keep identical structure in English and Thai (teaching sections included)', () => {
    for (const id of PILOT) {
      const e = enL(id).teaching!, t = thL(id).teaching!;
      expect(t.terms.length).toBe(e.terms.length);
      expect(t.interpretation.length).toBe(e.interpretation.length);
      expect(t.decisions.length).toBe(e.decisions.length);
      expect(t.check.length).toBe(e.check.length);
      expect(t.takeaways.length).toBe(e.takeaways.length);
      expect(/[฀-๿]/.test(t.why + t.apply)).toBe(true);
    }
  });

  it('leave every other lesson on the older format', () => {
    for (const l of getLessons('en').filter((x) => !PILOT.includes(x.id))) expect(l.teaching, l.id).toBeUndefined();
  });

  it('do not remove or rename any question id that existing progress may refer to', () => {
    for (const id of ['l2q1', 'l2q5', 'l4q1', 'l4q5', 'l5q1', 'l5q4', 'l5w1', 'l2p01', 'l4p01', 'l5p01']) expect(questionKey(id), id).toBeTruthy();
  });

  it('use one set of Sunrise Bakery figures that agree with each other', () => {
    // Recompute the running example independently of the lesson text.
    const revenue = 1_200_000, cogs = 720_000, opex = 230_000 + 60_000 + 40_000 + 30_000, interest = 20_000;
    const gross = revenue - cogs, operating = gross - opex, preTax = operating - interest, net = preTax * 0.75;
    expect([gross, operating, preTax, net]).toEqual([480_000, 120_000, 100_000, 75_000]);
    const ocf = net + 30_000 - 50_000 - 30_000 + 20_000;
    expect(ocf).toBe(45_000);
    expect(ocf - 40_000).toBe(5_000); // free cash flow = rise in the cash balance
    expect(105_000 + 150_000 + 90_000 + 310_000).toBe(655_000); // total assets
    expect(70_000 + 200_000 + (310_000 + net)).toBe(655_000); // liabilities + equity
    const dso = (150_000 / revenue) * 365, dio = (90_000 / cogs) * 365, dpo = (70_000 / cogs) * 365;
    expect([dso, dio, dpo].map((x) => x.toFixed(1))).toEqual(['45.6', '45.6', '35.5']);
    expect(Math.round(dso + dio - dpo)).toBe(56);
    expect(150_000 + 90_000 - 70_000).toBe(170_000);
    // The same figures appear in the lesson text.
    const all = (id: string) => JSON.stringify(enL(id));
    expect(all('l2-operating-profit')).toContain('$75,000');
    expect(all('l2-operating-profit')).toContain('$655,000');
    expect(all('l4-inventory-wc')).toContain('about 56 days');
    expect(all('l4-inventory-wc')).toContain('$170,000');
    expect(all('l5-operating-cash-flow')).toContain('$45,000');
    expect(all('l5-operating-cash-flow')).toContain('$5,000');
  });
});

describe('Phase 3.2 assessments for the pilot lessons', () => {
  const qs = (lessonId: string) => ALL_QUESTION_KEYS.filter((q) => q.lessonId === lessonId);

  it('every pilot lesson tests interpretation, assumptions, decisions and calculation, not only calculation', () => {
    for (const id of PILOT) {
      const skills = new Set(qs(id).map((q) => q.skill).filter(Boolean));
      for (const s of ['interpret', 'assumptions', 'decide', 'calculate'] as const) expect(skills.has(s), `${id} ${s}`).toBe(true);
    }
  });

  it('tag every new question with a known skill and keep the pool at 30 or more', () => {
    for (const id of PILOT) {
      expect(qs(id).length, id).toBeGreaterThanOrEqual(30);
      for (const q of qs(id)) if (q.skill) expect(SKILLS).toContain(q.skill);
    }
  });

  it('new numeric answers match an independent recomputation', () => {
    const num = (id: string) => (questionKey(id) as { answer: number }).answer;
    const find = (lesson: string, concept: string) => getAllQuestions('en').find((q) => q.lessonId === lesson && q.concept === concept)!.id;
    const pbt = 2_400_000 - 1_560_000 - 540_000 - 48_000;
    expect(num(find('l2-operating-profit', 'Full profit ladder'))).toBe(pbt * 0.75);
    expect(num(find('l4-inventory-wc', 'Cash released by faster collection'))).toBe((7_300_000 / 365) * (60 - 48));
    const cashFromCustomers = 900_000 - 60_000, paidSuppliers = 540_000 - 20_000 - 15_000;
    expect(num(find('l5-operating-cash-flow', 'Direct-method cash flow with changes'))).toBe(cashFromCustomers - paidSuppliers - 210_000 - 10_000 - 30_000);
    // The accepted answer parses from what a student would type.
    expect(parseNumericInput('$85,000')).toBe(85_000);
    expect(isWithinTolerance(85_000, 85_000, 'usd')).toBe(true);
  });

  it('decision questions say that reasoning, not one answer, is judged where several choices are defensible', () => {
    const q = getAllQuestions('en').filter((x) => x.skill === 'decide');
    expect(q.length).toBeGreaterThanOrEqual(3);
    for (const x of q) expect(/reasonable|defensible|could|might|depends|judge|decide|factors|quality|argument/i.test(x.explanation), x.id).toBe(true);
  });

  it('map each skill of each pilot lesson to an existing lesson', () => {
    const ids = new Set(ALL_LESSON_KEYS.map((l) => l.id));
    for (const id of PILOT) for (const s of SKILLS) {
      const target = relatedLesson(id, s);
      expect(target, `${id} ${s}`).toBeTruthy();
      expect(ids.has(target!), `${id} ${s} -> ${target}`).toBe(true);
    }
  });
});

describe('feedback by skill', () => {
  const make = (id: string, concept: string, type: Question['type'], skill?: Question['skill']) => ({ id, concept, type, skill, lessonId: 'l5-operating-cash-flow' }) as unknown as Question;
  it('groups an attempt by skill, defaults untagged items, and reports what was missed', () => {
    const r = skillResults([
      { question: make('a', 'Indirect cash flow', 'numeric'), correct: true },
      { question: make('b', 'Profit versus cash', 'mcq'), correct: false },
      { question: make('c', 'Diagnosing a gap', 'mcq', 'interpret'), correct: false },
      { question: make('d', 'Diagnosing another gap', 'mcq', 'interpret'), correct: true },
    ]);
    expect(r.map((x) => [x.skill, x.correct, x.total])).toEqual([['understand', 0, 1], ['calculate', 1, 1], ['interpret', 1, 2]]);
    expect(r.find((x) => x.skill === 'interpret')!.missedConcepts).toEqual(['Diagnosing a gap']);
    expect(skillOf(make('x', 'c', 'numeric'))).toBe('calculate');
    expect(skillOf(make('x', 'c', 'mcq'))).toBe('understand');
  });

  it('does not count self-assessed written answers as automatically checked results', () => {
    const r = skillResults([{ question: make('w', 'Case', 'written'), correct: false }]);
    expect(r).toEqual([]);
  });
});
