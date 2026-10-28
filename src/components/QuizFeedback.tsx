import { getLesson } from '../content';
import { Alert, Card, H2, Link } from './ui';
import type { Skill } from '../content/types';
import type { Question } from '../content/types';
import { relatedLesson, skillResults } from '../lib/feedback';
import { useI18n } from '../i18n';
import type { TKey } from '../i18n/en';

/** Which part of the lesson to reread for each kind of question. */
const SECTION: Record<Skill, TKey> = {
  understand: 'lesson.idea',
  calculate: 'lesson.worked',
  interpret: 'lesson.interpretation',
  decide: 'lesson.decisions',
  assumptions: 'lesson.terms',
};

/** Personal feedback for the pilot lessons. It describes the automatically checked questions of this attempt only. */
export function QuizFeedback({ lessonId, outcomes }: { lessonId: string; outcomes: { question: Question; correct: boolean }[] }) {
  const { t, lang } = useI18n();
  const results = skillResults(outcomes);
  const lesson = getLesson(lessonId, lang);
  if (results.length === 0 || !lesson) return null;
  const good = results.filter((r) => r.correct === r.total);
  const gaps = results.filter((r) => r.correct < r.total);

  return (
    <Card className="space-y-4">
      <H2>{t('fb.title')}</H2>
      {good.length > 0 && (
        <div>
          <p className="font-semibold text-emerald-800">{t('fb.did')}</p>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
            {good.map((r) => <li key={r.skill}>{t(`skill.${r.skill}` as TKey)} ({r.correct}/{r.total}): {t(`fb.good.${r.skill}` as TKey)}</li>)}
          </ul>
        </div>
      )}
      {gaps.map((r) => {
        const other = relatedLesson(lessonId, r.skill);
        const otherLesson = other && other !== lessonId ? getLesson(other, lang) : undefined;
        return (
          <Alert key={r.skill} tone="amber" title={`${t(`skill.${r.skill}` as TKey)} (${r.correct}/${r.total})`}>
            <p>{t(`fb.gap.${r.skill}` as TKey)}</p>
            <p className="mt-1"><span className="font-semibold">{t('fb.missed')}</span> {r.missedConcepts.join('; ')}</p>
            <p className="mt-1"><span className="font-semibold">{t('fb.why')}</span> {t(`fb.matters.${r.skill}` as TKey)}</p>
            <p className="mt-1">
              <span className="font-semibold">{t('fb.next')}</span> {t('fb.reread', { section: t(SECTION[r.skill]) })}
              {otherLesson && <> {t('fb.then')} <Link to={`/lesson/${otherLesson.id}`} className="font-semibold text-indigo-700 underline">{t('lesson.label', { n: otherLesson.number })}: {otherLesson.title}</Link>.</>}
            </p>
          </Alert>
        );
      })}
      {lesson.teaching && (
        <p className="text-sm text-slate-700"><span className="font-semibold">{t('fb.apply')}</span> {lesson.teaching.apply}</p>
      )}
      <p className="text-xs text-slate-500">{t('fb.limits')}</p>
    </Card>
  );
}
