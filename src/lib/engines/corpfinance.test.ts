import { describe, it, expect } from 'vitest';
import * as F from './corpfinance';
import { QUESTION_KEYS } from '../../content/corporate-finance/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('corporate finance engine reproduces every numeric answer key', () => {
  it('lesson 11: time value of money', () => {
    near(F.futureValue(10_000, 0.08, 5), 14_693.28);
    near(F.annuityPV(2_000, 0.1, 6), 8_710.52);
    near(F.futureValue(5_000, 0.06, 3), ans('l11q2'));
    near(F.presentValue(20_000, 0.09, 4), ans('l11q3'), 1);
    near(F.annuityPV(12_000, 0.08, 5), ans('l11q4'));
    near(F.perpetuityPV(3_000, 0.075), ans('l11q5'));
    near(F.effectiveAnnualRate(0.12, 12), 0.1268, 4);
    expect(F.effectiveAnnualRate(0.12, 12)).toBeGreaterThan(0.125); // bank A costs more than bank B
    expect(F.annuityFactor(0, 5)).toBe(5);
  });

  it('lesson 12: investment appraisal', () => {
    const w = [-100_000, 40_000, 50_000, 60_000];
    near(F.npv(0.1, w), 22_764.84);
    near(F.paybackPeriod(w), 2.17);
    near(F.irr(w), 0.2165, 3);
    expect(F.npv(0.2, w)).toBeGreaterThan(0);
    expect(F.npv(0.22, w)).toBeLessThan(0);
    expect(F.paybackPeriod([-90_000, 30_000, 30_000, 30_000])).toBe(ans('l12q2'));
    near(F.npv(0.1, [-50_000, 30_000, 30_000]), ans('l12q3'));
    near(F.npv(0.12, [-100_000, 30_000, 30_000, 30_000, 30_000, 30_000]), ans('l12q4'));
    // NPV is positive at a rate below the IRR (l12q5)
    const proj = [-100_000, 60_000, 60_000, 30_000];
    expect(F.npv(0.1, proj)).toBeGreaterThan(0);
    expect(F.paybackPeriod([-100, 10])).toBeNaN();
    expect(F.irr([-100, -10])).toBeNaN();
    // written case
    const flows = (cf: number) => [-200_000, cf, cf, cf, cf];
    near(F.npv(0.1, flows(70_000)), 21_890.58);
    near(F.npv(0.1, flows(63_000)), -298.48);
    near(200_000 / F.annuityFactor(0.1, 4), 63_094, 0);
    near(((70_000 - 63_094.16) / 70_000) * 100, 9.9, 1);
  });

  it('lesson 13: cost of capital', () => {
    near(F.afterTaxCostOfDebt(0.08, 0.3) * 100, ans('l13q2'));
    near(F.capm(0.03, 0.9, 0.06) * 100, ans('l13q3'));
    near(F.wacc(700, 300, 0.12, 0.07, 0.2) * 100, ans('l13q4'));
    near(F.capm(0.04, 1.5, 0.05) * 100, ans('l13q5'));
    near(F.capm(0.04, 1.2, 0.05), 0.1);
    near(F.wacc(60, 40, 0.1, 0.06, 0.25), 0.078, 4);
  });

  it('lesson 14: valuation', () => {
    near(F.gordonValue(2.4, 0.1, 0.04), ans('l14q2'));
    near(F.terminalValue(50, 0.09, 0.02), ans('l14q3'));
    near(600 - 150, ans('l14q4'));
    near(80 * 7.5 - 150, ans('l14q4'));
    near(F.presentValue(1_000, 0.1, 5), ans('l14q5'));
    const d = F.dcfEnterpriseValue([100, 110, 121], 0.1, 0.03);
    near(d.pvForecast, 272.73);
    near(d.pvTerminal, 1_337.66);
    near(d.enterpriseValue, 1_610.39);
    near(F.equityFromEnterprise(d.enterpriseValue, 400) / 100, 12.1, 1);
    expect(900 - (300 - 100)).toBe(700); // l14q1
    // written case: terminal growth sensitivity
    near((1.04 / 0.04), 26, 6);
    near((1.03 / 0.05), 20.6, 6);
    near(780 * (20.6 / 26), 618, 0);
    near(220 + 780 * (20.6 / 26), 838, 0);
  });
});
