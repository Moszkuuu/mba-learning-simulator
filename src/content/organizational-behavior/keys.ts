import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l30-motivation', number: 42, unitId: 'ob-u1', minutes: 14, competencies: ['ob.motivation'], status: 'foundation' },
  { id: 'l31-teams', number: 43, unitId: 'ob-u2', minutes: 13, competencies: ['ob.teams'], status: 'foundation' },
  { id: 'l32-leadership', number: 44, unitId: 'ob-u2', minutes: 14, competencies: ['ob.leadership'], status: 'foundation' },
  { id: 'l33-change', number: 45, unitId: 'ob-u2', minutes: 14, competencies: ['ob.change'], status: 'foundation' },
];

const MO = 'ob.motivation', TE = 'ob.teams', LE = 'ob.leadership', CH = 'ob.change';
const L30 = 'l30-motivation', L31 = 'l31-teams', L32 = 'l32-leadership', L33 = 'l33-change';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l30q1', lessonId: L30, level: 1, competency: MO, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l30q2', lessonId: L30, level: 1, competency: MO, type: 'numeric', answer: 2.7, unit: 'num' },
  { id: 'l30q3', lessonId: L30, level: 2, competency: MO, type: 'numeric', answer: 50, unit: 'num' },
  { id: 'l30q4', lessonId: L30, level: 2, competency: MO, type: 'numeric', answer: 0.83, unit: 'x' },
  { id: 'l30q5', lessonId: L30, level: 2, competency: MO, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l30w1', lessonId: L30, level: 3, competency: MO, type: 'written', rubricCount: 5 },
  { id: 'l31q1', lessonId: L31, level: 1, competency: TE, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l31q2', lessonId: L31, level: 1, competency: TE, type: 'numeric', answer: 28, unit: 'num' },
  { id: 'l31q3', lessonId: L31, level: 2, competency: TE, type: 'numeric', answer: 66, unit: 'num' },
  { id: 'l31q4', lessonId: L31, level: 2, competency: TE, type: 'numeric', answer: 4.5, unit: 'x' },
  { id: 'l31q5', lessonId: L31, level: 2, competency: TE, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l31q6', lessonId: L31, level: 3, competency: TE, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l32q1', lessonId: L32, level: 1, competency: LE, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l32q2', lessonId: L32, level: 1, competency: LE, type: 'numeric', answer: 21, unit: 'num' },
  { id: 'l32q3', lessonId: L32, level: 2, competency: LE, type: 'numeric', answer: 73, unit: 'num' },
  { id: 'l32q4', lessonId: L32, level: 2, competency: LE, type: 'numeric', answer: 3, unit: 'num' },
  { id: 'l32q5', lessonId: L32, level: 2, competency: LE, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l32w1', lessonId: L32, level: 3, competency: LE, type: 'written', rubricCount: 5 },
  { id: 'l33q1', lessonId: L33, level: 1, competency: CH, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l33q2', lessonId: L33, level: 1, competency: CH, type: 'numeric', answer: 19, unit: 'num' },
  { id: 'l33q3', lessonId: L33, level: 2, competency: CH, type: 'numeric', answer: -1, unit: 'num' },
  { id: 'l33q4', lessonId: L33, level: 2, competency: CH, type: 'numeric', answer: 4, unit: 'num' },
  { id: 'l33q5', lessonId: L33, level: 2, competency: CH, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l33w1', lessonId: L33, level: 3, competency: CH, type: 'written', rubricCount: 5 },
];

export const CASE_IDS: string[] = [];
