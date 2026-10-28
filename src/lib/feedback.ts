import { SKILLS, type Question, type Skill } from '../content/types';
import { PILOT_STUDY } from '../content/pilot';

export interface SkillResult {
  skill: Skill;
  correct: number;
  total: number;
  /** Concepts of the questions answered wrongly, in order, without duplicates. */
  missedConcepts: string[];
}

/** Untagged questions: numeric items test calculation, everything else tests understanding. */
export const skillOf = (q: Pick<Question, 'type' | 'skill'>): Skill => q.skill ?? (q.type === 'numeric' ? 'calculate' : 'understand');

/**
 * Groups one attempt by skill. Written answers are self-assessed, so they are not counted here:
 * this summary only describes the automatically checked questions.
 */
export function skillResults(outcomes: { question: Question; correct: boolean }[]): SkillResult[] {
  const out: SkillResult[] = [];
  for (const skill of SKILLS) {
    const items = outcomes.filter((o) => o.question.type !== 'written' && skillOf(o.question) === skill);
    if (items.length === 0) continue;
    const missed = [...new Set(items.filter((o) => !o.correct).map((o) => o.question.concept))];
    out.push({ skill, correct: items.filter((o) => o.correct).length, total: items.length, missedConcepts: missed });
  }
  return out;
}

/** The other lesson that builds a skill, for a pilot lesson. Undefined if none is defined. */
export const relatedLesson = (lessonId: string, skill: Skill): string | undefined => PILOT_STUDY[lessonId]?.[skill];
