import type { Lang, Lesson, LessonKey, Question, QuestionKey, SubjectContent } from './types';
import * as fa from './financial-accounting';
import * as ma from './managerial-accounting';
import * as cf from './corporate-finance';
import * as me from './managerial-economics';
import * as mk from './marketing';
import * as op from './operations';
import * as st from './strategy';
import * as ob from './organizational-behavior';
import * as ana from './analytics-statistics';
import * as ent from './entrepreneurship';
import * as ib from './international-business';
import * as eg from './ethics-governance-risk';

type SubjectModule = { LESSON_KEYS: LessonKey[]; QUESTION_KEYS: QuestionKey[]; CASE_IDS?: string[]; enText: SubjectContent['text']['en']; thText: SubjectContent['text']['th'] };

const mod = (m: SubjectModule): SubjectContent => ({
  caseIds: m.CASE_IDS,
  lessons: m.LESSON_KEYS,
  questions: m.QUESTION_KEYS,
  text: { en: m.enText, th: m.thText },
});

/** Registry of subjects that have content. Add new subjects here (one folder each). Order = programme order. */
export const SUBJECT_CONTENT: Record<string, SubjectContent> = {
  'financial-accounting': mod(fa),
  'managerial-accounting': mod(ma),
  'corporate-finance': mod(cf),
  'managerial-economics': mod(me),
  'marketing': mod(mk),
  'operations': mod(op),
  'strategy': mod(st),
  'organizational-behavior': mod(ob),
  'analytics-statistics': mod(ana),
  'entrepreneurship': mod(ent),
  'international-business': mod(ib),
  'ethics-governance-risk': mod(eg),
};

export const CASE_QUESTION_IDS = new Set(Object.values(SUBJECT_CONTENT).flatMap((s) => s.caseIds ?? []));

// ---------- language-neutral lookups (used by progress, mastery, tests) ----------
export const ALL_LESSON_KEYS: LessonKey[] = Object.values(SUBJECT_CONTENT).flatMap((s) => s.lessons);
export const ALL_QUESTION_KEYS: QuestionKey[] = Object.values(SUBJECT_CONTENT).flatMap((s) => s.questions);
const qIndex = new Map(ALL_QUESTION_KEYS.map((q) => [q.id, q]));
const lIndex = new Map(ALL_LESSON_KEYS.map((l) => [l.id, l]));
export const questionKey = (id: string): QuestionKey | undefined => qIndex.get(id);
export const lessonKey = (id: string): LessonKey | undefined => lIndex.get(id);
export const subjectOfLesson = (lessonId: string): string | undefined =>
  Object.entries(SUBJECT_CONTENT).find(([, s]) => s.lessons.some((l) => l.id === lessonId))?.[0];

// ---------- resolution (key + text -> what the UI renders) ----------
function resolveQuestion(k: QuestionKey, lang: Lang, subject: SubjectContent): Question {
  const t = subject.text[lang].questions[k.id];
  if (!t) throw new Error(`Missing ${lang} text for question ${k.id}`);
  const base = { id: k.id, lessonId: k.lessonId, level: k.level, competency: k.competency, concept: t.concept, prompt: t.prompt, scenario: t.scenario, explanation: t.explanation };
  if (k.type === 'mcq') return { ...base, type: 'mcq', options: t.options ?? [], correctIndex: k.correctIndex };
  if (k.type === 'numeric') return { ...base, type: 'numeric', answer: k.answer, unit: k.unit, tolerance: k.tolerance, commonMistake: t.commonMistake };
  return { ...base, type: 'written', modelAnswer: t.modelAnswer ?? '', rubric: t.rubric ?? [] };
}

const cache: Partial<Record<Lang, { lessons: Lesson[]; questions: Question[] }>> = {};

function build(lang: Lang) {
  const lessons: Lesson[] = [];
  const questions: Question[] = [];
  for (const subject of Object.values(SUBJECT_CONTENT)) {
    const own: Question[] = subject.questions.map((k) => resolveQuestion(k, lang, subject));
    questions.push(...own);
    for (const lk of subject.lessons) {
      const t = subject.text[lang].lessons[lk.id];
      if (!t) throw new Error(`Missing ${lang} text for lesson ${lk.id}`);
      lessons.push({
        ...t, id: lk.id, number: lk.number, unitId: lk.unitId, minutes: lk.minutes, competencies: lk.competencies, status: lk.status,
        questions: own.filter((q) => q.lessonId === lk.id && !CASE_QUESTION_IDS.has(q.id)),
      });
    }
  }
  return { lessons, questions };
}

const data = (lang: Lang) => (cache[lang] ??= build(lang));
export const getLessons = (lang: Lang): Lesson[] => data(lang).lessons;
export const getLesson = (id: string, lang: Lang): Lesson | undefined => data(lang).lessons.find((l) => l.id === id);
export const getAllQuestions = (lang: Lang): Question[] => data(lang).questions;
export const getQuestion = (id: string, lang: Lang): Question | undefined => data(lang).questions.find((q) => q.id === id);
export const lessonsOfSubject = (subjectId: string, lang: Lang): Lesson[] => {
  const ids = new Set((SUBJECT_CONTENT[subjectId]?.lessons ?? []).map((l) => l.id));
  return getLessons(lang).filter((l) => ids.has(l.id));
};
/** First lesson that teaches a competency - the revision target for that competency. */
export const reviseLessonFor = (competencyId: string): LessonKey | undefined =>
  ALL_LESSON_KEYS.find((l) => l.competencies.includes(competencyId));
