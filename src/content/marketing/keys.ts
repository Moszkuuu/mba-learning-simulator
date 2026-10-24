import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l19-segmentation-positioning', number: 31, unitId: 'mk-u1', minutes: 14, competencies: ['mk.stp'], status: 'foundation' },
  { id: 'l20-value-pricing', number: 32, unitId: 'mk-u2', minutes: 14, competencies: ['mk.pricing'], status: 'foundation' },
  { id: 'l21-customer-economics', number: 33, unitId: 'mk-u2', minutes: 14, competencies: ['mk.customer-economics'], status: 'foundation' },
];

const S = 'mk.stp', P = 'mk.pricing', C = 'mk.customer-economics';
const L19 = 'l19-segmentation-positioning', L20 = 'l20-value-pricing', L21 = 'l21-customer-economics';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l19q1', lessonId: L19, level: 1, competency: S, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l19q2', lessonId: L19, level: 1, competency: S, type: 'numeric', answer: 6_000, unit: 'units' },
  { id: 'l19q3', lessonId: L19, level: 2, competency: S, type: 'numeric', answer: 150_000, unit: 'usd' },
  { id: 'l19q4', lessonId: L19, level: 2, competency: S, type: 'numeric', answer: 9.375, unit: 'pct' },
  { id: 'l19q5', lessonId: L19, level: 2, competency: S, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l19w1', lessonId: L19, level: 3, competency: S, type: 'written', rubricCount: 5 },
  { id: 'l20q1', lessonId: L20, level: 1, competency: P, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l20q2', lessonId: L20, level: 1, competency: P, type: 'numeric', answer: 95, unit: 'usd' },
  { id: 'l20q3', lessonId: L20, level: 2, competency: P, type: 'numeric', answer: 33.33, unit: 'pct' },
  { id: 'l20q4', lessonId: L20, level: 2, competency: P, type: 'numeric', answer: 16.67, unit: 'pct' },
  { id: 'l20q5', lessonId: L20, level: 2, competency: P, type: 'numeric', answer: 97.5, unit: 'usd' },
  { id: 'l20q6', lessonId: L20, level: 3, competency: P, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l21q1', lessonId: L21, level: 1, competency: C, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l21q2', lessonId: L21, level: 1, competency: C, type: 'numeric', answer: 300, unit: 'usd' },
  { id: 'l21q3', lessonId: L21, level: 2, competency: C, type: 'numeric', answer: 25, unit: 'months' },
  { id: 'l21q4', lessonId: L21, level: 2, competency: C, type: 'numeric', answer: 500, unit: 'usd' },
  { id: 'l21q5', lessonId: L21, level: 2, competency: C, type: 'numeric', answer: 2, unit: 'x' },
  { id: 'l21w1', lessonId: L21, level: 3, competency: C, type: 'written', rubricCount: 5 },
];

export const CASE_IDS: string[] = [];
