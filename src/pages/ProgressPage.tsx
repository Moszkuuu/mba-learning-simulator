import { useRef, useState } from 'react';
import { getLessons, getQuestion } from '../content';
import { COMPETENCIES, competencyById } from '../curriculum/program';
import { competencyStats } from '../lib/progress';
import { storageKeyFor } from '../lib/cloud/owner';
import { backupFileName, commitImport, getStorage, hasProgress, parseBackup, serializeBackup, summarizeProgress, type BackupResult } from '../lib/backup';
import { useProgress } from '../components/ProgressContext';
import { LAB_CHANGED, LAB_SYNCED, adoptLab, labKey, loadLab, mergeLab, saveLab, summarizeLab } from '../lib/lab';
import { ActivityList } from '../components/ActivityList';
import { Alert, Badge, Button, Card, H2, PageTitle, Link } from '../components/ui';
import { money } from '../lib/numeric';
import { useI18n } from '../i18n';

const TONE = { mastered: 'green', learning: 'indigo', weak: 'red', stale: 'amber', new: 'slate' } as const;

export default function ProgressPage() {
  const { progress, replace, owner, resetProgress, resetLabWork, resetAll } = useProgress();
  const { t, lang, date } = useI18n();
  const [confirming, setConfirming] = useState<'progress' | 'lab' | 'all' | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState<{ fileName: string; result: Extract<BackupResult, { ok: true }> } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lessons = getLessons(lang);
  const stats = competencyStats(progress);
  const wrong = [...progress.attempts].reverse().filter((a) => !a.correct).slice(0, 30);

  function exportJson() {
    try {
      const lab = loadLab(getStorage() ?? undefined, labKey(storageKeyFor(owner)));
      const blob = new Blob([serializeBackup(progress, new Date(), lab)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFileName();
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ ok: true, text: t('backup.exported') });
    } catch {
      setMessage({ ok: false, text: t('backup.err.exportFail') });
    }
  }

  async function chooseFile(file: File | undefined) {
    setPending(null);
    setMessage(null);
    if (!file) return;
    let text: string;
    try {
      text = await file.text();
    } catch {
      setMessage({ ok: false, text: t('backup.err.readFail') });
      return;
    }
    const result = parseBackup(text);
    if (!result.ok) { setMessage({ ok: false, text: t(`backup.err.${result.error}` as 'backup.err.empty', { detail: result.detail ?? '' }) }); return; }
    setPending({ fileName: file.name, result });
  }

  function confirmImport() {
    if (!pending) return;
    const { progress: imported, lab } = pending.result;
    // A file that holds only Consulting Lab work must never replace (and so empty) the current progress.
    if (hasProgress(imported)) {
      // Save first: only report success (and replace what is on screen) if the browser really stored it.
      if (!commitImport(imported, undefined, storageKeyFor(owner)).ok) { setMessage({ ok: false, text: t('backup.err.saveFail') }); return; }
      replace(imported);
    }
    if (lab) {
      // Lab work from a file is merged into the current Lab work (newer drafts win, older ones are kept), never replaced.
      const store = getStorage() ?? undefined;
      const key = labKey(storageKeyFor(owner));
      if (!saveLab(store, key, mergeLab(loadLab(store, key), adoptLab(lab)))) { setMessage({ ok: false, text: t('backup.err.saveFail') }); return; }
      window.dispatchEvent(new Event(LAB_SYNCED));
      window.dispatchEvent(new Event(LAB_CHANGED));
    }
    setPending(null);
    setMessage({ ok: true, text: t('prog.importOk') });
  }

  const labCounts = summarizeLab(loadLab(getStorage() ?? undefined, labKey(storageKeyFor(owner))));
  function doReset(kind: 'progress' | 'lab' | 'all') {
    (kind === 'progress' ? resetProgress : kind === 'lab' ? resetLabWork : resetAll)();
    setConfirming(null);
    setPending(null);
    setMessage({ ok: true, text: t('reset.done') });
  }

  const current = summarizeProgress(progress);
  const hasCurrent = hasProgress(progress);
  const rows = [
    { label: 'backup.attempts', key: 'attempts' }, { label: 'backup.lessons', key: 'completedLessons' }, { label: 'backup.exams', key: 'exams' },
    { label: 'backup.sims', key: 'simResults' }, { label: 'backup.cards', key: 'reviewCards' },
  ] as const;

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
            <input ref={fileRef} type="file" accept="application/json,.json" aria-label={t('prog.import')} className="hidden" onChange={(e) => { void chooseFile(e.target.files?.[0]); e.target.value = ''; }} />
          </div>
          {message && <div className="mt-3"><Alert tone={message.ok ? 'green' : 'red'}>{message.text}</Alert></div>}
          {pending && (
            <div className="mt-4 rounded-lg border border-slate-300 p-4" role="region" aria-label={t('backup.previewTitle')}>
              <h3 className="font-semibold text-slate-900">{t('backup.previewTitle')}</h3>
              <p className="text-sm text-slate-600">{t('backup.file')}: {pending.fileName} · {t('backup.exportedAt')}: {pending.result.exportedAt ? date(pending.result.exportedAt) : t('backup.unknownDate')}</p>
              {pending.result.upgraded && <p className="mt-1 text-sm text-slate-600">{t('backup.upgraded')}</p>}
              <table className="my-3 w-full max-w-md text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-1">{t('backup.item')}</th><th>{t('backup.inBackup')}</th><th>{t('backup.inBrowser')}</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => <tr key={r.key}><td className="py-1">{t(r.label)}</td><td>{pending.result.summary[r.key]}</td><td>{current[r.key]}</td></tr>)}
                  <tr><td className="py-1">{t('backup.last')}</td><td>{pending.result.summary.lastActivity ? date(pending.result.summary.lastActivity) : '-'}</td><td>{current.lastActivity ? date(current.lastActivity) : '-'}</td></tr>
                </tbody>
              </table>
              {pending.result.lab && <p className="mb-2 text-sm text-slate-700">{t('backup.lab', summarizeLab(pending.result.lab))}</p>}
              {hasCurrent && hasProgress(pending.result.progress) && <Alert tone="amber" title={t('backup.replaceTitle')}>{t('backup.replaceWarning')}</Alert>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button tone={hasCurrent && hasProgress(pending.result.progress) ? 'danger' : 'primary'} onClick={confirmImport}>{!hasProgress(pending.result.progress) ? t('backup.confirmLabOnly') : hasCurrent ? t('backup.confirmReplace') : t('backup.confirmRestore')}</Button>
                {hasCurrent && <Button tone="secondary" onClick={exportJson}>{t('backup.downloadCurrent')}</Button>}
                <Button tone="secondary" onClick={() => setPending(null)}>{t('common.cancel')}</Button>
              </div>
            </div>
          )}
        </Card>
        <Card className="border-red-200 lg:col-span-2">
          <H2>{t('reset.title')}</H2>
          <p className="mb-3 text-sm text-slate-600">{t('reset.intro')} {owner.kind === 'user' ? t('reset.whereAccount') : t('reset.whereGuest')}</p>
          <div className="space-y-3">
            {(['progress', 'lab', 'all'] as const).map((kind) => (
              <div key={kind} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-700">{kind === 'progress' ? t('reset.progress.body', { attempts: current.attempts, lessons: current.completedLessons }) : kind === 'lab' ? t('reset.lab.body', labCounts) : t('reset.all.body')}</p>
                {confirming === kind ? (
                  <Alert tone="red" title={t('reset.confirmQ')}>
                    <p>{owner.kind === 'user' ? t('reset.effectAccount') : t('reset.effectGuest')}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button tone="danger" onClick={() => doReset(kind)}>{t(`reset.confirm.${kind}` as 'reset.confirm.all')}</Button>
                      {kind !== 'lab' && <Button tone="secondary" onClick={exportJson}>{t('backup.downloadCurrent')}</Button>}
                      <Button tone="secondary" onClick={() => setConfirming(null)}>{t('common.cancel')}</Button>
                    </div>
                  </Alert>
                ) : <div className="mt-2"><Button tone="danger" onClick={() => setConfirming(kind)}>{t(`reset.${kind}.button` as 'reset.all.button')}</Button></div>}
              </div>
            ))}
          </div>
        </Card>      </div>
    </div>
  );
}
