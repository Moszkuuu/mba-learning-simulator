import { useState } from 'react';
import { getAllQuestions, getLessons, subjectOfLesson } from '../content';
import { SUBJECTS } from '../curriculum/program';
import type { Level } from '../content/types';
import { QuizRunner, type QuizOutcome } from '../components/QuizRunner';
import { ToolLinks } from '../components/AccountEntry';
import { Alert, Button, Card, PageTitle, Link } from '../components/ui';
import { shuffle } from '../lib/shuffle';
import { useI18n } from '../i18n';

const COUNTS = [5, 10, 15, 0];
const LEVELS: Level[] = [1, 2, 3];

export default function PracticePage() {
  const { t, lang } = useI18n();
  const lessons = getLessons(lang);
  const all = getAllQuestions(lang);
  const [selected, setSelected] = useState<string[]>(lessons.map((l) => l.id));
  const [levels, setLevels] = useState<Level[]>([1, 2, 3]);
  const [types, setTypes] = useState({ mcq: true, numeric: true, written: true, scenario: true });
  const [count, setCount] = useState(10);
  const [session, setSession] = useState<string[] | null>(null);
  const [outcomes, setOutcomes] = useState<QuizOutcome[] | null>(null);
  const [error, setError] = useState('');

  const pool = all.filter((q) => selected.includes(q.lessonId) && levels.includes(q.level) && types[q.type] && (q.scenario ? types.scenario : true));
  const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function start() {
    if (pool.length === 0) { setError(t('practice.noMatch')); return; }
    setError('');
    const picked = shuffle(pool.map((q) => q.id));
    setOutcomes(null);
    setSession(count === 0 ? picked : picked.slice(0, count));
  }

  if (outcomes && session) {
    const score = outcomes.filter((o) => o.correct).length;
    const missed = outcomes.filter((o) => !o.correct);
    const lessonIds = [...new Set(missed.map((m) => m.question.lessonId))];
    return (
      <div>
        <PageTitle title={t('practice.results')} />
        <Card className="space-y-4">
          <p className="text-4xl font-bold text-indigo-700">{score} / {outcomes.length}</p>
          {missed.length ? (
            <Alert tone="amber" title={t('practice.revise')}>
              <ul className="mt-1 list-inside list-disc">
                {lessonIds.map((id) => {
                  const l = lessons.find((x) => x.id === id)!;
                  return <li key={id}><Link to={`/lesson/${id}`} className="underline">{t('lesson.label', { n: l.number })}: {l.title}</Link> - {missed.filter((m) => m.question.lessonId === id).map((m) => m.question.concept).join('; ')}</li>;
                })}
              </ul>
            </Alert>
          ) : <Alert tone="green" title={t('practice.perfect')}>{t('practice.perfectBody')}</Alert>}
          <div className="flex gap-3">
            <Button onClick={start}>{t('practice.again')}</Button>
            <Button tone="secondary" onClick={() => { setSession(null); setOutcomes(null); }}>{t('practice.changeSettings')}</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (session) {
    return (
      <div>
        <PageTitle title={t('nav.practice')} subtitle={t('practice.runningSubtitle')} />
        <QuizRunner questionIds={session} context="practice" onFinish={setOutcomes} />
      </div>
    );
  }

  return (
    <div>
      <PageTitle title={t('nav.practice')} subtitle={t('practice.subtitle')} />
      <ToolLinks />
      <Card className="space-y-6">
        <fieldset>
          <legend className="mb-2 font-semibold text-slate-900">{t('practice.lessons')}</legend>
          <div className="mb-2 flex gap-3 text-sm">
            <button type="button" className="text-indigo-700 underline" onClick={() => setSelected(lessons.map((l) => l.id))}>{t('practice.selectAll')}</button>
            <button type="button" className="text-indigo-700 underline" onClick={() => setSelected([])}>{t('practice.selectNone')}</button>
          </div>
          <div className="space-y-3">
            {SUBJECTS.map((s) => {
              const ls = lessons.filter((l) => subjectOfLesson(l.id) === s.id);
              if (ls.length === 0) return null;
              const all = ls.every((l) => selected.includes(l.id));
              return (
                <div key={s.id}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <input type="checkbox" className="h-4 w-4 accent-indigo-700" checked={all} onChange={() => setSelected(all ? selected.filter((x) => !ls.some((l) => l.id === x)) : [...new Set([...selected, ...ls.map((l) => l.id)])])} />
                    {s.name[lang]}
                  </label>
                  <div className="ml-6 mt-1 grid gap-1 sm:grid-cols-2">
                    {ls.map((l) => (
                      <label key={l.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="h-4 w-4 accent-indigo-700" checked={selected.includes(l.id)} onChange={() => setSelected(toggle(selected, l.id))} />
                        {t('lesson.label', { n: l.number })}: {l.title}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-semibold text-slate-900">{t('practice.levels')}</legend>
          <div className="flex flex-wrap gap-4 text-sm">
            {LEVELS.map((lv) => (
              <label key={lv} className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-indigo-700" checked={levels.includes(lv)} onChange={() => setLevels(toggle(levels, lv))} />
                {t(`level.${lv}` as 'level.1')}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-semibold text-slate-900">{t('practice.types')}</legend>
          <div className="flex flex-wrap gap-4 text-sm">
            {([['mcq', 'q.typeMcq'], ['numeric', 'q.typeNumeric'], ['written', 'q.typeWritten'], ['scenario', 'practice.scenarios']] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-indigo-700" checked={types[k]} onChange={() => setTypes({ ...types, [k]: !types[k] })} />
                {t(label)}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="count" className="mb-2 block font-semibold text-slate-900">{t('practice.count')}</label>
          <select id="count" value={count} onChange={(e) => setCount(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {COUNTS.map((c) => <option key={c} value={c}>{c === 0 ? t('practice.allMatching', { n: pool.length }) : c}</option>)}
          </select>
        </div>
        {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
        <Button onClick={start}>{t('practice.start', { n: Math.min(pool.length, count || pool.length) })}</Button>
      </Card>
      <p className="mt-4 text-sm text-slate-500">{t('practice.tip')}</p>
    </div>
  );
}
