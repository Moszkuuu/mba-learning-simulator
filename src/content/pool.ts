/**
 * Compact authoring helper for the question pools (30+ questions per lesson).
 * Each call defines the language-neutral key AND both language texts together, so the English and Thai
 * versions of a question can never drift apart structurally. For multiple-choice questions the correct option is
 * written first; the helper places it at a rotating position (the quiz shuffles options at run time anyway).
 * Numeric answers are computed by the caller from the engines, and explanations are built from the computed value.
 */
import type { Level, LessonKey, McqKey, NumericKey, OptionText, QuestionKey, QuestionText, Skill } from './types';
import type { Tolerance, Unit } from '../lib/numeric';

export type Opt = [text: string, why: string];
export interface McqText { concept: string; prompt: string; explanation: string; scenario?: string; correct: Opt; wrong: [Opt, Opt, Opt] }
export interface NumText { concept: string; prompt: string; explanation: string; scenario?: string; commonMistake?: string }

export class Pool {
  keys: QuestionKey[] = [];
  en: Record<string, QuestionText> = {};
  th: Record<string, QuestionText> = {};
  private counter: Record<string, number> = {};

  /** @param lessons the subject's lesson keys; the competency of a pool question is the lesson's first competency unless overridden. */
  constructor(private lessons: LessonKey[]) {}

  private next(lessonId: string): { id: string; competency: string; n: number } {
    const lk = this.lessons.find((l) => l.id === lessonId);
    if (!lk) throw new Error(`pool: unknown lesson ${lessonId}`);
    const n = (this.counter[lessonId] = (this.counter[lessonId] ?? 0) + 1);
    return { id: `${lessonId.split('-')[0]}p${String(n).padStart(2, '0')}`, competency: lk.competencies[0], n };
  }

  mcq(lessonId: string, level: Level, en: McqText, th: McqText, competency?: string, skill?: Skill): void {
    const { id, competency: c, n } = this.next(lessonId);
    const pos = n % 4;
    const build = (t: McqText): QuestionText => {
      for (const [text, why] of [t.correct, ...t.wrong]) if (why.length <= 10) throw new Error(`pool ${id}: explanation too short for option "${text}"`);
      const opts: OptionText[] = t.wrong.map(([text, why]) => ({ text, why }));
      opts.splice(pos, 0, { text: t.correct[0], why: t.correct[1] });
      return { concept: t.concept, prompt: t.prompt, scenario: t.scenario, explanation: t.explanation, options: opts };
    };
    const key: McqKey = { id, lessonId, level, competency: competency ?? c, type: 'mcq', correctIndex: pos, optionCount: 4, ...(skill ? { skill } : {}) };
    this.keys.push(key);
    this.en[id] = build(en);
    this.th[id] = build(th);
  }

  num(lessonId: string, level: Level, unit: Unit, answer: number, en: NumText, th: NumText, tolerance?: Tolerance, competency?: string, skill?: Skill): void {
    const { id, competency: c } = this.next(lessonId);
    const key: NumericKey = { id, lessonId, level, competency: competency ?? c, type: 'numeric', answer, unit, tolerance, ...(skill ? { skill } : {}) };
    this.keys.push(key);
    this.en[id] = { ...en };
    this.th[id] = { ...th };
  }
}

/** Number formatting shared by English and Thai templates so digits are identical in both languages. */
export const f0 = (n: number): string => Math.round(n).toLocaleString('en-US');
export const f1 = (n: number): string => (Math.round(n * 10) / 10).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const f2 = (n: number): string => (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
