import { describe, expect, it } from 'vitest';
import { completeness, effectiveSelfPoints, emptyLab, labKey, loadLab, saveLab, thaiFallbackCount, verifiedPoints, verifiedResults, wordCount, type LabState } from './lab';

// The Thai strings are a short, complete Beginner answer, and short mixed-language lines.
const th = {
  why: 'กำไรไปจมอยู่กับลูกค้าที่ยังไม่จ่ายและสต็อกที่ยังขายไม่ออก',
  movers: 'ลูกหนี้กับสินค้าคงเหลือเพิ่มขึ้นมากกว่าสองเท่า และหนี้ธนาคารเพิ่มขึ้น',
  options: 'ตามเก็บหนี้ให้เร็วขึ้น (เสี่ยงเสียลูกค้า) และลดสต็อกที่ขายช้า (เสี่ยงของขาด)',
  first: 'ตามเก็บใบแจ้งหนี้เก่าสุดก่อน',
};
const thAnswers = { 'text.why': th.why, 'text.movers': th.movers, 'text.options': th.options, 'text.first': th.first };
const ratings = { diagnosis: 3, reasoning: 3, recommendations: 3, risk: 3, feasibility: 3, communication: 3 };

describe('wordCount: English behaviour is unchanged', () => {
  it('counts space-separated words exactly as before', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('   \n\t ')).toBe(0);
    expect(wordCount('  one two  three ')).toBe(3);
    expect(wordCount('line one\nline two\ttab')).toBe(5);
    expect(wordCount('supply-chain finance')).toBe(2);
    expect(wordCount('DSO rose to 75.0 days')).toBe(5);
    expect(wordCount('262,500 -647,500 1,187,500')).toBe(3);
    expect(wordCount('It’s “quoted”, isn’t it?')).toBe(4);
  });
  it('gives the same answer as the old rule for any text without Thai', () => {
    const old = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
    for (const s of ['a', 'a b', ' a  b ', 'a b', 'Customers pay in 75 days (was 46); stock 82 vs 52.', '?!', '... ,,,', 'ñandú café über', 'ｆｕｌｌ ｗｉｄｔｈ']) expect(wordCount(s)).toBe(old(s));
  });
  it('very short English answers stay short', () => {
    expect(wordCount('x')).toBe(1);
    expect(wordCount('ok.')).toBe(1);
  });
});

describe('wordCount: Thai is counted in words, not in spaces', () => {
  it('counts a spaceless Thai sentence as many words', () => {
    expect(wordCount(th.why)).toBeGreaterThanOrEqual(10);
    expect(wordCount(th.first)).toBeGreaterThanOrEqual(8);
  });
  it('is zero for empty and whitespace-only input', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('   \n')).toBe(0);
  });
  it('counts very short Thai answers as short', () => {
    expect(wordCount('ก')).toBe(1);
    expect(wordCount('ใช่')).toBeLessThan(3);
    expect(wordCount('ลูกค้า')).toBeLessThan(3);
  });
  it('does not count punctuation that stands between Thai words', () => {
    expect(wordCount('ลูกค้า, ลูกค้า. (ลูกค้า)')).toBe(wordCount('ลูกค้า ลูกค้า ลูกค้า'));
  });
  it('gives the same count for the same Thai text in different Unicode forms', () => {
    expect(wordCount('น้ำ')).toBe(wordCount('น้ํา'));
  });
  it('stays within a sensible range of the English word count for the same content', () => {
    const en = { why: 19, movers: 11, options: 18, first: 5 }; // word counts of the equivalent English answer
    for (const k of Object.keys(en) as (keyof typeof en)[]) {
      const ratio = wordCount(th[k]) / en[k];
      expect(ratio, k).toBeGreaterThanOrEqual(0.7);
      expect(ratio, k).toBeLessThanOrEqual(1.7);
    }
  });
});

describe('wordCount: mixed Thai and English', () => {
  it('counts numbers and Latin finance terms inside Thai as one word each', () => {
    expect(wordCount('262,500')).toBe(1);
    expect(wordCount('DSO')).toBe(1);
    expect(wordCount('DSO เพิ่มจาก 45.6 เป็น 75.0 วัน และ receivables เพิ่ม 650,000')).toBeGreaterThanOrEqual(9);
  });
  it('counts the English part of a mixed answer as English words', () => {
    expect(wordCount('กำไร profit cash flow')).toBeGreaterThanOrEqual(4);
  });
  it('treats text with a single Thai character as Thai text', () => {
    expect(wordCount('customers pay late ก')).toBeGreaterThanOrEqual(4);
  });
});

describe('completeness: a good Thai answer is not marked too short', () => {
  it('passes every Beginner field for the Thai answer', () => {
    expect(completeness('beginner', thAnswers).every((c) => c.ok)).toBe(true);
  });
  it('still fails empty, very short or missing fields', () => {
    expect(completeness('beginner', { ...thAnswers, 'text.first': 'ก' }).find((c) => c.id === 'first')!.ok).toBe(false);
    expect(completeness('beginner', { ...thAnswers, 'text.why': '' }).find((c) => c.id === 'why')!.ok).toBe(false);
    expect(completeness('beginner', {}).every((c) => !c.ok)).toBe(true);
  });
  it('lets the self-assessed points count for a complete Thai answer, and still gives 0 for empty text', () => {
    expect(effectiveSelfPoints('beginner', thAnswers, ratings)).toBe(75);
    expect(effectiveSelfPoints('beginner', {}, ratings)).toBe(0);
  });
  it('gives the English result as before', () => {
    const en = { 'text.why': 'a b c d e f g h i j k', 'text.movers': 'x' };
    expect(completeness('beginner', en).find((c) => c.id === 'why')!.ok).toBe(true);
    expect(completeness('beginner', en).find((c) => c.id === 'movers')!.ok).toBe(false);
    const full = { 'text.why': 'one two three four five six seven eight nine ten', 'text.movers': 'a b c d e', 'text.options': 'a b c d e f g h i j k l', 'text.first': 'a b c d e f g h' };
    expect(effectiveSelfPoints('beginner', full, ratings)).toBe(75);
    expect(effectiveSelfPoints('beginner', { ...full, 'text.first': 'a b c d e f g' }, ratings)).toBe(0);
  });
  it('does not touch the minimums', () => {
    expect(completeness('beginner', {}).map((c) => c.need)).toEqual([10, 5, 12, 8]);
    expect(completeness('intermediate', {}).map((c) => c.need)).toEqual([30, 40, 30, 25, 30]);
    expect(completeness('advanced', {}).map((c) => c.need)).toEqual([150, 15, 15, 10]);
  });
});

describe('existing numerical grading is unchanged by the word count', () => {
  const right = { ocf: '-647,500', dso: '75', dio: '81.9', dpo: '40', ccc2: '116.9', release: '230,100' };
  it('awards the same checked-number points for English and Thai answers alike', () => {
    expect(verifiedPoints(verifiedResults('beginner', right))).toBe(25);
    expect(verifiedPoints(verifiedResults('beginner', { ...right, ocf: '647500', dio: '', release: 'lots' }))).toBe(12.5);
    expect(verifiedPoints(verifiedResults('advanced', {}))).toBe(0);
  });
});

describe('historical submissions are not recalculated', () => {
  const store = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } }; };
  it('keeps the verified, self and total values a Thai student was given before the fix', () => {
    const s = store();
    const key = labKey('mba-learning-simulator:v1:user:abc');
    const state: LabState = { ...emptyLab(), drafts: { beginner: { answers: thAnswers, ratings, reflection: '' } }, submissions: [{ at: '2026-10-28T00:00:00.000Z', level: 'beginner', verified: 20.8, self: 0, total: 20.8, correctIds: ['ocf', 'dso', 'dio', 'dpo', 'ccc2'] }] };
    expect(saveLab(s, key, state)).toBe(true);
    const loaded = loadLab(s, key);
    expect(loaded.submissions).toEqual(state.submissions);
    expect(loaded.submissions[0].self).toBe(0);
  });
});

describe('thaiFallbackCount (used when Intl.Segmenter is missing)', () => {
  it('stays within about 30% of the segmenter and never returns 0 for Thai text', () => {
    for (const t of [th.why, th.movers, th.options]) {
      const ratio = thaiFallbackCount(t) / wordCount(t);
      expect(thaiFallbackCount(t)).toBeGreaterThan(0);
      expect(ratio).toBeGreaterThanOrEqual(0.7);
      expect(ratio).toBeLessThanOrEqual(1.35);
    }
  });
  it('equals the old space count for text without Thai', () => {
    expect(thaiFallbackCount('one two  three')).toBe(3);
  });
});
