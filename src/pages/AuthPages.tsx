import { useEffect, useState } from 'react';
import { useProgress } from '../components/ProgressContext';
import { Alert, Button, Card, H2, LinkButton } from '../components/ui';
import { cloudConfigured } from '../lib/cloud/client';
import { requestPasswordReset, setNewPassword, signIn, signOut, signUp, verifyRecoveryCode, type AuthResult } from '../lib/cloud/auth';
import { useI18n } from '../i18n';

const INPUT = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2';
const EMAIL_KEY = 'mba-lab:reset-email';
const rememberEmail = (v: string) => { try { sessionStorage.setItem(EMAIL_KEY, v); } catch { /* optional */ } };
const recalledEmail = () => { try { return sessionStorage.getItem(EMAIL_KEY) ?? ''; } catch { return ''; } };
const go = (path: string) => { window.location.hash = `#${path}`; };

/** Shared frame: explains setup if the cloud is off, and sends already-signed-in people home. */
function Frame({ title, sub, children, redirectIfSignedIn = true }: { title: string; sub?: string; children: React.ReactNode; redirectIfSignedIn?: boolean }) {
  const { owner, recovery } = useProgress();
  const { t } = useI18n();
  useEffect(() => { if (redirectIfSignedIn && owner.kind === 'user' && recovery !== 'ready') go('/'); }, [owner, recovery, redirectIfSignedIn]);
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <H2>{title}</H2>
        {sub && <p className="mb-3 text-sm text-slate-600">{sub}</p>}
        {cloudConfigured ? children : <p className="text-sm text-slate-600">{t('acct.notConfigured')}</p>}
      </Card>
    </div>
  );
}

function useForm() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fail = (r: Extract<AuthResult, { ok: false }>) => setMsg({ ok: false, text: t(`acct.err.${r.reason}` as 'acct.err.other') });
  const note = msg && <div className="mt-3"><Alert tone={msg.ok ? 'green' : 'red'}>{msg.text}</Alert></div>;
  return { busy, setBusy, msg, setMsg, fail, note };
}

const Field = ({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block text-sm font-medium">{label}<input {...rest} className={INPUT} /></label>
);

export function LoginPage() {
  const { t } = useI18n();
  const f = useForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  async function submit() {
    f.setBusy(true); f.setMsg(null);
    const r = await signIn(email.trim(), password);
    f.setBusy(false);
    if (r.ok) go('/'); else f.fail(r);
  }
  return (
    <Frame title={t('auth.loginTitle')} sub={t('auth.loginSub')}>
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <Field label={t('acct.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label={t('acct.password')} type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" disabled={f.busy}>{t('auth.loginTitle')}</Button>
      </form>
      {f.note}
      <div className="mt-4 grid gap-2 text-sm">
        <a className="text-indigo-700 underline" href="#/forgot">{t('acct.forgot')}</a>
        <a className="text-indigo-700 underline" href="#/signup">{t('auth.noAccount')}</a>
        <a className="text-indigo-700 underline" href="#/courses">{t('home.guest')}</a>
      </div>
    </Frame>
  );
}

export function SignupPage() {
  const { t } = useI18n();
  const f = useForm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  async function submit() {
    f.setBusy(true); f.setMsg(null);
    const r = await signUp(email.trim(), password);
    f.setBusy(false);
    if (!r.ok) f.fail(r);
    else if (r.needsConfirmation) f.setMsg({ ok: true, text: t('acct.confirmEmail') });
    else go('/');
  }
  return (
    <Frame title={t('auth.signupTitle')} sub={t('auth.signupSub')}>
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <Field label={t('acct.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label={t('acct.password')} type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-slate-500">{t('acct.passwordHint')}</p>
        <Button type="submit" disabled={f.busy}>{t('acct.signUp')}</Button>
      </form>
      {f.note}
      <div className="mt-4 grid gap-2 text-sm">
        <a className="text-indigo-700 underline" href="#/login">{t('auth.haveAccount')}</a>
        <a className="text-indigo-700 underline" href="#/courses">{t('home.guest')}</a>
      </div>
    </Frame>
  );
}

export function ForgotPage() {
  const { t } = useI18n();
  const f = useForm();
  const [email, setEmail] = useState(recalledEmail);
  async function submit() {
    f.setBusy(true); f.setMsg(null);
    const r = await requestPasswordReset(email.trim());
    f.setBusy(false);
    if (!r.ok) { f.fail(r); return; }
    rememberEmail(email.trim());
    go('/reset'); // same next step whether or not the email has an account
  }
  return (
    <Frame title={t('auth.forgotTitle')} sub={t('auth.forgotSub')}>
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <Field label={t('acct.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" disabled={f.busy}>{t('acct.sendReset')}</Button>
      </form>
      {f.note}
      <div className="mt-4 grid gap-2 text-sm">
        <a className="text-indigo-700 underline" href="#/reset">{t('auth.haveCode')}</a>
        <a className="text-indigo-700 underline" href="#/login">{t('acct.backToSignIn')}</a>
      </div>
    </Frame>
  );
}

export function ResetPage() {
  const { recovery, endRecovery, beginRecovery } = useProgress();
  const { t } = useI18n();
  const f = useForm();
  const [email, setEmail] = useState(recalledEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [done, setDone] = useState(false);

  async function checkCode() {
    f.setBusy(true); f.setMsg(null);
    const r = await verifyRecoveryCode(email.trim(), code);
    f.setBusy(false);
    if (r.ok) beginRecovery(); else f.fail(r);
  }
  async function savePassword() {
    if (password !== password2) { f.setMsg({ ok: false, text: t('acct.passwordMismatch') }); return; }
    f.setBusy(true); f.setMsg(null);
    const r = await setNewPassword(password);
    if (!r.ok) { f.setBusy(false); f.fail(r); return; }
    setDone(true);
    endRecovery();
    await signOut(); // the reset session is not a login: the person logs in with the new password
    f.setBusy(false);
  }

  if (done) {
    return (
      <Frame title={t('auth.resetTitle')} redirectIfSignedIn={false}>
        <Alert tone="green">{t('acct.passwordChanged')}</Alert>
        <div className="mt-4"><LinkButton to="/login">{t('auth.returnLogin')}</LinkButton></div>
      </Frame>
    );
  }
  if (recovery === 'ready') {
    return (
      <Frame title={t('auth.resetTitle')} sub={t('auth.newPasswordSub')} redirectIfSignedIn={false}>
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void savePassword(); }}>
          <Field label={t('acct.newPassword')} type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <Field label={t('acct.confirmPassword')} type="password" autoComplete="new-password" required minLength={8} value={password2} onChange={(e) => setPassword2(e.target.value)} />
          <Button type="submit" disabled={f.busy}>{t('acct.setPassword')}</Button>
        </form>
        {f.note}
      </Frame>
    );
  }
  return (
    <Frame title={t('auth.resetTitle')} sub={t('auth.codeSub')} redirectIfSignedIn={false}>
      {recovery === 'failed' && <div className="mb-3"><Alert tone="amber">{t('auth.linkFailed')}</Alert></div>}
      <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); void checkCode(); }}>
        <Field label={t('acct.email')} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label={t('auth.code')} inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
        <Button type="submit" disabled={f.busy}>{t('auth.next')}</Button>
      </form>
      {f.note}
      <div className="mt-4 grid gap-2 text-sm">
        <a className="text-indigo-700 underline" href="#/forgot">{t('auth.newCode')}</a>
        <a className="text-indigo-700 underline" href="#/login">{t('acct.backToSignIn')}</a>
      </div>
    </Frame>
  );
}
