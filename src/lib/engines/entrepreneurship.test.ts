import { describe, it, expect } from 'vitest';
import * as E from './entrepreneurship';
import { QUESTION_KEYS } from '../../content/entrepreneurship/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('entrepreneurship engine reproduces every numeric answer key', () => {
  it('lesson 38: validating ideas', () => {
    near(E.funnelCustomers(5_000, 0.06, 0.2), ans('l38q2'), 6);
    near(E.funnelCustomers(10_000, 0.04, 0.1), 40, 6);
    near(E.proportionStandardError(0.06, 400) * 100, ans('l38q3'));
    near(1.96 * E.proportionStandardError(0.06, 400) * 100, ans('l38q4'));
    const ci = E.proportionInterval(0.06, 400);
    near(ci.low * 100, 3.67);
    near(ci.high * 100, 8.33);
    expect(ci.low < 0.05 && 0.05 < ci.high).toBe(true); // target inside the interval: inconclusive
    expect(E.sampleSizeForProportion(0.06, 0.01)).toBe(2_167);
  });

  it('lesson 39: unit economics, burn and runway', () => {
    expect(E.netBurn(40_000, 100_000)).toBe(ans('l39q2'));
    expect(E.runwayMonths(600_000, 60_000)).toBe(ans('l39q3'));
    expect(E.contributionPerOrder(40, 22, 8, 2)).toBe(ans('l39q4'));
    expect(E.breakEvenOrders(48_000, 8)).toBe(ans('l39q5'));
    expect(E.runwayMonths(100, 0)).toBe(Infinity);
    // written case
    const loss = (orders: number, contribution: number, fixed: number) => fixed - orders * contribution;
    expect(loss(4_000, 8, 48_000)).toBe(16_000);
    near(160_000 / loss(3_600, 10, 48_000), 13.33);
    expect(160_000 / loss(4_000, 8, 42_000)).toBe(16);
    near(160_000 / loss(3_600, 10, 42_000), 26.67);
    expect(E.breakEvenOrders(42_000, 10)).toBe(4_200);
  });

  it('lesson 40: funding and dilution', () => {
    expect(E.postMoney(8, 2)).toBe(10);
    near(E.investorOwnership(8, 2) * 100, ans('l40q2'));
    near(E.stakeAfterRound(0.8, 0.2) * 100, ans('l40q3'));
    near(E.discountedPrice(2.5, 0.2), ans('l40q4'));
    near(E.stakeAfterRound(0.8, 0.2) * 50, ans('l40q5'));
    // written case
    near(E.investorOwnership(9, 3), 0.25, 9);
    near(E.investorOwnership(10, 2), 1 / 6, 9);
    near((1 - E.investorOwnership(9, 3)) * E.postMoney(9, 3), 9, 9);
    near((1 - E.investorOwnership(10, 2)) * E.postMoney(10, 2), 10, 9);
    expect(3_000_000 / 100_000).toBe(30);
    expect(2_000_000 / 100_000).toBe(20);
  });
});
