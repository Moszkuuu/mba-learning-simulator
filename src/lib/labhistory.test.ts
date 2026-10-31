import { describe, expect, it } from 'vitest';
import { emptyProgress } from './progress';
import { createBackup, parseBackup, serializeBackup } from './backup';
import { syncProgress, type CloudData, type CloudRow, type CloudStore } from './cloud/sync';
import { emptyLab, labKey, loadLab, mergeLab, saveLab, type LabState, type LabSubmission } from './lab';
import { labEn } from '../lab/text-en';
import { labTh } from '../lab/text-th';
import { en } from '../i18n/en';
import { th } from '../i18n/th';

// A Thai Beginner student's submission made BEFORE the word-count fix: all six numbers right (25) but the self-assessed points were
// capped to 0 by the old space-based length check. It is a historical fact of what the student was shown and must never be rewritten.
const OLD_THAI: LabSubmission = { at: '2026-10-20T08:00:00.000Z', level: 'beginner', verified: 25, self: 0, total: 25, correctIds: ['ocf', 'dso', 'dio', 'dpo', 'ccc2', 'release'] };
const OLD_EN: LabSubmission = { at: '2026-10-21T08:00:00.000Z', level: 'beginner', verified: 12.5, self: 40.5, total: 53, correctIds: ['dso', 'dpo', 'ccc2'], updatedAt: '2026-10-21T08:10:00.000Z' };
const NEW_THAI: LabSubmission = { at: '2026-10-31T08:00:00.000Z', level: 'beginner', verified: 25, self: 75, total: 100, correctIds: ['ocf', 'dso', 'dio', 'dpo', 'ccc2', 'release'] };
const lab = (subs: LabSubmission[]): LabState => ({ ...emptyLab(), submissions: subs });

function cloud(initial: CloudData | null) {
  let row: CloudRow | null = initial ? { data: JSON.parse(JSON.stringify(initial)), revision: 1 } : null;
  const store: CloudStore = {
    fetch: async () => (row ? { data: JSON.parse(JSON.stringify(row.data)), revision: row.revision } : null),
    insert: async (d) => { if (row) return 'conflict'; row = { data: JSON.parse(JSON.stringify(d)), revision: 1 }; return 'ok'; },
    update: async (d, rev) => { if (!row || row.revision !== rev) return 'conflict'; row = { data: JSON.parse(JSON.stringify(d)), revision: rev + 1 }; return 'ok'; },
  };
  return { store, row: () => row };
}
const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } }; };

describe('historical Lab submissions keep their original scores', () => {
  it('after a save and reload in the browser (guest or signed in)', () => {
    const s = memory();
    const key = labKey('mba-learning-simulator:v1');
    expect(saveLab(s, key, lab([OLD_THAI, OLD_EN]))).toBe(true);
    const back = loadLab(s, key);
    expect(back.submissions).toEqual([OLD_THAI, OLD_EN]);
    expect(back.submissions[0]).toMatchObject({ verified: 25, self: 0, total: 25 });
  });

  it('after merging with a newer submission made with the corrected rule (two devices, or one device before and after the update)', () => {
    const m = mergeLab(lab([OLD_THAI, OLD_EN]), lab([NEW_THAI]));
    expect(m.submissions).toHaveLength(3);
    expect(m.submissions.find((x) => x.at === OLD_THAI.at)).toEqual(OLD_THAI);
    expect(m.submissions.find((x) => x.at === OLD_EN.at)).toEqual(OLD_EN);
    expect(m.submissions.find((x) => x.at === NEW_THAI.at)).toEqual(NEW_THAI);
  });

  it('through cloud sync for a signed-in user, including a second device', async () => {
    const c = cloud(null);
    await syncProgress(emptyProgress(), c.store, 'merge', lab([OLD_THAI, OLD_EN]));
    const second = await syncProgress(emptyProgress(), c.store, 'merge', lab([NEW_THAI]));
    expect(second.lab!.submissions).toHaveLength(3);
    const again = await syncProgress(emptyProgress(), c.store, 'merge', emptyLab());
    expect(again.lab!.submissions.find((x) => x.at === OLD_THAI.at)).toEqual(OLD_THAI);
    expect(again.lab!.submissions.find((x) => x.at === NEW_THAI.at)).toEqual(NEW_THAI);
  });

  it('through export and import of a backup file', () => {
    const r = parseBackup(serializeBackup(emptyProgress(), new Date('2026-10-31T00:00:00Z'), lab([OLD_THAI, OLD_EN, NEW_THAI])));
    expect(r.ok && r.lab && r.lab.submissions).toEqual([OLD_THAI, OLD_EN, NEW_THAI]);
    expect(Object.keys(createBackup(emptyProgress(), new Date(), lab([OLD_THAI])))).toContain('lab');
  });
});

describe('number-problem messages exist in both languages', () => {
  it('has Lab and app messages in English and Thai, and the Thai ones are Thai', () => {
    const thai = /[฀-๿]/;
    for (const t of [labEn.numberProblem.ambiguous, labEn.numberProblem.invalid, en['num.ambiguous']]) { expect(t.length).toBeGreaterThan(20); expect(thai.test(t)).toBe(false); }
    for (const t of [labTh.numberProblem.ambiguous, labTh.numberProblem.invalid, th['num.ambiguous']]) { expect(t.length).toBeGreaterThan(20); expect(thai.test(t)).toBe(true); }
    expect(labEn.numberProblem.ambiguous).toBe(en['num.ambiguous']);
    expect(labTh.numberProblem.ambiguous).toBe(th['num.ambiguous']);
  });
});
