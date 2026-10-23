import type { Activity } from '../lib/progress';
import { useI18n } from '../i18n';
import { activityText } from './ActivityText';

export function ActivityList({ items, empty }: { items: Activity[]; empty: string }) {
  const { t, lang, dateTime } = useI18n();
  if (items.length === 0) return <p className="text-sm text-slate-600">{empty}</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((a) => (
        <li key={a.id} className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:justify-between">
          <span>{activityText(a, t, lang)}</span>
          <time className="text-xs text-slate-500" dateTime={a.at}>{dateTime(a.at)}</time>
        </li>
      ))}
    </ul>
  );
}
