import type { Tolerance, Unit } from '../lib/numeric';

/**
 * Consulting Lab pilot case: "The Profitable Company Running Out of Cash".
 * Maple Garden Supply Co. is FICTIONAL; every figure is invented and internally consistent (verified in case.test.ts).
 * Conventions: one year, 365 days, ending balances, 25% tax paid in cash in the year, interest paid inside operating cash flow.
 */
export type LabLevel = 'beginner' | 'intermediate' | 'advanced';
export const LAB_LEVELS: LabLevel[] = ['beginner', 'intermediate', 'advanced'];

export interface YearData {
  revenue: number; cogs: number; opexExDep: number; depreciation: number; interest: number;
  receivables: number; inventory: number; payables: number; cash: number; equipment: number; debt: number;
}
/** Year 1 and Year 2 (the year to be diagnosed). Balance sheet items are year-end. */
export const Y1: YearData = { revenue: 4_000_000, cogs: 2_800_000, opexExDep: 760_000, depreciation: 100_000, interest: 40_000, receivables: 500_000, inventory: 400_000, payables: 350_000, cash: 150_000, equipment: 800_000, debt: 400_000 };
export const Y2: YearData = { revenue: 5_600_000, cogs: 3_920_000, opexExDep: 1_100_000, depreciation: 140_000, interest: 90_000, receivables: 1_150_000, inventory: 880_000, payables: 430_000, cash: 30_000, equipment: 820_000, debt: 1_187_500 };
export const TAX_RATE = 0.25;
export const DIVIDEND_Y2 = 100_000;
export const CAPEX_Y2 = 160_000;
/** Bank covenant described in the Advanced briefing: debt must not exceed equity (debt / equity <= 1.0). */
export const COVENANT_MAX_DEBT_TO_EQUITY = 1;
/** Year 3 budget described in the Advanced briefing: sales growth with unchanged days. */
export const BUDGET_GROWTH = 0.3;

export const gross = (y: YearData) => y.revenue - y.cogs;
export const operatingProfit = (y: YearData) => gross(y) - y.opexExDep - y.depreciation;
export const profitBeforeTax = (y: YearData) => operatingProfit(y) - y.interest;
export const tax = (y: YearData) => profitBeforeTax(y) * TAX_RATE;
export const netProfit = (y: YearData) => profitBeforeTax(y) - tax(y);
export const totalAssets = (y: YearData) => y.cash + y.receivables + y.inventory + y.equipment;
export const equity = (y: YearData) => totalAssets(y) - y.payables - y.debt;
export const dso = (y: YearData) => (y.receivables / y.revenue) * 365;
export const dio = (y: YearData) => (y.inventory / y.cogs) * 365;
export const dpo = (y: YearData) => (y.payables / y.cogs) * 365;
export const ccc = (y: YearData) => dso(y) + dio(y) - dpo(y);
export const tradeWorkingCapital = (y: YearData) => y.receivables + y.inventory - y.payables;
/** Indirect-method operating cash flow for Year 2. */
export const ocfY2 = () => netProfit(Y2) + Y2.depreciation - (Y2.receivables - Y1.receivables) - (Y2.inventory - Y1.inventory) + (Y2.payables - Y1.payables);
/** Cash released by shortening DSO by `days` (revenue per day, Year 2). */
export const cashFromDso = (days: number) => (days * Y2.revenue) / 365;

export interface LabCheck {
  id: string;
  expected: number;
  unit: Unit;
  tol?: Tolerance;
  /** Existing lesson ids to study when this check is missed. */
  lessons: string[];
}

const OCF: LabCheck = { id: 'ocf', expected: Math.round(ocfY2()), unit: 'usd', lessons: ['l5-operating-cash-flow'] };
const CCC2: LabCheck = { id: 'ccc2', expected: ccc(Y2), unit: 'days', lessons: ['l4-inventory-wc'] };
const CCC1: LabCheck = { id: 'ccc1', expected: ccc(Y1), unit: 'days', lessons: ['l4-inventory-wc'] };
const TWC: LabCheck = { id: 'twc', expected: tradeWorkingCapital(Y2) - tradeWorkingCapital(Y1), unit: 'usd', lessons: ['l4-inventory-wc'] };
const HEADROOM: LabCheck = { id: 'headroom', expected: equity(Y2) * COVENANT_MAX_DEBT_TO_EQUITY - Y2.debt, unit: 'usd', lessons: ['l54-debt-equity'] };

/**
 * Six automatically checked numbers per level. The sixth in the Intermediate and Advanced levels ("consistency") is computed
 * from the student's own target, see checkConsistency in lib/lab.ts.
 */
export const CHECKS: Record<LabLevel, LabCheck[]> = {
  beginner: [
    OCF,
    { id: 'dso', expected: dso(Y2), unit: 'days', lessons: ['l3-ar-ap', 'l4-inventory-wc'] },
    { id: 'dio', expected: dio(Y2), unit: 'days', lessons: ['l4-inventory-wc'] },
    { id: 'dpo', expected: dpo(Y2), unit: 'days', lessons: ['l3-ar-ap', 'l4-inventory-wc'] },
    CCC2,
    { id: 'release', expected: cashFromDso(15), unit: 'usd', lessons: ['l4-inventory-wc'] },
  ],
  intermediate: [OCF, CCC1, CCC2, TWC, HEADROOM],
  advanced: [
    OCF,
    { id: 'cccChange', expected: ccc(Y2) - ccc(Y1), unit: 'days', tol: { abs: 0.6 }, lessons: ['l4-inventory-wc'] },
    TWC,
    HEADROOM,
    { id: 'fundNeed', expected: tradeWorkingCapital(Y2) * BUDGET_GROWTH, unit: 'usd', lessons: ['l4-inventory-wc'] },
  ],
};
export const CONSISTENCY: LabCheck = { id: 'consistency', expected: 0, unit: 'usd', lessons: ['l4-inventory-wc'] };

/** The self-assessed part of the 100-point rubric. The remaining 25 points are the automatically checked numbers. */
export const VERIFIED_POINTS = 25;
export const RUBRIC: { id: string; points: number }[] = [
  { id: 'diagnosis', points: 20 },
  { id: 'reasoning', points: 15 },
  { id: 'recommendations', points: 15 },
  { id: 'risk', points: 10 },
  { id: 'feasibility', points: 10 },
  { id: 'communication', points: 5 },
];
/** Self-rating levels: 0 not attempted, 1 basic, 2 good, 3 strong. */
export const RATING_MAX = 3;

/** Written fields per level (keys are used for saving and for the completeness checks). */
export const FIELDS: Record<LabLevel, { id: string; minWords: number }[]> = {
  beginner: [{ id: 'why', minWords: 10 }, { id: 'movers', minWords: 5 }, { id: 'options', minWords: 12 }, { id: 'first', minWords: 8 }],
  intermediate: [{ id: 'diagnosis', minWords: 30 }, { id: 'options', minWords: 40 }, { id: 'recommendation', minWords: 30 }, { id: 'risks', minWords: 25 }, { id: 'plan', minWords: 30 }],
  advanced: [{ id: 'report', minWords: 150 }, { id: 'assumptions', minWords: 15 }, { id: 'limitations', minWords: 15 }, { id: 'requests', minWords: 10 }],
};
