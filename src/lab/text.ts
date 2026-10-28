import type { Lang } from '../content/types';
import type { LabLevel } from './case';
import { labEn } from './text-en';
import { labTh } from './text-th';

export interface Task { prompt: string; formula?: string; hint?: string }
export interface FieldText { label: string; hint?: string }
export interface RubricText { name: string; strong: string; basic: string }

/** All Consulting Lab wording for one language. English and Thai must have the same keys, counts and numbers (see text.test.ts). */
export interface LabText {
  title: string; tagline: string; fictional: string;
  hubIntro: string; hubAssessTitle: string; hubAssess: string[];
  start: string; resume: string; attemptsLine: string;
  levels: Record<LabLevel, { name: string; blurb: string }>;
  stages: { brief: string; docs: string; analysis: string; recommend: string; submit: string };
  workflow: string; steps: string[];
  company: string[]; briefing: Record<LabLevel, string[]>;
  docsTitle: { income: string; balance: string; notes: string; year1: string; year2: string };
  docsConvention: string;
  rows: Record<'revenue' | 'cogs' | 'gross' | 'opex' | 'depreciation' | 'operating' | 'interest' | 'pbt' | 'tax' | 'net' | 'cash' | 'receivables' | 'inventory' | 'equipment' | 'assets' | 'payables' | 'debt' | 'equity' | 'le', string>;
  notes: { from: string; text: string }[];
  analysisTitle: string; analysisIntro: Record<LabLevel, string>;
  tasks: Record<string, Task>;
  consistency: { title: string; targetDso: string; release: string; note: string };
  explanations: Record<string, string>;
  recommendTitle: string; recommendIntro: string; fields: Record<string, FieldText>;
  submitTitle: string; submitIntro: string; submitButton: string;
  completenessTitle: string; completenessNote: string; words: string; quoted: string;
  resultsTitle: string; verifiedLine: string; correctLabel: string; incorrectLabel: string; yourAnswer: string; expectedAnswer: string; noAnswer: string;
  studyTitle: string; studyNone: string; studyLine: string;
  selfTitle: string; selfNote: string; rubric: Record<string, RubricText>; rubricVerified: string;
  totalTitle: string; totalLine: string; totalNote: string;
  modelTitle: string; model: string[];
  reflectTitle: string; reflectPrompt: string;
  save: string; saveFailed: string; history: string; historyLine: string; revise: string; back: string; next: string; previous: string; showHint: string; checkNow: string; hubBack: string;
}

export const labText = (lang: Lang): LabText => (lang === 'th' ? labTh : labEn);
export const fill = (s: string, vars: Record<string, string | number>): string => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
