import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l7-cost-behaviour', number: 19, unitId: 'ma-u1', minutes: 14, competencies: ['ma.cost-behaviour'], status: 'foundation' },
  { id: 'l8-product-costing', number: 20, unitId: 'ma-u2', minutes: 14, competencies: ['ma.costing'], status: 'foundation' },
  { id: 'l9-budgets-variances', number: 21, unitId: 'ma-u3', minutes: 14, competencies: ['ma.budgeting'], status: 'foundation' },
  { id: 'l10-relevant-costs', number: 22, unitId: 'ma-u4', minutes: 14, competencies: ['ma.relevant-costs'], status: 'foundation' },
];

const CB = 'ma.cost-behaviour', CO = 'ma.costing', BU = 'ma.budgeting', RC = 'ma.relevant-costs';
const L7 = 'l7-cost-behaviour', L8 = 'l8-product-costing', L9 = 'l9-budgets-variances', L10 = 'l10-relevant-costs';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l7q1', lessonId: L7, level: 1, competency: CB, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l7q2', lessonId: L7, level: 1, competency: CB, type: 'numeric', answer: 89_500, unit: 'usd' },
  { id: 'l7q3', lessonId: L7, level: 2, competency: CB, type: 'numeric', answer: 7, unit: 'usd' },
  { id: 'l7q4', lessonId: L7, level: 2, competency: CB, type: 'numeric', answer: 30_000, unit: 'usd' },
  { id: 'l7q5', lessonId: L7, level: 2, competency: CB, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l7w1', lessonId: L7, level: 3, competency: CB, type: 'written', rubricCount: 5 },
  { id: 'l8q1', lessonId: L8, level: 1, competency: CO, type: 'numeric', answer: 30, unit: 'usd' },
  { id: 'l8q2', lessonId: L8, level: 1, competency: CO, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l8q3', lessonId: L8, level: 2, competency: CO, type: 'numeric', answer: 1_640, unit: 'usd' },
  { id: 'l8q4', lessonId: L8, level: 2, competency: CO, type: 'numeric', answer: 10_000, unit: 'usd' },
  { id: 'l8q5', lessonId: L8, level: 2, competency: CO, type: 'numeric', answer: 10_000, unit: 'usd' },
  { id: 'l8q6', lessonId: L8, level: 3, competency: CO, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l9q1', lessonId: L9, level: 1, competency: BU, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l9q2', lessonId: L9, level: 1, competency: BU, type: 'numeric', answer: 100_000, unit: 'usd' },
  { id: 'l9q3', lessonId: L9, level: 2, competency: BU, type: 'numeric', answer: 3_000, unit: 'usd' },
  { id: 'l9q4', lessonId: L9, level: 2, competency: BU, type: 'numeric', answer: 2_000, unit: 'usd' },
  { id: 'l9q5', lessonId: L9, level: 2, competency: BU, type: 'numeric', answer: 4_000, unit: 'usd' },
  { id: 'l9q6', lessonId: L9, level: 3, competency: BU, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l10q1', lessonId: L10, level: 1, competency: RC, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l10q2', lessonId: L10, level: 1, competency: RC, type: 'numeric', answer: 15_000, unit: 'usd' },
  { id: 'l10q3', lessonId: L10, level: 2, competency: RC, type: 'numeric', answer: 40_000, unit: 'usd' },
  { id: 'l10q4', lessonId: L10, level: 2, competency: RC, type: 'numeric', answer: 20_000, unit: 'usd' },
  { id: 'l10q5', lessonId: L10, level: 2, competency: RC, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l10w1', lessonId: L10, level: 3, competency: RC, type: 'written', rubricCount: 5 },
];

export const CASE_IDS: string[] = [];
