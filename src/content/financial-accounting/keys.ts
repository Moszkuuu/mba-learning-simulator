import type { LessonKey, QuestionKey } from '../types';
import { NEW_QUESTION_KEYS } from './keys-new';

/** Language-neutral structure and answer keys for Financial Accounting. Shared by EN and TH. */
export const LESSON_KEYS: LessonKey[] = [
  { id: 'l47-accounting-equation', number: 1, unitId: 'u1-foundations', minutes: 12, competencies: ['fa.double-entry'], status: 'foundation' },
  { id: 'l48-double-entry', number: 2, unitId: 'u1-foundations', minutes: 14, competencies: ['fa.double-entry'], status: 'foundation' },
  { id: 'l49-accrual-recognition', number: 3, unitId: 'u2-accrual', minutes: 13, competencies: ['fa.accrual'], status: 'foundation' },
  { id: 'l50-adjusting-entries', number: 4, unitId: 'u2-accrual', minutes: 13, competencies: ['fa.accrual'], status: 'foundation' },
  { id: 'l1-gross-profit', number: 5, unitId: 'u3-income-statement', minutes: 10, competencies: ['fa.financial-statements'], status: 'migrated' },
  { id: 'l2-operating-profit', number: 6, unitId: 'u3-income-statement', minutes: 10, competencies: ['fa.financial-statements'], status: 'migrated' },
  { id: 'l3-ar-ap', number: 7, unitId: 'u4-balance-sheet-wc', minutes: 12, competencies: ['fa.working-capital'], status: 'migrated' },
  { id: 'l4-inventory-wc', number: 8, unitId: 'u4-balance-sheet-wc', minutes: 12, competencies: ['fa.working-capital'], status: 'migrated' },
  { id: 'l51-inventory-costing', number: 9, unitId: 'u5-inventory', minutes: 14, competencies: ['fa.inventory-valuation'], status: 'foundation' },
  { id: 'l52-inventory-nrv-errors', number: 10, unitId: 'u5-inventory', minutes: 13, competencies: ['fa.inventory-valuation'], status: 'foundation' },
  { id: 'l53-depreciation', number: 11, unitId: 'u6-assets-financing', minutes: 14, competencies: ['fa.long-lived-assets'], status: 'foundation' },
  { id: 'l54-debt-equity', number: 12, unitId: 'u6-assets-financing', minutes: 14, competencies: ['fa.liabilities-equity'], status: 'foundation' },
  { id: 'l5-operating-cash-flow', number: 13, unitId: 'u7-cash-flow', minutes: 12, competencies: ['fa.cash-flow'], status: 'migrated' },
  { id: 'l55-ratios-liquidity-profitability', number: 14, unitId: 'u8-analysis', minutes: 14, competencies: ['fa.ratio-analysis'], status: 'foundation' },
  { id: 'l56-ratios-efficiency-trend', number: 15, unitId: 'u8-analysis', minutes: 14, competencies: ['fa.ratio-analysis'], status: 'foundation' },
  { id: 'l57-earnings-quality', number: 16, unitId: 'u9-earnings-quality', minutes: 15, competencies: ['fa.earnings-quality'], status: 'foundation' },
  { id: 'l58-comparing-policies', number: 17, unitId: 'u9-earnings-quality', minutes: 15, competencies: ['fa.earnings-quality'], status: 'foundation' },
  { id: 'l6-break-even', number: 18, unitId: 'applications', minutes: 12, competencies: ['ma.cvp'], status: 'migrated' },
];

const FS = 'fa.financial-statements';
const WC = 'fa.working-capital';
const CF = 'fa.cash-flow';
const CVP = 'ma.cvp';

export const QUESTION_KEYS: QuestionKey[] = [
  ...NEW_QUESTION_KEYS,
  // Lesson 1
  { id: 'l1q1', lessonId: 'l1-gross-profit', level: 1, competency: FS, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l1q2', lessonId: 'l1-gross-profit', level: 1, competency: FS, type: 'numeric', answer: 157_500, unit: 'usd' },
  { id: 'l1q3', lessonId: 'l1-gross-profit', level: 1, competency: FS, type: 'numeric', answer: 35, unit: 'pct' },
  { id: 'l1q4', lessonId: 'l1-gross-profit', level: 2, competency: FS, type: 'numeric', answer: 365_000, unit: 'usd' },
  { id: 'l1q5', lessonId: 'l1-gross-profit', level: 2, competency: FS, type: 'mcq', correctIndex: 1, optionCount: 4 },
  // Lesson 2
  { id: 'l2q1', lessonId: 'l2-operating-profit', level: 1, competency: FS, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l2q2', lessonId: 'l2-operating-profit', level: 1, competency: FS, type: 'numeric', answer: 130_000, unit: 'usd' },
  { id: 'l2q3', lessonId: 'l2-operating-profit', level: 1, competency: FS, type: 'numeric', answer: 7.5, unit: 'pct' },
  { id: 'l2q4', lessonId: 'l2-operating-profit', level: 2, competency: FS, type: 'numeric', answer: 7, unit: 'pct' },
  { id: 'l2q5', lessonId: 'l2-operating-profit', level: 2, competency: FS, type: 'mcq', correctIndex: 1, optionCount: 4 },
  // Lesson 3
  { id: 'l3q1', lessonId: 'l3-ar-ap', level: 1, competency: WC, type: 'mcq', correctIndex: 0, optionCount: 4 },
  { id: 'l3q2', lessonId: 'l3-ar-ap', level: 1, competency: WC, type: 'numeric', answer: 50, unit: 'days' },
  { id: 'l3q3', lessonId: 'l3-ar-ap', level: 1, competency: WC, type: 'numeric', answer: 30, unit: 'days' },
  { id: 'l3q4', lessonId: 'l3-ar-ap', level: 2, competency: WC, type: 'numeric', answer: 460_000, unit: 'usd' },
  { id: 'l3q5', lessonId: 'l3-ar-ap', level: 2, competency: WC, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l3w1', lessonId: 'l3-ar-ap', level: 3, competency: WC, type: 'written', rubricCount: 5 },
  // Lesson 4
  { id: 'l4q1', lessonId: 'l4-inventory-wc', level: 1, competency: WC, type: 'numeric', answer: 6, unit: 'x' },
  { id: 'l4q2', lessonId: 'l4-inventory-wc', level: 1, competency: WC, type: 'numeric', answer: 30, unit: 'days' },
  { id: 'l4q3', lessonId: 'l4-inventory-wc', level: 2, competency: WC, type: 'numeric', answer: 395_000, unit: 'usd' },
  { id: 'l4q4', lessonId: 'l4-inventory-wc', level: 2, competency: WC, type: 'numeric', answer: 53, unit: 'days' },
  { id: 'l4q5', lessonId: 'l4-inventory-wc', level: 2, competency: WC, type: 'mcq', correctIndex: 1, optionCount: 4 },
  // Lesson 5
  { id: 'l5q1', lessonId: 'l5-operating-cash-flow', level: 2, competency: CF, type: 'numeric', answer: 140_000, unit: 'usd' },
  { id: 'l5q2', lessonId: 'l5-operating-cash-flow', level: 1, competency: CF, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l5q3', lessonId: 'l5-operating-cash-flow', level: 2, competency: CF, type: 'numeric', answer: -25_000, unit: 'usd' },
  { id: 'l5q4', lessonId: 'l5-operating-cash-flow', level: 2, competency: CF, type: 'mcq', correctIndex: 1, optionCount: 4 },
  { id: 'l5q5', lessonId: 'l5-operating-cash-flow', level: 1, competency: CF, type: 'numeric', answer: 60_000, unit: 'usd' },
  { id: 'l5w1', lessonId: 'l5-operating-cash-flow', level: 3, competency: CF, type: 'written', rubricCount: 5 },
  // Lesson 6
  { id: 'l6q1', lessonId: 'l6-break-even', level: 1, competency: CVP, type: 'numeric', answer: 5_000, unit: 'units' },
  { id: 'l6q2', lessonId: 'l6-break-even', level: 1, competency: CVP, type: 'numeric', answer: 600_000, unit: 'usd' },
  { id: 'l6q3', lessonId: 'l6-break-even', level: 2, competency: CVP, type: 'numeric', answer: 10_000, unit: 'units' },
  { id: 'l6q4', lessonId: 'l6-break-even', level: 2, competency: CVP, type: 'numeric', answer: 25, unit: 'pct' },
  { id: 'l6q5', lessonId: 'l6-break-even', level: 2, competency: CVP, type: 'mcq', correctIndex: 0, optionCount: 4 },
  // Practice cases (not in the lesson quizzes)
  { id: 'c1q1', lessonId: 'l2-operating-profit', level: 2, competency: FS, type: 'numeric', answer: 5, unit: 'pct' },
  { id: 'c1q2', lessonId: 'l3-ar-ap', level: 2, competency: WC, type: 'numeric', answer: 60, unit: 'days' },
  { id: 'c1q3', lessonId: 'l4-inventory-wc', level: 2, competency: WC, type: 'numeric', answer: 1_410_000, unit: 'usd' },
  { id: 'c2q1', lessonId: 'l6-break-even', level: 2, competency: CVP, type: 'numeric', answer: 4_000, unit: 'units' },
  { id: 'c2q2', lessonId: 'l6-break-even', level: 2, competency: CVP, type: 'numeric', answer: 6_000, unit: 'units' },
  { id: 'c2q3', lessonId: 'l6-break-even', level: 2, competency: CVP, type: 'numeric', answer: 4_500, unit: 'units' },
];

/** Question ids that belong only to practice mode (business cases), not to a lesson quiz. */
export const CASE_IDS = ['c1q1', 'c1q2', 'c1q3', 'c2q1', 'c2q2', 'c2q3'];
