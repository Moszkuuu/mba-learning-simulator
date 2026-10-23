import { useRef, useState } from 'react';
import { getLessons, getQuestion } from '../content';
import { COMPETENCIES, competencyById } from '../curriculum/program';
import { competencyStats, parseProgress } from '../lib/progress';
import { useProgress } from '../components/ProgressContext';
import { ActivityList } from '../components/ActivityList';
import { Alert, Badge, Button, Card, H2, PageTitle, Link } from '../components/ui';
import { money } from '../lib/numeric';
import { useI18n } from '../i18n';

const TONE = { mastered: 'green', learning: 'indigo', weak: 'red', stale: 'amber', new: 'slate' } as const;

export default function ProgressPage() {
  const { progress, dispatch, replace } = useProgress();
  const { t, lang, date } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lessons = getLessons(lang);
  const stats = competencyStats(progress);
  const wrong = [...progress.attempts].reverse().filter((a) => !a.correct).slice(0, 30);

  function exportJson() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mba-lab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const parsed = parseProgress(text);
    const valid = parsed.attempts.length > 0 || parsed.completedLessons.length > 0 || parsed.simResults.length > 0;
    if (!valid) { setImportMsg({ ok: false, text: t('prog.importFail') }); return; }
    replace(parsed);
    setImportMsg({ ok: true, text: t('prog.importOk') });
  }

  return (
    <div>
      <PageTitle title={t('prog.title')} subtitle={t('prog.subtitle')} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <H2>{t('prog.competencies')}</H2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">{t('prog.competency')}</th><th>{t('prog.status')}</th><th>{t('prog.attemptsCol')}</th><th>{t('prog.accuracyCol')}</th><th>{t('prog.levelsCol')}</th><th>{t('prog.delayedCol')}</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {COMPETENCIES.filter((c) => c.available).map((c) => {
                  const s = stats.find((x) => x.competency === c.id)!;
                  return (
                    <tr key={c.id}>
                      <td className="py-2">{c.name[lang]}</td>
                      <td><Badge tone={TONE[s.status]}>{t(`mastery.${s.status}` as 'mastery.new')}</Badge></td>
                      <td>{s.attempts}</td>
                      <td>{s.accuracy === null ? '-' : `${Math.round(s.accuracy * 100)}%`}</td>
                      <td>{s.levels.length ? s.levels.map((l) => `L${l}`).join(', ') : '-'}</td>
                      <td>{s.delayedCorrect ? t('common.yes') : t('common.no')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-500">{t('dash.masteryRule')}</p>
        </Card>
        <Card>
          <H2>{t('prog.lessonScores')}</H2>
          <ul className="divide-y divide-slate-100 text-sm">
            {lessons.map((l) => {
              const s = progress.lessonScores[l.id];
              return (
                <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                  <Link to={`/lesson/${l.id}`} className="text-indigo-700 hover:underline">{t('lesson.label', { n: l.number })}: {l.title}</Link>
                  {s ? <Badge tone={s.correct / s.total >= 0.7 ? 'green' : 'amber'}>{s.correct}/{s.total}</Badge> : <Badge>{t('prog.notTaken')}</Badge>}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <H2>{t('prog.exams')}</H2>
          {progress.exams.length === 0 ? <p className="text-sm text-slate-600">{t('prog.noExams')}</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {[...progress.exams].reverse().map((e) => <li key={e.id} className="flex justify-between py-2"><span>{date(e.at)}</span><Badge tone={e.correct / e.total >= 0.7 ? 'green' : 'amber'}>{e.correct}/{e.total}</Badge></li>)}
            </ul>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <H2>{t('prog.mistakes')}</H2>
          {wrong.length === 0 ? <p className="text-sm text-slate-600">{t('prog.noMistakes')}</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {wrong.map((a) => {
                const q = getQuestion(a.questionId, lang);
                return (
                  <li key={a.id} className="py-3">
                    <p className="font-medium">{q?.prompt ?? a.questionId}</p>
                    <p className="text-slate-600">{t('prog.youAnswered')}: {a.given} · {competencyById(a.competency)?.name[lang]} · <time dateTime={a.at}>{date(a.at)}</time></p>
                    <Link to={`/lesson/${a.lessonId}`} className="text-indigo-700 underline">{t('prog.reviseLesson')}</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <H2>{t('prog.simResults')}</H2>
          {progress.simResults.length === 0 ? <p className="text-sm text-slate-600">{t('prog.noSims')}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">{t('prog.date')}</th><th>{t('prog.outcome')}</th><th>{t('prog.months')}</th><th>{t('sim.cumProfit')}</th><th>{t('prog.finalCash')}</th><th>{t('sim.equity')}</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {[...progress.simResults].reverse().map((r) => (
                    <tr key={r.id}>
                      <td className="py-2">{date(r.at)}</td>
                      <td><Badge tone={r.status === 'completed' ? 'green' : 'red'}>{t(r.status === 'completed' ? 'sim.statusCompleted' : 'sim.statusDefaulted')}</Badge></td>
                      <td>{r.months}</td><td>{money(r.cumulativeProfit)}</td><td>{money(r.finalCash)}</td><td>{money(r.finalEquity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <H2>{t('prog.history')}</H2>
          <ActivityList items={progress.activity.slice(0, 50)} empty={t('prog.noActivity')} />
        </Card>
        <Card className="lg:col-span-2">
          <H2>{t('prog.backup')}</H2>
          <p className="mb-3 text-sm text-slate-600">{t('prog.backupBody')}</p>
          <div className="flex flex-wrap gap-3">
            <Button tone="secondary" onClick={exportJson}>{t('prog.export')}</Button>
            <Button tone="secondary" onClick={() => fileRef.current?.click()}>{t('prog.import')}</Button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { importJson(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
          {importMsg && <div className="mt-3"><Alert tone={importMsg.ok ? 'green' : 'red'}>{importMsg.text}</Alert></div>}
        </Card>
        <Card className="border-red-200 lg:col-span-2">
          <H2>{t('prog.resetTitle')}</H2>
          <p className="mb-3 text-sm text-slate-600">{t('prog.resetBody')}</p>
          {confirming ? (
            <Alert tone="red" title={t('prog.sure')}>
              <div className="mt-2 flex gap-2">
                <Button tone="danger" onClick={() => { dispatch({ type: 'reset' }); setConfirming(false); }}>{t('prog.confirmReset')}</Button>
                <Button tone="secondary" onClick={() => setConfirming(false)}>{t('common.cancel')}</Button>
              </div>
            </Alert>
          ) : <Button tone="danger" onClick={() => setConfirming(true)}>{t('prog.resetButton')}</Button>}
        </Card>
      </div>
    </div>
  );
}
