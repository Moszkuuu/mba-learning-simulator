import { useState } from 'react';
import type { Question } from '../content/types';
import { competencyById } from '../curriculum/program';
import { lessonKey, getLesson } from '../content';
import { formatValue, isWithinTolerance, parseNumericInput } from '../lib/numeric';
import { PASS_SCORE } from '../lib/progress';
import { useI18n } from '../i18n';
import { Alert, Badge, Button, Link } from './ui';

export interface AnswerResult {
  correct: boolean;
  /** 0..1 (rubric fraction for written answers). */
  score: number;
  given: string;
}

export function QuestionCard({ question, onAnswered, onNext, nextLabel }: {
  question: Question;
  onAnswered: (r: AnswerResult) => void;
  onNext: () => void;
  nextLabel: string;
}) {
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([]);
  const lesson = lessonKey(question.lessonId);
  const lessonTitle = getLesson(question.lessonId, lang)?.title ?? '';
  const comp = competencyById(question.competency);
  const submitted = result !== null;

  function record(r: AnswerResult) {
    setError('');
    setResult(r);
    onAnswered(r);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted) return;
    if (question.type === 'mcq') {
      if (selected === null) { setError(t('q.chooseFirst')); return; }
      const correct = selected === question.correctIndex;
      record({ correct, score: correct ? 1 : 0, given: question.options[selected].text });
    } else if (question.type === 'numeric') {
      const n = parseNumericInput(text);
      if (n === null) { setError(t('q.invalidNumber')); return; }
      const correct = isWithinTolerance(n, question.answer, question.unit, question.tolerance);
      record({ correct, score: correct ? 1 : 0, given: text.trim() });
    } else if (!revealed) {
      if (text.trim().length < 20) { setError(t('q.writeFirst')); return; }
      setError('');
      setChecked(question.rubric.map(() => false));
      setRevealed(true);
    } else {
      const score = checked.filter(Boolean).length / question.rubric.length;
      record({ correct: score >= PASS_SCORE, score, given: text.trim().slice(0, 500) });
    }
  }

  const wrongOption = question.type === 'mcq' && result && !result.correct && selected !== null ? question.options[selected] : null;
  const typeLabel = question.type === 'mcq' ? t('q.typeMcq') : question.type === 'numeric' ? t('q.typeNumeric') : t('q.typeWritten');

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="indigo">{typeLabel}</Badge>
        <Badge>{t('level.short', { n: question.level })}</Badge>
        {question.scenario && <Badge tone="amber">{t('q.scenario')}</Badge>}
        {comp && <Badge tone="green">{comp.name[lang]}</Badge>}
      </div>
      {question.scenario && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">{question.scenario}</p>}
      <p className="text-base font-medium text-slate-900" id="q-prompt">{question.prompt}</p>

      {question.type === 'mcq' && (
        <fieldset disabled={submitted} aria-labelledby="q-prompt" className="space-y-2">
          {question.options.map((o, i) => {
            const isCorrect = submitted && i === question.correctIndex;
            const isWrongPick = submitted && i === selected && !result?.correct;
            return (
              <label key={i} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${isCorrect ? 'border-emerald-500 bg-emerald-50' : isWrongPick ? 'border-red-400 bg-red-50' : selected === i ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name={question.id} checked={selected === i} onChange={() => { setSelected(i); setError(''); }} className="mt-0.5 h-4 w-4 accent-indigo-700" />
                <span className="flex-1">
                  {o.text}
                  {submitted && <span className={`mt-1 block text-xs ${isCorrect ? 'text-emerald-800' : 'text-slate-600'}`}>{o.why}</span>}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      {question.type === 'numeric' && (
        <div>
          <label htmlFor="num-answer" className="mb-1 block text-xs text-slate-500">{t(`unit.${question.unit}` as 'unit.usd')}</label>
          <input id="num-answer" inputMode="decimal" autoComplete="off" value={text} disabled={submitted}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100"
            placeholder={t('q.yourAnswer')} />
        </div>
      )}

      {question.type === 'written' && (
        <div className="space-y-3">
          <label htmlFor="written-answer" className="block text-xs text-slate-500">{t('q.writtenHint')}</label>
          <textarea id="written-answer" rows={7} value={text} disabled={revealed}
            onChange={(e) => { setText(e.target.value); setError(''); }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100" />
          {revealed && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-semibold">{t('q.modelAnswer')}</p>
              <p className="whitespace-pre-line">{question.modelAnswer}</p>
              <fieldset disabled={submitted}>
                <legend className="mb-1 font-semibold">{t('q.selfAssess')}</legend>
                {question.rubric.map((r, i) => (
                  <label key={i} className="mb-1 flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 accent-indigo-700" checked={checked[i] ?? false} onChange={() => setChecked(checked.map((c, j) => (j === i ? !c : c)))} />
                    <span>{r}</span>
                  </label>
                ))}
              </fieldset>
              <p className="text-xs text-slate-500">{t('q.noAutoGrade')}</p>
            </div>
          )}
        </div>
      )}

      {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}

      {!submitted ? (
        <Button type="submit">{question.type === 'written' ? (revealed ? t('q.recordAssessment') : t('q.showModel')) : t('q.submit')}</Button>
      ) : (
        <div className="space-y-3">
          <Alert tone={result.correct ? 'green' : 'red'} title={question.type === 'written' ? t('q.selfScore', { got: Math.round(result.score * question.rubric.length), total: question.rubric.length }) : result.correct ? t('q.correct') : t('q.incorrect')}>
            {question.type === 'numeric' && (
              <p>{t('q.correctAnswer')}: <strong>{formatValue(question.answer, question.unit, lang)}</strong>{!result.correct && <> ({t('q.youAnswered', { a: result.given })})</>}</p>
            )}
            {question.type === 'mcq' && !result.correct && wrongOption && (
              <p className="mt-1"><strong>{t('q.whyWrong')}:</strong> {wrongOption.why}</p>
            )}
          </Alert>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p><strong>{t('q.explanation')}:</strong> {question.explanation}</p>
            {question.type === 'numeric' && !result.correct && question.commonMistake && <p className="mt-1 text-slate-700"><strong>{t('q.commonSlip')}:</strong> {question.commonMistake}</p>}
            <p className="mt-2"><strong>{t('q.concept')}:</strong> {question.concept}</p>
            {lesson && (
              <p className="mt-1">
                <strong>{result.correct ? t('q.reviewOptional') : t('q.recommendedRevision')}:</strong>{' '}
                <Link to={`/lesson/${lesson.id}`} className="font-medium text-indigo-700 underline">{t('lesson.label', { n: lesson.number })}: {lessonTitle}</Link>
              </p>
            )}
          </div>
          <Button type="button" onClick={onNext}>{nextLabel}</Button>
        </div>
      )}
    </form>
  );
}
