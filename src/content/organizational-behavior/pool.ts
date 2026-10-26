import { Pool } from '../pool';
import { LESSON_KEYS } from './keys';
import { part1 } from './pool-1';
import { part2 } from './pool-2';

const pool = new Pool(LESSON_KEYS);
part1(pool);
part2(pool);

export const POOL_KEYS = pool.keys;
export const poolEn = pool.en;
export const poolTh = pool.th;
