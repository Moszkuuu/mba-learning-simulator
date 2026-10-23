import { describe, it, expect } from 'vitest';
import { initialState, simulateMonth, defaultDecision, equityOf, startingEquity, validateDecision, summarize, SIM, demandFor, unitCostFor, receivablesBalance, payablesBalance, type SimState } from './simulation';

function play(decisions: Partial<ReturnType<typeof defaultDecision>>[], s: SimState = initialState()): SimState {
  let state = s;
  for (const d of decisions) if (state.status === 'running') state = simulateMonth(state, { ...defaultDecision(), ...d }).state;
  return state;
}

describe('simulation starting conditions', () => {
  it('matches the brief', () => {
    const s = initialState();
    expect(s.cash).toBe(500_000);
    expect(s.inventoryValue).toBe(300_000);
    expect(receivablesBalance(s)).toBe(400_000); // 60 days of $200k/month revenue
    expect(payablesBalance(s)).toBe(130_000);
    expect((SIM.basePrice - SIM.baseUnitCost) / SIM.basePrice).toBeCloseTo(0.35, 10);
    expect(SIM.baseUnits * SIM.basePrice).toBe(200_000);
    expect(SIM.fixedCosts).toBe(60_000);
  });
});

describe('simulation mechanics', () => {
  it('is deterministic', () => {
    const a = play(Array(12).fill({}));
    const b = play(Array(12).fill({}));
    expect(a).toEqual(b);
    expect(a.status).toBe('completed');
    expect(a.history).toHaveLength(12);
  });

  it('does not mutate the input state', () => {
    const s = initialState();
    const copy = JSON.parse(JSON.stringify(s));
    simulateMonth(s, defaultDecision());
    expect(s).toEqual(copy);
  });

  it('month 1 computes revenue, COGS and cash separately', () => {
    const { result: r } = simulateMonth(initialState(), defaultDecision());
    expect(r.unitsSold).toBe(9_500); // 10,000 x 0.95 January seasonality
    expect(r.revenue).toBe(190_000);
    expect(r.cogs).toBeCloseTo(123_500, 0);
    expect(r.collections).toBe(200_000); // December sales, not January revenue
    expect(r.supplierPayments).toBe(130_000);
    expect(r.closingCash).toBeCloseTo(500_000 + 200_000 - 130_000 - 60_000 - 3_000, 0); // holding cost 1% of $300k
  });

  it('cash identity: change in cash = net profit - change in AR - change in inventory + change in AP', () => {
    const s0 = initialState();
    let state = s0;
    for (let i = 0; i < 12; i++) {
      const prev = state;
      state = simulateMonth(prev, { ...defaultDecision(), priceIndex: 1.05, marketing: 10_000, purchases: 150_000, customerTermsDays: i % 2 ? 30 : 90, supplierTermsDays: 60 }).state;
      const r = state.history[i];
      const dAR = receivablesBalance(state) - receivablesBalance(prev);
      const dInv = state.inventoryValue - prev.inventoryValue;
      const dAP = payablesBalance(state) - payablesBalance(prev);
      expect(r.closingCash - r.openingCash).toBeCloseTo(r.netProfit - dAR - dInv + dAP, 1);
    }
    // equity grows exactly by cumulative net profit
    expect(equityOf(state)).toBeCloseTo(startingEquity() + summarize(state).cumulativeProfit, 0);
  });

  it('never sells more than available stock and never lets inventory go negative', () => {
    const s = play(Array(6).fill({ purchases: 0, priceIndex: 0.8 }));
    for (const m of s.history) {
      expect(m.inventory).toBeGreaterThanOrEqual(0);
      expect(m.unitsSold).toBeLessThanOrEqual(m.demandUnits);
    }
    expect(s.inventoryUnits).toBeGreaterThanOrEqual(0);
    const stockout = s.history.find((m) => m.lostUnits > 0);
    expect(stockout).toBeDefined();
    expect(stockout!.warnings.some((w) => w.code === 'stockout')).toBe(true);
    expect(stockout!.unitsSold).toBeLessThanOrEqual(23_077 + 130_000 / unitCostFor(30) * 6);
  });

  it('higher prices reduce demand (elasticity) and raise unit margin', () => {
    const lo = demandFor(3, { ...defaultDecision(), priceIndex: 0.9 }, 0).units;
    const hi = demandFor(3, { ...defaultDecision(), priceIndex: 1.1 }, 0).units;
    expect(hi).toBeLessThan(lo);
  });

  it('marketing has diminishing returns and carries over', () => {
    const d = defaultDecision();
    const a = demandFor(3, d, 20_000).units - demandFor(3, d, 0).units;
    const b = demandFor(3, d, 40_000).units - demandFor(3, d, 20_000).units;
    expect(a).toBeGreaterThan(b);
    const s1 = simulateMonth(initialState(), { ...d, marketing: 20_000 }).state;
    expect(s1.marketingStock).toBe(20_000);
    expect(simulateMonth(s1, d).state.marketingStock).toBe(10_000);
  });

  it('longer customer terms delay cash but not revenue', () => {
    const fast = simulateMonth(initialState(), { ...defaultDecision(), customerTermsDays: 0 }).result;
    const slow = simulateMonth(initialState(), { ...defaultDecision(), customerTermsDays: 90 }).result;
    expect(fast.collections).toBeGreaterThan(slow.collections);
    expect(slow.accountsReceivable).toBeGreaterThan(fast.accountsReceivable);
    expect(slow.badDebt).toBeGreaterThan(fast.badDebt);
  });

  it('longer supplier terms defer payment at a higher unit cost', () => {
    expect(unitCostFor(60)).toBeGreaterThan(unitCostFor(30));
    expect(unitCostFor(0)).toBeLessThan(unitCostFor(30));
    const short = simulateMonth(initialState(), { ...defaultDecision(), purchases: 200_000, supplierTermsDays: 0 }).result;
    const long = simulateMonth(initialState(), { ...defaultDecision(), purchases: 200_000, supplierTermsDays: 90 }).result;
    expect(long.supplierPayments).toBeLessThan(short.supplierPayments);
    expect(long.accountsPayable).toBeGreaterThan(short.accountsPayable);
  });

  it('flags negative cash with a liquidity warning and charges overdraft interest', () => {
    const s = play([{ purchases: 500_000, supplierTermsDays: 0 }, { purchases: 500_000, supplierTermsDays: 0 }]);
    const r = s.history[1];
    expect(r.closingCash).toBeLessThan(0);
    expect(r.interest).toBeGreaterThan(0);
    expect(r.warnings.some((w) => w.code === 'liquidity')).toBe(true);
  });

  it('defaults when the overdraft limit is breached and refuses further play', () => {
    const s = play(Array(4).fill({ purchases: 500_000, supplierTermsDays: 0 }));
    expect(s.status).toBe('defaulted');
    expect(() => simulateMonth(s, defaultDecision())).toThrow();
  });
});

describe('decision validation', () => {
  it('flags NaN and out-of-range values and returns a safe decision', () => {
    const { decision, errors } = validateDecision({ priceIndex: NaN, marketing: -5, purchases: 9e9, customerTermsDays: 61, supplierTermsDays: 31 });
    expect(errors).toHaveLength(3);
    expect(decision.marketing).toBe(0);
    expect(decision.purchases).toBe(500_000);
    expect(decision.customerTermsDays).toBe(60);
    expect(decision.supplierTermsDays).toBe(30);
  });
  it('accepts valid values', () => {
    expect(validateDecision(defaultDecision()).errors).toEqual([]);
  });
});
