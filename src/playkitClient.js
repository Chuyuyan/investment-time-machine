import { createPlaykit } from './lib/playkit.js';

/**
 * Accounts are optional. If VITE_PLAYKIT_URL isn't set (or the service is down)
 * the game stays fully playable — it just runs anonymously with no cloud save.
 * Nothing in the game loop is allowed to depend on this being available.
 */
const baseUrl = import.meta.env.VITE_PLAYKIT_URL ?? '';

export const accountsEnabled = Boolean(baseUrl);

export const playkit = accountsEnabled
  ? createPlaykit({ baseUrl, gameId: 'investment-time-machine' })
  : null;

/** The leaderboard ranks Decision Quality, not returns. */
export const DQ_BOARD = 'decision-quality';

/*
 * A tiny auth store.
 *
 * The game has several independent entry points (App plus the ?proto=… slices),
 * and each mounts its own root. Holding the signed-in user in one module — not
 * inside App — lets the account bar live above all of them while any screen can
 * still ask who is playing.
 */

let currentUser = null;
const listeners = new Set();

export function getUser() {
  return currentUser;
}

export function setUser(user) {
  currentUser = user;
  for (const fn of listeners) fn(user);
}

/** Returns an unsubscribe function; call it on unmount. */
export function subscribeUser(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let restored = null;

/**
 * Resumes a session from a previous visit, at most once per page load.
 * Safe to call from several components — they share the same promise.
 */
export function restoreSession() {
  if (!accountsEnabled) return Promise.resolve(null);
  if (!restored) {
    restored = playkit
      .restore()
      .then((user) => {
        setUser(user);
        return user;
      })
      .catch(() => null);
  }
  return restored;
}
