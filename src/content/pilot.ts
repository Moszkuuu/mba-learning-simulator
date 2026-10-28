import type { Skill } from './types';

/**
 * Phase 3.2: where to send a student who missed a kind of question in a pilot lesson. Values are existing lesson ids
 * (checked by a test). The lesson itself is always offered too; this adds the lesson that builds the missing skill.
 */
export const PILOT_STUDY: Record<string, Partial<Record<Skill, string>>> = {
  'l2-operating-profit': { understand: 'l47-accounting-equation', calculate: 'l1-gross-profit', interpret: 'l5-operating-cash-flow', decide: 'l4-inventory-wc', assumptions: 'l5-operating-cash-flow' },
  'l4-inventory-wc': { understand: 'l3-ar-ap', calculate: 'l3-ar-ap', interpret: 'l5-operating-cash-flow', decide: 'l5-operating-cash-flow', assumptions: 'l2-operating-profit' },
  'l5-operating-cash-flow': { understand: 'l2-operating-profit', calculate: 'l4-inventory-wc', interpret: 'l4-inventory-wc', decide: 'l4-inventory-wc', assumptions: 'l2-operating-profit' },
};

export const isPilotLesson = (lessonId: string): boolean => lessonId in PILOT_STUDY;
