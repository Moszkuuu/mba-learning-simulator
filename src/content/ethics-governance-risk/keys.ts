import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l44-ethics-stakeholders', number: 56, unitId: 'eg-u1', minutes: 14, competencies: ['eg.ethics'], status: 'foundation' },
  { id: 'l45-corporate-governance', number: 57, unitId: 'eg-u1', minutes: 14, competencies: ['eg.governance'], status: 'foundation' },
  { id: 'l46-risk-management', number: 58, unitId: 'eg-u2', minutes: 15, competencies: ['eg.risk'], status: 'foundation' },
];

const ET = 'eg.ethics', GO = 'eg.governance', RI = 'eg.risk';
const L44 = 'l44-ethics-stakeholders', L45 = 'l45-corporate-governance', L46 = 'l46-risk-management';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l44q1', lessonId: L44, level: 1, competency: ET, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l44q2', lessonId: L44, level: 1, competency: ET, type: 'numeric', answer: 200, unit: 'num' },
  { id: 'l44q3', lessonId: L44, level: 2, competency: ET, type: 'numeric', answer: 9, unit: 'num' },
  { id: 'l44q4', lessonId: L44, level: 2, competency: ET, type: 'numeric', answer: 13.33, unit: 'pct' },
  { id: 'l44q5', lessonId: L44, level: 2, competency: ET, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l44w1', lessonId: L44, level: 3, competency: ET, type: 'written', rubricCount: 5 },
  { id: 'l45q1', lessonId: L45, level: 1, competency: GO, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l45q2', lessonId: L45, level: 1, competency: GO, type: 'numeric', answer: 0.1, unit: 'num' },
  { id: 'l45q3', lessonId: L45, level: 2, competency: GO, type: 'numeric', answer: 1.9, unit: 'num' },
  { id: 'l45q4', lessonId: L45, level: 2, competency: GO, type: 'numeric', answer: 1_000_000, unit: 'usd' },
  { id: 'l45q5', lessonId: L45, level: 2, competency: GO, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l45q6', lessonId: L45, level: 3, competency: GO, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l46q1', lessonId: L46, level: 1, competency: RI, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l46q2', lessonId: L46, level: 1, competency: RI, type: 'numeric', answer: 0.2, unit: 'num' },
  { id: 'l46q3', lessonId: L46, level: 2, competency: RI, type: 'numeric', answer: 0.4, unit: 'num' },
  { id: 'l46q4', lessonId: L46, level: 2, competency: RI, type: 'numeric', answer: 1.65, unit: 'num' },
  { id: 'l46q5', lessonId: L46, level: 2, competency: RI, type: 'numeric', answer: 5.2, unit: 'num' },
  { id: 'l46w1', lessonId: L46, level: 3, competency: RI, type: 'written', rubricCount: 5 },
];

export const CASE_IDS: string[] = [];
