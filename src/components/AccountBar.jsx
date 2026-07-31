import { useEffect, useRef, useState } from 'react';
import { mountGoogleButton } from '../lib/playkit.js';
import {
  playkit,
  accountsEnabled,
  getUser,
  setUser,
  subscribeUser,
  restoreSession,
  googleClientId,
} from '../playkitClient.js';

const DISMISS_KEY = 'itm_account_prompt_dismissed';

const wasDismissed = () => {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return true; }
};
const rememberDismissed = () => {
  try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* private mode */ }
};

/**
 * Accounts UI: a one-time dialog offering sign-in, and a small chip afterwards.
 *
 * Two rules shape this:
 *  - An account is optional, so the dialog always offers "play without" and
 *    never returns once dismissed. Discovery matters (a grey link in the corner
 *    of the viewport went unnoticed), but not at the cost of a wall.
 *  - Nothing floats outside the game's column. The chip is constrained to the
 *    same width as the screen behind it, so on these portrait layouts it reads
 *    as part of the game rather than as browser chrome.
 */
export default function AccountBar() {
  const [user, setLocalUser] = useState(getUser);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeUser(setLocalUser);
    restoreSession().then((u) => {
      setReady(true);
      // First-time visitors get the offer once; everyone else is left alone.
      if (!u && !wasDismissed()) setOpen(true);
    });
    return unsubscribe;
  }, []);

  if (!accountsEnabled) return null;

  const dismiss = () => {
    rememberDismissed();
    setOpen(false);
  };

  return (
    <>
      <div className="acct-slot">
        {user ? (
          <div className="acct-chip-wrap">
            <button
              className="acct-chip"
              onClick={() => setMenuOpen((v) => !v)}
              title={user.email}
            >
              <span className="acct-dot" aria-hidden="true">
                {user.displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="acct-name">{user.displayName}</span>
            </button>
            {menuOpen && (
              <div className="acct-menu">
                <p className="acct-menu-email">{user.email}</p>
                <button
                  className="acct-menu-item"
                  onClick={async () => {
                    await playkit.logout();
                    setUser(null);
                    setMenuOpen(false);
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          ready && (
            <button className="acct-chip is-ghost" onClick={() => setOpen(true)}>
              Sign in
            </button>
          )
        )}
      </div>

      {open && !user && <AccountDialog onClose={dismiss} />}
    </>
  );
}

function AccountDialog({ onClose }) {
  const [mode, setMode] = useState('register'); // most first-timers need an account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleSlot = useRef(null);
  const firstField = useRef(null);

  useEffect(() => { firstField.current?.focus(); }, [mode]);

  // Escape closes — the dialog is an offer, not a gate.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!googleClientId || !googleSlot.current || googleReady) return;
    let cancelled = false;
    mountGoogleButton(playkit, {
      clientId: googleClientId,
      container: googleSlot.current,
      onSignedIn: (u) => { setUser(u); rememberDismissed(); onClose(); },
      onError: () => setError('Google sign-in failed. Try email instead.'),
      width: 260,
    }).then((ok) => { if (!cancelled) setGoogleReady(ok); });
    return () => { cancelled = true; };
  }, [googleReady, onClose]);

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
      rememberDismissed();
      onClose();
    } catch (err) {
      setError(err?.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="acct-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="acct-dialog" role="dialog" aria-modal="true" aria-label="Save your progress">
        <h2 className="acct-title">Save your progress</h2>
        <p className="acct-sub">
          An account keeps your runs and lets you pick up on any device. Entirely optional.
        </p>

        <div ref={googleSlot} className="acct-google" />
        {googleReady && <div className="acct-or"><span>or</span></div>}

        <form className="acct-form" onSubmit={submit}>
          {mode === 'register' && (
            <input
              ref={firstField}
              className="acct-input"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="nickname"
            />
          )}
          <input
            ref={mode === 'login' ? firstField : null}
            className="acct-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            className="acct-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
          />

          {error && <p className="acct-error">{error}</p>}

          <button className="acct-primary" type="submit" disabled={busy}>
            {busy ? '…' : mode === 'register' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="acct-switch">
          {mode === 'register' ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            className="acct-link"
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
          >
            {mode === 'register' ? 'Sign in' : 'Create one'}
          </button>
        </p>

        <button type="button" className="acct-skip" onClick={onClose}>
          Play without an account
        </button>
      </div>
    </div>
  );
}
