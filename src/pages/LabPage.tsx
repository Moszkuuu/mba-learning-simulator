import { useEffect, useState } from 'react';
import { getLesson } from '../content';
import { useProgress } from '../components/ProgressContext';
import { Alert, Badge, Button, Card, H2, Link, LinkButton, PageTitle } from '../components/ui';
import { useI18n } from '../i18n';
import { storageKeyFor } from '../lib/cloud/owner';
import { LAB_CHANGED, LAB_SYNCED, completeness, effectiveSelfPoints, labKey, loadLab, quotedFigures, saveLab, verifiedPoints, verifiedResults, type CheckResult, type EarlierDraft, type LabDraft, type LabState } from '../lib/lab';
import { numericInputProblem } from '../lib/numeric';
import { GuestOffer } from '../components/AccountCard';
import { CHECKS, FIELDS, LAB_LEVELS, RATING_MAX, RUBRIC, VERIFIED_POINTS, Y1, Y2, ccc, cashFromDso, dio, dpo, dso, equity, gross, netProfit, ocfY2, operatingProfit, profitBeforeTax, tax, totalAssets, tradeWorkingCapital, type LabLevel, type YearData } from '../lab/case';
import { fill, labText, type LabText } from '../lab/text';

const INPUT = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2';
const num = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });
const storage = (): Storage | undefined => { try { return window.localStorage; } catch { return undefined; } };
const STAGES = ['brief', 'docs', 'analysis', 'recommend', 'submit'] as const;
/** Figures a report might quote, for the mechanical "quoted figures" count. */
const KNOWN = [...[Y1, Y2].flatMap((y) => [y.revenue, y.cogs, y.receivables, y.inventory, y.payables, y.debt, y.cash, y.interest, y.equipment]),
  ocfY2(), netProfit(Y2), netProfit(Y1), equity(Y2), equity(Y1), tradeWorkingCapital(Y2), tradeWorkingCapital(Y1), dso(Y2), dio(Y2), dpo(Y2), ccc(Y2), dso(Y1), dio(Y1), ccc(Y1), cashFromDso(15), 75_000, 1_050_000, 480_000];

const emptyDraft = (): LabDraft => ({ answers: {}, ratings: {}, reflection: '' });

export default function LabPage({ level }: { level?: LabLevel }) {
  const { lang } = useI18n();
  const { owner } = useProgress();
  const lt = labText(lang);
  const key = labKey(storageKeyFor(owner));
  const [st, setSt] = useState<{ key: string; lab: LabState }>(() => ({ key, lab: loadLab(storage(), key) }));
  const [saveOk, setSaveOk] = useState(true);
  // If the signed-in person changed, read that person's saved work instead of showing the previous person's.
  const lab = st.key === key ? st.lab : loadLab(storage(), key);
  const update = (fn: (l: LabState) => LabState) => {
    const next = fn(lab);
    setSt({ key, lab: next });
    setSaveOk(saveLab(storage(), key, next));
    window.dispatchEvent(new Event(LAB_CHANGED)); // signed-in students: the app saves it to the account shortly
  };
  // Newer work merged in from the account (another device, or copied guest work) appears without a reload.
  useEffect(() => {
    const reload = () => setSt({ key, lab: loadLab(storage(), key) });
    window.addEventListener(LAB_SYNCED, reload);
    return () => window.removeEventListener(LAB_SYNCED, reload);
  }, [key]);

  if (!level) return <Hub lt={lt} lab={lab} />;
  return <Case lt={lt} level={level} lab={lab} update={update} saveOk={saveOk} />;
}

function Hub({ lt, lab }: { lt: LabText; lab: LabState }) {
  return (
    <div>
      <PageTitle title={lt.title} subtitle={lt.tagline} />
      <GuestOffer labOnly />
      <div className="mt-4 space-y-4">
        <Card>
          <p className="text-slate-700">{lt.hubIntro}</p>
          <p className="mt-2 text-sm text-slate-500">{lt.fictional}</p>
        </Card>
        <Alert tone="blue" title={lt.hubAssessTitle}>
          <ul className="mt-1 list-inside list-disc space-y-1">{lt.hubAssess.map((x) => <li key={x}>{x}</li>)}</ul>
        </Alert>
        <p className="text-sm text-slate-600">{lt.choose}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {LAB_LEVELS.map((l) => {
            const subs = lab.submissions.filter((s) => s.level === l);
            const best = subs.reduce((m, s) => Math.max(m, s.total), 0);
            return (
              <Card key={l}>
                <H2>{lt.levels[l].name}</H2>
                <p className="text-sm text-slate-600">{lt.levels[l].blurb}</p>
                {subs.length > 0 && <p className="mt-2"><Badge tone="green">{fill(lt.attemptsLine, { n: subs.length, best })}</Badge></p>}
                <div className="mt-3"><LinkButton to={`/lab/${l}`}>{lab.drafts[l] ? lt.resume : lt.start}</LinkButton></div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatementTable({ lt, title, rows }: { lt: LabText; title: string; rows: { label: string; a: number; b: number; strong?: boolean }[] }) {
  return (
    <Card>
      <H2>{title}</H2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[22rem] text-sm">
          <thead><tr className="text-left text-slate-500"><th className="py-1 pr-2 font-medium" /><th className="px-2 text-right font-medium">{lt.docsTitle.year1}</th><th className="pl-2 text-right font-medium">{lt.docsTitle.year2}</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={`border-t border-slate-100 ${r.strong ? 'font-semibold' : ''}`}>
                <td className="py-1 pr-2">{r.label}</td><td className="px-2 text-right tabular-nums">{num(r.a)}</td><td className="pl-2 text-right tabular-nums">{num(r.b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const pair = (f: (y: YearData) => number) => ({ a: f(Y1), b: f(Y2) });

function Case({ lt, level, lab, update, saveOk }: { lt: LabText; level: LabLevel; lab: LabState; update: (fn: (l: LabState) => LabState) => void; saveOk: boolean }) {
  const { lang } = useI18n();
  const [stage, setStage] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const draft = lab.drafts[level] ?? emptyDraft();
  const setDraft = (fn: (d: LabDraft) => LabDraft) => update((l) => ({ ...l, drafts: { ...l.drafts, [level]: { ...fn(l.drafts[level] ?? emptyDraft()), updatedAt: new Date().toISOString() } } }));
  const setAnswer = (id: string, v: string) => setDraft((d) => ({ ...d, answers: { ...d.answers, [id]: v } }));
  const results = verifiedResults(level, draft.answers);
  const verified = verifiedPoints(results);
  const complete = completeness(level, draft.answers).every((c) => c.ok);
  const self = effectiveSelfPoints(level, draft.answers, draft.ratings);
  const attempts = lab.submissions.filter((s) => s.level === level);

  function submit() {
    const at = new Date().toISOString();
    setSubmittedAt(at);
    setShowResults(true);
    update((l) => ({ ...l, submissions: [...l.submissions, { at, level, verified, self, total: Math.round((verified + self) * 10) / 10, correctIds: results.filter((r) => r.correct).map((r) => r.id) }] }));
  }
  function rate(id: string, v: number) {
    const ratings = { ...draft.ratings, [id]: v };
    const s = effectiveSelfPoints(level, draft.answers, ratings);
    const now = new Date().toISOString();
    update((l) => ({
      ...l,
      drafts: { ...l.drafts, [level]: { ...(l.drafts[level] ?? emptyDraft()), ratings, updatedAt: now } },
      submissions: l.submissions.map((x) => (x.at === submittedAt ? { ...x, self: s, total: Math.round((x.verified + s) * 10) / 10, updatedAt: now } : x)),
    }));
  }

  const rows1 = [
    { label: lt.rows.revenue, ...pair((y) => y.revenue) }, { label: lt.rows.cogs, ...pair((y) => y.cogs) }, { label: lt.rows.gross, ...pair(gross), strong: true },
    { label: lt.rows.opex, ...pair((y) => y.opexExDep) }, { label: lt.rows.depreciation, ...pair((y) => y.depreciation) }, { label: lt.rows.operating, ...pair(operatingProfit), strong: true },
    { label: lt.rows.interest, ...pair((y) => y.interest) }, { label: lt.rows.pbt, ...pair(profitBeforeTax) }, { label: lt.rows.tax, ...pair(tax) }, { label: lt.rows.net, ...pair(netProfit), strong: true },
  ];
  const rows2 = [
    { label: lt.rows.cash, ...pair((y) => y.cash) }, { label: lt.rows.receivables, ...pair((y) => y.receivables) }, { label: lt.rows.inventory, ...pair((y) => y.inventory) },
    { label: lt.rows.equipment, ...pair((y) => y.equipment) }, { label: lt.rows.assets, ...pair(totalAssets), strong: true },
    { label: lt.rows.payables, ...pair((y) => y.payables) }, { label: lt.rows.debt, ...pair((y) => y.debt) }, { label: lt.rows.equity, ...pair(equity) }, { label: lt.rows.le, ...pair(totalAssets), strong: true },
  ];

  const missedLessons = [...new Set(results.filter((r) => !r.correct).flatMap((r) => r.lessons))];
  const reportText = draft.answers['text.report'] ?? '';
  const stageName = (s: (typeof STAGES)[number]) => lt.stages[s];

  const taskFor = (r: CheckResult) => (r.id === 'consistency' ? null : lt.tasks[r.id]);
  /** A clear message when a typed number cannot be read (for example "74,9", which could be a decimal comma). Empty input says nothing. */
  const numberProblemNote = (raw: string) => {
    const p = numericInputProblem(raw);
    return p === 'ambiguous-separator' || p === 'not-a-number'
      ? <p role="alert" className="mt-1 text-sm font-medium text-red-700">{p === 'ambiguous-separator' ? lt.numberProblem.ambiguous : lt.numberProblem.invalid}</p>
      : null;
  };
  /** Visible progress on the stage buttons: numbers entered, and written fields completed. */
  const entered = results.filter((r) => r.given !== null).length;
  const fieldsDone = completeness(level, draft.answers).filter((c) => c.ok).length;
  const progressOf = (s: (typeof STAGES)[number]): string => (s === 'analysis' ? `${entered}/${results.length}` : s === 'recommend' ? `${fieldsDone}/${FIELDS[level].length}` : '');
  const earlier = (lab.earlier ?? []).filter((e) => e.level === level);
  const restoreEarlier = (e: EarlierDraft) => update((l) => {
    const now = new Date().toISOString();
    const cur = l.drafts[level];
    const keep = (l.earlier ?? []).filter((x) => x !== e);
    return { ...l, drafts: { ...l.drafts, [level]: { ...e.draft, updatedAt: now } }, earlier: cur ? [{ level, savedAt: cur.updatedAt ?? now, draft: cur }, ...keep] : keep };
  });

  return (
    <div>
      <p className="mb-2 text-sm"><Link to="/lab" className="text-indigo-700 underline">{lt.hubBack}</Link> / {lt.levels[level].name}</p>
      <PageTitle title={`${lt.title}: ${lt.tagline}`} subtitle={lt.levels[level].blurb} />
      <nav aria-label={lt.workflow} className="mb-4 flex flex-wrap gap-2">
        {STAGES.map((s, i) => (
          <button key={s} onClick={() => setStage(i)} aria-current={stage === i ? 'step' : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${stage === i ? 'bg-indigo-700 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{i + 1}. {stageName(s)}{progressOf(s) ? ` (${progressOf(s)})` : ''}</button>
        ))}
      </nav>
      {!saveOk && <div className="mb-3"><Alert tone="red">{lt.saveFailed}</Alert></div>}

      <div className="space-y-4">
        {stage === 0 && (
          <>
            <Card>
              <H2>{lt.stages.brief}</H2>
              <div className="space-y-2 text-slate-700">{lt.briefing[level].map((p) => <p key={p}>{p}</p>)}</div>
            </Card>
            <Card>
              <div className="space-y-2 text-slate-700">{lt.company.map((p) => <p key={p}>{p}</p>)}</div>
              <p className="mt-3 text-sm text-slate-500">{lt.fictional}</p>
            </Card>
            <Card>
              <H2>{lt.workflow}</H2>
              <ol className="list-inside list-decimal space-y-1 text-sm text-slate-700">{lt.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </Card>
          </>
        )}

        {stage === 1 && (
          <>
            <p className="text-sm text-slate-600">{lt.docsConvention}</p>
            <StatementTable lt={lt} title={lt.docsTitle.income} rows={rows1} />
            <StatementTable lt={lt} title={lt.docsTitle.balance} rows={rows2} />
            {level === 'advanced' && (
              <Card>
                <H2>{lt.docsTitle.notes}</H2>
                <ul className="space-y-3">{lt.notes.map((n) => <li key={n.from} className="text-sm text-slate-700"><span className="font-semibold">{n.from}:</span> {n.text}</li>)}</ul>
              </Card>
            )}
          </>
        )}

        {stage === 2 && (
          <Card>
            <H2>{lt.analysisTitle}</H2>
            <p className="mb-1 text-sm text-slate-600">{lt.analysisIntro[level]}</p>
            <p className="mb-3 text-xs text-slate-500">{lt.numberHint} {fill(lt.answered, { n: entered, total: results.length })}</p>
            <div className="space-y-4">
              {CHECKS[level].map((c) => {
                const task = lt.tasks[c.id]!;
                const res = results.find((r) => r.id === c.id)!;
                const given = draft.answers[c.id] ?? '';
                return (
                  <div key={c.id}>
                    <label className="block text-sm font-medium">{task.prompt}
                      <input inputMode="decimal" value={given} onChange={(e) => setAnswer(c.id, e.target.value)} className={INPUT} />
                    </label>
                    {numberProblemNote(given)}
                    {level === 'beginner' && (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                        <button type="button" className="text-indigo-700 underline" onClick={() => setOpen({ ...open, [c.id]: !open[c.id] })}>{lt.showHint}</button>
                        {given && !numericInputProblem(given) && <Badge tone={res.correct ? 'green' : 'amber'}>{res.correct ? lt.correctLabel : lt.incorrectLabel}</Badge>}
                      </div>
                    )}
                    {level === 'beginner' && open[c.id] && (
                      <div className="mt-1 rounded-lg bg-slate-50 p-2 text-sm text-slate-700">{task.formula && <p className="font-mono">{task.formula}</p>}{task.hint && <p>{task.hint}</p>}</div>
                    )}
                  </div>
                );
              })}
              {level !== 'beginner' && (
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-semibold">{lt.consistency.title}</p>
                  <label className="mt-2 block text-sm font-medium">{lt.consistency.targetDso}<input inputMode="decimal" value={draft.answers.targetDso ?? ''} onChange={(e) => setAnswer('targetDso', e.target.value)} className={INPUT} /></label>
                  {numberProblemNote(draft.answers.targetDso ?? '')}
                  <label className="mt-2 block text-sm font-medium">{lt.consistency.release}<input inputMode="decimal" value={draft.answers.release ?? ''} onChange={(e) => setAnswer('release', e.target.value)} className={INPUT} /></label>
                  {numberProblemNote(draft.answers.release ?? '')}
                  <p className="mt-1 text-xs text-slate-500">{lt.consistency.note}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {stage === 3 && (
          <Card>
            <H2>{lt.recommendTitle}</H2>
            <p className="mb-3 text-sm text-slate-600">{lt.recommendIntro}</p>
            <div className="space-y-4">
              {FIELDS[level].map((f) => {
                const ft = lt.fields[f.id]!;
                return (
                  <label key={f.id} className="block text-sm font-medium">{ft.label}
                    {ft.hint && <span className="block text-xs font-normal text-slate-500">{ft.hint}</span>}
                    <textarea rows={f.id === 'report' ? 14 : 4} value={draft.answers[`text.${f.id}`] ?? ''} onChange={(e) => setAnswer(`text.${f.id}`, e.target.value)} className={INPUT} />
                  </label>
                );
              })}
            </div>
            {earlier.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-amber-900">{lt.earlierTitle}</p>
                <p className="text-xs text-amber-900">{lt.earlierNote}</p>
                <ul className="mt-2 space-y-2">
                  {earlier.map((e) => (
                    <li key={`${e.savedAt}-${Object.values(e.draft.answers).join('').length}`} className="text-sm text-slate-700">
                      <p className="font-medium">{fill(lt.earlierLine, { date: e.savedAt ? new Date(e.savedAt).toLocaleString(lang === 'th' ? 'th-TH' : 'en-GB') : '-' })}</p>
                      <p className="line-clamp-3 whitespace-pre-line text-xs text-slate-600">{Object.entries(e.draft.answers).filter(([k, v]) => k.startsWith('text.') && v).map(([, v]) => v).join(' / ').slice(0, 300)}</p>
                      <div className="mt-1"><Button tone="secondary" onClick={() => restoreEarlier(e)}>{lt.earlierRestore}</Button></div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {stage === 4 && (
          <>
            <Card>
              <H2>{lt.submitTitle}</H2>
              <p className="mb-3 text-sm text-slate-600">{lt.submitIntro}</p>
              <p className="text-sm font-semibold">{lt.completenessTitle}</p>
              <p className="mb-1 text-xs text-slate-500">{lt.completenessNote}</p>
              <ul className="mb-3 list-inside list-disc text-sm text-slate-700">
                {completeness(level, draft.answers).map((c) => <li key={c.id}>{lt.fields[c.id]!.label}: {fill(lt.words, { n: c.words, need: c.need })} {c.ok ? '✓' : ''}</li>)}
                {level === 'advanced' && <li>{fill(lt.quoted, { n: quotedFigures(reportText, KNOWN) })}</li>}
              </ul>
              <Button onClick={submit}>{lt.submitButton}</Button>
            </Card>

            {showResults && (
              <>
                <Card>
                  <H2>{lt.resultsTitle}</H2>
                  <p className="mb-3 font-semibold">{fill(lt.verifiedLine, { points: verified, n: results.filter((r) => r.correct).length, total: results.length })}</p>
                  <ul className="space-y-3">
                    {results.map((r) => (
                      <li key={r.id} className="text-sm">
                        <p className="font-medium">{r.id === 'consistency' ? lt.consistency.title : taskFor(r)!.prompt} <Badge tone={r.correct ? 'green' : 'amber'}>{r.correct ? lt.correctLabel : lt.incorrectLabel}</Badge></p>
                        <p className="text-slate-600">{lt.yourAnswer} {r.given === null ? lt.noAnswer : num(r.given)}{r.id !== 'consistency' || r.expected > 0 ? <> · {lt.expectedAnswer} {num(Math.round(r.expected * 10) / 10)}</> : null}</p>
                        <p className="text-slate-700">{lt.explanations[r.id]}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <H2>{lt.studyTitle}</H2>
                  {missedLessons.length === 0 ? <p className="text-sm text-slate-700">{lt.studyNone}</p> : (
                    <ul className="list-inside list-disc text-sm text-slate-700">
                      {missedLessons.map((id) => {
                        const l = getLesson(id, lang);
                        return l ? <li key={id}><Link to={`/lesson/${id}`} className="font-semibold text-indigo-700 underline">{l.title}</Link></li> : null;
                      })}
                    </ul>
                  )}
                </Card>
                <Card>
                  <H2>{lt.modelTitle}</H2>
                  <div className="space-y-2 text-sm text-slate-700">{lt.model.map((p) => <p key={p}>{p}</p>)}</div>
                </Card>
                <Card>
                  <H2>{lt.selfTitle}</H2>
                  <p className="mb-3 text-sm text-slate-600">{lt.selfNote}</p>
                  {!complete && <div className="mb-3"><Alert tone="amber">{lt.capNote}</Alert></div>}
                  <ul className="space-y-4">
                    {RUBRIC.map((r) => (
                      <li key={r.id} className="text-sm">
                        <p className="font-medium">{lt.rubric[r.id]!.name} ({r.points})</p>
                        <p className="text-slate-600">{lt.rubric[r.id]!.strong}</p>
                        <div className="mt-1 flex gap-3" role="radiogroup" aria-label={lt.rubric[r.id]!.name}>
                          {Array.from({ length: RATING_MAX + 1 }, (_, v) => (
                            <label key={v} className="flex items-center gap-1"><input type="radio" name={`rate-${r.id}`} checked={(draft.ratings[r.id] ?? 0) === v} onChange={() => rate(r.id, v)} />{v}</label>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-semibold">{lt.totalTitle}</p>
                  <p className="text-sm">{fill(lt.totalLine, { verified, self, total: Math.round((verified + self) * 10) / 10 })}</p>
                  <p className="text-xs text-slate-500">{lt.totalNote} ({lt.rubricVerified}: {VERIFIED_POINTS})</p>
                </Card>
                <Card>
                  <H2>{lt.reflectTitle}</H2>
                  <label className="block text-sm font-medium">{lt.reflectPrompt}
                    <textarea rows={4} value={draft.reflection} onChange={(e) => setDraft((d) => ({ ...d, reflection: e.target.value }))} className={INPUT} />
                  </label>
                  <div className="mt-3"><Button tone="secondary" onClick={() => { setShowResults(false); setStage(2); }}>{lt.revise}</Button></div>
                </Card>
              </>
            )}
            {attempts.length > 0 && (
              <Card>
                <H2>{lt.history}</H2>
                <ul className="list-inside list-disc text-sm text-slate-700">{attempts.map((a, i) => <li key={a.at}>{fill(lt.historyLine, { n: i + 1, verified: a.verified, total: a.total })}</li>)}</ul>
              </Card>
            )}
          </>
        )}
      </div>
      <p className="mt-4 text-xs text-slate-500">{lt.save}</p>
      <div className="mt-3 flex justify-between">
        <Button tone="secondary" disabled={stage === 0} onClick={() => setStage(stage - 1)}>{lt.previous}</Button>
        <Button disabled={stage === STAGES.length - 1} onClick={() => setStage(stage + 1)}>{lt.next}</Button>
      </div>
    </div>
  );
}
