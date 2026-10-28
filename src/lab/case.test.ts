import { describe, expect, it } from 'vitest';
import { CHECKS, DIVIDEND_Y2, CAPEX_Y2, FIELDS, RUBRIC, VERIFIED_POINTS, Y1, Y2, ccc, cashFromDso, dio, dpo, dso, equity, netProfit, ocfY2, operatingProfit, totalAssets, tradeWorkingCapital } from './case';
import { ALL_LESSON_KEYS } from '../content';

describe('Consulting Lab case: Maple Garden Supply (fictional)', () => {
  it('has balanced statements in both years', () => {
    expect(equity(Y1)).toBe(1_100_000);
    expect(equity(Y2)).toBe(1_262_500);
    expect(totalAssets(Y1)).toBe(1_850_000);
    expect(totalAssets(Y2)).toBe(2_880_000);
    expect(Y2.payables + Y2.debt + equity(Y2)).toBe(totalAssets(Y2));
  });

  it('shows a growing profit and a large cash outflow, reconciled three ways', () => {
    expect(operatingProfit(Y1)).toBe(340_000);
    expect(operatingProfit(Y2)).toBe(440_000);
    expect(netProfit(Y1)).toBe(225_000);
    expect(netProfit(Y2)).toBe(262_500);
    expect(ocfY2()).toBe(-647_500);
    // Equity rolls forward: opening + profit - dividend.
    expect(equity(Y1) + netProfit(Y2) - DIVIDEND_Y2).toBe(equity(Y2));
    // Equipment rolls forward: opening + purchases - depreciation.
    expect(Y1.equipment + CAPEX_Y2 - Y2.depreciation).toBe(Y2.equipment);
    // Cash bridge: operating + investing + financing = change in cash, with new borrowing as the balancing flow.
    const newBorrowing = Y2.debt - Y1.debt;
    expect(ocfY2() - CAPEX_Y2 + newBorrowing - DIVIDEND_Y2).toBe(Y2.cash - Y1.cash);
  });

  it('has the working-capital days the briefing relies on', () => {
    expect([dso(Y1), dio(Y1), dpo(Y1), ccc(Y1)].map((x) => x.toFixed(1))).toEqual(['45.6', '52.1', '45.6', '52.1']);
    expect([dso(Y2), dio(Y2), dpo(Y2), ccc(Y2)].map((x) => x.toFixed(1))).toEqual(['75.0', '81.9', '40.0', '116.9']);
    expect(tradeWorkingCapital(Y2) - tradeWorkingCapital(Y1)).toBe(1_050_000);
    expect(Math.round(cashFromDso(15))).toBe(230_137);
    // The covenant (debt / equity at most 1.0) leaves almost no room: 75,000.
    expect(equity(Y2) - Y2.debt).toBe(75_000);
    expect(Y2.debt / equity(Y2)).toBeLessThan(1);
    expect(Math.round(tradeWorkingCapital(Y2) * 0.3)).toBe(480_000);
  });

  it('every level has six checks once the consistency check is added, and the rubric totals 100', () => {
    expect(CHECKS.beginner.length).toBe(6);
    expect(CHECKS.intermediate.length + 1).toBe(6);
    expect(CHECKS.advanced.length + 1).toBe(6);
    expect(VERIFIED_POINTS + RUBRIC.reduce((s, r) => s + r.points, 0)).toBe(100);
    for (const l of ['beginner', 'intermediate', 'advanced'] as const) expect(FIELDS[l].length).toBeGreaterThan(0);
  });

  it('points every check at lessons that exist', () => {
    const ids = new Set(ALL_LESSON_KEYS.map((l) => l.id));
    for (const level of Object.values(CHECKS)) for (const c of level) for (const l of c.lessons) expect(ids.has(l), `${c.id} -> ${l}`).toBe(true);
  });
});
