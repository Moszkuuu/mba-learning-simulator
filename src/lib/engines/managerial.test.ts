import { describe, it, expect } from 'vitest';
import * as M from './managerial';
import { QUESTION_KEYS } from '../../content/managerial-accounting/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};

describe('managerial accounting engine reproduces every numeric answer key', () => {
  it('lesson 7: cost behaviour', () => {
    expect(M.totalCost(30_000, 7, 8_500)).toBe(ans('l7q2'));
    const hl = M.highLow(10_000, 100_000, 4_000, 58_000);
    expect(hl.variablePerUnit).toBe(ans('l7q3'));
    expect(hl.fixed).toBe(ans('l7q4'));
    expect(M.totalCost(hl.fixed, hl.variablePerUnit, 4_000)).toBe(58_000); // check at the low point
    expect(M.totalCost(30_000, 7, 7_000) / 7_000).toBeCloseTo(11.29, 2);
    // average vs marginal (l7q5)
    expect(M.totalCost(30_000, 7, 5_000) / 5_000).toBe(13);
    expect(M.totalCost(30_000, 7, 10_000) / 10_000).toBe(10);
    // step-cost written case (l7w1)
    const before = 7_500 * (25 - 15) - 20_000;
    const after = Math.floor(7_500 * 1.15 + 0.5) * (25 - 15) - 40_000;
    expect([before, after, before - after]).toEqual([55_000, 46_250, 8_750]);
    expect((55_000 + 40_000) / 10).toBe(9_500);
  });

  it('lesson 8: product costing', () => {
    expect(M.overheadRate(600_000, 20_000)).toBe(ans('l8q1'));
    expect(M.overheadRate(480_000, 12_000)).toBe(40);
    expect(1_200 + 8 * 25 + M.appliedOverhead(30, 8)).toBe(ans('l8q3'));
    expect(M.overheadUnderApplied(310_000, M.appliedOverhead(30, 10_000))).toBe(ans('l8q4'));
    expect(M.overheadUnderApplied(495_000, M.appliedOverhead(40, 12_300))).toBe(3_000);
    expect(M.absorptionMinusVariableProfit(50_000, 10_000, 8_000)).toBe(ans('l8q5'));
  });

  it('lesson 9: budgets and variances', () => {
    expect(M.flexibleBudget(40_000, 12, 5_000)).toBe(ans('l9q2'));
    expect(M.priceVariance(4.3, 4, 10_000)).toBeCloseTo(ans('l9q3'), 6);
    expect(M.usageVariance(10_000, 9_500, 4)).toBe(ans('l9q4'));
    expect(M.usageVariance(5_000, 4_800, 20)).toBe(ans('l9q5'));
    // worked example: net 80 unfavourable and reconciles to actual - standard cost
    const p = M.priceVariance(4.8, 5, 2_100), u = M.usageVariance(2_100, 2_000, 5);
    expect(p).toBeCloseTo(-420, 6);
    expect(u).toBe(500);
    expect(2_100 * 4.8 - 2_000 * 5).toBeCloseTo(p + u, 6);
    // l9q6 net effect
    expect(6_000 - 1_500).toBe(4_500);
  });

  it('lesson 10: relevant costs', () => {
    expect(M.specialOrderProfit(3_000, 16, 11)).toBe(ans('l10q2'));
    expect(M.specialOrderProfit(2_000, 18, 13)).toBe(10_000);
    expect(M.makeInsteadOfBuySaving(20_000, 17, 7 + 5 + 3)).toBe(ans('l10q3'));
    expect(M.makeInsteadOfBuySaving(10_000, 15, 13)).toBe(20_000);
    expect(-M.dropSegmentEffect(35_000, 15_000)).toBe(ans('l10q4'));
    expect(M.contributionPerScarceHour(20, 2)).toBe(10);
    expect(M.contributionPerScarceHour(30, 4)).toBe(7.5);
    // l10w1: partial acceptance vs full order
    const spare = M.specialOrderProfit(3_000, 15, 11);
    const displaced = 2_000 * (22 - 11);
    const full = spare + M.specialOrderProfit(2_000, 15, 11) - displaced;
    expect([spare, full]).toEqual([12_000, -2_000]);
  });
});
