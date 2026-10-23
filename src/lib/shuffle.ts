import type { Question } from '../content/types';
import { questionKey } from '../content';

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * A quiz plan is language-independent: question ids in random order plus, for each
 * multiple-choice question, a random permutation of its options. Questions are resolved
 * into the active language at render time, so switching language mid-quiz keeps the same order.
 */
export interface PlanItem {
  id: string;
  optionOrder?: number[];
}

export function makePlan(ids: readonly string[]): PlanItem[] {
  return shuffle(ids).map((id) => {
    const k = questionKey(id);
    return k && k.type === 'mcq' ? { id, optionOrder: shuffle(Array.from({ length: k.optionCount }, (_, i) => i)) } : { id };
  });
}

/** Returns the question with options in the planned order and correctIndex remapped. */
export function applyPlan(q: Question, item: PlanItem): Question {
  if (q.type !== 'mcq' || !item.optionOrder) return q;
  const order = item.optionOrder;
  return { ...q, options: order.map((i) => q.options[i]), correctIndex: order.indexOf(q.correctIndex) };
}
