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

/** The leaderboard ranks Decision Quality, not returns — see BOARD below. */
export const DQ_BOARD = 'decision-quality';
