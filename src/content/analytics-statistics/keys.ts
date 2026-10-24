import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l34-descriptive-statistics', number: 46, unitId: 'as-u1', minutes: 13, competencies: ['as.descriptive'], status: 'foundation' },
  { id: 'l35-probability', number: 47, unitId: 'as-u1', minutes: 15, competencies: ['as.probability'], status: 'foundation' },
  { id: 'l36-inference', number: 48, unitId: 'as-u2', minutes: 16, competencies: ['as.inference'], status: 'foundation' },
  { id: 'l37-regression-forecasting', number: 49, unitId: 'as-u2', minutes: 16, competencies: ['as.regression'], status: 'foundation' },
];

const DE = 'as.descriptive', PR = 'as.probability', IN = 'as.inference', RE = 'as.regression';
const L34 = 'l34-descriptive-statistics', L35 = 'l35-probability', L36 = 'l36-inference', L37 = 'l37-regression-forecasting';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l34q1', lessonId: L34, level: 1, competency: DE, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l34q2', lessonId: L34, level: 1, competency: DE, type: 'numeric', answer: 14, unit: 'num' },
  { id: 'l34q3', lessonId: L34, level: 2, competency: DE, type: 'numeric', answer: 1.58, unit: 'num' },
  { id: 'l34q4', lessonId: L34, level: 2, competency: DE, type: 'numeric', answer: 1.5, unit: 'num' },
  { id: 'l34q5', lessonId: L34, level: 2, competency: DE, type: 'numeric', answer: 20, unit: 'pct' },
  { id: 'l34q6', lessonId: L34, level: 3, competency: DE, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l35q1', lessonId: L35, level: 1, competency: PR, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l35q2', lessonId: L35, level: 1, competency: PR, type: 'numeric', answer: 50, unit: 'pct' },
  { id: 'l35q3', lessonId: L35, level: 2, competency: PR, type: 'numeric', answer: 70, unit: 'num' },
  { id: 'l35q4', lessonId: L35, level: 2, competency: PR, type: 'numeric', answer: 16.24, unit: 'pct' },
  { id: 'l35q5', lessonId: L35, level: 2, competency: PR, type: 'numeric', answer: 7.29, unit: 'pct' },
  { id: 'l35q6', lessonId: L35, level: 3, competency: PR, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l36q1', lessonId: L36, level: 1, competency: IN, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l36q2', lessonId: L36, level: 1, competency: IN, type: 'numeric', answer: 2, unit: 'num' },
  { id: 'l36q3', lessonId: L36, level: 2, competency: IN, type: 'numeric', answer: 2.94, unit: 'num' },
  { id: 'l36q4', lessonId: L36, level: 2, competency: IN, type: 'numeric', answer: 2, unit: 'num' },
  { id: 'l36q5', lessonId: L36, level: 2, competency: IN, type: 'numeric', answer: 97, unit: 'num' },
  { id: 'l36q6', lessonId: L36, level: 3, competency: IN, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l37q1', lessonId: L37, level: 1, competency: RE, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l37q2', lessonId: L37, level: 1, competency: RE, type: 'numeric', answer: 14.3, unit: 'num' },
  { id: 'l37q3', lessonId: L37, level: 2, competency: RE, type: 'numeric', answer: 2.3, unit: 'num' },
  { id: 'l37q4', lessonId: L37, level: 2, competency: RE, type: 'numeric', answer: 123, unit: 'num' },
  { id: 'l37q5', lessonId: L37, level: 2, competency: RE, type: 'numeric', answer: 10, unit: 'pct' },
  { id: 'l37q6', lessonId: L37, level: 3, competency: RE, type: 'mcq', correctIndex: 3, optionCount: 4 },
];

export const CASE_IDS: string[] = [];
