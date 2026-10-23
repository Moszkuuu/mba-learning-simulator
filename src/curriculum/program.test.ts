import { describe, it, expect } from 'vitest';
import { COMPETENCIES, COMPETENCY_PREREQS, REFERENCES, SUBJECTS, UNITS } from './program';

function hasCycle(nodes: string[], edges: [string, string][]): boolean {
  const state = new Map<string, 1 | 2>();
  const visit = (n: string): boolean => {
    if (state.get(n) === 1) return true;
    if (state.get(n) === 2) return false;
    state.set(n, 1);
    for (const [a, b] of edges) if (a === n && visit(b)) return true;
    state.set(n, 2);
    return false;
  };
  return nodes.some(visit);
}

describe('curriculum metadata', () => {
  it('has the twelve required subjects with English and Thai names', () => {
    expect(SUBJECTS).toHaveLength(12);
    SUBJECTS.forEach((s) => { expect(s.name.en.length).toBeGreaterThan(3); expect(/[฀-๿]/.test(s.name.th)).toBe(true); });
  });

  it('subject prerequisites reference real subjects and are acyclic', () => {
    const ids = SUBJECTS.map((s) => s.id);
    const edges: [string, string][] = [];
    for (const s of SUBJECTS) for (const r of [...s.requires, ...s.recommends]) { expect(ids).toContain(r); edges.push([s.id, r]); }
    expect(hasCycle(ids, edges)).toBe(false);
  });

  it('competency prerequisites reference real competencies and are acyclic', () => {
    const ids = COMPETENCIES.map((c) => c.id);
    for (const [a, b] of COMPETENCY_PREREQS) { expect(ids).toContain(a); expect(ids).toContain(b); expect(a).not.toBe(b); }
    expect(hasCycle(ids, COMPETENCY_PREREQS)).toBe(false);
  });

  it('cross-subject competency prerequisites are consistent with subject prerequisites', () => {
    const subjectOf = (id: string) => COMPETENCIES.find((c) => c.id === id)!.subjectId;
    for (const [a, b] of COMPETENCY_PREREQS) {
      const sa = subjectOf(a), sb = subjectOf(b);
      if (sa === sb) continue;
      const s = SUBJECTS.find((x) => x.id === sa)!;
      expect([...s.requires, ...s.recommends], `${a} -> ${b}`).toContain(sb);
    }
  });

  it('every competency and unit belongs to a subject', () => {
    const ids = SUBJECTS.map((s) => s.id);
    COMPETENCIES.forEach((c) => expect(ids).toContain(c.subjectId));
    UNITS.forEach((u) => expect(ids).toContain(u.subjectId));
  });

  it('references have https URLs and descriptions in both languages', () => {
    for (const list of Object.values(REFERENCES)) for (const r of list) {
      expect(r.url).toMatch(/^https:\/\//);
      expect(r.note.en.length).toBeGreaterThan(10);
      expect(r.note.th.length).toBeGreaterThan(10);
    }
  });
});
