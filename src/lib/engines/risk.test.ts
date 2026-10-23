import { describe, it, expect } from 'vitest';
import * as R from './risk';
import { QUESTION_KEYS } from '../../content/ethics-governance-risk/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('ethics, governance and risk engine reproduces every numeric answer key', () => {
  it('lesson 44: ethics and stakeholders', () => {
    expect(R.netBenefit(100, 5, 20, 15)).toBe(ans('l44q2'));
    near(R.expectedLoss(0.3, 20 + 10), ans('l44q3'));
    near(R.breakEvenProbability(4, 30) * 100, ans('l44q4'));
    expect(0.3).toBeGreaterThan(R.breakEvenProbability(4, 30)); // recall justified financially
    // written case: expected penalty versus the bonus
    near(R.expectedLoss(0.2, 5_000_000), 1_000_000, 6);
    expect(R.expectedLoss(0.2, 5_000_000) / 100_000).toBe(10);
  });

  it('lesson 45: governance', () => {
    near(R.managerBorneCost(2, 0.05), ans('l45q2'));
    near(R.outsideShareholderCost(2, 0.05), ans('l45q3'));
    expect(R.optionIntrinsicValue(100_000, 30, 20)).toBe(ans('l45q4'));
    expect(R.optionIntrinsicValue(100_000, 20, 20)).toBe(0);
    expect(R.optionIntrinsicValue(100_000, 15, 20)).toBe(0);
  });

  it('lesson 46: risk management', () => {
    near(R.expectedLoss(0.1, 2), ans('l46q2'));
    near(R.expectedLoss(0.02, 20), ans('l46q3'));
    near(R.valueAtRisk(1), ans('l46q4'), 1);
    near(R.scaleVar(R.valueAtRisk(1), 10), ans('l46q5'), 1);
    near(R.scaleVar(R.valueAtRisk(1), 10), 5.2, 1);
    // written case: premium above expected loss, but loss exceeds equity
    near(0.6 - R.expectedLoss(0.02, 20), 0.2);
    near(0.6 / R.expectedLoss(0.02, 20) - 1, 0.5);
    expect(20).toBeGreaterThan(15);
  });
});
