import { describe, it, expect } from 'vitest';
import { ALL_LESSON_KEYS, ALL_QUESTION_KEYS, SUBJECT_CONTENT, getAllQuestions, getLessons } from './index';
import { COMPETENCIES, SUBJECTS, UNITS } from '../curriculum/program';
import { GLOSSARY } from './glossary';
import { en } from '../i18n/en';
import { th } from '../i18n/th';
import type { LessonText, QuestionText } from './types';

const numberTokens = (s: string): string[] =>
  (s.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) ?? []).map((x) => x.replace(/,/g, '')).sort();
const flatten = (t: LessonText | QuestionText): string => JSON.stringify(t);
const thai = /[฀-๿]/;
const subjects = Object.entries(SUBJECT_CONTENT);

describe('content integrity', () => {
  it('every programme subject has content, and every lesson has at least five quiz questions', () => {
    expect(Object.keys(SUBJECT_CONTENT).sort()).toEqual(SUBJECTS.map((s) => s.id).sort());
    for (const [id, s] of subjects) expect(s.lessons.length, id).toBeGreaterThanOrEqual(3);
    for (const l of getLessons('en')) expect(l.questions.length, l.id).toBeGreaterThanOrEqual(5);
  });

  it('lesson ids and numbers are unique', () => {
    expect(new Set(ALL_LESSON_KEYS.map((l) => l.id)).size).toBe(ALL_LESSON_KEYS.length);
    expect(new Set(ALL_LESSON_KEYS.map((l) => l.number)).size).toBe(ALL_LESSON_KEYS.length);
  });

  it('has unique question ids and valid keys', () => {
    expect(new Set(ALL_QUESTION_KEYS.map((q) => q.id)).size).toBe(ALL_QUESTION_KEYS.length);
    for (const q of ALL_QUESTION_KEYS) {
      expect(ALL_LESSON_KEYS.some((l) => l.id === q.lessonId), q.id).toBe(true);
      expect(COMPETENCIES.some((c) => c.id === q.competency), q.id).toBe(true);
      expect([1, 2, 3]).toContain(q.level);
      if (q.type === 'mcq') expect(q.correctIndex).toBeLessThan(q.optionCount);
      if (q.type === 'numeric') expect(Number.isFinite(q.answer)).toBe(true);
    }
  });

  it('each lesson belongs to a unit of its own subject and teaches competencies of that subject or a bridge', () => {
    for (const [sid, s] of subjects) {
      for (const l of s.lessons) {
        const unit = UNITS.find((u) => u.id === l.unitId);
        expect(unit?.subjectId, l.id).toBe(sid);
        l.competencies.forEach((c) => expect(COMPETENCIES.some((x) => x.id === c), l.id).toBe(true));
      }
    }
  });

  it('competencies flagged available are exactly the ones that are taught', () => {
    const taught = new Set(ALL_QUESTION_KEYS.map((q) => q.competency));
    for (const c of COMPETENCIES) expect(c.available, c.id).toBe(taught.has(c.id));
  });

  it('every available competency has questions at two or more difficulty levels and at least five items', () => {
    for (const c of COMPETENCIES.filter((x) => x.available)) {
      const qs = ALL_QUESTION_KEYS.filter((q) => q.competency === c.id);
      expect(new Set(qs.map((q) => q.level)).size, c.id).toBeGreaterThanOrEqual(2);
      expect(qs.length, c.id).toBeGreaterThanOrEqual(5);
    }
  });

  it('every lesson contains at least one Level 3 item (advanced reasoning)', () => {
    for (const l of ALL_LESSON_KEYS.filter((x) => x.status !== 'migrated')) {
      expect(ALL_QUESTION_KEYS.some((q) => q.lessonId === l.id && q.level === 3), l.id).toBe(true);
    }
  });

  it('lessons satisfy the lesson-contract fields they claim', () => {
    for (const lang of ['en', 'th'] as const) {
      for (const l of getLessons(lang)) {
        expect(l.objectives.length, l.id).toBeGreaterThanOrEqual(3);
        expect(l.misconceptions.length, l.id).toBeGreaterThanOrEqual(2);
        expect(l.formulas.length, l.id).toBeGreaterThan(0);
        expect(l.workedExamples.length, l.id).toBeGreaterThanOrEqual(1);
        expect(l.explanation.length, l.id).toBeGreaterThanOrEqual(3);
        if (l.status === 'full') expect(l.workedExamples.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('multiple-choice questions explain every option', () => {
    for (const [, s] of subjects) for (const q of s.questions) {
      if (q.type !== 'mcq') continue;
      for (const lang of ['en', 'th'] as const) {
        const opts = s.text[lang].questions[q.id].options ?? [];
        expect(opts.length, q.id).toBe(q.optionCount);
        opts.forEach((o) => expect(o.why.length, q.id).toBeGreaterThan(10));
        expect(new Set(opts.map((o) => o.text)).size, `${q.id} duplicate options`).toBe(opts.length);
      }
    }
  });

  it('written questions have a rubric of the declared size and a model answer', () => {
    for (const [, s] of subjects) for (const q of s.questions) {
      if (q.type !== 'written') continue;
      for (const lang of ['en', 'th'] as const) {
        const text = s.text[lang].questions[q.id];
        expect(text.rubric?.length, q.id).toBe(q.rubricCount);
        expect(text.modelAnswer?.length, q.id).toBeGreaterThan(50);
      }
    }
  });
});

describe('English / Thai equivalence', () => {
  it('both languages cover exactly the same lessons and questions in every subject', () => {
    for (const [id, s] of subjects) {
      for (const lang of ['en', 'th'] as const) {
        expect(Object.keys(s.text[lang].lessons).sort(), `${id} lessons ${lang}`).toEqual(s.lessons.map((l) => l.id).sort());
        expect(Object.keys(s.text[lang].questions).sort(), `${id} questions ${lang}`).toEqual(s.questions.map((q) => q.id).sort());
      }
    }
  });

  it('question text has identical structure in both languages', () => {
    for (const [, s] of subjects) for (const k of s.questions) {
      const e = s.text.en.questions[k.id];
      const t = s.text.th.questions[k.id];
      expect(!!t.scenario, `${k.id} scenario`).toBe(!!e.scenario);
      expect(!!t.commonMistake, `${k.id} commonMistake`).toBe(!!e.commonMistake);
      expect(t.options?.length, `${k.id} options`).toBe(e.options?.length);
      expect(t.rubric?.length, `${k.id} rubric`).toBe(e.rubric?.length);
    }
  });

  it('lesson text has identical structure in both languages', () => {
    for (const [, s] of subjects) for (const l of s.lessons) {
      const e = s.text.en.lessons[l.id];
      const t = s.text.th.lessons[l.id];
      expect(t.objectives.length, l.id).toBe(e.objectives.length);
      expect(t.explanation.length, l.id).toBe(e.explanation.length);
      expect(t.formulas.length, l.id).toBe(e.formulas.length);
      expect(t.misconceptions.length, l.id).toBe(e.misconceptions.length);
      expect(t.workedExamples.length, l.id).toBe(e.workedExamples.length);
      t.workedExamples.forEach((w, i) => {
        expect(w.given.length, l.id).toBe(e.workedExamples[i].given.length);
        expect(w.steps.length, l.id).toBe(e.workedExamples[i].steps.length);
      });
    }
  });

  it('every number in the English text appears identically in the Thai text', () => {
    for (const [, s] of subjects) {
      for (const k of s.questions) expect(numberTokens(flatten(s.text.th.questions[k.id])), `question ${k.id}`).toEqual(numberTokens(flatten(s.text.en.questions[k.id])));
      for (const l of s.lessons) expect(numberTokens(flatten(s.text.th.lessons[l.id])), `lesson ${l.id}`).toEqual(numberTokens(flatten(s.text.en.lessons[l.id])));
    }
  });

  it('Thai text is actually Thai (not copied English)', () => {
    for (const [, s] of subjects) {
      for (const k of s.questions) {
        const t = s.text.th.questions[k.id];
        expect(thai.test(t.prompt) && thai.test(t.concept), k.id).toBe(true);
        if (/[A-Za-z]{4,}/.test(s.text.en.questions[k.id].explanation)) expect(thai.test(t.explanation), k.id).toBe(true);
      }
      for (const l of s.lessons) {
        const t = s.text.th.lessons[l.id];
        expect(thai.test(t.title) && thai.test(t.summary) && t.explanation.every((p) => thai.test(p)), l.id).toBe(true);
      }
    }
  });

  it('resolved questions share one answer key across languages', () => {
    const qe = getAllQuestions('en');
    const qt = getAllQuestions('th');
    expect(qe.length).toBe(qt.length);
    qe.forEach((q, i) => {
      const o = qt[i];
      expect(o.id).toBe(q.id);
      expect(o.type).toBe(q.type);
      if (q.type === 'mcq' && o.type === 'mcq') expect(o.correctIndex).toBe(q.correctIndex);
      if (q.type === 'numeric' && o.type === 'numeric') {
        expect(o.answer).toBe(q.answer);
        expect(o.unit).toBe(q.unit);
      }
    });
  });

  it('UI dictionaries have the same keys and placeholders', () => {
    expect(Object.keys(th).sort()).toEqual(Object.keys(en).sort());
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(en) as (keyof typeof en)[]) expect(ph(th[key]), key).toEqual(ph(en[key]));
  });

  it('glossary entries are complete and unique', () => {
    expect(new Set(GLOSSARY.map((g) => g.en)).size).toBe(GLOSSARY.length);
    GLOSSARY.forEach((g) => { expect(g.en.length).toBeGreaterThan(2); expect(thai.test(g.th)).toBe(true); });
  });
});
