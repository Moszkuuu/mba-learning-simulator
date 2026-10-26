import { LESSON_KEYS, QUESTION_KEYS as BASE_KEYS, CASE_IDS } from './keys';
import { POOL_KEYS, poolEn, poolTh } from './pool';
import * as en from './en';
import * as th from './th';

const QUESTION_KEYS = [...BASE_KEYS, ...POOL_KEYS];
export { LESSON_KEYS, QUESTION_KEYS, CASE_IDS };
export const enText = { lessons: en.lessons, questions: { ...en.questions, ...poolEn } };
export const thText = { lessons: th.lessons, questions: { ...th.questions, ...poolTh } };
