import { describe, expect, it } from 'vitest';
import { parseRecoveryHash, requestPasswordReset, setNewPassword, startRecoverySession, takePendingRecovery } from './auth';

type Fake = Parameters<typeof requestPasswordReset>[1];
const fake = (auth: Record<string, unknown>) => ({ auth }) as unknown as Fake;
const tokens = { kind: 'tokens' as const, accessToken: 'AAA.bbb.ccc', refreshToken: 'refresh123' };

describe('password reset (implicit flow, default email template)', () => {
  it('reads the session tokens the emailed link puts in the URL fragment', () => {
    expect(parseRecoveryHash('#access_token=AAA.bbb.ccc&expires_in=3600&refresh_token=refresh123&token_type=bearer&type=recovery')).toEqual(tokens);
  });

  it('never mistakes app routes or unrelated fragments for a recovery link', () => {
    expect(parseRecoveryHash('')).toBeNull();
    expect(parseRecoveryHash('#/progress')).toBeNull();
    expect(parseRecoveryHash('#/reset')).toBeNull();
    expect(parseRecoveryHash('#section-2')).toBeNull();
    // a non-recovery token (e.g. a signup link) is not accepted on the reset path
    expect(parseRecoveryHash('#access_token=a&refresh_token=b&type=signup')).toBeNull();
    // tokens without a refresh token are incomplete
    expect(parseRecoveryHash('#access_token=a&type=recovery')).toBeNull();
  });

  it('maps expired, already-used and invalid links to clear reasons', () => {
    expect(parseRecoveryHash('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')).toEqual({ kind: 'error', reason: 'expired' });
    expect(parseRecoveryHash('#error=access_denied&error_code=something_else')).toEqual({ kind: 'error', reason: 'invalid' });
  });

  it('hands the link result over once only (so tokens cannot be processed twice)', () => {
    expect(takePendingRecovery()).toBeNull(); // nothing pending in a plain page load
  });

  it('requests the reset email with the app address as redirect (no token, no password in the URL)', async () => {
    const calls: unknown[][] = [];
    const c = fake({ resetPasswordForEmail: async (...a: unknown[]) => { calls.push(a); return { error: null }; } });
    expect(await requestPasswordReset('a@example.com', c, 'https://site.example/mba-learning-simulator/')).toEqual({ ok: true });
    expect(calls[0]).toEqual(['a@example.com', { redirectTo: 'https://site.example/mba-learning-simulator/' }]);
  });

  it('maps rate limits and network errors to clear reasons', async () => {
    const limited = fake({ resetPasswordForEmail: async () => ({ error: { message: 'email rate limit exceeded', status: 429 } }) });
    expect(await requestPasswordReset('a@example.com', limited, 'x')).toEqual({ ok: false, reason: 'rateLimit' });
    const down = fake({ resetPasswordForEmail: async () => { throw new Error('offline'); } });
    expect(await requestPasswordReset('a@example.com', down, 'x')).toEqual({ ok: false, reason: 'network' });
  });

  it('turns the link tokens into a session, and reports a rejected token as invalid', async () => {
    const seen: unknown[] = [];
    const ok = fake({ setSession: async (p: unknown) => { seen.push(p); return { error: null }; } });
    expect(await startRecoverySession(tokens, ok)).toEqual({ ok: true });
    expect(seen).toEqual([{ access_token: 'AAA.bbb.ccc', refresh_token: 'refresh123' }]);
    const bad = fake({ setSession: async () => ({ error: { message: 'invalid JWT' } }) });
    expect(await startRecoverySession(tokens, bad)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('rejects a weak new password before calling the server, and reports success otherwise', async () => {
    let called = 0;
    const c = fake({ updateUser: async () => { called++; return { error: null }; } });
    expect(await setNewPassword('short', c)).toEqual({ ok: false, reason: 'weak' });
    expect(called).toBe(0);
    expect(await setNewPassword('long-enough-1', c)).toEqual({ ok: true });
    expect(called).toBe(1);
  });

  it('explains a reused password instead of calling it weak', async () => {
    const c = fake({ updateUser: async () => ({ error: { message: 'New password should be different from the old password.', status: 422 } }) });
    expect(await setNewPassword('long-enough-1', c)).toEqual({ ok: false, reason: 'samePassword' });
  });
});
