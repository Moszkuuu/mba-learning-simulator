import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l38-validating-ideas', number: 50, unitId: 'en-u1', minutes: 14, competencies: ['en.lean'], status: 'foundation' },
  { id: 'l39-unit-economics-runway', number: 51, unitId: 'en-u2', minutes: 14, competencies: ['en.unit-economics'], status: 'foundation' },
  { id: 'l40-funding-dilution', number: 52, unitId: 'en-u2', minutes: 15, competencies: ['en.funding'], status: 'foundation' },
];

const LE = 'en.lean', UE = 'en.unit-economics', FU = 'en.funding';
const L38 = 'l38-validating-ideas', L39 = 'l39-unit-economics-runway', L40 = 'l40-funding-dilution';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l38q1', lessonId: L38, level: 1, competency: LE, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l38q2', lessonId: L38, level: 1, competency: LE, type: 'numeric', answer: 60, unit: 'units' },
  { id: 'l38q3', lessonId: L38, level: 2, competency: LE, type: 'numeric', answer: 1.19, unit: 'pct' },
  { id: 'l38q4', lessonId: L38, level: 2, competency: LE, type: 'numeric', answer: 2.33, unit: 'pct' },
  { id: 'l38q5', lessonId: L38, level: 2, competency: LE, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l38w1', lessonId: L38, level: 3, competency: LE, type: 'written', rubricCount: 5 },
  { id: 'l39q1', lessonId: L39, level: 1, competency: UE, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l39q2', lessonId: L39, level: 1, competency: UE, type: 'numeric', answer: 60_000, unit: 'usd' },
  { id: 'l39q3', lessonId: L39, level: 2, competency: UE, type: 'numeric', answer: 10, unit: 'months' },
  { id: 'l39q4', lessonId: L39, level: 2, competency: UE, type: 'numeric', answer: 8, unit: 'usd' },
  { id: 'l39q5', lessonId: L39, level: 2, competency: UE, type: 'numeric', answer: 6_000, unit: 'units' },
  { id: 'l39w1', lessonId: L39, level: 3, competency: UE, type: 'written', rubricCount: 5 },
  { id: 'l40q1', lessonId: L40, level: 1, competency: FU, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l40q2', lessonId: L40, level: 1, competency: FU, type: 'numeric', answer: 20, unit: 'pct' },
  { id: 'l40q3', lessonId: L40, level: 2, competency: FU, type: 'numeric', answer: 64, unit: 'pct' },
  { id: 'l40q4', lessonId: L40, level: 2, competency: FU, type: 'numeric', answer: 2, unit: 'usd' },
  { id: 'l40q5', lessonId: L40, level: 2, competency: FU, type: 'numeric', answer: 32, unit: 'usd' },
  { id: 'l40w1', lessonId: L40, level: 3, competency: FU, type: 'written', rubricCount: 5 },
];

export const CASE_IDS: string[] = [];
