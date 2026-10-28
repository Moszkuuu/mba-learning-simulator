/**
 * Content model. Every question/lesson is split into:
 *  - a language-NEUTRAL key (ids, level, competency, answer key, numbers, tolerance)
 *  - per-language TEXT (prompt, options, explanations, rubric wording)
 * The UI works with the merged ("resolved") types at the bottom.
 */
import type { Tolerance, Unit } from '../lib/numeric';

export type Lang = 'en' | 'th';
export const LANGS: Lang[] = ['en', 'th'];
export type Level = 1 | 2 | 3;

/** What a question mainly tests. Untagged questions default to 'calculate' (numeric) or 'understand' (other). */
export type Skill = 'understand' | 'calculate' | 'interpret' | 'decide' | 'assumptions';
export const SKILLS: Skill[] = ['understand', 'calculate', 'interpret', 'decide', 'assumptions'];

// ---------- language-neutral keys ----------
interface KeyBase {
  id: string;
  lessonId: string;
  level: Level;
  skill?: Skill;
  /** Competency id from curriculum/program.ts */
  competency: string;
}
export interface McqKey extends KeyBase { type: 'mcq'; correctIndex: number; optionCount: number }
export interface NumericKey extends KeyBase { type: 'numeric'; answer: number; unit: Unit; tolerance?: Tolerance }
/** Written answers are self-assessed against a rubric; there is no automatic grading. */
export interface WrittenKey extends KeyBase { type: 'written'; rubricCount: number }
export type QuestionKey = McqKey | NumericKey | WrittenKey;

export interface LessonKey {
  id: string;
  number: number;
  unitId: string;
  minutes: number;
  competencies: string[];
  /** 'migrated' = prototype-depth content; 'full' = meets the full lesson contract (see content tests). */
  status: 'migrated' | 'foundation' | 'full';
}

// ---------- per-language text ----------
export interface OptionText { text: string; why: string }
export interface QuestionText {
  concept: string;
  prompt: string;
  scenario?: string;
  explanation: string;
  options?: OptionText[];
  commonMistake?: string;
  modelAnswer?: string;
  rubric?: string[];
}
export interface WorkedExampleText { title: string; given: string[]; steps: string[]; result: string }
/** Optional teaching sections used by lessons written to the full lesson standard (Phase 3.1 pilot). */
export interface LessonTeaching {
  why: string;
  terms: { term: string; meaning: string }[];
  interpretation: string[];
  decisions: string[];
  check: { q: string; a: string }[];
  takeaways: string[];
  /** A prompt for applying the idea to a real business the student knows. */
  apply: string;
}
export interface LessonText {
  teaching?: LessonTeaching;
  title: string;
  summary: string;
  objectives: string[];
  explanation: string[];
  formulas: { name: string; expr: string }[];
  realWorld: string;
  misconceptions: string[];
  workedExamples: WorkedExampleText[];
}
export interface SubjectContent {
  /** Question ids used only in Practice/Review (business cases), not in a lesson quiz. */
  caseIds?: string[];
  lessons: LessonKey[];
  questions: QuestionKey[];
  text: Record<Lang, { lessons: Record<string, LessonText>; questions: Record<string, QuestionText> }>;
}

// ---------- resolved (what the UI uses) ----------
interface QBase {
  id: string;
  lessonId: string;
  level: Level;
  skill?: Skill;
  competency: string;
  concept: string;
  prompt: string;
  scenario?: string;
  explanation: string;
}
export interface McqQuestion extends QBase { type: 'mcq'; options: OptionText[]; correctIndex: number }
export interface NumericQuestion extends QBase { type: 'numeric'; answer: number; unit: Unit; tolerance?: Tolerance; commonMistake?: string }
export interface WrittenQuestion extends QBase { type: 'written'; modelAnswer: string; rubric: string[] }
export type Question = McqQuestion | NumericQuestion | WrittenQuestion;

export interface Lesson extends LessonText {
  id: string;
  number: number;
  unitId: string;
  minutes: number;
  competencies: string[];
  status: 'migrated' | 'foundation' | 'full';
  questions: Question[];
}
