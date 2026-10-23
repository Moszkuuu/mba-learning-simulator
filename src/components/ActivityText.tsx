import { getLesson } from '../content';
import { useI18n } from '../i18n';
import type { Activity } from '../lib/progress';

/** Renders an activity-log entry in the active language. */
export function activityText(a: Activity, t: ReturnType<typeof useI18n>['t'], lang: 'en' | 'th'): string {
  const p = a.params;
  switch (a.kind) {
    case 'lesson': {
      const title = getLesson(String(p.lessonId), lang)?.title ?? String(p.lessonId);
      return t(p.first ? 'act.lessonDone' : 'act.lessonRetake', { title, correct: Number(p.correct), total: Number(p.total) });
    }
    case 'simFinished': return t('act.simFinished', { status: t(p.status === 'completed' ? 'sim.statusCompleted' : 'sim.statusDefaulted'), equity: Number(p.equity).toLocaleString('en-US') });
    case 'simStarted': return t('act.simStarted');
    case 'exam': return t('act.exam', { correct: Number(p.correct), total: Number(p.total) });
    case 'review': return t('act.review', { correct: Number(p.correct), total: Number(p.total) });
    case 'legacy': return String(p.text);
  }
}
