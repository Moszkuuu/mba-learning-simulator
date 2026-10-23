import { describe, it, expect } from 'vitest';
import * as S from './statistics';
import { QUESTION_KEYS } from '../../content/analytics-statistics/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('statistics engine reproduces every numeric answer key', () => {
  it('lesson 34: descriptive statistics', () => {
    expect(S.mean([12, 15, 9, 20, 14])).toBe(ans('l34q2'));
    near(S.sampleSd([4, 8, 6, 5, 7]), ans('l34q3'));
    near(S.sampleVariance([4, 8, 6, 5, 7]), 2.5, 9);
    near(S.zScore(85, 70, 10), ans('l34q4'));
    near(S.coefficientOfVariation(10, 50) * 100, ans('l34q5'));
    expect(S.mean([10, 12, 13, 15, 100])).toBe(30);
    expect(S.median([10, 12, 13, 15, 100])).toBe(13);
    expect(S.median([1, 2, 3, 4])).toBe(2.5);
    // dividing by n instead of n - 1 would give 1.41, the stated common mistake
    near(Math.sqrt(10 / 5), 1.41);
  });

  it('lesson 35: probability', () => {
    near(0.5 * 0.4, 0.2, 9);
    near((0.3 + 0.2) * 100, ans('l35q2'));
    near(S.expectedValue([0, 100, 200], [0.5, 0.3, 0.2]), ans('l35q3'));
    near(S.posteriorGivenPositive(0.02, 0.95, 0.1) * 100, ans('l35q4'));
    near(S.binomialPmf(5, 2, 0.1) * 100, ans('l35q5'));
    near(S.posteriorGivenPositive(0.02, 0.95, 0.1) / 0.02, 8.1, 1); // flag raises probability about eightfold
    near(S.conditional(0.019, 0.117), 0.1624, 3);
  });

  it('lesson 36: inference', () => {
    near(S.standardError(20, 100), ans('l36q2'));
    near(S.marginOfError(1.5), ans('l36q3'));
    near(S.zStatistic(52, 50, 1), ans('l36q4'));
    expect(S.requiredSampleSize(10, 2)).toBe(ans('l36q5'));
    near((1.96 * 10) / 2, 9.8, 9);
    near(S.twoSidedP(2), 0.0455, 3);
    const z = S.twoProportionZ(200, 2_000, 240, 2_000);
    near(z, 2.02);
    near(S.twoSidedP(z), 0.043, 3);
    near(52 - S.marginOfError(S.standardError(10, 100)), 50.04);
    near(52 + S.marginOfError(S.standardError(10, 100)), 53.96);
  });

  it('lesson 37: regression and forecasting', () => {
    const fit = S.linearRegression([1, 2, 3, 4, 5], [3, 5, 7, 10, 12]);
    near(fit.slope, ans('l37q3'));
    near(fit.intercept, 0.5);
    near(fit.intercept + fit.slope * 6, ans('l37q2'));
    near(fit.r2, 0.994, 3);
    near(S.exponentialSmoothing(120, 130, 0.3), ans('l37q4'));
    near(S.mape([100, 200], [90, 220]), ans('l37q5'));
    expect(S.movingAverageForecast([100, 110, 120, 130], 3)).toBe(120);
  });
});
