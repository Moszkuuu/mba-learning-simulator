import { useProgress } from './ProgressContext';
import { Alert, Button, Card, H2, LinkButton } from './ui';
import { cloudConfigured } from '../lib/cloud/client';
import { signOut } from '../lib/cloud/auth';
import { useI18n } from '../i18n';

/** Offer to copy this browser's guest progress into the signed-in account (never automatic; the guest copy is kept). */
export function GuestOffer({ labOnly = false }: { labOnly?: boolean }) {
  const { guestOffer, copyGuest, guestLabOffer, copyGuestLab } = useProgress();
  const { t } = useI18n();
  return (
    <>
      {!labOnly && guestOffer && (
        <div className="mt-3"><Alert tone="blue" title={t('acct.guestOfferTitle')}>
          {t('acct.guestOfferBody', { attempts: guestOffer.attempts, lessons: guestOffer.completedLessons })}
          <div className="mt-2"><Button onClick={copyGuest}>{t('acct.copyGuest')}</Button></div>
        </Alert></div>
      )}
      {guestLabOffer && (
        <div className="mt-3"><Alert tone="blue" title={t('acct.guestLabTitle')}>
          {t('acct.guestLabBody', { submissions: guestLabOffer.submissions, drafts: guestLabOffer.drafts })}
          <div className="mt-2"><Button onClick={copyGuestLab}>{t('acct.copyGuestLab')}</Button></div>
        </Alert></div>
      )}
    </>
  );
}

/** The Account page: who is signed in, whether progress is saved, and Sign out. Sign in / sign up live on their own pages. */
export function AccountCard() {
  const { owner, syncStatus, syncNow } = useProgress();
  const { t } = useI18n();
  if (!cloudConfigured) {
    return <Card className="mx-auto max-w-md"><H2>{t('acct.title')}</H2><p className="text-sm text-slate-600">{t('acct.notConfigured')}</p></Card>;
  }
  if (owner.kind === 'guest') {
    return (
      <Card className="mx-auto max-w-md">
        <H2>{t('acct.title')}</H2>
        <p className="text-sm text-slate-600">{t('home.guestBody')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LinkButton to="/login">{t('auth.loginTitle')}</LinkButton>
          <LinkButton to="/signup" tone="secondary">{t('acct.signUp')}</LinkButton>
        </div>
      </Card>
    );
  }
  return (
    <Card className="mx-auto max-w-md">
      <H2>{t('acct.title')}</H2>
      <p className="text-sm">{t('acct.signedInAs', { email: owner.email })}</p>
      <p className="mt-1 text-sm text-slate-600" role="status">{t(`acct.status.${syncStatus}` as 'acct.status.idle')}</p>
      <p className="mt-1 text-xs text-slate-500">{t('acct.replaceNote')}</p>
      <GuestOffer />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button tone="secondary" onClick={syncNow}>{t('acct.syncNow')}</Button>
        <Button tone="secondary" onClick={() => void signOut()}>{t('acct.signOut')}</Button>
      </div>
      <p className="mt-3 text-xs text-slate-500">{t('acct.sharedDevice')}</p>
    </Card>
  );
}
