// Checks the database trigger described in docs/CLOUD_SETUP.md using two DISPOSABLE accounts.
// Run:  node scripts/verify-lab-trigger.mjs
// It only reads and writes the rows of the two accounts it creates (zz.trigger.*@example.com), through the same public
// key and the same Row Level Security rules the app uses. It never touches anyone else's row and uses no secret key.
// Without the trigger, the check "an older app version cannot remove the Lab section or reset marker" is EXPECTED to FAIL.
// With the trigger attached, every check should PASS. Afterwards delete the two users in Supabase: Authentication -> Users.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const url = env.VITE_SUPABASE_URL, key = env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) { console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local'); process.exit(2); }

const stamp = Date.now();
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : detail ? `  (${detail})` : ''}`); };
// The database may reorder the keys of a JSON object, so compare with the keys sorted.
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

async function account(label) {
  const c = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const email = `zz.trigger.${label}.${stamp}@example.com`;
  const password = `Zz-${randomBytes(9).toString('hex')}`;
  const { data, error } = await c.auth.signUp({ email, password });
  if (error || !data.session) throw new Error(`could not create the disposable account (${error?.message ?? 'no session: is "Confirm email" switched off?'})`);
  return { c, id: data.user.id, email };
}
const LAB = (text) => ({ version: 1, drafts: { beginner: { answers: { 'text.why': text }, ratings: {}, reflection: '', updatedAt: '2026-10-28T10:00:00.000Z' } }, submissions: [] });
const MARK = { cutoff: '2026-10-28T09:00:00.000Z', setAt: '2026-10-28T09:00:00.000Z' };
const progress = (attempts) => ({ version: 2, completedLessons: [], lessonScores: {}, attempts, cards: {}, exams: [], simResults: [], simState: null, activity: [] });

async function write(a, data, rev) {
  const { data: rows, error } = await a.c.from('progress').update({ data, revision: rev + 1 }).eq('user_id', a.id).eq('revision', rev).select('revision');
  if (error) throw new Error(`update failed: ${error.message}`);
  return rows?.length === 1 ? rev + 1 : null;
}
const read = async (a, id = a.id) => (await a.c.from('progress').select('data,revision').eq('user_id', id).maybeSingle()).data;

try {
  const A = await account('a'), B = await account('b');
  const att = (n) => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, questionId: 'q', lessonId: 'l', competency: 'c', level: 1, correct: true, score: 1, given: 'x', at: '2026-10-27T10:00:00.000Z', context: 'practice' }));

  // 1. existing cloud data stays exactly as saved
  const start = { ...progress(att(1)), lab: LAB('v1'), progressReset: MARK };
  const ins = await A.c.from('progress').insert({ user_id: A.id, data: start, revision: 1 });
  check('first save of progress + Lab + reset marker works', !ins.error, ins.error?.message);
  let row = await read(A);
  check('saved data reads back unchanged', same(row.data, start));
  let rev = row.revision;

  // 2. an OLDER app version saves progress only (no lab, no marker)
  rev = await write(A, progress(att(2)), rev);
  row = await read(A);
  check('older app version: its progress change is stored (saving still works)', row.data.attempts.length === 2);
  check('older app version cannot remove the Lab section', same(row.data.lab, LAB('v1')), 'lab missing: the trigger is probably not attached');
  check('older app version cannot remove the reset marker', same(row.data.progressReset, MARK), 'marker missing: the trigger is probably not attached');

  // 3. a NEW app version syncs normally and its newer values win
  rev = await write(A, { ...progress(att(3)), lab: LAB('v2'), progressReset: MARK }, rev);
  row = await read(A);
  check('new app version: newer Lab work is stored, not replaced by the old copy', same(row.data.lab, LAB('v2')) && row.data.attempts.length === 3);

  // 4. a legitimate Lab reset (lab object with no work, plus its marker) is stored as sent
  const emptyLab = { version: 1, drafts: {}, submissions: [], reset: { cutoff: '2026-10-28T11:00:00.000Z', setAt: '2026-10-28T11:00:00.000Z' } };
  rev = await write(A, { ...progress(att(3)), lab: emptyLab, progressReset: MARK }, rev);
  row = await read(A);
  check('Lab reset works: old drafts do not come back', same(row.data.lab, emptyLab));

  // 5. a legitimate progress reset (empty progress + new marker) is stored as sent
  const newMark = { cutoff: '2026-10-28T12:00:00.000Z', setAt: '2026-10-28T12:00:00.000Z' };
  rev = await write(A, { ...progress([]), lab: emptyLab, progressReset: newMark }, rev);
  row = await read(A);
  check('progress reset works: attempts empty and the new marker stored', row.data.attempts.length === 0 && same(row.data.progressReset, newMark));

  // 6. a backup restore (older data back, restore marker made now) is stored as sent
  const restore = { cutoff: '1970-01-01T00:00:00.000Z', setAt: '2026-10-28T13:00:00.000Z' };
  rev = await write(A, { ...progress(att(2)), lab: LAB('restored'), progressReset: restore }, rev);
  row = await read(A);
  check('backup restore works: restored data and the restore marker are stored', row.data.attempts.length === 2 && same(row.data.lab, LAB('restored')) && same(row.data.progressReset, restore));

  // 7. account isolation
  const insB = await B.c.from('progress').insert({ user_id: B.id, data: progress(att(1)), revision: 1 });
  check('second account can save its own row', !insB.error, insB.error?.message);
  const rowB = await read(B);
  check('second account row has no Lab section or marker of the first account', !('lab' in rowB.data) && !('progressReset' in rowB.data));
  check('second account cannot read the first account\'s row', (await read(B, A.id)) === null);
  const hijack = await B.c.from('progress').update({ data: { ...progress([]), hijacked: true } }).eq('user_id', A.id).select('user_id');
  check('second account cannot change the first account\'s row', !hijack.error ? (hijack.data ?? []).length === 0 : true);
  const after = await read(A);
  check('first account\'s data (Lab and marker) is untouched by the second account', same(after.data.lab, LAB('restored')) && same(after.data.progressReset, restore) && !after.data.hijacked);

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed} of ${results.length} checks passed.`);
  console.log(`Disposable accounts to delete in Supabase (Authentication -> Users): ${A.email}, ${B.email}`);
  process.exit(failed ? 1 : 0);
} catch (e) {
  console.error('Could not finish:', e.message);
  process.exit(2);
}
