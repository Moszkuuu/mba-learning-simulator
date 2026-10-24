import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l11-time-value', number: 23, unitId: 'cf-u1', minutes: 15, competencies: ['cf.tvm'], status: 'foundation' },
  { id: 'l12-investment-appraisal', number: 24, unitId: 'cf-u2', minutes: 16, competencies: ['cf.appraisal'], status: 'foundation' },
  { id: 'l13-cost-of-capital', number: 25, unitId: 'cf-u3', minutes: 14, competencies: ['cf.cost-of-capital'], status: 'foundation' },
  { id: 'l14-valuation', number: 26, unitId: 'cf-u3', minutes: 16, competencies: ['cf.valuation'], status: 'foundation' },
];

const TV = 'cf.tvm', AP = 'cf.appraisal', CC = 'cf.cost-of-capital', VA = 'cf.valuation';
const L11 = 'l11-time-value', L12 = 'l12-investment-appraisal', L13 = 'l13-cost-of-capital', L14 = 'l14-valuation';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l11q1', lessonId: L11, level: 1, competency: TV, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l11q2', lessonId: L11, level: 1, competency: TV, type: 'numeric', answer: 5_955.08, unit: 'usd' },
  { id: 'l11q3', lessonId: L11, level: 2, competency: TV, type: 'numeric', answer: 14_168.5, unit: 'usd' },
  { id: 'l11q4', lessonId: L11, level: 2, competency: TV, type: 'numeric', answer: 47_912.52, unit: 'usd' },
  { id: 'l11q5', lessonId: L11, level: 2, competency: TV, type: 'numeric', answer: 40_000, unit: 'usd' },
  { id: 'l11q6', lessonId: L11, level: 3, competency: TV, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l12q1', lessonId: L12, level: 1, competency: AP, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l12q2', lessonId: L12, level: 1, competency: AP, type: 'numeric', answer: 3, unit: 'years' },
  { id: 'l12q3', lessonId: L12, level: 2, competency: AP, type: 'numeric', answer: 2_066.12, unit: 'usd' },
  { id: 'l12q4', lessonId: L12, level: 2, competency: AP, type: 'numeric', answer: 8_143.29, unit: 'usd' },
  { id: 'l12q5', lessonId: L12, level: 2, competency: AP, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l12q6', lessonId: L12, level: 3, competency: AP, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l12w1', lessonId: L12, level: 3, competency: AP, type: 'written', rubricCount: 5 },
  { id: 'l13q1', lessonId: L13, level: 1, competency: CC, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l13q2', lessonId: L13, level: 1, competency: CC, type: 'numeric', answer: 5.6, unit: 'pct' },
  { id: 'l13q3', lessonId: L13, level: 2, competency: CC, type: 'numeric', answer: 8.4, unit: 'pct' },
  { id: 'l13q4', lessonId: L13, level: 2, competency: CC, type: 'numeric', answer: 10.08, unit: 'pct' },
  { id: 'l13q5', lessonId: L13, level: 2, competency: CC, type: 'numeric', answer: 11.5, unit: 'pct' },
  { id: 'l13q6', lessonId: L13, level: 3, competency: CC, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l14q1', lessonId: L14, level: 1, competency: VA, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l14q2', lessonId: L14, level: 1, competency: VA, type: 'numeric', answer: 40, unit: 'usd' },
  { id: 'l14q3', lessonId: L14, level: 2, competency: VA, type: 'numeric', answer: 728.57, unit: 'usd' },
  { id: 'l14q4', lessonId: L14, level: 2, competency: VA, type: 'numeric', answer: 450, unit: 'usd' },
  { id: 'l14q5', lessonId: L14, level: 2, competency: VA, type: 'numeric', answer: 620.92, unit: 'usd' },
  { id: 'l14w1', lessonId: L14, level: 3, competency: VA, type: 'written', rubricCount: 5 },
];

export const CASE_IDS: string[] = [];
