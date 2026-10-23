import { useMemo, useState } from 'react';
import { ALL_QUESTION_KEYS } from '../content';
import { QuizRunner, type QuizOutcome } from '../components/QuizRunner';
import { Alert, Button, Card, H2, LinkButton, PageTitle } from '../components/ui';
import { useProgress } from '../components/ProgressContext';
import { useI18n } from '../i18n';
import { dueQuestionIds } from '../lib/srs';
import { shuffle } from '../lib/shuffle';
import { competencyById } from '../curriculum/program';

const REVIEW_BATCH = 10;
const EXAM_SIZE = 12;
const EXAM_MAX_PER_COMPETENCY = 4;
const EXAM_MAX_WRITTEN = 1;

/** Cumulative exam: mixed competencies and levels, capped per competency, at most one written item. */
export function buildExam(): string[] {
  const perComp: Record<string, number> = {};
  let written = 0;
  const out: string[] = [];
  for (const k of shuffle(ALL_QUESTION_KEYS)) {
    if (out.length >= EXAM_SIZE) break;
    if ((perComp[k.competency] ?? 0) >= EXAM_MAX_PER_COMPETENCY) continue;
    if (k.type === 'written') { if (written >= EXAM_MAX_WRITTEN) continue; written++; }
    perComp[k.competency] = (perComp[k.competency] ?? 0) + 1;
    out.push(k.id);
  }
  return out;
}

type Mode = 'menu' | 'review' | 'exam';

export default function ReviewPage() {
  const { t, lang } = useI18n();
  const { progress, dispatch } = useProgress();
  const [mode, setMode] = useState<Mode>('menu');
  const [ids, setIds] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<QuizOutcome[] | null>(null);
  const due = useMemo(() => dueQuestionIds(progress.cards, new Date()), [progress.cards]);

  function startReview() {
    setIds(due.slice(0, REVIEW_BATCH));
    setOutcomes(null);
    setMode('review');
  }
  function startExam() {
    setIds(buildExam());
    setOutcomes(null);
    setMode('exam');
  }
  function finish(o: QuizOutcome[]) {
    setOutcomes(o);
    const correct = o.filter((x) => x.correct).length;
    if (mode === 'exam') {
      const byCompetency: Record<string, { correct: number; total: number }> = {};
      for (const x of o) {
        const c = (byCompetency[x.question.competency] ??= { correct: 0, total: 0 });
        c.total++;
        if (x.correct) c.correct++;
      }
      dispatch({ type: 'examResult', correct, total: o.length, byCompetency });
    } else {
      dispatch({ type: 'reviewDone', correct, total: o.length });
    }
  }

  if (mode !== 'menu' && outcomes) {
    const correct = outcomes.filter((o) => o.correct).length;
    const by: Record<string, { c: number; n: number }> = {};
    outcomes.forEach((o) => { const b = (by[o.question.competency] ??= { c: 0, n: 0 }); b.n++; if (o.correct) b.c++; });
    return (
      <div>
        <PageTitle title={mode === 'exam' ? t('review.examResults') : t('review.reviewResults')} />
        <Card className="space-y-4">
          <p className="text-4xl font-bold text-indigo-700">{correct} / {outcomes.length}</p>
          <ul className="divide-y divide-slate-100 text-sm">
            {Object.entries(by).map(([c, v]) => <li key={c} className="flex justify-between py-2"><span>{competencyById(c)?.name[lang]}</span><span>{v.c}/{v.n}</span></li>)}
          </ul>
          <Alert tone="blue">{t('review.afterNote')}</Alert>
          <Button onClick={() => { setMode('menu'); setOutcomes(null); }}>{t('review.back')}</Button>
        </Card>
      </div>
    );
  }

  if (mode !== 'menu') {
    return (
      <div>
        <PageTitle title={mode === 'exam' ? t('review.examTitle') : t('review.dueTitle')} />
        <QuizRunner questionIds={ids} context={mode === 'exam' ? 'exam' : 'review'} onFinish={finish} />
      </div>
    );
  }

  const lastExam = progress.exams[progress.exams.length - 1];
  return (
    <div>
      <PageTitle title={t('nav.review')} subtitle={t('review.subtitle')} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <H2>{t('review.dueTitle')}</H2>
          <p className="text-3xl font-bold text-indigo-700">{due.length}</p>
          <p className="text-sm text-slate-600">{due.length ? t('review.dueBody', { n: Math.min(due.length, REVIEW_BATCH) }) : t('review.noneDue')}</p>
          <p className="text-xs text-slate-500">{t('review.schedule')}</p>
          <div className="flex gap-3">
            <Button onClick={startReview} disabled={due.length === 0}>{t('review.start')}</Button>
            {due.length === 0 && <LinkButton to="/practice" tone="secondary">{t('nav.practice')}</LinkButton>}
          </div>
        </Card>
        <Card className="space-y-3">
          <H2>{t('review.examTitle')}</H2>
          <p className="text-sm text-slate-600">{t('review.examBody', { n: EXAM_SIZE })}</p>
          {lastExam && <p className="text-sm">{t('review.lastExam')}: <strong>{lastExam.correct}/{lastExam.total}</strong></p>}
          <Button onClick={startExam}>{t('review.startExam')}</Button>
        </Card>
      </div>
    </div>
  );
}
