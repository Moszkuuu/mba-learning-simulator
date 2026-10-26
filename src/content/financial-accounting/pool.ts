import { Pool } from '../pool';
import { LESSON_KEYS } from './keys';
import { part1 } from './pool-1';
import { part2 } from './pool-2';
import { part2b } from './pool-2b';
import { part2c } from './pool-2c';
import { part3 } from './pool-3';
import { part4 } from './pool-4';
import { part5 } from './pool-5';
import { part6 } from './pool-6';
import { part7 } from './pool-7';

const pool = new Pool(LESSON_KEYS);
part1(pool);
part2(pool);
part2b(pool);
part2c(pool);
part3(pool);
part4(pool);
part5(pool);
part6(pool);
part7(pool);

export const POOL_KEYS = pool.keys;
export const poolEn = pool.en;
export const poolTh = pool.th;
