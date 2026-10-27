import { useState } from 'react';
import { useProgress } from './ProgressContext';
import { AccountCard } from './AccountCard';
import { Button, Card, H2, LinkButton } from './ui';
import { cloudConfigured } from '../lib/cloud/client';
import { signOut } from '../lib/cloud/auth';
import { useI18n } from '../i18n';

const HIDE_KEY = 'mba-lab:hide-welcome';
const hidden = () => { try { return sessionStorage.getItem(HIDE_KEY) === '1'; } catch { return false; } };

/** Home page entry point: sign-in form for guests (reusing AccountCard), a welcome card once signed in. */
export function HomeAccount({ continueTo }: { continueTo: string }) {
  const { owner } = useProgress();
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(hidden);
  if (!cloudConfigured) return null;

  if (owner.kind === 'user') {
    return (
      <Card className="mb-4">
        <H2>{t('home.welcome')}</H2>
        <p className="text-sm text-slate-600">{t('home.signedInBody', { email: owner.email })}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <LinkButton to={continueTo}>{t('home.continue')}</LinkButton>
          <LinkButton to="/progress" tone="secondary">{t('home.viewProgress')}</LinkButton>
        </div>
      </Card>
    );
  }
  if (dismissed) return null;
  return (
    <div className="mb-4 grid gap-4">
      <AccountCard />
      <Card>
        <p className="text-sm text-slate-600">{t('home.guestBody')}</p>
        <div className="mt-3">
          <Button tone="secondary" onClick={() => { try { sessionStorage.setItem(HIDE_KEY, '1'); } catch { /* ignore */ } setDismissed(true); }}>{t('home.guest')}</Button>
        </div>
      </Card>
    </div>
  );
}

/** Account access in the main navigation (desktop sidebar and mobile header). */
export function NavAccount({ onNavigate }: { onNavigate?: () => void }) {
  const { owner } = useProgress();
  const { t } = useI18n();
  if (!cloudConfigured) return null;
  if (owner.kind === 'guest') {
    return <a href="#/account" onClick={onNavigate} className="block rounded-lg bg-indigo-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-800">{t('nav.login')}</a>;
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
