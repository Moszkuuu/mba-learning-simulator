import { useMemo, useState } from 'react';
import { ALL_LESSON_KEYS, getLesson, getLessons, reviseLessonFor, subjectOfLesson } from '../content';
import { subjectById } from '../curriculum/program';
import { competencyById } from '../curriculum/program';
import { Alert, Badge, Card, H2, Link, LinkButton, PageTitle } from '../components/ui';
import { QuizRunner, type QuizOutcome } from '../components/QuizRunner';
import { useProgress } from '../components/ProgressContext';
import { useI18n } from '../i18n';
import { competencyStats } from '../lib/progress';
import { unmetPrerequisites } from '../lib/mastery';

export default function LessonPage({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const lesson = getLesson(id, lang);
  const { progress, dispatch } = useProgress();
  const [stage, setStage] = useState<'learn' | 'quiz' | 'done'>('learn');
  const [outcomes, setOutcomes] = useState<QuizOutcome[]>([]);
  const ids = useMemo(() => lesson?.questions.map((q) => q.id) ?? [], [lesson?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lesson) {
    return (
      <Card>
        <H2>{t('lesson.notFound')}</H2>
        <LinkButton to="/curriculum">{t('lesson.backToCurriculum')}</LinkButton>
      </Card>
    );
  }
  const subjectId = subjectOfLesson(lesson.id);
  const all = getLessons(lang).filter((l) => subjectOfLesson(l.id) === subjectId);
  const idx = all.findIndex((l) => l.id === lesson.id);
  const next = all[idx + 1];
  const done = progress.completedLessons.includes(lesson.id);
  const prevScore = progress.lessonScores[lesson.id];
  const stats = competencyStats(progress);
  // A prerequisite only blocks the student if its lessons are not all completed yet; mastery progress is shown as a hint.
  const lessonsDone = (c: string) => ALL_LESSON_KEYS.filter((l) => l.competencies.includes(c)).every((l) => progress.completedLessons.includes(l.id));
  const unmet = lesson.competencies.flatMap((c) => unmetPrerequisites(c, stats)).filter((c) => !lessonsDone(c));

  function finish(o: QuizOutcome[]) {
    setOutcomes(o);
    dispatch({ type: 'completeLesson', lessonId: lesson!.id, correct: o.filter((x) => x.correct).length, total: o.length });
    setStage('done');
  }

  if (stage === 'quiz') {
    return (
      <div>
        <PageTitle title={t('lesson.quizTitle', { title: lesson.title })} subtitle={t('lesson.quizSubtitle')} />
        <QuizRunner questionIds={ids} context="lesson" onFinish={finish} />
      </div>
    );
  }

  if (stage === 'done') {
    const score = outcomes.filter((o) => o.correct).length;
    const missed = outcomes.filter((o) => !o.correct);
    return (
      <div>
        <PageTitle title={t('lesson.complete')} subtitle={lesson.title} />
        <Card className="space-y-4">
          <p className="text-4xl font-bold text-indigo-700">{score} / {outcomes.length}</p>
          {missed.length === 0 ? (
            <Alert tone="green" title={t('lesson.perfect')}>{t('lesson.perfectBody')}</Alert>
          ) : (
            <Alert tone="amber" title={score / outcomes.length < 0.7 ? t('lesson.reviseFirst') : t('lesson.reviewMissed')}>
              <ul className="mt-1 list-inside list-disc">{missed.map((m) => <li key={m.question.id}>{m.question.concept}</li>)}</ul>
            </Alert>
          )}
          <Alert tone="blue" title={t('lesson.masteryNoteTitle')}>{t('lesson.masteryNote')}</Alert>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" onClick={() => { setOutcomes([]); setStage('learn'); }}>{t('lesson.reread')}</button>
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" onClick={() => setStage('quiz')}>{t('lesson.retake')}</button>
            {next ? <LinkButton to={`/lesson/${next.id}`}>{t('lesson.next', { n: next.number })}</LinkButton> : <LinkButton to="/curriculum">{t('lesson.backToCurriculum')}</LinkButton>}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm"><Link to="/curriculum" className="text-indigo-700 underline">{subjectById(subjectOfLesson(lesson.id) ?? '')?.name[lang]}</Link> / {t('lesson.label', { n: lesson.number })}</p>
      <PageTitle title={`${t('lesson.label', { n: lesson.number })}: ${lesson.title}`} subtitle={lesson.summary} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge>{t('lesson.minutes', { n: lesson.minutes })}</Badge>
        {done && <Badge tone="green">{t('lesson.completedBadge')}{prevScore ? ` - ${prevScore.correct}/${prevScore.total}` : ''}</Badge>}
        <Badge tone="indigo">{t('lesson.questionCount', { n: lesson.questions.length })}</Badge>
        {lesson.competencies.map((c) => <Badge key={c} tone="green">{competencyById(c)?.name[lang]}</Badge>)}
        {lesson.status !== 'full' && <Badge tone="amber">{t('lesson.prototypeDepth')}</Badge>}
      </div>
      {lang === 'th' && <div className="mb-4"><Alert tone="amber">{t('th.draftNotice')}</Alert></div>}
      {unmet.length > 0 && (
        <div className="mb-4">
          <Alert tone="amber" title={t('lesson.prereqTitle')}>
            {t('lesson.prereqBody')}{' '}
            {[...new Set(unmet)].map((c, i) => {
              const target = reviseLessonFor(c);
              const name = competencyById(c)?.name[lang];
              return (
                <span key={c}>
                  {i > 0 && ', '}
                  {target ? <Link to={`/lesson/${target.id}`} className="font-semibold text-indigo-700 underline">{name}</Link> : name}
                  {` (${stats.find((x) => x.competency === c)?.progressPct ?? 0}%)`}
                </span>
              );
            })}
          </Alert>
        </div>
      )}
      <div className="space-y-4">
        <Card>
          <H2>{t('lesson.objectives')}</H2>
          <ul className="list-inside list-disc space-y-1 text-slate-700">{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </Card>
        <Card>
          <H2>{t('lesson.idea')}</H2>
          <div className="space-y-3 text-slate-700">{lesson.explanation.map((p, i) => <p key={i}>{p}</p>)}</div>
        </Card>
        <Card>
          <H2>{t('lesson.formulas')}</H2>
          <dl className="space-y-3">
            {lesson.formulas.map((f) => (
              <div key={f.name} className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{f.name}</dt>
                <dd className="mt-1 break-words font-mono text-sm text-slate-900">{f.expr}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card>
          <H2>{t('lesson.realWorld')}</H2>
          <p className="text-slate-700">{lesson.realWorld}</p>
        </Card>
        {lesson.workedExamples.map((w, i) => (
          <Card key={i}>
            <H2>{t('lesson.worked')}: {w.title}</H2>
            <p className="text-sm font-semibold text-slate-600">{t('lesson.given')}</p>
            <ul className="mb-3 list-inside list-disc text-slate-700">{w.given.map((g) => <li key={g}>{g}</li>)}</ul>
            <p className="text-sm font-semibold text-slate-600">{t('lesson.solution')}</p>
            <ol className="mb-3 list-inside list-decimal space-y-1 text-slate-700">{w.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <Alert tone="blue" title={t('lesson.takeaway')}>{w.result}</Alert>
          </Card>
        ))}
        <Card>
          <H2>{t('lesson.misconceptions')}</H2>
          <ul className="list-inside list-disc space-y-2 text-slate-700">{lesson.misconceptions.map((m) => <li key={m}>{m}</li>)}</ul>
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setStage('quiz')} className="rounded-lg bg-indigo-700 px-5 py-2.5 font-semibold text-white hover:bg-indigo-800">{t('lesson.startQuiz', { n: lesson.questions.length })}</button>
        </div>
      </div>
    </div>
  );
}
