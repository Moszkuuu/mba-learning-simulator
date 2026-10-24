import { describe, it, expect } from 'vitest';
import * as A from './accounting';
import { NEW_QUESTION_KEYS } from '../../content/financial-accounting/keys-new';

const ans = (id: string): number => {
  const k = NEW_QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);
const layers = [{ units: 100, cost: 10 }, { units: 200, cost: 12 }, { units: 200, cost: 14 }];

describe('accounting engine reproduces every numeric answer key', () => {
  it('accounting equation and double entry', () => {
    near(A.equityFromEquation(250_000, 90_000), ans('l47q2'));
    near(A.closingEquity(A.equityFromEquation(120_000, 45_000), 15_000, 5_000), ans('l47q3'));
    near(40_000 - 10_000, ans('l47q4'));
    near(40_000 + 25_000 + 15_000, ans('l48q2'));
    near(80_000 - 20_000 - 45_000, ans('l48q3'));
    near(5_400 - 4_500, ans('l48q5'));
    expect(A.isBalanced([{ account: 'a', debit: 98_000 }, { account: 'b', credit: 98_000 }])).toBe(true);
  });
  it('accruals', () => {
    near(A.monthlyShare(1_200, 12, 3), ans('l49q2'));
    near(1_200 - A.monthlyShare(1_200, 12, 3), ans('l49q3'));
    near(95_000 - 60_000, ans('l49q4'));
    near(A.monthlyShare(2_400, 12, 2), ans('l50q2'));
    near(A.accruedFraction(6_000, 3, 5), ans('l50q3'));
    near(A.allowance(250_000, 0.02), ans('l50q4'));
    near(40_000 - 3_600 - 400 - 5_000, ans('l50q5'));
  });
  it('inventory', () => {
    near(A.weightedAverage(layers, 300).unitCost, ans('l51q2'));
    near(A.fifo(layers, 300).cogs, ans('l51q3'));
    near(A.lifo(layers, 300).cogs, ans('l51q4'));
    near(A.lifo(layers, 300).cogs - A.fifo(layers, 300).cogs, ans('l51q5'));
    near(A.netRealisableValue(55, 8), ans('l52q2'));
    near(A.inventoryWriteDown(50, 47, 100), ans('l52q3'));
    near(8_000, ans('l52q4'));
    near(120_000 - 8_000, ans('l52q5'));
  });
  it('long-lived assets', () => {
    near(A.straightLine(100_000, 10_000, 5), ans('l53q2'));
    near(A.doubleDeclining(100_000, 10_000, 5, 2), ans('l53q3'));
    near(A.unitsOfProduction(100_000, 10_000, 200_000, 30_000), ans('l53q4'));
    near(A.gainOnDisposal(50_000, A.bookValueSL(100_000, 10_000, 5, 3)), ans('l53q5'));
  });
  it('debt and equity', () => {
    near(150_000 + 45_000 - 15_000, ans('l54q2'));
    near(A.loanPayment(100_000, 0.08, 5), ans('l54q3'));
    near(A.interestForPeriod(100_000, 0.08), ans('l54q4'));
    near(A.debtToEquity(300_000, 600_000), ans('l54q5'));
    near(A.interestCoverage(120_000, 40_000), 3);
  });
  it('ratios', () => {
    near(A.currentRatio(450_000, 300_000), ans('l55q2'));
    near(A.quickRatio(450_000, 150_000, 300_000), ans('l55q3'));
    near(A.roe(80_000, 400_000), ans('l55q4'));
    near(A.dupont(80_000, 1_000_000, 800_000, 400_000).multiplier, ans('l55q5'));
    near(A.dupont(80_000, 1_000_000, 800_000, 400_000).roe, 0.2);
    near(A.growthPct(900_000, 1_080_000), ans('l56q2'));
    near(A.commonSizePct(1_080_000 - 702_000, 1_080_000), ans('l56q3'));
    near(A.commonSizePct(150_000, 1_080_000), ans('l56q4'));
    near(A.interestCoverage(120_000, 40_000), ans('l56q5'));
    near(A.daysOutstanding360(150_000, 900_000), 60);
    near(A.daysOutstanding360(225_000, 1_080_000), 75);
  });
  it('earnings quality and policy comparison', () => {
    near(A.cashConversion(40_000, 100_000), ans('l57q2'));
    near(A.totalAccruals(100_000, 40_000), ans('l57q3'));
    near(A.growthPct(150_000, 210_000) - A.growthPct(900_000, 990_000), ans('l57q4'));
    near(A.cashConversion(85, 80), 1.0625, 3);
    near(A.cashConversion(70, 95), 0.7368, 3);
    near(A.cashConversion(45, 110), 0.4091, 3);
    near(A.fifoInventory(150_000, 30_000), ans('l58q2'));
    near(A.fifoCogs(600_000, 10_000), ans('l58q3'));
    near(90_000 + 10_000, ans('l58q4'));
    near(A.straightLine(1_000_000, 0, 5) - A.straightLine(1_000_000, 0, 10), ans('l58q5'));
    near(110_000 - A.straightLine(1_000_000, 0, 5) + A.straightLine(1_000_000, 0, 10), 10_000);
  });
});
