import { useMemo } from 'react';
import { getLessons, reviseLessonFor, subjectOfLesson } from '../content';
import { COMPETENCIES, SUBJECTS, competencyById } from '../curriculum/program';
import { useProgress } from '../components/ProgressContext';
import { HomeHero, ToolLinks } from '../components/AccountEntry';
import { ActivityList } from '../components/ActivityList';
import { Badge, Card, H2, LinkButton, PageTitle, ProgressBar, Stat, Link } from '../components/ui';
import { levelInfo, quizAccuracy, competencyStats, xp } from '../lib/progress';
import { revisionPriorities } from '../lib/mastery';
import { dueQuestionIds } from '../lib/srs';
import { useI18n } from '../i18n';

export default function Dashboard() {
  const { progress } = useProgress();
  const { t, lang } = useI18n();
  const lessons = getLessons(lang);
  const now = new Date();
  const stats = useMemo(() => competencyStats(progress, now), [progress]); // eslint-disable-line react-hooks/exhaustive-deps
  const lvl = levelInfo(xp(progress, now));
  const acc = quizAccuracy(progress);
  const weak = revisionPriorities(stats);
  const due = dueQuestionIds(progress.cards, now).length;
  const nextLesson = lessons.find((l) => !progress.completedLessons.includes(l.id));
  const completed = progress.completedLessons.length;
  const available = COMPETENCIES.filter((c) => c.available);
  const mastered = stats.filter((s) => s.status === 'mastered').length;
  const bySubject = SUBJECTS.map((s) => {
    const ls = lessons.filter((l) => subjectOfLesson(l.id) === s.id);
    const done = ls.filter((l) => progress.completedLessons.includes(l.id)).length;
    return { s, done, total: ls.length, pct: ls.length ? (done / ls.length) * 100 : 0 };
  });
  const overall = bySubject.reduce((sum, b) => sum + b.pct, 0) / SUBJECTS.length;

  return (
    <div>
      <PageTitle title={t('dash.title')} subtitle={t('dash.subtitle')} />
      <HomeHero continueTo={nextLesson ? `/lesson/${nextLesson.id}` : '/courses'} started={progress.attempts.length > 0 || completed > 0} />
      <ToolLinks />
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-indigo-700">{t('home.details')}</summary>
        <div className="mt-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label={t('dash.level')} value={`L${lvl.level} ${t(`rank.${lvl.level}` as 'rank.1')}`} hint={lvl.nextName ? t('dash.xpToNext', { n: lvl.toNext, name: t(`rank.${lvl.level + 1}` as 'rank.2') }) : t('dash.topLevel')} tone="text-indigo-700" />
        <Stat label={t('dash.completed')} value={`${completed} / ${lessons.length}`} hint={t('dash.completedHint')} />
        <Stat label={t('dash.accuracy')} value={acc === null ? '-' : `${acc.toFixed(0)}%`} hint={t('dash.answers', { n: progress.attempts.length })} />
        <Stat label={t('dash.mastered')} value={`${mastered} / ${available.length}`} hint={t('dash.masteredHint')} tone="text-emerald-700" />
        <Stat label={t('dash.dueReviews')} value={due} hint={<Link to="/review" className="text-indigo-700 underline">{t('dash.openReview')}</Link>} tone={due ? 'text-amber-700' : 'text-slate-900'} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <H2>{t('dash.progress')}</H2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">{t('dash.bySubject')}</p>
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {bySubject.map(({ s, done, total, pct }) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-xs text-slate-600"><span>{s.name[lang]}</span><span>{done}/{total}</span></div>
                    <ProgressBar value={pct} label={s.name[lang]} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm"><span>{t('dash.program', { n: SUBJECTS.length })}</span><span>{overall.toFixed(0)}%</span></div>
              <ProgressBar value={overall} label={t('dash.program', { n: SUBJECTS.length })} color="bg-sky-600" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm"><span>{t('dash.levelProgress', { n: lvl.xp })}</span><span>{Math.round(lvl.pct)}%</span></div>
              <ProgressBar value={lvl.pct} label={t('dash.level')} color="bg-emerald-600" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {nextLesson
              ? <LinkButton to={`/lesson/${nextLesson.id}`}>{completed ? t('dash.continue', { n: nextLesson.number }) : t('dash.start', { n: nextLesson.number })}</LinkButton>
              : <LinkButton to="/practice">{t('dash.allDone')}</LinkButton>}
            <LinkButton to="/review" tone="secondary">{t('nav.review')}</LinkButton>
            <LinkButton to="/practice" tone="secondary">{t('nav.practice')}</LinkButton>
            <LinkButton to="/simulator" tone="secondary">{t('nav.simulator')}</LinkButton>
          </div>
        </Card>

        <Card>
          <H2>{t('dash.weak')}</H2>
          {weak.length === 0 ? (
            <p className="text-sm text-slate-600">{progress.attempts.length < 3 ? t('dash.weakEmpty') : t('dash.weakNone')}</p>
          ) : (
            <ul className="space-y-3">
              {weak.map((w) => {
                const lk = reviseLessonFor(w.competency);
                return (
                  <li key={w.competency} className="text-sm">
                    <p className="font-medium">{competencyById(w.competency)?.name[lang]}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge tone={w.status === 'weak' ? 'red' : 'amber'}>{w.status === 'weak' ? `${Math.round((w.accuracy ?? 0) * 100)}%` : t('mastery.stale')}</Badge>
                      {lk && <Link to={`/lesson/${lk.id}`} className="text-indigo-700 underline">{t('dash.revise')}</Link>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <H2>{t('dash.competencies')}</H2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {available.map((c) => {
              const s = stats.find((x) => x.competency === c.id)!;
              return (
                <div key={c.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="font-medium">{c.name[lang]}</p>
                  <div className="my-2"><ProgressBar value={s.progressPct} label={c.name[lang]} color={s.status === 'mastered' ? 'bg-emerald-600' : s.status === 'weak' ? 'bg-red-600' : 'bg-indigo-600'} /></div>
                  <p className="text-xs text-slate-600">{t(`mastery.${s.status}` as 'mastery.new')} - {t('dash.attempts', { n: s.attempts })}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500">{t('dash.masteryRule')}</p>
        </Card>

        <Card className="lg:col-span-3">
          <H2>{t('dash.recent')}</H2>
          <ActivityList items={progress.activity.slice(0, 6)} empty={t('dash.recentEmpty')} />
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">{t('dash.subjects')}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map((s) => (
          <Card key={s.id} className={s.status === 'available' ? 'border-indigo-300' : 'opacity-70'}>
            <p className="text-xs font-semibold uppercase text-slate-500">{t('cur.subject', { n: s.number })}</p>
            <p className="font-semibold">{s.name[lang]}</p>
            <div className="mt-2">{s.status === 'available' ? <Link to="/courses" className="text-sm font-medium text-indigo-700 underline">{t('dash.openSubject')}</Link> : <Badge>{t('cur.planned')}</Badge>}</div>
          </Card>
        ))}
      </div>
        </div>
      </details>
    </div>
  );
}
