import { useState } from 'react';
import { ProgressProvider } from './components/ProgressContext';
import { I18nProvider, useI18n } from './i18n';
import { useRoute } from './lib/router';
import Dashboard from './pages/Dashboard';
import CurriculumPage from './pages/CurriculumPage';
import LessonPage from './pages/LessonPage';
import PracticePage from './pages/PracticePage';
import ReviewPage from './pages/ReviewPage';
import SimulatorPage from './pages/SimulatorPage';
import ProgressPage from './pages/ProgressPage';
import GlossaryPage from './pages/GlossaryPage';
import { Card, H2, LinkButton } from './components/ui';
import type { TKey } from './i18n/en';

const NAV: { to: string; label: TKey }[] = [
  { to: '/', label: 'nav.dashboard' },
  { to: '/curriculum', label: 'nav.curriculum' },
  { to: '/review', label: 'nav.review' },
  { to: '/practice', label: 'nav.practice' },
  { to: '/simulator', label: 'nav.simulator' },
  { to: '/progress', label: 'nav.progress' },
  { to: '/glossary', label: 'nav.glossary' },
];

function Page({ path }: { path: string }) {
  const { t } = useI18n();
  if (path === '/') return <Dashboard />;
  if (path === '/curriculum') return <CurriculumPage />;
  if (path.startsWith('/lesson/')) return <LessonPage key={path} id={path.slice('/lesson/'.length)} />;
  if (path === '/practice') return <PracticePage />;
  if (path === '/review') return <ReviewPage />;
  if (path === '/simulator') return <SimulatorPage />;
  if (path === '/progress') return <ProgressPage />;
  if (path === '/glossary') return <GlossaryPage />;
  return (
    <Card>
      <H2>{t('app.notFound')}</H2>
      <LinkButton to="/">{t('app.goDashboard')}</LinkButton>
    </Card>
  );
}

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t('app.language')} className="inline-flex overflow-hidden rounded-lg border border-slate-300 text-sm">
      {(['en', 'th'] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l} className={`px-3 py-1.5 font-medium ${lang === l ? 'bg-indigo-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
          {l === 'en' ? 'EN' : 'ไทย'}
        </button>
      ))}
    </div>
  );
}

function Shell() {
  const path = useRoute();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const active = (to: string) => (to === '/' ? path === '/' : path.startsWith(to) || (to === '/curriculum' && path.startsWith('/lesson/')));

  const links = NAV.map((n) => (
    <a key={n.to} href={`#${n.to}`} onClick={() => setOpen(false)} aria-current={active(n.to) ? 'page' : undefined}
      className={`block rounded-lg px-3 py-2 text-sm font-medium ${active(n.to) ? 'bg-indigo-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
      {t(n.label)}
    </a>
  ));

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
        <a href="#/" className="mb-4 block text-lg font-bold text-indigo-800">{t('app.name')}</a>
        <div className="mb-4"><LangSwitch /></div>
        <nav className="space-y-1" aria-label="Main">{links}</nav>
        <p className="mt-6 text-xs text-slate-500">{t('app.disclaimer')}</p>
      </aside>
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <a href="#/" className="font-bold text-indigo-800">{t('app.name')}</a>
          <div className="flex items-center gap-2">
            <LangSwitch />
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium">{open ? t('app.close') : t('app.menu')}</button>
          </div>
        </header>
        {open && <nav id="mobile-nav" aria-label="Main" className="space-y-1 border-b border-slate-200 bg-white p-3 lg:hidden">{links}</nav>}
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8"><Page path={path} /></main>
        <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-slate-500 sm:px-6 lg:hidden">{t('app.disclaimer')}</footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ProgressProvider>
        <Shell />
      </ProgressProvider>
    </I18nProvider>
  );
}
