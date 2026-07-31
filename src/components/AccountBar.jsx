import { useEffect, useRef, useState } from 'react';
import {
  playkit,
  accountsEnabled,
  getUser,
  setUser,
  subscribeUser,
  restoreSession,
} from '../playkitClient.js';

/**
 * Small sign-in affordance. Deliberately unobtrusive: an account is optional,
 * so this must never look like a wall in front of the game.
 *
 * Self-contained by design — it reads the signed-in user from the shared store
 * rather than from props, so it can be mounted once above every entry point
 * (the main campaign and each ?proto= slice) instead of only inside App.
 */
export default function AccountBar() {
  const [user, setLocalUser] = useState(getUser);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeUser(setLocalUser);
    restoreSession();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (open) emailRef.current?.focus();
  }, [open, mode]);

  if (!accountsEnabled) return null;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const u =
        mode === 'register'
          ? await playkit.register(email, password, displayName)
          : await playkit.login(email, password);
      setUser(u);
      setOpen(false);
      setPassword('');
    } catch (err) {
      setError(err?.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await playkit.logout();
    setUser(null);
  }

  if (user) {
    return (
      <div className="account-bar">
        <span className="account-who">{user.displayName}</span>
        <button className="account-link" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="account-bar">
      {!open ? (
        <button className="account-link" onClick={() => setOpen(true)}>
          Sign in to save progress
        </button>
      ) : (
        <form className="account-form" onSubmit={submit}>
          <div className="account-tabs">
            <button
              type="button"
              className={mode === 'login' ? 'account-tab is-on' : 'account-tab'}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'account-tab is-on' : 'account-tab'}
              onClick={() => { setMode('register'); setError(''); }}
            >
              Create account
            </button>
          </div>

          {mode === 'register' && (
            <input
              className="account-input"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="nickname"
            />
          )}
          <input
            ref={emailRef}
            className="account-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="account-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
          />

          {error && <p className="account-error">{error}</p>}

          <div className="account-actions">
            <button className="account-submit" type="submit" disabled={busy}>
              {busy ? '…' : mode === 'register' ? 'Create account' : 'Sign in'}
            </button>
            <button type="button" className="account-link" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
          <p className="account-note">Optional — the game works without an account.</p>
        </form>
      )}
    </div>
  );
}
