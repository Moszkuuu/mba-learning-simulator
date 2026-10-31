import { describe, expect, it } from 'vitest';
import { numericInputProblem, parseNumericInput } from './numeric';
import { verifiedPoints, verifiedResults } from './lab';

describe('parseNumericInput: formats that worked before still work', () => {
  it('parses common formats', () => {
    expect(parseNumericInput('$1,234.50')).toBe(1234.5);
    expect(parseNumericInput('35%')).toBe(35);
    expect(parseNumericInput('35 %')).toBe(35);
    expect(parseNumericInput(' 60 days')).toBe(60);
    expect(parseNumericInput('60days')).toBe(60);
    expect(parseNumericInput('(25,000)')).toBe(-25_000);
    expect(parseNumericInput('( 25000 )')).toBe(-25_000);
    expect(parseNumericInput('-25000')).toBe(-25_000);
    expect(parseNumericInput('+5')).toBe(5);
    expect(parseNumericInput('.5')).toBe(0.5);
    expect(parseNumericInput('5.')).toBe(5);
    expect(parseNumericInput('-$647,500')).toBe(-647_500);
    expect(parseNumericInput('$-647,500')).toBe(-647_500);
    expect(parseNumericInput('75 วัน')).toBe(75);
    expect(parseNumericInput('๗๕วัน')).toBe(75);
  });
  it('still accepts a space after a sign or a currency sign, as before', () => {
    expect(parseNumericInput('- 647,500')).toBe(-647_500);
    expect(parseNumericInput('+ 5')).toBe(5);
    expect(parseNumericInput('- $5')).toBe(-5);
    expect(parseNumericInput('$ 1,234.50')).toBe(1234.5);
    expect(parseNumericInput('-  5')).toBe(-5);
    expect(parseNumericInput('- ')).toBeNull();
    expect(parseNumericInput('- -5')).toBeNull();
  });
  it('reads decimals, negatives and small values exactly', () => {
    expect(parseNumericInput('74.955')).toBe(74.955);
    expect(parseNumericInput('-0.5')).toBe(-0.5);
    expect(parseNumericInput('0.05')).toBe(0.05);
    expect(parseNumericInput('-.5')).toBe(-0.5);
    expect(parseNumericInput('1,234.567')).toBe(1234.567);
    expect(parseNumericInput('−๐.๕')).toBe(-0.5);
    expect(parseNumericInput('(๑,๒๓๔.๕)')).toBe(-1234.5);
    expect(parseNumericInput('0')).toBe(0);
    expect(parseNumericInput('-0')).toBe(-0);
  });
  it('accepts commas and spaces only as thousands separators in groups of three', () => {
    expect(parseNumericInput('1,000')).toBe(1000);
    expect(parseNumericInput('12,345,678')).toBe(12_345_678);
    expect(parseNumericInput('-1,234.5')).toBe(-1234.5);
    expect(parseNumericInput('1 000 000')).toBe(1_000_000);
    expect(parseNumericInput('1 000')).toBe(1000);
  });
  it('rejects invalid input as before', () => {
    for (const bad of ['', '   ', 'abc', '1.2.3', '12e', '--5', 'Infinity', '$', 'x', '%', '5 5 x y', '1e3']) expect(parseNumericInput(bad)).toBeNull();
    expect(parseNumericInput(undefined as unknown as string)).toBeNull();
    expect(parseNumericInput(5 as unknown as string)).toBeNull();
  });
});

describe('parseNumericInput: Thai numerals', () => {
  it('reads Thai digits like ASCII digits', () => {
    expect(parseNumericInput('๖๔๗,๕๐๐')).toBe(647_500);
    expect(parseNumericInput('-๖๔๗,๕๐๐')).toBe(-647_500);
    expect(parseNumericInput('(๖๔๗,๕๐๐)')).toBe(-647_500);
    expect(parseNumericInput('๗๕ วัน')).toBe(75);
    expect(parseNumericInput('๗๕.๐')).toBe(75);
    expect(parseNumericInput('๓๕%')).toBe(35);
    expect(parseNumericInput('๑,๒๓๔.๕๐')).toBe(1234.5);
    expect(parseNumericInput('๐')).toBe(0);
  });
  it('reads Thai and Latin digits mixed in one number', () => {
    expect(parseNumericInput('6๔7')).toBe(647);
  });
  it('reads full-width digits', () => {
    expect(parseNumericInput('７５')).toBe(75);
  });
  it('still rejects Thai text that is not a number', () => {
    for (const bad of ['หกสิบ', 'วัน', 'ประมาณ ๗๕ วันเศษ']) expect(parseNumericInput(bad)).toBeNull();
  });
});

describe('parseNumericInput: Unicode minus signs', () => {
  it('reads minus-like signs as a minus', () => {
    expect(parseNumericInput('−647,500')).toBe(-647_500); // U+2212 minus sign
    expect(parseNumericInput('－5')).toBe(-5); // U+FF0D full-width hyphen-minus
    expect(parseNumericInput('﹣5')).toBe(-5); // U+FE63 small hyphen-minus
    expect(parseNumericInput('–5')).toBe(-5); // U+2013 en dash (typed by word processors)
    expect(parseNumericInput('‒5')).toBe(-5); // U+2012 figure dash
    expect(parseNumericInput('$−5')).toBe(-5);
  });
  it('does not guess when a sign makes no sense', () => {
    for (const bad of ['−', '5−5', '5–10', '−−5', '(−5)', '(-5)', '(+5)']) expect(parseNumericInput(bad), bad).toBeNull();
  });
});

describe('parseNumericInput: ambiguous separators are rejected, never reinterpreted', () => {
  it('rejects a decimal comma', () => {
    for (const bad of ['74,9', '74,90', '0,5', '1,5', '12,34', '100,0', '-74,9', '(74,9)', '๗๔,๙']) {
      expect(parseNumericInput(bad), bad).toBeNull();
      expect(numericInputProblem(bad), bad).toBe('ambiguous-separator');
    }
  });
  it('rejects other groupings that could mean something else', () => {
    for (const bad of ['1,2,3', '1.234,5', '1,23,456', '1234,567', ',500', '1,,000', '74 9', '1 2 3', '1,234 567']) {
      expect(parseNumericInput(bad), bad).toBeNull();
      expect(numericInputProblem(bad), bad).toBe('ambiguous-separator');
    }
  });
  it('never turns "74,9" into 749 or 74.9', () => {
    expect(parseNumericInput('74,9')).not.toBe(749);
    expect(parseNumericInput('74,9')).not.toBe(74.9);
  });
  it('explains why other input is rejected', () => {
    expect(numericInputProblem('')).toBe('empty');
    expect(numericInputProblem('   ')).toBe('empty');
    expect(numericInputProblem('abc')).toBe('not-a-number');
    expect(numericInputProblem('1.2.3')).toBe('not-a-number');
    expect(numericInputProblem('(-5)')).toBe('not-a-number');
    expect(numericInputProblem('75')).toBeNull();
    expect(numericInputProblem('๗๕')).toBeNull();
    expect(numericInputProblem('1,234')).toBeNull();
  });
});

describe('Consulting Lab numerical grading', () => {
  const right = { ocf: '-647,500', dso: '75', dio: '81.9', dpo: '40', ccc2: '116.9', release: '230,100' };
  it('is unchanged for the formats it already accepted', () => {
    expect(verifiedPoints(verifiedResults('beginner', right))).toBe(25);
    expect(verifiedPoints(verifiedResults('beginner', { ...right, ocf: '647500', dio: '', release: 'lots' }))).toBe(12.5);
    expect(verifiedPoints(verifiedResults('beginner', { ...right, ocf: '(647,500)', dso: '75 days', release: '$230,137' }))).toBe(25);
  });
  it('accepts the same correct answers written with Thai digits or a Unicode minus', () => {
    const thai = { ocf: '−๖๔๗,๕๐๐', dso: '๗๕', dio: '๘๑.๙', dpo: '๔๐ วัน', ccc2: '๑๑๖.๙', release: '๒๓๐,๑๐๐' };
    expect(verifiedPoints(verifiedResults('beginner', thai))).toBe(25);
    expect(verifiedResults('beginner', thai).every((r) => r.correct)).toBe(true);
  });
  it('does not credit an ambiguous value and does not guess it', () => {
    const r = verifiedResults('beginner', { ...right, dso: '74,9' }).find((x) => x.id === 'dso')!;
    expect(r.given).toBeNull();
    expect(r.correct).toBe(false);
  });
  it('still marks wrong numbers wrong', () => {
    const wrong = verifiedResults('beginner', { ...right, dso: '50', ocf: '647500' });
    expect(wrong.filter((x) => x.correct).map((x) => x.id)).toEqual(['dio', 'dpo', 'ccc2', 'release']);
  });
});
