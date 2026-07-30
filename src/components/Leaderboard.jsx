import { useEffect, useState } from 'react';
import { playkit, accountsEnabled, DQ_BOARD } from '../playkitClient.js';

/**
 * Ranks players by Decision Quality, not by money made.
 *
 * This is the game's whole thesis: a good decision can lose money and a
 * reckless one can get lucky, so ranking returns would reward exactly the
 * behaviour the game is trying to unteach.
 */
export default function Leaderboard({ user, refreshKey }) {
  const [entries, setEntries] = useState(null);
  const [mine, setMine] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!accountsEnabled) return;
    let cancelled = false;

    (async () => {
      try {
        const rows = await playkit.getLeaderboard({ board: DQ_BOARD, limit: 10 });
        if (!cancelled) setEntries(rows);
        if (user) {
          const rank = await playkit.getMyRank(DQ_BOARD);
          if (!cancelled) setMine(rank);
        }
      } catch {
        // A leaderboard is a nice-to-have; never surface infrastructure errors
        // on top of the player's result screen.
        if (!cancelled) setFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, [user, refreshKey]);

  if (!accountsEnabled || failed) return null;
  if (!entries) return <p className="lb-loading">Loading decision-quality board…</p>;
  if (entries.length === 0) return null;

  return (
    <div className="leaderboard">
      <p className="lb-title">Decision Quality — top players</p>
      <p className="lb-sub">Ranked on how you decided, not on what you earned.</p>
      <ol className="lb-list">
        {entries.map((e) => (
          <li
            key={`${e.rank}-${e.displayName}`}
            className={user && e.displayName === user.displayName ? 'lb-row is-me' : 'lb-row'}
          >
            <span className="lb-rank">{e.rank}</span>
            <span className="lb-name">{e.displayName}</span>
            <span className="lb-score">{Math.round(e.score)}</span>
          </li>
        ))}
      </ol>
      {mine?.rank && (
        <p className="lb-mine">
          Your best: {Math.round(mine.best)} · rank #{mine.rank}
        </p>
      )}
    </div>
  );
}
