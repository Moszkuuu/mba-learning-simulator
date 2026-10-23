import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l15-demand-elasticity', number: 15, unitId: 'me-u1', minutes: 14, competencies: ['me.demand'], status: 'foundation' },
  { id: 'l16-costs-marginal', number: 16, unitId: 'me-u2', minutes: 14, competencies: ['me.costs-marginal'], status: 'foundation' },
  { id: 'l17-market-structure', number: 17, unitId: 'me-u3', minutes: 14, competencies: ['me.market-structure'], status: 'foundation' },
  { id: 'l18-game-theory', number: 18, unitId: 'me-u3', minutes: 15, competencies: ['me.game-theory'], status: 'foundation' },
];

const D = 'me.demand', MC = 'me.costs-marginal', MS = 'me.market-structure', GT = 'me.game-theory';
const L15 = 'l15-demand-elasticity', L16 = 'l16-costs-marginal', L17 = 'l17-market-structure', L18 = 'l18-game-theory';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l15q1', lessonId: L15, level: 1, competency: D, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l15q2', lessonId: L15, level: 1, competency: D, type: 'numeric', answer: -1.5, unit: 'x' },
  { id: 'l15q3', lessonId: L15, level: 2, competency: D, type: 'numeric', answer: -0.71, unit: 'x' },
  { id: 'l15q4', lessonId: L15, level: 2, competency: D, type: 'numeric', answer: 4.5, unit: 'pct' },
  { id: 'l15q5', lessonId: L15, level: 2, competency: D, type: 'numeric', answer: -0.67, unit: 'x' },
  { id: 'l15q6', lessonId: L15, level: 3, competency: D, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l16q1', lessonId: L16, level: 1, competency: MC, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l16q2', lessonId: L16, level: 1, competency: MC, type: 'numeric', answer: 30, unit: 'usd' },
  { id: 'l16q3', lessonId: L16, level: 2, competency: MC, type: 'numeric', answer: 20, unit: 'units' },
  { id: 'l16q4', lessonId: L16, level: 2, competency: MC, type: 'numeric', answer: 60, unit: 'usd' },
  { id: 'l16q5', lessonId: L16, level: 2, competency: MC, type: 'numeric', answer: 600, unit: 'usd' },
  { id: 'l16q6', lessonId: L16, level: 3, competency: MC, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l17q1', lessonId: L17, level: 1, competency: MS, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l17q2', lessonId: L17, level: 1, competency: MS, type: 'numeric', answer: 40, unit: 'pct' },
  { id: 'l17q3', lessonId: L17, level: 2, competency: MS, type: 'numeric', answer: 45, unit: 'usd' },
  { id: 'l17q4', lessonId: L17, level: 2, competency: MS, type: 'numeric', answer: 50, unit: 'usd' },
  { id: 'l17q5', lessonId: L17, level: 2, competency: MS, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l17q6', lessonId: L17, level: 3, competency: MS, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l18q1', lessonId: L18, level: 1, competency: GT, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l18q2', lessonId: L18, level: 1, competency: GT, type: 'numeric', answer: 12, unit: 'usd' },
  { id: 'l18q3', lessonId: L18, level: 2, competency: GT, type: 'numeric', answer: 8, unit: 'usd' },
  { id: 'l18q4', lessonId: L18, level: 2, competency: GT, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l18q5', lessonId: L18, level: 2, competency: GT, type: 'numeric', answer: 2.2, unit: 'usd' },
  { id: 'l18w1', lessonId: L18, level: 3, competency: GT, type: 'written', rubricCount: 5 },
];

export const CASE_IDS: string[] = [];
