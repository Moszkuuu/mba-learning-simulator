import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l22-process-analysis', number: 22, unitId: 'op-u1', minutes: 14, competencies: ['op.process'], status: 'foundation' },
  { id: 'l23-inventory-models', number: 23, unitId: 'op-u1', minutes: 15, competencies: ['op.inventory'], status: 'foundation' },
  { id: 'l24-capacity-queues', number: 24, unitId: 'op-u2', minutes: 15, competencies: ['op.capacity-queues'], status: 'foundation' },
  { id: 'l25-quality', number: 25, unitId: 'op-u2', minutes: 14, competencies: ['op.quality'], status: 'foundation' },
];

const PR = 'op.process', IN = 'op.inventory', CQ = 'op.capacity-queues', QU = 'op.quality';
const L22 = 'l22-process-analysis', L23 = 'l23-inventory-models', L24 = 'l24-capacity-queues', L25 = 'l25-quality';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l22q1', lessonId: L22, level: 1, competency: PR, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l22q2', lessonId: L22, level: 1, competency: PR, type: 'numeric', answer: 7.5, unit: 'num' },
  { id: 'l22q3', lessonId: L22, level: 2, competency: PR, type: 'numeric', answer: 10, unit: 'num' },
  { id: 'l22q4', lessonId: L22, level: 2, competency: PR, type: 'numeric', answer: 3, unit: 'days' },
  { id: 'l22q5', lessonId: L22, level: 2, competency: PR, type: 'numeric', answer: 83.33, unit: 'pct' },
  { id: 'l22q6', lessonId: L22, level: 3, competency: PR, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l23q1', lessonId: L23, level: 1, competency: IN, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l23q2', lessonId: L23, level: 1, competency: IN, type: 'numeric', answer: 400, unit: 'units' },
  { id: 'l23q3', lessonId: L23, level: 2, competency: IN, type: 'numeric', answer: 1_000, unit: 'usd' },
  { id: 'l23q4', lessonId: L23, level: 2, competency: IN, type: 'numeric', answer: 200, unit: 'units' },
  { id: 'l23q5', lessonId: L23, level: 2, competency: IN, type: 'numeric', answer: 33, unit: 'units' },
  { id: 'l23q6', lessonId: L23, level: 3, competency: IN, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l24q1', lessonId: L24, level: 1, competency: CQ, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l24q2', lessonId: L24, level: 1, competency: CQ, type: 'numeric', answer: 75, unit: 'pct' },
  { id: 'l24q3', lessonId: L24, level: 2, competency: CQ, type: 'numeric', answer: 4, unit: 'num' },
  { id: 'l24q4', lessonId: L24, level: 2, competency: CQ, type: 'numeric', answer: 30, unit: 'num' },
  { id: 'l24q5', lessonId: L24, level: 2, competency: CQ, type: 'numeric', answer: 2, unit: 'num' },
  { id: 'l24q6', lessonId: L24, level: 3, competency: CQ, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l25q1', lessonId: L25, level: 1, competency: QU, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l25q2', lessonId: L25, level: 1, competency: QU, type: 'numeric', answer: 1_250, unit: 'num' },
  { id: 'l25q3', lessonId: L25, level: 2, competency: QU, type: 'numeric', answer: 2, unit: 'x' },
  { id: 'l25q4', lessonId: L25, level: 2, competency: QU, type: 'numeric', answer: 1.67, unit: 'x' },
  { id: 'l25q5', lessonId: L25, level: 2, competency: QU, type: 'numeric', answer: 53, unit: 'num' },
  { id: 'l25q6', lessonId: L25, level: 3, competency: QU, type: 'mcq', correctIndex: 2, optionCount: 4 },
];

export const CASE_IDS: string[] = [];
