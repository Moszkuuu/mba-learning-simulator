import { useState } from 'react';
import { useProgress } from './ProgressContext';
import { Alert, Button, Card, H2 } from './ui';
import { cloudConfigured } from '../lib/cloud/client';
import { requestPasswordReset, setNewPassword, signIn, signOut, signUp, type AuthResult } from '../lib/cloud/auth';
import { useI18n } from '../i18n';

const INPUT = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2';

export function AccountCard() {
  const { owner, syncStatus, syncNow, guestOffer, copyGuest, recovery, endRecovery } = useProgress();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!cloudConfigured) {
    return <Card className="lg:col-span-2"><H2>{t('acct.title')}</H2><p className="text-sm text-slate-600">{t('acct.notConfigured')}</p></Card>;
  }

  const fail = (r: Extract<AuthResult, { ok: false }>) => setMsg({ ok: false, text: t(`acct.err.${r.reason}` as 'acct.err.other') });

  async function submit(kind: 'in' | 'up') {
    setBusy(true);
    setMsg(null);
    const r = await (kind === 'in' ? signIn(email.trim(), password) : signUp(email.trim(), password));
    setBusy(false);
    if (r.ok) {
      setPassword('');
      if (r.needsConfirmation) setMsg({ ok: true, text: t('acct.confirmEmail') });
    } else fail(r);
  }

  async function sendReset() {
    setBusy(true);
    setMsg(null);
    const r = await requestPasswordReset(email.trim());
    setBusy(false);
    // Same message whether or not the email has an account, so the form cannot be used to find out who has one.
    if (r.ok) setMsg({ ok: true, text: t('acct.resetSent') });
    else fail(r);
  }

  async function saveNewPassword() {
    if (password !== password2) { setMsg({ ok: false, text: t('acct.passwordMismatch') }); return; }
    setBusy(true);
    setMsg(null);
    const r = await setNewPassword(password);
    setBusy(false);
    if (r.ok) { setPassword(''); setPassword2(''); endRecovery(); setMsg({ ok: true, text: t('acct.passwordChanged') }); }
    else fail(r);
  }

  const note = msg && <div className="mt-3"><Alert tone={msg.ok ? 'green' : 'red'}>{msg.text}</Alert></div>;

  if (recovery === 'ready') {
    return (
      <Card className="lg:col-span-2">
        <H2>{t('acct.recoveryTitle')}</H2>
        <form className="grid max-w-md gap-3" onSubmit={(e) => { e.preventDefault(); void saveNewPassword(); }}>
          <label className="text-sm font-medium">{t('acct.newPassword')}
            <input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} />
          </label>
          <label className="text-sm font-medium">{t('acct.confirmPassword')}
            <input type="password" autoComplete="new-password" required minLength={8} value={password2} onChange={(e) => setPassword2(e.target.value)} className={INPUT} />
          </label>
          <div><Button type="submit" disabled={busy}>{t('acct.setPassword')}</Button></div>
        </form>
        {note}
      </Card>
    );
  }

  const failedNotice = recovery === 'failed' && <div className="mb-3"><Alert tone="red">{t('acct.recoveryFailed')}</Alert></div>;

  if (owner.kind === 'guest' && resetMode) {
    return (
      <Card className="lg:col-span-2">
        <H2>{t('acct.title')}</H2>
        {failedNotice}
        <p className="mb-3 text-sm text-slate-600">{t('acct.resetHint')}</p>
        <form className="grid max-w-md gap-3" onSubmit={(e) => { e.preventDefault(); void sendReset(); }}>
          <label className="text-sm font-medium">{t('acct.email')}
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>{t('acct.sendReset')}</Button>
            <Button type="button" tone="secondary" onClick={() => { setResetMode(false); setMsg(null); }}>{t('acct.backToSignIn')}</Button>
          </div>
        </form>
        {note}
      </Card>
    );
  }

  if (owner.kind === 'guest') {
    return (
      <Card className="lg:col-span-2">
        <H2>{t('acct.title')}</H2>
        {failedNotice}
        <p className="mb-3 text-sm text-slate-600">{t('acct.guestBody')}</p>
        <form className="grid max-w-md gap-3" onSubmit={(e) => { e.preventDefault(); void submit('in'); }}>
          <label className="text-sm font-medium">{t('acct.email')}
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} />
          </label>
          <label className="text-sm font-medium">{t('acct.password')}
            <input type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={INPUT} />
          </label>
          <p className="text-xs text-slate-500">{t('acct.passwordHint')}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>{t('acct.signIn')}</Button>
            <Button type="button" tone="secondary" disabled={busy} onClick={() => void submit('up')}>{t('acct.signUp')}</Button>
            <Button type="button" tone="secondary" onClick={() => { setResetMode(true); setMsg(null); }}>{t('acct.forgot')}</Button>
          </div>
        </form>
        {note}
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <H2>{t('acct.title')}</H2>
      {failedNotice}
      {msg?.ok && <div className="mb-3"><Alert tone="green">{msg.text}</Alert></div>}
      <p className="text-sm">{t('acct.signedInAs', { email: owner.email })}</p>
      <p className="mt-1 text-sm text-slate-600" role="status">{t(`acct.status.${syncStatus}` as 'acct.status.idle')}</p>
      <p className="mt-1 text-xs text-slate-500">{t('acct.replaceNote')}</p>
      {guestOffer && (
        <div className="mt-3"><Alert tone="blue" title={t('acct.guestOfferTitle')}>
          {t('acct.guestOfferBody', { attempts: guestOffer.attempts, lessons: guestOffer.completedLessons })}
          <div className="mt-2"><Button onClick={copyGuest}>{t('acct.copyGuest')}</Button></div>
        </Alert></div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button tone="secondary" onClick={syncNow}>{t('acct.syncNow')}</Button>
        <Button tone="secondary" onClick={() => void signOut()}>{t('acct.signOut')}</Button>
      </div>
      <p className="mt-3 text-xs text-slate-500">{t('acct.sharedDevice')}</p>
    </Card>
  );
}
