import { useMemo, useState } from 'react';
import type { Question } from '../content/types';
import { getQuestion } from '../content';
import { applyPlan, makePlan } from '../lib/shuffle';
import { useI18n } from '../i18n';
import type { AttemptContext } from '../lib/progress';
import { useProgress } from './ProgressContext';
import { QuestionCard } from './QuestionCard';
import { Card, ProgressBar } from './ui';

export interface QuizOutcome {
  question: Question;
  correct: boolean;
  score: number;
}

/**
 * Runs a sequence of questions in random order and records every attempt.
 * The order is fixed from question IDs, and questions are resolved in the active language at render time,
 * so switching language mid-quiz keeps your place.
 */
export function QuizRunner({ questionIds, context, onFinish }: {
  questionIds: string[];
  context: AttemptContext;
  onFinish: (outcomes: QuizOutcome[]) => void;
}) {
  const { dispatch } = useProgress();
  const { t, lang } = useI18n();
  const plan = useMemo(() => makePlan(questionIds), [questionIds]);
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<QuizOutcome[]>([]);
  const item = plan[index];
  const base = getQuestion(item.id, lang);
  if (!base) return null;
  const q = applyPlan(base, item);
  const last = index === plan.length - 1;

  return (
    <Card>
      <div className="mb-4">
        <p className="mb-1 text-sm text-slate-600">{t('quiz.progress', { i: index + 1, n: plan.length })}</p>
        <ProgressBar value={(index / plan.length) * 100} label={t('quiz.progressLabel')} />
      </div>
      <QuestionCard
        key={q.id}
        question={q}
        nextLabel={last ? t('quiz.seeResults') : t('quiz.next')}
        onAnswered={(r) => {
          dispatch({ type: 'attempt', questionId: q.id, correct: r.correct, score: r.score, given: r.given, context });
          setOutcomes((o) => [...o, { question: q, correct: r.correct, score: r.score }]);
        }}
        onNext={() => (last ? onFinish(outcomes) : setIndex(index + 1))}
      />
    </Card>
  );
}
