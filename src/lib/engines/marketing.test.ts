import { describe, it, expect } from 'vitest';
import * as M from './marketing';
import { QUESTION_KEYS } from '../../content/marketing/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('marketing engine reproduces every numeric answer key', () => {
  it('lesson 19: segmentation', () => {
    expect(M.captured(40_000, 0.15)).toBe(ans('l19q2'));
    expect(M.segmentNetContribution(12_000, 0.25, 80, 90_000)).toBe(ans('l19q3'));
    near(M.breakEvenPenetration(12_000, 80, 90_000) * 100, ans('l19q4'), 3);
    expect(M.segmentNetContribution(20_000, 0.1, 120, 60_000)).toBe(180_000);
    expect(M.segmentNetContribution(50_000, 0.04, 90, 80_000)).toBe(100_000);
    expect(M.segmentNetContribution(8_000, 0.25, 200, 150_000)).toBe(250_000);
    // written case
    expect(M.segmentNetContribution(30_000, 0.2, 40, 120_000)).toBe(120_000);
    expect(M.segmentNetContribution(8_000, 0.3, 150, 150_000)).toBe(210_000);
    expect(M.segmentNetContribution(8_000, 0.15, 150, 150_000)).toBe(30_000);
    expect(M.segmentNetContribution(30_000, 0.1, 40, 120_000)).toBe(0);
  });

  it('lesson 20: value-based pricing', () => {
    expect(M.economicValueToCustomer(80, 25, 10)).toBe(ans('l20q2'));
    expect(M.economicValueToCustomer(100, 30, 5)).toBe(125);
    near(M.breakEvenVolumeGainForPriceCut(0.4, 0.1) * 100, ans('l20q3'));
    near(M.breakEvenVolumeLossForPriceRise(0.25, 0.05) * 100, ans('l20q4'));
    near(M.sharedSurplusPrice(70, 125, 0.5), ans('l20q5'));
    // consistency: the break-even formulas leave contribution unchanged
    near(M.contributionIndexAfterPriceChange(0.4, -0.1, M.breakEvenVolumeGainForPriceCut(0.4, 0.1)), 1, 9);
    near(M.contributionIndexAfterPriceChange(0.25, 0.05, -M.breakEvenVolumeLossForPriceRise(0.25, 0.05)), 1, 9);
    // l20q6: revenue +8% but contribution -10%
    near(0.9 * 1.2, 1.08, 9);
    near(M.contributionIndexAfterPriceChange(0.4, -0.1, 0.2), 0.9, 9);
  });

  it('lesson 21: customer economics', () => {
    expect(M.customerAcquisitionCost(150_000, 500)).toBe(ans('l21q2'));
    near(M.lifetimePeriods(0.04), ans('l21q3'), 9);
    near(M.customerLifetimeValue(25, 0.05), ans('l21q4'), 9);
    near(M.ltvToCac(500, 250), ans('l21q5'), 9);
    const clv = M.customerLifetimeValue(30, 0.05);
    near(clv, 600, 9);
    near(M.ltvToCac(clv, 200), 3, 9);
    near(M.paybackPeriods(200, 30), 6.67);
    near(M.customerLifetimeValue(30, 0.04), 750, 9);
    // written case
    near(M.customerLifetimeValue(20, 0.1), 200, 9);
    near(M.customerLifetimeValue(20, 0.02), 1_000, 9);
    near(M.ltvToCac(1_000, 300), 3.33);
    expect(M.paybackPeriods(100, 20)).toBe(5);
    expect(M.paybackPeriods(300, 20)).toBe(15);
    near(M.ltvToCac(M.customerLifetimeValue(20, 0.05), 300), 1.33);
  });
});
