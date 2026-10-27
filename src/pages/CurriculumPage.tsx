import { useState } from 'react';
import { ToolLinks } from '../components/AccountEntry';
import { Badge, Card, H2, Link, LinkButton, PageTitle } from '../components/ui';
import { useProgress } from '../components/ProgressContext';
import { useI18n } from '../i18n';
import { COMPETENCIES, REFERENCES, SUBJECTS, THREADS, subjectById, unitsOf } from '../curriculum/program';
import { lessonsOfSubject, reviseLessonFor } from '../content';
import { competencyStats } from '../lib/progress';

const STATUS_TONE = { mastered: 'green', learning: 'indigo', weak: 'red', stale: 'amber', new: 'slate' } as const;

export default function CurriculumPage() {
  const { progress } = useProgress();
  const { t, lang } = useI18n();
  const stats = competencyStats(progress);
  const [open, setOpen] = useState<string[]>(['financial-accounting']);
  const jump = (id: string) => {
    setOpen((o) => (o.includes(id) ? o : [...o, id]));
    setTimeout(() => document.getElementById(`subject-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const subjectLinks = (ids: string[]) => ids.map((r, i) => {
    const sub = subjectById(r);
    if (!sub) return null;
    return <span key={r}>{i > 0 && ', '}{sub.status === 'available' ? <button type="button" className="font-medium text-indigo-700 underline" onClick={() => jump(r)}>{sub.name[lang]}</button> : sub.name[lang]}</span>;
  });

  return (
    <div>
      <PageTitle title={t('cur.title')} subtitle={t('cur.subtitle')} />
      <ToolLinks />
      <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">{t('cur.disclaimer')}</p>
      <div className="mt-4 space-y-3">
        {SUBJECTS.map((s) => {
          const available = s.status === 'available';
          const lessons = lessonsOfSubject(s.id, lang);
          const done = lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
          const comps = COMPETENCIES.filter((c) => c.subjectId === s.id);
          const needs = s.requires, recs = s.recommends;
          return (
            <Card key={s.id} className={available ? '' : 'opacity-80'}>
              <details id={`subject-${s.id}`} open={open.includes(s.id)} onToggle={(e) => { const isOpen = (e.currentTarget as HTMLDetailsElement).open; setOpen((o) => (isOpen ? (o.includes(s.id) ? o : [...o, s.id]) : o.filter((x) => x !== s.id))); }}>
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{t('cur.subject', { n: s.number })}</span>
                    <span className="text-lg font-semibold text-slate-900">{s.name[lang]}</span>
                  </span>
                  {available ? <Badge tone="green">{t('cur.progressCount', { done, total: lessons.length })}</Badge> : <Badge>{t('cur.planned')}</Badge>}
                </summary>
                {(needs.length > 0 || recs.length > 0) && (
                  <p className="mt-2 text-sm text-slate-600">
                    {needs.length > 0 && <>{t('cur.requires')}: {subjectLinks(needs)}. </>}
                    {recs.length > 0 && <>{t('cur.recommends')}: {subjectLinks(recs)}.</>}
                  </p>
                )}
                {available && (
                  <>
                    <div className="mt-4 space-y-4">
                      {unitsOf(s.id).map((u) => {
                        const ul = lessons.filter((l) => l.unitId === u.id);
                        return (
                          <div key={u.id}>
                            <p className="text-sm font-semibold text-slate-800">
                              {u.name[lang]} <Badge tone="slate">{u.level === 'mixed' ? t('level.mixed') : t('level.short', { n: u.level })}</Badge>
                            </p>
                            {ul.length === 0 ? (
                              <p className="text-sm text-slate-500">{t('cur.unitPlanned')}</p>
                            ) : (
                              <ul className="divide-y divide-slate-100">
                                {ul.map((l) => {
                                  const score = progress.lessonScores[l.id];
                                  return (
                                    <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                                      <div>
                                        <Link to={`/lesson/${l.id}`} className="font-medium text-indigo-700 hover:underline">{t('lesson.label', { n: l.number })}: {l.title}</Link>
                                        <p className="text-sm text-slate-500">{l.summary}</p>
                                      </div>
                                      {progress.completedLessons.includes(l.id)
                                        ? <Badge tone="green">{t('cur.done')}{score ? ` ${score.correct}/${score.total}` : ''}</Badge>
                                        : <Badge>{t('lesson.minutes', { n: l.minutes })}</Badge>}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-5">
                      <H2>{t('cur.competencies')}</H2>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {comps.map((c) => {
                          const st = stats.find((x) => x.competency === c.id)!;
                          return (
                            <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                              {c.available && reviseLessonFor(c.id)
                                ? <Link to={`/lesson/${reviseLessonFor(c.id)!.id}`} className="font-medium text-indigo-700 hover:underline">{c.name[lang]}</Link>
                                : <span>{c.name[lang]}</span>}
                              {c.available ? <Badge tone={STATUS_TONE[st.status]}>{t(`mastery.${st.status}` as 'mastery.new')}</Badge> : <Badge>{t('cur.planned')}</Badge>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {(REFERENCES[s.id] ?? []).length > 0 && (
                      <div className="mt-5">
                        <H2>{t('cur.furtherReading')}</H2>
                        <ul className="space-y-2 text-sm">
                          {(REFERENCES[s.id] ?? []).map((r) => (
                            <li key={r.title}>
                              <a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-indigo-700 underline">{r.title}</a> - {r.author}. {r.note[lang]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </details>
            </Card>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <LinkButton to="/practice" tone="secondary">{t('cur.practice')}</LinkButton>
        <LinkButton to="/review" tone="secondary">{t('nav.review')}</LinkButton>
        <LinkButton to="/simulator" tone="secondary">{t('nav.simulator')}</LinkButton>
        <LinkButton to="/glossary" tone="secondary">{t('nav.glossary')}</LinkButton>
      </div>
      <Card className="mt-4">
        <H2>{t('cur.threads')}</H2>
        <p className="mb-2 text-sm text-slate-600">{t('cur.threadsNote')}</p>
        <div className="flex flex-wrap gap-2">{THREADS.map((th) => <Badge key={th.id}>{th.name[lang]}</Badge>)}</div>
      </Card>
    </div>
  );
}
