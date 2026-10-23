import { Alert, Card, PageTitle } from '../components/ui';
import { GLOSSARY } from '../content/glossary';
import { useI18n } from '../i18n';

export default function GlossaryPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageTitle title={t('nav.glossary')} subtitle={t('glossary.subtitle')} />
      <div className="mb-4"><Alert tone="amber">{t('th.draftNotice')}</Alert></div>
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2">English</th><th>ไทย</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {GLOSSARY.map((g) => <tr key={g.en}><td className="py-2 pr-4">{g.en}</td><td>{g.th}</td></tr>)}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
