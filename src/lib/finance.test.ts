import { describe, it, expect } from 'vitest';
import * as F from './finance';
import { parseNumericInput, isWithinTolerance } from './numeric';

describe('income statement formulas', () => {
  it('gross profit and margin', () => {
    expect(F.grossProfit(800_000, 520_000)).toBe(280_000);
    expect(F.grossMarginPct(800_000, 520_000)).toBeCloseTo(35, 10);
    expect(F.grossMarginPct(0, 0)).toBeNaN();
  });
  it('COGS from inventory', () => {
    expect(F.cogsFromInventory(120_000, 340_000, 95_000)).toBe(365_000);
  });
  it('operating and net profit', () => {
    expect(F.operatingProfit(420_000, 300_000)).toBe(120_000);
    expect(F.operatingMarginPct(120_000, 1_200_000)).toBeCloseTo(10, 10);
    expect(F.netProfit(120_000, 20_000, 0.25)).toBe(75_000);
    expect(F.netMarginPct(75_000, 1_200_000)).toBeCloseTo(6.25, 10);
    expect(F.netProfit(-10_000, 5_000, 0.25)).toBe(-15_000); // no tax credit on losses
  });
});

describe('working capital formulas', () => {
  it('DSO / DPO / DIO', () => {
    expect(F.dso(400_000, 200_000, 30)).toBe(60);
    expect(F.dso(1_000_000, 7_300_000, 365)).toBeCloseTo(50, 10);
    expect(F.dpo(450_000, 1_350_000, 90)).toBeCloseTo(30, 10);
    expect(F.dio(300_000, 130_000, 30)).toBeCloseTo(69.23, 2);
  });
  it('collections', () => {
    expect(F.cashCollections(500_000, 220_000, 260_000)).toBe(460_000);
  });
  it('turnover, trade working capital and CCC', () => {
    expect(F.inventoryTurnover(2_400_000, 400_000)).toBe(6);
    expect(F.tradeWorkingCapital(310_000, 275_000, 190_000)).toBe(395_000);
    expect(F.cashConversionCycle(45, 38, 30)).toBe(53);
    expect(F.netWorkingCapital(500, 300)).toBe(200);
  });
});

describe('cash flow', () => {
  it('indirect method', () => {
    expect(F.operatingCashFlowIndirect({ netIncome: 90_000, depreciation: 20_000, changeInAR: 50_000, changeInInventory: 30_000, changeInAP: 25_000 })).toBe(55_000);
    expect(F.operatingCashFlowIndirect({ netIncome: 120_000, depreciation: 35_000, changeInAR: 40_000, changeInInventory: -10_000, changeInAP: 15_000 })).toBe(140_000);
    expect(F.operatingCashFlowIndirect({ netIncome: 75_000, changeInAR: 90_000, changeInInventory: 20_000, changeInAP: 10_000 })).toBe(-25_000);
  });
  it('direct method', () => {
    expect(F.operatingCashFlowDirect(640_000, 410_000, 160_000, 10_000)).toBe(60_000);
  });
});

describe('break-even', () => {
  it('units and revenue', () => {
    expect(F.contributionMarginPerUnit(20, 13)).toBe(7);
    expect(F.contributionMarginRatio(20, 13)).toBeCloseTo(0.35, 10);
    expect(F.breakEvenUnits(60_000, 20, 13)).toBeCloseTo(8571.43, 2);
    expect(F.breakEvenUnits(100_000, 50, 30)).toBe(5_000);
    expect(F.breakEvenUnits(80_000, 25, 15, 20_000)).toBe(10_000);
    expect(F.breakEvenUnits(1, 10, 12)).toBeNaN();
    expect(F.breakEvenRevenue(240_000, 0.4)).toBe(600_000);
    expect(F.marginOfSafetyPct(12_000, 9_000)).toBe(25);
  });
});

describe('numeric input handling', () => {
  it('parses common formats', () => {
    expect(parseNumericInput('$1,234.50')).toBe(1234.5);
    expect(parseNumericInput('35%')).toBe(35);
    expect(parseNumericInput(' 60 days')).toBe(60);
    expect(parseNumericInput('(25,000)')).toBe(-25_000);
    expect(parseNumericInput('-25000')).toBe(-25_000);
  });
  it('rejects invalid input', () => {
    for (const bad of ['', 'abc', '1.2.3', '12e', '--5', 'Infinity', '$']) expect(parseNumericInput(bad)).toBeNull();
  });
  it('applies rounding tolerance', () => {
    expect(isWithinTolerance(158_000, 157_500, 'usd')).toBe(true);
    expect(isWithinTolerance(170_000, 157_500, 'usd')).toBe(false);
    expect(isWithinTolerance(33.3, 33.333, 'pct')).toBe(true);
    expect(isWithinTolerance(34, 33.333, 'pct')).toBe(false);
  });
});
