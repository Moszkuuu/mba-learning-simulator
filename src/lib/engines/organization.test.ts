import { describe, it, expect } from 'vitest';
import * as O from './organization';
import { QUESTION_KEYS } from '../../content/organizational-behavior/keys';

const ans = (id: string): number => {
  const k = QUESTION_KEYS.find((q) => q.id === id);
  if (!k || k.type !== 'numeric') throw new Error(`no numeric key ${id}`);
  return k.answer;
};
const near = (a: number, b: number, d = 2) => expect(a).toBeCloseTo(b, d);

describe('organizational behaviour engine reproduces every numeric answer key', () => {
  it('lesson 30: motivation', () => {
    near(O.motivationalForce(0.9, 0.6, 5), ans('l30q2'));
    near(O.motivationalForce(0.8, 0.5, 6), 2.4);
    near(O.motivationalForce(0.8, 0.9, 6), 4.32);
    expect(O.outcomeInputRatio(2_000, 40)).toBe(ans('l30q3'));
    near(O.outcomeInputRatio(2_000, 40) / O.outcomeInputRatio(3_000, 50), ans('l30q4'));
    // written case
    near(O.motivationalForce(0.8, 0.2, 6), 0.96);
    near(O.motivationalForce(0.8, 0.7, 6), 3.36);
    expect(O.motivationalForce(0.8, 0, 6)).toBe(0); // a zero term gives zero motivation
  });

  it('lesson 31: teams', () => {
    expect(O.communicationLinks(8)).toBe(ans('l31q2'));
    expect(O.communicationLinks(12)).toBe(ans('l31q3'));
    near(O.communicationLinks(10) / O.communicationLinks(5), ans('l31q4'));
    expect(O.communicationLinks(6)).toBe(15);
    expect(O.communicationLinks(10)).toBe(45);
    near(O.communicationLinks(10) / O.communicationLinks(6), 3);
    expect(2 * O.communicationLinks(6)).toBe(30);
    near((1 - 30 / O.communicationLinks(12)) * 100, 54.5, 1);
  });

  it('lesson 32: leadership and span of control', () => {
    expect(O.managersNeeded(64, 4)).toBe(ans('l32q2'));
    expect(O.managersNeeded(512, 8)).toBe(ans('l32q3'));
    expect(O.hierarchyLevels(512, 8)).toBe(ans('l32q4'));
    expect((512 - 1) / (8 - 1)).toBe(73);
    expect((64 - 1) / (4 - 1)).toBe(21);
    expect(O.managersNeeded(64, 8)).toBe(9);
    expect(O.managersNeeded(64, 4) / O.managersNeeded(64, 8)).toBeGreaterThan(2);
  });

  it('lesson 33: change', () => {
    expect(O.totalForce([8, 6, 5])).toBe(ans('l33q2'));
    expect(O.netForce([8, 6, 5], [7, 6, 4, 3])).toBe(ans('l33q3'));
    expect(O.totalForce([7, 6, 4, 3]) - 16).toBe(ans('l33q4'));
    expect(O.netForce([8, 6, 5], [3, 2, 4, 3])).toBe(7);
  });
});
