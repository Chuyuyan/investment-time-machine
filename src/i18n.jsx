// Tiny i18n with graceful fallback. T(s) looks the English string up in the
// zh dictionary; anything untranslated simply stays English — the game can
// never break from a missing entry. L(en, zh) is for interpolated strings.
import { useSyncExternalStore } from 'react';
import React from 'react';
import { ZH } from './i18n-zh.js';

const KEY = 'itm_lang';
let lang = (() => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'zh' || saved === 'en') return saved;
    return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  } catch (e) { return 'en'; }
})();

const listeners = new Set();

export function getLang() { return lang; }
export function setLang(next) {
  lang = next;
  try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
  for (const fn of listeners) fn();
}
export function toggleLang() { setLang(lang === 'zh' ? 'en' : 'zh'); }

const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

/** Re-render the calling component whenever the language changes. */
export function useLangTick() { return useSyncExternalStore(subscribe, getLang); }

/** Translate a dictionary string (falls back to the English original). */
export function T(s) {
  if (lang !== 'zh' || s == null) return s;
  return ZH[s] || s;
}

/** Pick between two hand-written variants (for interpolated strings). */
export function L(en, zh) { return lang === 'zh' ? zh : en; }

/** The globe button — fixed corner, above every modal (z-index 300). */
export function LangGlobe() {
  useLangTick();
  return (
    <button className="itm-globe" onClick={toggleLang}
      aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
      title={lang === 'zh' ? 'Switch to English' : '切换到中文'}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <ellipse cx="12" cy="12" rx="4" ry="9" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3.6 9h16.8 M3.6 15h16.8" stroke="currentColor" strokeWidth="1.3" fill="none" />
      </svg>
      <span>{lang === 'zh' ? 'EN' : '中'}</span>
    </button>
  );
}
