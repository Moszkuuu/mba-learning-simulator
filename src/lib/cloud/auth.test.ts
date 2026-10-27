import { describe, expect, it } from 'vitest';
import { exchangeRecoveryCode, recoveryCodeFromSearch, requestPasswordReset, setNewPassword } from './auth';

type Fake = Parameters<typeof requestPasswordReset>[1];
const fake = (auth: Record<string, unknown>) => ({ auth }) as unknown as Fake;

describe('password reset helpers', () => {
  it('reads the recovery code from the query string only, ignoring other values', () => {
    expect(recoveryCodeFromSearch('?code=abcd1234-efgh')).toBe('abcd1234-efgh');
    expect(recoveryCodeFromSearch('')).toBeNull();
    expect(recoveryCodeFromSearch('?code=')).toBeNull();
    expect(recoveryCodeFromSearch('?code=<script>alert(1)</script>')).toBeNull();
    expect(recoveryCodeFromSearch('?other=abcd1234efgh')).toBeNull();
  });

  it('requests the reset email with the app address as redirect (no token, no password in the URL)', async () => {
    const calls: unknown[][] = [];
    const c = fake({ resetPasswordForEmail: async (...a: unknown[]) => { calls.push(a); return { error: null }; } });
    const r = await requestPasswordReset('a@example.com', c, 'https://site.example/mba-learning-simulator/');
    expect(r).toEqual({ ok: true });
    expect(calls[0]).toEqual(['a@example.com', { redirectTo: 'https://site.example/mba-learning-simulator/' }]);
  });

  it('maps rate limits and network errors to clear reasons', async () => {
    const limited = fake({ resetPasswordForEmail: async () => ({ error: { message: 'email rate limit exceeded', status: 429 } }) });
    expect(await requestPasswordReset('a@example.com', limited, 'x')).toEqual({ ok: false, reason: 'rateLimit' });
    const down = fake({ resetPasswordForEmail: async () => { throw new Error('offline'); } });
    expect(await requestPasswordReset('a@example.com', down, 'x')).toEqual({ ok: false, reason: 'network' });
  });

  it('exchanges the code once and reports a bad or used code as a failure', async () => {
    const used: string[] = [];
    const good = fake({ exchangeCodeForSession: async (code: string) => { used.push(code); return { error: null }; } });
    expect(await exchangeRecoveryCode('abcd1234', good)).toEqual({ ok: true });
    expect(used).toEqual(['abcd1234']);
    const bad = fake({ exchangeCodeForSession: async () => ({ error: { message: 'invalid flow state' } }) });
    expect(await exchangeRecoveryCode('abcd1234', bad)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('rejects a weak new password before calling the server, and reports success otherwise', async () => {
    let called = 0;
    const c = fake({ updateUser: async () => { called++; return { error: null }; } });
    expect(await setNewPassword('short', c)).toEqual({ ok: false, reason: 'weak' });
    expect(called).toBe(0);
    expect(await setNewPassword('long-enough-1', c)).toEqual({ ok: true });
    expect(called).toBe(1);
  });
});
