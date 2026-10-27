import { getClient, getRecoveryClient } from './client';

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; reason: 'invalid' | 'exists' | 'weak' | 'network' | 'rateLimit' | 'unconfigured' | 'samePassword' | 'other' };

function reasonOf(e: { message?: string; status?: number; name?: string }): Extract<AuthResult, { ok: false }>['reason'] {
  const m = (e.message ?? '').toLowerCase();
  if (e.name === 'AuthRetryableFetchError' || m.includes('fetch') || m.includes('network')) return 'network';
  if (e.status === 429 || m.includes('rate limit') || m.includes('security purposes')) return 'rateLimit';
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'invalid';
  if (m.includes('already') || m.includes('registered')) return 'exists';
  if (m.includes('different from the old')) return 'samePassword';
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

// ---------- password reset (implicit flow: the default email link returns tokens in the URL fragment, in any browser) ----------
type AuthClient = NonNullable<ReturnType<typeof getClient>>;

/** The page the emailed link returns to. It must be listed under Redirect URLs in the Supabase dashboard. No `#/` here: Supabase appends the tokens as the fragment. */
export const recoveryRedirect = (): string => `${window.location.origin}${import.meta.env.BASE_URL}`;

export async function requestPasswordReset(email: string, c: AuthClient | null = getRecoveryClient(), redirectTo = recoveryRedirect()): Promise<AuthResult> {
  if (!c) return { ok: false, reason: 'unconfigured' };
  try {
    const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo });
    return error ? { ok: false, reason: reasonOf(error) } : { ok: true };
  } catch { return { ok: false, reason: 'network' }; }
}

export type RecoveryHash =
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'error'; reason: 'expired' | 'invalid' };

/** Reads what the emailed link put in the URL fragment. App routes (#/...) and unrelated fragments return null. */
export function parseRecoveryHash(hash: string): RecoveryHash | null {
  const raw = hash.replace(/^#/, '');
  if (!raw || raw.startsWith('/')) return null;
  const p = new URLSearchParams(raw);
  const access = p.get('access_token');
  const refresh = p.get('refresh_token');
  if (access && refresh && p.get('type') === 'recovery') return { kind: 'tokens', accessToken: access, refreshToken: refresh };
  if (p.get('error') || p.get('error_code')) return { kind: 'error', reason: p.get('error_code') === 'otp_expired' ? 'expired' : 'invalid' };
  return null;
}

// Read once, at load, and remove the tokens from the address bar before anything else (or any script) can see them.
let pendingRecovery: RecoveryHash | null = typeof window === 'undefined' ? null : parseRecoveryHash(window.location.hash);
if (pendingRecovery) window.history.replaceState(null, '', window.location.pathname + window.location.search);

/** Hands over the link's result exactly once. */
export function takePendingRecovery(): RecoveryHash | null {
  const r = pendingRecovery;
  pendingRecovery = null;
  return r;
}

/** Turns the link's tokens into a session so the new password can be saved. */
export async function startRecoverySession(tokens: Extract<RecoveryHash, { kind: 'tokens' }>, c: AuthClient | null = getClient()): Promise<AuthResult> {
  if (!c) return { ok: false, reason: 'unconfigured' };
  try {
    const { error } = await c.auth.setSession({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken });
    return error ? { ok: false, reason: 'invalid' } : { ok: true };
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
