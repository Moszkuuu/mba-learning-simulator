import { describe, it, expect } from 'vitest';
import * as O from './operations';
import { QUESTION_KEYS } from '../../content/operations/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('operations engine reproduces every numeric answer key', () => {
  it('lesson 22: process analysis', () => {
    near(O.stepCapacityPerHour(8), ans('l22q2'));
    const caps = [4, 6, 5].map((m) => O.stepCapacityPerHour(m));
    expect(caps.map((c) => Math.round(c * 100) / 100)).toEqual([15, 10, 12]);
    expect(O.processCapacity(caps)).toBe(ans('l22q3'));
    expect(O.bottleneckIndex(caps)).toBe(1);
    expect(O.littleFlowTime(90, 30)).toBe(ans('l22q4'));
    near(O.utilization(10, 12) * 100, ans('l22q5'));
    near(O.littleWip(10, 0.25), 2.5);
    // relieving the bottleneck: second worker at step 2
    const after = [O.stepCapacityPerHour(4), O.stepCapacityPerHour(6, 2), O.stepCapacityPerHour(5)];
    expect(O.processCapacity(after)).toBe(12);
    expect(O.bottleneckIndex(after)).toBe(2);
    // l22q6: doubling a non-bottleneck leaves output at 10
    expect(O.processCapacity([30, 10, 12])).toBe(10);
  });

  it('lesson 23: inventory models', () => {
    near(O.eoq(4_000, 50, 2.5), ans('l23q2'));
    near(O.annualInventoryCost(4_000, 400, 50, 2.5), ans('l23q3'));
    expect(O.annualOrderingCost(4_000, 400, 50)).toBe(O.annualHoldingCost(400, 2.5)); // equal at EOQ
    expect(O.reorderPoint(40, 5)).toBe(ans('l23q4'));
    expect(Math.round(O.safetyStock(1.65, 20))).toBe(ans('l23q5'));
    near(O.eoq(12_000, 100, 6), 632.46);
    near(O.annualInventoryCost(12_000, O.eoq(12_000, 100, 6), 100, 6), 3_794.73);
    near(O.demandStdDuringLeadTime(8, 5), 17.89);
    near(O.reorderPoint(40, 5, O.safetyStock(1.65, O.demandStdDuringLeadTime(8, 5))), 229.5, 1);
    // l23q6
    near(O.eoq(4_000, 12.5, 2.5), 200, 9);
    expect(4_000 / 200).toBe(20);
    // cost curve is flat near the optimum: 10% off EOQ costs ~0.5% more
    const best = O.annualInventoryCost(4_000, 400, 50, 2.5);
    expect(O.annualInventoryCost(4_000, 440, 50, 2.5) / best - 1).toBeLessThan(0.006);
  });

  it('lesson 24: queues', () => {
    near(O.mm1(6, 8).rho * 100, ans('l24q2'));
    near(O.mm1(8, 10).L, ans('l24q3'));
    near(O.mm1(8, 10).W * 60, ans('l24q4'));
    near(O.mm1(8, 12).L, ans('l24q5'));
    near(O.mm1(8, 10).Lq, 3.2);
    near(O.mm1(8, 10).Wq * 60, 24);
    near(O.mm1(8, 12).W * 60, 15);
    near(O.mm1(10, 20).L, 1);
    near(O.mm1(19, 20).L, 19);
    expect(() => O.mm1(10, 10)).toThrow();
  });

  it('lesson 25: quality', () => {
    near(O.dpmo(25, 5_000, 4), ans('l25q2'));
    near(O.processCapability(10.3, 9.7, 0.05), ans('l25q3'));
    near(O.processCapabilityIndex(10.3, 9.7, 10.05, 0.05), ans('l25q4'));
    expect(O.controlLimits(50, 2, 4)).toEqual({ lcl: 47, ucl: ans('l25q5') });
    // l25q6: an off-centre process has Cpk below Cp
    expect(O.processCapabilityIndex(10.3, 9.7, 10.05, 0.05)).toBeLessThan(O.processCapability(10.3, 9.7, 0.05));
  });
});
