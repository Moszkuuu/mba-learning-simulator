import { useProgress } from './ProgressContext';
import { GuestOffer } from './AccountCard';
import { Card, H2, LinkButton } from './ui';
import { cloudConfigured } from '../lib/cloud/client';
import { signOut } from '../lib/cloud/auth';
import { useI18n } from '../i18n';

/** Top of the Home page: one obvious next step for everyone. */
export function HomeHero({ continueTo, started }: { continueTo: string; started: boolean }) {
  const { owner } = useProgress();
  const { t } = useI18n();
  if (owner.kind === 'user') {
    return (
      <Card className="mb-6">
        <H2>{t('home.welcome')}</H2>
        <p className="text-sm text-slate-600">{t('home.signedInBody', { email: owner.email })}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <LinkButton to={continueTo}>{t('home.continue')}</LinkButton>
          <LinkButton to="/courses" tone="secondary">{t('nav.curriculum')}</LinkButton>
          <LinkButton to="/progress" tone="secondary">{t('nav.progress')}</LinkButton>
        </div>
        <GuestOffer />
      </Card>
    );
  }
  return (
    <Card className="mb-6">
      <H2>{started ? t('home.welcome') : t('home.hello')}</H2>
      <p className="text-sm text-slate-600">{t('home.guestBody')}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {started
          ? <LinkButton to={continueTo}>{t('home.continue')}</LinkButton>
          : <LinkButton to="/courses">{t('home.guest')}</LinkButton>}
        {cloudConfigured && <LinkButton to="/login" tone="secondary">{t('auth.loginTitle')}</LinkButton>}
        {cloudConfigured && <LinkButton to="/signup" tone="secondary">{t('acct.signUp')}</LinkButton>}
      </div>
    </Card>
  );
}

/** Review, Simulator and Glossary: kept out of the main menu, but one click from Home, Courses and Practice. */
export function ToolLinks() {
  const { t } = useI18n();
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <span className="text-slate-500">{t('home.moreTools')}</span>
      <a className="font-medium text-indigo-700 underline" href="#/review">{t('nav.review')}</a>
      <a className="font-medium text-indigo-700 underline" href="#/simulator">{t('nav.simulator')}</a>
      <a className="font-medium text-indigo-700 underline" href="#/glossary">{t('nav.glossary')}</a>
      <a className="font-medium text-indigo-700 underline" href="#/lab">{t('nav.lab')}</a>
    </div>
  );
}

/** Account access in the main navigation (desktop sidebar and mobile menu). */
export function NavAccount({ onNavigate }: { onNavigate?: () => void }) {
  const { owner } = useProgress();
  const { t } = useI18n();
  if (!cloudConfigured) return null;
  if (owner.kind === 'guest') {
    return <a href="#/login" onClick={onNavigate} className="block rounded-lg bg-indigo-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-800">{t('nav.login')}</a>;
  }
  return (
    <details className="relative text-sm">
      <summary className="cursor-pointer list-none truncate rounded-lg border border-slate-300 px-3 py-2 font-medium" aria-label={t('nav.account')}>👤 {owner.email}</summary>
      <div className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="break-all text-xs text-slate-600">{owner.email}</p>
        <a href="#/account" onClick={onNavigate} className="mt-2 block font-medium text-indigo-700 underline">{t('nav.accountSync')}</a>
        <button type="button" onClick={() => { onNavigate?.(); void signOut(); }} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 font-medium hover:bg-slate-50">{t('acct.signOut')}</button>
      </div>
    </details>
  );
}
