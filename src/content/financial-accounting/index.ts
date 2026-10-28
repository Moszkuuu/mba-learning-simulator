import { LESSON_KEYS, QUESTION_KEYS as BASE_KEYS, CASE_IDS } from './keys';
import { POOL_KEYS, poolEn, poolTh } from './pool';
import * as en from './en';
import * as th from './th';
import { pilotLessons as pilotEn } from './pilot-en';
import { pilotLessons as pilotTh } from './pilot-th';

const QUESTION_KEYS = [...BASE_KEYS, ...POOL_KEYS];
export { LESSON_KEYS, QUESTION_KEYS, CASE_IDS };
// The pilot lessons (Phase 3.1) replace the earlier text of the same lesson ids; their ids and question ids are unchanged.
export const enText = { lessons: { ...en.lessons, ...pilotEn }, questions: { ...en.questions, ...poolEn } };
export const thText = { lessons: { ...th.lessons, ...pilotTh }, questions: { ...th.questions, ...poolTh } };
