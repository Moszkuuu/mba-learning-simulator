import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l41-exchange-rates', number: 41, unitId: 'ib-u1', minutes: 14, competencies: ['ib.fx'], status: 'foundation' },
  { id: 'l42-trade-advantage', number: 42, unitId: 'ib-u1', minutes: 13, competencies: ['ib.trade'], status: 'foundation' },
  { id: 'l43-market-entry-risk', number: 43, unitId: 'ib-u2', minutes: 15, competencies: ['ib.entry'], status: 'foundation' },
];

const FX = 'ib.fx', TR = 'ib.trade', EN = 'ib.entry';
const L41 = 'l41-exchange-rates', L42 = 'l42-trade-advantage', L43 = 'l43-market-entry-risk';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l41q1', lessonId: L41, level: 1, competency: FX, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l41q2', lessonId: L41, level: 1, competency: FX, type: 'numeric', answer: 9_000_000, unit: 'num' },
  { id: 'l41q3', lessonId: L41, level: 2, competency: FX, type: 'numeric', answer: 40, unit: 'num' },
  { id: 'l41q4', lessonId: L41, level: 2, competency: FX, type: 'numeric', answer: 35.31, unit: 'num' },
  { id: 'l41q5', lessonId: L41, level: 2, competency: FX, type: 'numeric', answer: -1.92, unit: 'pct' },
  { id: 'l41q6', lessonId: L41, level: 3, competency: FX, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l42q1', lessonId: L42, level: 1, competency: TR, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l42q2', lessonId: L42, level: 1, competency: TR, type: 'numeric', answer: 2, unit: 'num' },
  { id: 'l42q3', lessonId: L42, level: 2, competency: TR, type: 'numeric', answer: 1.5, unit: 'num' },
  { id: 'l42q4', lessonId: L42, level: 2, competency: TR, type: 'numeric', answer: 2, unit: 'num' },
  { id: 'l42q5', lessonId: L42, level: 2, competency: TR, type: 'numeric', answer: 20, unit: 'num' },
  { id: 'l42q6', lessonId: L42, level: 3, competency: TR, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l43q1', lessonId: L43, level: 1, competency: EN, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l43q2', lessonId: L43, level: 1, competency: EN, type: 'numeric', answer: 1, unit: 'num' },
  { id: 'l43q3', lessonId: L43, level: 2, competency: EN, type: 'numeric', answer: 0.3, unit: 'num' },
  { id: 'l43q4', lessonId: L43, level: 2, competency: EN, type: 'numeric', answer: 0.44, unit: 'num' },
  { id: 'l43q5', lessonId: L43, level: 2, competency: EN, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l43w1', lessonId: L43, level: 3, competency: EN, type: 'written', rubricCount: 5 },
];

export const CASE_IDS: string[] = [];
