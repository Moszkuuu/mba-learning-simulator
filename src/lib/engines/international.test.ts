import { describe, it, expect } from 'vitest';
import * as I from './international';
import { npv, annuityFactor } from './corpfinance';
import { QUESTION_KEYS } from '../../content/international-business/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('international business engine reproduces every numeric answer key', () => {
  it('lesson 41: exchange rates', () => {
    expect(I.convert(250_000, 36)).toBe(ans('l41q2'));
    near(I.crossRate(36, 0.9), ans('l41q3'));
    near(I.forwardRate(36, 0.02, 0.04), ans('l41q4'));
    near(I.percentChange(36, 35.31) * 100, ans('l41q5'));
    near(500_000 * I.forwardRate(36, 0.02, 0.04) / 1e6, 17.65);
    expect(I.forwardRate(36, 0.02, 0.04)).toBeLessThan(36); // higher US rate -> dollar at a forward discount
  });

  it('lesson 42: trade', () => {
    expect(I.opportunityCost(10, 20)).toBe(ans('l42q2'));
    expect(I.opportunityCost(6, 6)).toBe(1);
    near((I.opportunityCost(6, 6) + I.opportunityCost(10, 20)) / 2, ans('l42q3'));
    // gain for A: value bundles at 1 cloth = 2 wine
    expect(4 * 2 + 14 - (5 * 2 + 10)).toBe(ans('l42q4'));
    // B's gain is also 2 in its own terms (1 cloth = 1 wine): 2 cloth + 6 wine versus 3 + 3
    expect(2 + 6 - (3 + 3)).toBe(2);
    expect(I.tariffRevenue(200, 0.1)).toBe(ans('l42q5'));
    near(I.domesticPriceWithTariff(100, 0.2), 120);
  });

  it('lesson 43: market entry', () => {
    expect(I.royalty(20, 0.05)).toBe(ans('l43q2'));
    const flows = (r: number) => npv(r, [-10, 3, 3, 3, 3, 3]);
    near(flows(0.1), 1.37);
    near(flows(0.14), ans('l43q3'));
    near(3 * annuityFactor(0.1, 5), 11.372, 3);
    near(I.expectedPvWithLoss(3 * annuityFactor(0.1, 5), 0.1, 2) - 10, ans('l43q4'));
    // written case: expected five-year profits and worst cases
    expect(2 * 5 - 0.5).toBe(9.5);
    near(0.7 * 5 * 5 - 4, 13.5);
    near(0.5 * 9 * 5 - 12, 10.5);
  });
});
