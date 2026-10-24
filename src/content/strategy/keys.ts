import type { LessonKey, QuestionKey } from '../types';

export const LESSON_KEYS: LessonKey[] = [
  { id: 'l26-industry-analysis', number: 38, unitId: 'st-u1', minutes: 14, competencies: ['st.industry'], status: 'foundation' },
  { id: 'l27-competitive-advantage', number: 39, unitId: 'st-u1', minutes: 14, competencies: ['st.advantage'], status: 'foundation' },
  { id: 'l28-corporate-strategy', number: 40, unitId: 'st-u2', minutes: 15, competencies: ['st.corporate'], status: 'foundation' },
  { id: 'l29-decisions-uncertainty', number: 41, unitId: 'st-u2', minutes: 15, competencies: ['st.uncertainty'], status: 'foundation' },
];

const IN = 'st.industry', AD = 'st.advantage', CO = 'st.corporate', UN = 'st.uncertainty';
const L26 = 'l26-industry-analysis', L27 = 'l27-competitive-advantage', L28 = 'l28-corporate-strategy', L29 = 'l29-decisions-uncertainty';

export const QUESTION_KEYS: QuestionKey[] = [
  { id: 'l26q1', lessonId: L26, level: 1, competency: IN, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l26q2', lessonId: L26, level: 1, competency: IN, type: 'numeric', answer: 85, unit: 'pct' },
  { id: 'l26q3', lessonId: L26, level: 2, competency: IN, type: 'numeric', answer: 3_000, unit: 'num' },
  { id: 'l26q4', lessonId: L26, level: 2, competency: IN, type: 'numeric', answer: 3_400, unit: 'num' },
  { id: 'l26q5', lessonId: L26, level: 2, competency: IN, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l26w1', lessonId: L26, level: 3, competency: IN, type: 'written', rubricCount: 5 },
  { id: 'l27q1', lessonId: L27, level: 1, competency: AD, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l27q2', lessonId: L27, level: 1, competency: AD, type: 'numeric', answer: 64, unit: 'usd' },
  { id: 'l27q3', lessonId: L27, level: 2, competency: AD, type: 'numeric', answer: 51.2, unit: 'usd' },
  { id: 'l27q4', lessonId: L27, level: 2, competency: AD, type: 'numeric', answer: 12.5, unit: 'pct' },
  { id: 'l27q5', lessonId: L27, level: 2, competency: AD, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l27q6', lessonId: L27, level: 3, competency: AD, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l28q1', lessonId: L28, level: 1, competency: CO, type: 'mcq', correctIndex: 2, optionCount: 4 },
  { id: 'l28q2', lessonId: L28, level: 1, competency: CO, type: 'numeric', answer: 0.5, unit: 'x' },
  { id: 'l28q3', lessonId: L28, level: 2, competency: CO, type: 'numeric', answer: 50, unit: 'usd' },
  { id: 'l28q4', lessonId: L28, level: 2, competency: CO, type: 'numeric', answer: 30, unit: 'pct' },
  { id: 'l28q5', lessonId: L28, level: 2, competency: CO, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l28w1', lessonId: L28, level: 3, competency: CO, type: 'written', rubricCount: 5 },
  { id: 'l29q1', lessonId: L29, level: 1, competency: UN, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l29q2', lessonId: L29, level: 1, competency: UN, type: 'numeric', answer: 80, unit: 'usd' },
  { id: 'l29q3', lessonId: L29, level: 2, competency: UN, type: 'numeric', answer: 120, unit: 'usd' },
  { id: 'l29q4', lessonId: L29, level: 2, competency: UN, type: 'numeric', answer: 28.57, unit: 'pct' },
  { id: 'l29q5', lessonId: L29, level: 2, competency: UN, type: 'mcq', correctIndex: 3, optionCount: 4 },
  { id: 'l29q6', lessonId: L29, level: 3, competency: UN, type: 'numeric', answer: 100, unit: 'usd' },
];

export const CASE_IDS: string[] = [];
