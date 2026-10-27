import { getClient } from './client';

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; reason: 'invalid' | 'exists' | 'weak' | 'network' | 'rateLimit' | 'unconfigured' | 'badCode' | 'other' };

function reasonOf(e: { message?: string; status?: number; name?: string }): Extract<AuthResult, { ok: false }>['reason'] {
  const m = (e.message ?? '').toLowerCase();
  if (e.name === 'AuthRetryableFetchError' || m.includes('fetch') || m.includes('network')) return 'network';
  if (e.status === 429 || m.includes('rate limit') || m.includes('security purposes')) return 'rateLimit';
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'invalid';
  if (m.includes('already') || m.includes('registered')) return 'exists';
  if (m.includes('password')) return 'weak';
  return 'other';
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const c = getClient();
  if (!c) return { ok: false, reason: 'unconfigured' };
  try {
    const { error } = await c.auth.signInWithPassword({ email, password });
    return error ? { ok: false, reason: reasonOf(error) } : { ok: true };
  } catch { return { ok: false, reason: 'network' }; }
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const c = getClient();
  if (!c) return { ok: false, reason: 'unconfigured' };
  try {
    const { data, error } = await c.auth.signUp({ email, password });
    if (error) return { ok: false, reason: reasonOf(error) };
    // A user object with no identities means the email is already registered (Supabase hides this).
    if (data.user && data.user.identities?.length === 0) return { ok: false, reason: 'exists' };
    return { ok: true, needsConfirmation: !data.session };
  } catch { return { ok: false, reason: 'network' }; }
}

export async function signOut(): Promise<void> {
  try { await getClient()?.auth.signOut(); } catch { /* signing out locally still happens */ }
}

// ---------- password reset (PKCE: the emailed link carries ?code=..., never a #token, so #/ routes keep working) ----------
type AuthClient = NonNullable<ReturnType<typeof getClient>>;

/** The page the emailed link returns to. It must be listed under Redirect URLs in the Supabase dashboard. */
export const recoveryRedirect = (): string => `${window.location.origin}${import.meta.env.BASE_URL}`;

export function recoveryCodeFromSearch(search: string): string | null {
  const code = new URLSearchParams(search).get('code');
  return code && /^[\w-]{8,}$/.test(code) ? code : null;
}

export async function requestPasswordReset(email: string, c: AuthClient | null = getClient(), redirectTo = recoveryRedirect()): Promise<AuthResult> {
  if (!c) return { ok: false, reason: 'unconfigured' };
  try {
    const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo });
    return error ? { ok: false, reason: reasonOf(error) } : { ok: true };
  } catch { return { ok: false, reason: 'network' }; }
}

export async function exchangeRecoveryCode(code: string, c: AuthClient | null = getClient()): Promise<AuthResult> {
  if (!c) return { ok: false, reason: 'unconfigured' };
  try {
    const { error } = await c.auth.exchangeCodeForSession(code);
    return error ? { ok: false, reason: 'invalid' } : { ok: true };
  } catch { return { ok: false, reason: 'network' }; }
}

/** The code from the reset email (Supabase's own email OTP, type 'recovery'). Works in any browser or device. */
export const recoveryOtpFrom = (raw: string): string | null => {
  const digits = raw.replace(/\s+/g, '');
  return /^\d{6,10}$/.test(digits) ? digits : null;
};

export async function verifyRecoveryCode(email: string, code: string, c: AuthClient | null = getClient()): Promise<AuthResult> {
  if (!c) return { ok: false, reason: 'unconfigured' };
  const token = recoveryOtpFrom(code);
  if (!token) return { ok: false, reason: 'badCode' };
  try {
    const { error } = await c.auth.verifyOtp({ email, token, type: 'recovery' });
    if (!error) return { ok: true };
    const r = reasonOf(error);
    return { ok: false, reason: r === 'rateLimit' || r === 'network' ? r : 'badCode' };
  } catch { return { ok: false, reason: 'network' }; }
}

export async function setNewPassword(password: string, c: AuthClient | null = getClient()): Promise<AuthResult> {
  if (!c) return { ok: false, reason: 'unconfigured' };
  if (password.length < 8) return { ok: false, reason: 'weak' };
  try {
    const { error } = await c.auth.updateUser({ password });
    return error ? { ok: false, reason: reasonOf(error) } : { ok: true };
  } catch { return { ok: false, reason: 'network' }; }
}
