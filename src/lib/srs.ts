/**
 * Leitner-style spaced repetition. A question has a "box" 0-4; each box has a review interval.
 * Correct answer: move up one box (a first correct answer starts in box 1). Wrong answer: back to box 0.
 */
export const INTERVALS_DAYS = [1, 3, 7, 21, 60] as const;
export const MAX_BOX = INTERVALS_DAYS.length - 1;
const DAY_MS = 86_400_000;

export interface Card {
  box: number;
  due: string;
  firstAt: string;
  lastAt: string;
  seen: number;
}

export function updateCard(card: Card | undefined, correct: boolean, atISO: string): Card {
  const box = correct ? Math.min((card ? card.box : 0) + 1, MAX_BOX) : 0;
  const due = new Date(new Date(atISO).getTime() + INTERVALS_DAYS[box] * DAY_MS).toISOString();
  return { box, due, firstAt: card?.firstAt ?? atISO, lastAt: atISO, seen: (card?.seen ?? 0) + 1 };
}

/** Question ids whose review date has arrived, most overdue first. */
export function dueQuestionIds(cards: Record<string, Card>, now: Date): string[] {
  return Object.entries(cards)
    .filter(([, c]) => new Date(c.due).getTime() <= now.getTime())
    .sort((a, b) => new Date(a[1].due).getTime() - new Date(b[1].due).getTime())
    .map(([id]) => id);
}
