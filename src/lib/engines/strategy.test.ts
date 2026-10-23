import { describe, it, expect } from 'vitest';
import * as S from './strategy';
import { QUESTION_KEYS } from '../../content/strategy/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('strategy engine reproduces every numeric answer key', () => {
  it('lesson 26: industry analysis', () => {
    expect(S.concentrationRatio([35, 25, 15, 10, 5], 4)).toBe(ans('l26q2'));
    expect(S.concentrationRatio([40, 30, 20, 10], 2)).toBe(70);
    expect(S.hhi([40, 30, 20, 10])).toBe(ans('l26q3'));
    expect(S.hhiAfterMerger([40, 30, 20, 10], 2, 3)).toBe(ans('l26q4'));
    expect(S.hhiAfterMerger([40, 30, 20, 10], 2, 3) - S.hhi([40, 30, 20, 10])).toBe(2 * 20 * 10);
  });

  it('lesson 27: competitive advantage', () => {
    near(S.experienceCurveCost(100, 0.8, 2), 80);
    near(S.experienceCurveCost(100, 0.8, 4), ans('l27q2'));
    near(S.experienceCurveCost(100, 0.8, 8), ans('l27q3'));
    near(S.requiredPricePremium(80, 50, 60) * 100, ans('l27q4'));
  });

  it('lesson 28: corporate strategy', () => {
    near(S.relativeMarketShare(15, 30), ans('l28q2'));
    near(S.acquirerNetGain(500, 150, 600), ans('l28q3'));
    near(S.maxPremiumPct(500, 150), ans('l28q4'));
    // written case
    const expected = 0.6 * 150 + 0.4 * 30;
    near(expected, 102);
    near(S.acquirerNetGain(500, expected, 600), 2);
    near(S.acquirerNetGain(500, 30, 600), -70);
    near(S.acquirerNetGain(500, 150, 600), 50);
  });

  it('lesson 29: decisions under uncertainty', () => {
    const launch: S.Outcome[] = [{ probability: 0.4, payoff: 500 }, { probability: 0.6, payoff: -200 }];
    near(S.emv(launch), ans('l29q2'));
    near(S.evpi(launch), ans('l29q3'));
    near(S.breakEvenProbability(500, 200) * 100, ans('l29q4'));
    near(S.emvWithPerfectInfo(launch) - 20 - S.emv(launch), ans('l29q6')); // pilot costing 20
  });
});
