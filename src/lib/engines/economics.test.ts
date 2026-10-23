import { describe, it, expect } from 'vitest';
import * as E from './economics';
import { QUESTION_KEYS } from '../../content/managerial-economics/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('managerial economics engine reproduces every numeric answer key', () => {
  it('lesson 15: elasticity', () => {
    near(E.elasticity(-0.12, 0.08), ans('l15q2'));
    near(E.elasticity(-0.15, 0.2), -0.75);
    near(E.midpointElasticity(20, 600, 30, 450), ans('l15q3'));
    near(E.midpointElasticity(30, 450, 20, 600), E.midpointElasticity(20, 600, 30, 450), 10); // symmetric
    near(E.revenueChange(-2, -0.05) * 100, ans('l15q4'));
    near(E.pointElasticityLinear(1_000, 40, 10), ans('l15q5'));
    expect(12 * 850).toBe(10_200);
    near(E.revenueChange(-0.6, 0.1) * 100, 3.4, 1); // l15q6
  });

  it('lesson 16: marginal analysis', () => {
    expect(E.marginalCost(5_000, 5_030, 100, 101)).toBe(ans('l16q2'));
    const m = E.monopolyLinear(100, 2, 20, 200);
    expect(m.quantity).toBe(ans('l16q3'));
    expect(m.price).toBe(ans('l16q4'));
    expect(m.profit).toBe(ans('l16q5'));
    // neighbouring outputs earn less (worked example 2)
    const profitAt = (q: number) => (100 - 2 * q) * q - (200 + 20 * q);
    expect(profitAt(22)).toBe(592);
    expect(profitAt(18)).toBe(592);
    expect(profitAt(20)).toBeGreaterThan(profitAt(22));
    // MR = MC is not P = MC
    expect((100 - 20) / 2).toBe(40);
  });

  it('lesson 17: market structure', () => {
    near(E.lerner(50, 30) * 100, ans('l17q2'));
    near(E.markupPrice(30, -3), ans('l17q3'));
    near(E.markupPrice(40, -5), ans('l17q4'));
    near(E.markupPrice(20, -4), 26.67);
    near(E.lerner(E.markupPrice(20, -4), 20), 0.25, 6);
    near(E.markupPrice(20, -2), 40);
    near(E.markupPrice(20, -5), 25);
  });

  it('lesson 18: game theory', () => {
    const pd: E.Payoff[][] = [[[10, 10], [2, 14]], [[14, 2], [6, 6]]];
    expect(E.pureNash(pd)).toEqual([[1, 1]]);
    expect(6 + 6).toBe(ans('l18q2'));
    expect(20 - 12).toBe(ans('l18q3'));
    const coord: E.Payoff[][] = [[[5, 5], [0, 0]], [[0, 0], [3, 3]]];
    expect(E.pureNash(coord)).toEqual([[0, 0], [1, 1]]);
    near(E.expectedPayoff([0.6, 0.4], [3, 1]), ans('l18q5'));
    // entry deterrence via backward induction: rows = entrant (out, enter), see written case
    const incumbentFight = 3, incumbentAccommodate = 6;
    expect(incumbentAccommodate > incumbentFight).toBe(true); // threat not credible
    const afterFight = incumbentFight + 4 - 1, afterAccommodate = incumbentAccommodate - 1, afterOut = 10 - 1;
    expect([afterOut, afterFight, afterAccommodate]).toEqual([9, 6, 5]);
    expect(afterFight > afterAccommodate).toBe(true); // threat becomes credible
  });
});
