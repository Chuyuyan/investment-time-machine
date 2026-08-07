import React, { useState, useEffect, useRef } from 'react';
import { itmAudio } from '../audio.js';
import { CASES as STUDY_CASES } from './CoreLoop.jsx';
import { CONCEPTS } from '../lessons.js';
import { ERA_DOTCOM, DOTCOM_COLORS } from '../eras-dotcom.js';
import { T, L, useLangTick } from '../i18n.jsx';
import { getUser, loadSlice, saveSlice, restoreSession } from '../playkitClient.js';

/*
 * PressureGame — "Rent's Due"  (?proto=pressure)
 * ----------------------------------------------
 * Dark comic reskin. Cousin Sal is now a big-head, giant-glasses IP character
 * whose lenses ARE his expression screen, and who breaks the 4th wall: when you
 * try to sell one of his darlings he pops up and shoves the trade back ("WAIT!!
 * it's about to bounce!"). Research gives real, look-up-able facts (money/price/
 * news) that update each period — never the "why". A line chart shows P&L.
 */

const START = 4000;
const RENT = 700;
const ACTIONS = 3;
const GIG = 300;
const FREEDOM = 15000;

const DATES = ['Feb 2020', 'Mar 2020', 'Sep 2020', 'Feb 2021', 'Nov 2021', 'Jun 2022'];
const MUSIC_MOODS = ['calm', 'storm', 'boom', 'boom', 'tense', 'storm'];
const HEADLINE = [
  'Markets near record highs. A strange new virus is spreading in China — almost no one is worried.',
  'THE CRASH. Lockdowns hit and the market falls faster than at any time in history.',
  'A stunning rebound. Stuck at home, millions of new traders pile into anything tech.',
  'Peak euphoria — meme stocks, crypto, "stocks only go up." Everyone feels like a genius.',
  'The party is deafening, but interest rates and inflation are creeping into the headlines.',
  'The reckoning. Rates jump, the bubble bursts, and the high-flyers of 2021 collapse.',
];

// You start following only the household names. The rest of the market has to be
// unlocked — with scarce cash, or with insight you earn by actually researching.
const START_WATCH = ['AAPL', 'TSLA', 'DAL'];
const COMPANIES = [
  { id: 'AAPL', name: 'Apple', biz: 'Makes the iPhone, Mac, and services like the App Store. One of the most profitable companies on Earth.', prices: [68, 63, 116, 121, 165, 137] },
  { id: 'TSLA', name: 'Tesla', biz: 'Builds electric cars, led by Elon Musk. Also batteries and self-driving software.', prices: [133, 102, 430, 700, 1140, 700] },
  { id: 'ZM', name: 'Zoom', biz: 'Sells easy video-calling software, mostly to businesses. Small and fairly new.', prices: [105, 146, 470, 400, 250, 110], cost: 150, xp: 4,
    teasers: [
      'Your whole office suddenly mentions some video-call app. You have never used it.',
      'That video-call app is one of the only things RISING through the crash.',
      "It's a verb now — 'let's Zoom'. The stock has tripled since spring.",
      'Everyone on earth seems to use it now. The question is what that is worth.',
      'Whispers that its growth is cooling as offices plan to reopen.',
      'The lockdown darling has fallen hard from its peak.',
    ] },
  { id: 'DAL', name: 'Delta', biz: 'A major airline. Airlines carry huge fixed costs and lots of debt.', prices: [47, 23, 31, 46, 38, 31] },
  { id: 'MRNA', name: 'Moderna', biz: "A biotech using new 'mRNA' technology to make vaccines. Very few products so far.", prices: [26, 29, 67, 150, 300, 140], cost: 250, xp: 6,
    teasers: [
      'A tiny biotech is quietly working on a new kind of vaccine technology.',
      'Somewhere in the vaccine race there is a tiny biotech nobody has heard of.',
      'That little vaccine firm just signed its first government contracts.',
      'Its name is suddenly in every headline — the vaccine is real.',
      'Now a household name, minting money from boosters.',
      'The vaccine winner — but the pandemic itself is fading.',
    ] },
  { id: 'PTON', name: 'Peloton', biz: 'Sells premium exercise bikes and a subscription for live workout classes.', prices: [27, 27, 100, 145, 55, 12], cost: 200, xp: 5,
    teasers: [
      'Sal will not stop talking about some exercise-bike company.',
      'Gyms are shut — and that bike company is sold out for months.',
      'Those bikes are the hottest product in America, Sal says.',
      'Priced as if home fitness replaces gyms forever.',
      'Gyms reopened. The bikes are piling up unsold, apparently.',
      'Down about 90% from the top. Sal has gone quiet about it.',
    ] },
];
const COLORS = { AAPL: '#5b8cff', TSLA: '#f5b13c', ZM: '#b072ff', DAL: '#ff5f6a', MRNA: '#2fd1a8', PTON: '#ff6fa5', CASH: '#8a93a8' };

const INFO = {
  AAPL: [
    { m: 'Earns tens of billions in profit a year; huge cash reserves.', v: 'Priced roughly in line with its profits.', n: 'Warned the China virus could disrupt its factories.' },
    { m: 'Still deeply profitable; online sales continue with stores shut.', v: 'Fell with the market; a bit cheaper than usual.', n: 'Global lockdowns close its retail stores.' },
    { m: 'Selling record Macs and iPads to people stuck at home.', v: 'Recovered; now priced above its usual level.', n: 'Split its stock 4-for-1; retail traders pile in.' },
    { m: 'Record profits; services keep growing.', v: 'Expensive versus its own history, but earnings rise.', n: 'Treated as the safe giant amid the mania.' },
    { m: 'Profits at all-time highs.', v: 'Priced high, like most of the market now.', n: 'Rate-hike worries start hitting the headlines.' },
    { m: 'Still very profitable; sales holding up.', v: 'Came down toward a normal price.', n: 'Falls as rising rates hit nearly every stock.' },
  ],
  TSLA: [
    { m: 'Just turned its first small profits; heavy debt; low on cash.', v: 'Priced far above older carmakers that earn much more.', n: 'The most bet-against stock in America; Musk everywhere.' },
    { m: 'Barely profitable; shut factories could strain its cash.', v: 'Still priced like a tech giant despite the risks.', n: 'Crushed in the crash with other risky names.' },
    { m: 'Now posting steady profits; deliveries climbing fast.', v: 'Priced higher than any carmaker in history.', n: 'Reopens in defiance; about to join the S&P 500.' },
    { m: 'Growing and profitable, but small next to its price.', v: 'Among the most expensive big stocks in the world.', n: 'Retail mania at a fever pitch.' },
    { m: 'Record deliveries and real profits now.', v: 'Worth more than the next several carmakers combined.', n: 'Peak euphoria across the whole market.' },
    { m: 'Makes real money now, and a lot of it.', v: 'Still pricey, but far less extreme after the drop.', n: 'Falls hard as rising rates hit high-priced stocks.' },
  ],
  ZM: [
    { m: 'Small; sales nearly doubled last year; barely profitable.', v: 'Priced very high versus how little it earns.', n: 'Almost nobody used it — until the virus appeared.' },
    { m: 'Usage exploding as offices and schools close.', v: 'Even pricier after rising during the crash.', n: 'One of the only stocks going UP in the crash.' },
    { m: 'Revenue up 350%+; now clearly profitable.', v: 'About 50× its yearly sales — far above most companies.', n: "'To Zoom' becomes an everyday word." },
    { m: 'Still growing, but no longer exploding.', v: 'Still priced for very high growth far ahead.', n: 'Vaccines are being announced.' },
    { m: 'Growth slowing noticeably as reopening nears.', v: 'Very expensive relative to slowing growth.', n: 'Offices begin planning to reopen.' },
    { m: 'Sales growth has largely stalled.', v: 'Back to a modest price after a huge fall.', n: 'Near where it started before the pandemic.' },
  ],
  DAL: [
    { m: 'Solidly profitable in good times; lots of debt.', v: 'Priced cheaply versus its profits.', n: 'Record travel demand, for now.' },
    { m: 'Travel down ~95%; losing roughly $60M a day.', v: 'Cheap on paper — but now losing money fast.', n: 'Warren Buffett sells every airline he owns.' },
    { m: 'Still losing money; kept alive by bailouts.', v: 'Cheap, but few profits to value against.', n: 'Planes remain mostly empty.' },
    { m: 'Losses narrowing on reopening hopes.', v: 'Cheap, but still unprofitable.', n: 'Vaccine hopes briefly lift travel stocks.' },
    { m: 'Recovering slowly; still below pre-COVID.', v: 'Cheap, profits far below normal.', n: 'A slow grind back.' },
    { m: 'Small profits again, far below pre-pandemic.', v: 'Still statistically cheap.', n: 'Two years on, below where it started.' },
  ],
  MRNA: [
    { m: 'No approved products; loses money on research.', v: 'Priced on hope — almost no revenue.', n: 'A tiny firm now racing to make a COVID vaccine.' },
    { m: 'Still no products or profits.', v: 'Valued entirely on the chance its vaccine works.', n: 'Interest surges as the pandemic explodes.' },
    { m: 'Signs first big government supply contracts.', v: 'Priced far ahead of any actual profits.', n: 'Its vaccine enters human trials.' },
    { m: 'Vaccine authorized — billions in real revenue arriving.', v: 'Now has real sales to value against.', n: 'Among the first COVID vaccines approved.' },
    { m: 'Highly profitable now — almost all from COVID.', v: 'Priced richly on profits that may not last.', n: 'Booster demand is strong.' },
    { m: 'Still profitable, but sales set to shrink as COVID fades.', v: 'Came down as future profits look smaller.', n: 'The pandemic is winding down.' },
  ],
  PTON: [
    { m: 'Sales growing fast; loses money; recently went public.', v: 'Priced high for a company that loses money.', n: 'A pricey bike most people have never tried.' },
    { m: 'Demand jumping as gyms close.', v: 'Expensive, but growth is accelerating.', n: 'Gyms shut nationwide.' },
    { m: 'Bikes sold out for months; briefly profitable.', v: 'Priced for the boom to last for years.', n: 'Everyone stuck at home wants one.' },
    { m: "Still growing; can't build bikes fast enough.", v: 'Priced as if home fitness replaces gyms forever.', n: 'Home-fitness mania at its peak.' },
    { m: 'Growth stalling; unsold inventory piling up.', v: 'Still priced high as sales slow.', n: 'Gyms are reopening.' },
    { m: 'Sales collapsing; back to heavy losses.', v: 'Crashed to a fraction of its former price.', n: 'Down about 90% from its peak.' },
  ],
};

// ---- The market map ----------------------------------------------------
// Forces are the real things moving the world. You meet them in the news, then
// YOU draw the links yourself — and you can draw them wrong.
const FORCES = [
  { id: 'LOCK', name: 'Lockdown', at: [1, 2], blurb: 'Offices, gyms and airports shut overnight.' },
  { id: 'VAX', name: 'The vaccine race', at: [1, 2], blurb: 'Governments will pay almost anything for a vaccine.' },
  { id: 'OPEN', name: 'Reopening', at: [3, 4, 5], blurb: 'Vaccines arrive and life restarts.' },
  { id: 'RATES', name: 'Rate hikes', at: [4, 5], blurb: 'Inflation forces the Fed to make money expensive.' },
];

// What was actually true about the world. Note: being RIGHT here does not mean
// the trade paid — the market may have priced it in long before you got there.
const TRUTH = {
  LOCK: {
    DAL: { dir: 'hurts', note: 'Planes emptied. It fell ~50% in weeks.' },
    ZM: { dir: 'helps', note: 'It rose while everything else crashed.' },
    PTON: { dir: 'helps', note: 'Gyms shut; the bikes sold out for months.' },
    AAPL: { dir: 'helps', note: 'People stuck at home bought record Macs and iPads.' },
  },
  VAX: {
    MRNA: { dir: 'helps', note: 'A tiny biotech nobody knew became a household name.' },
  },
  OPEN: {
    DAL: { dir: 'helps', note: 'You were right about the world — and Delta still fell. The hope was already in the price.' },
    ZM: { dir: 'hurts', note: 'The exact thing that made it soar went into reverse.' },
    PTON: { dir: 'hurts', note: 'Gyms reopened and demand vanished. Down ~90%.' },
  },
  RATES: {
    TSLA: { dir: 'hurts', note: 'Expensive growth fell hardest — even a real business.' },
    ZM: { dir: 'hurts', note: 'Priced for perfection, then repriced brutally.' },
    PTON: { dir: 'hurts', note: 'Already broken; rates finished it.' },
    AAPL: { dir: 'hurts', note: 'Even the safest giant fell when money got expensive.' },
  },
};
const TRUE_LINKS = Object.values(TRUTH).reduce((s, m) => s + Object.keys(m).length, 0);

const LEADS = [
  [{ id: 'ZM', why: 'Downloads exploding as offices close.' }],
  [{ id: 'DAL', why: 'Airlines in free-fall — bargain, or trap?' }, { id: 'MRNA', why: 'A vaccine race is starting; one tiny firm is in it.' }],
  [{ id: 'TSLA', why: 'It bounced hard off the bottom — momentum building.' }],
  [{ id: 'PTON', why: 'Home-fitness mania — real, or a fad?' }],
  [{ id: 'TSLA', why: 'Everything is euphoric. Is this the top?' }],
  [],
];

const SAL_BASE = {
  0: { mood: 'hype', line: "Cuz! I dumped my whole bonus into Peloton — everyone's gonna work out at home, we're gonna be RICH. You should get in too!", choices: [{ label: "Thanks, Sal — I'll look into it" }] },
  1: { mood: 'worried', line: "It's bad, cuz — Mom's back in the hospital and I'm wiped out. I need $500 for her meds. Can you spot me?", choices: [{ label: 'Give him $500', need: 500, help: true, eff: { cash: -500 }, note: 'Family. The rent still comes anyway.' }, { label: "I can't right now", refuse: true }] },
  2: { mood: 'worried', line: "My tank's bone dry and payday's not 'til Friday, cuz. Float me $150? I'm good for it, I swear.", choices: [{ label: 'Lend him $150', need: 150, help: true, eff: { cash: -150 } }, { label: 'Not this time', refuse: true }] },
  3: { mood: 'greedy', line: "Everyone's getting rich! My guy runs a newsletter — $200 and he hands you the next 10×. He swears Peloton and Zoom go to the moon. In or out?", choices: [{ label: 'Buy the tip ($200)', need: 200, eff: { cash: -200, reveal: ['PTON', 'ZM'] }, note: 'You pay — then research them yourself.' }, { label: 'Pass' }] },
};

Object.assign(COLORS, DOTCOM_COLORS);

// Chapter 1 wraps the data above; chapter 2 lives in eras-dotcom.js. The pouch
// is shared across eras on purpose — RATES, Apple and Microsoft exist in both,
// so what you prove in 2022 comes back to life in 1999.
const ERA_COVID = {
  id: 'covid', num: 1, requires: null,
  title: "Rent's due", sub: '2020\u20132022 \u00b7 the crash, the mania, the bust',
  startLabel: 'February 2020', endLabel: 'June 2022',
  dates: DATES, moods: MUSIC_MOODS, headlines: HEADLINE,
  stormAt: [1], alarmAt: 1,
  startWatch: START_WATCH, salDarlings: ['PTON', 'ZM'], darlingUntil: 3,
  companies: COMPANIES, info: INFO, leads: LEADS, forces: FORCES, truth: TRUTH,
  sal: {
    base: SAL_BASE,
    steal: { line: "Funny thing, cuz \u2014 you kept slamming the door on me. So I let myself in and 'borrowed' $700 from your drawer. Guess we're even now." },
    warn: { line: "Cuz, you always spot me when I'm down \u2014 so straight up: I'm in deep on Peloton and Zoom, but something feels wrong. Get out while you can. And here, take this back.", cash: 600, reveal: ['PTON', 'ZM'], note: 'He pays you back \u2014 and hands you a real warning.' },
    plant: { mood: 'manic', line: "I re-mortgaged the house and put it ALL into Peloton and Zoom. And write this in that little bag of yours, cuz: rate hikes can't touch us \u2014 they HELP Tesla!!", plant: { force: 'RATES', company: 'TSLA', dir: 'helps' }, accept: "Write Sal's line in the pouch", decline: 'Sal\u2026 please be careful', note: "His call, in your pouch. Free \u2014 but it's HIS." },
    final: { mood: 'panic', line: "IT'S ALL CRASHING, CUZ!! Peloton, Zoom \u2014 everything's going to ZERO!! SELL IT ALL, RIGHT NOW!! Don't think \u2014 just DUMP EVERYTHING!!", doLabel: 'Panic \u2014 dump everything', doNote: "Do it Sal's way. Sell it all at the bottom.", wiseLabel: "No \u2014 I'll trust my own read", wiseNote: 'Stay calm. Stick to your own analysis.' },
    epi: {
      wiseIndep: "\u2026Wait. You didn't panic. You've been tuning me out all year, cuz \u2014 and you were right, every single time. \u2026Huh. Maybe I should've been listening to YOU.",
      wise: "\u2026Wait. You didn't panic. You just looked at it and decided for yourself. \u2026Huh. Maybe I should've been listening to you this whole time.",
      refused: "I lost it all, cuz. \u2026And no, we're not square after I took your cash. Don't look at me like that.",
      helped: "I lost it all \u2014 but you kept me afloat when it mattered. That's worth more than money. Crashing at Mom's for a while.",
      neutral: "I lost it all, cuz. Peloton, Zoom, everything. That newsletter guy was a fraud. Moving back in with Mom.",
    },
  },
  blurbs: {
    win: (net) => `You turned $4,000 into ${net} while the bills never stopped \u2014 through the crash, the mania, and the bust. Your money now works harder than your rent. That's escape velocity.`,
    winZh: (net) => `账单从没停过，你还是把 $4,000 变成了 ${net}\u2014\u2014穿过崩盘、狂热与破裂。你的钱现在比房租跑得快。这就是逃逸速度。`,
    survive: "You kept the lights on through a crash, a bubble, and its collapse. You didn't get rich \u2014 but you didn't get evicted, and you didn't end up like Sal.",
    surviveZh: '崩盘、泡沫、破裂，你都把日子撑住了。没发财\u2014\u2014但也没被赶出去，更没活成 Sal 那样。',
  },
};
if (!ERA_DOTCOM.sal.epi.wiseIndep) ERA_DOTCOM.sal.epi.wiseIndep = ERA_DOTCOM.sal.epi.wise;
const ERAS = [ERA_COVID, ERA_DOTCOM];

const CHAPTERS_KEY = 'itm_chapters_v1';
const loadChapters = () => { try { return JSON.parse(localStorage.getItem(CHAPTERS_KEY)) || {}; } catch (e) { return {}; } };
const saveChapter = (id, net) => { try { const c = loadChapters(); c[id] = { done: true, net: Math.max(net, (c[id] && c[id].net) || 0) }; localStorage.setItem(CHAPTERS_KEY, JSON.stringify(c)); } catch (e) { /* private mode */ } };

// Cousin Sal: huge head, tiny body, GIANT glasses whose lenses are his expression screen.
function SalGuy({ mood, thief }) {
  const lens = (cx) => {
    if (mood === 'hype') return <text x={cx} y={151} fontSize="34" fontWeight="900" textAnchor="middle" fill="#f5c84b">★</text>;
    if (mood === 'greedy') return <text x={cx} y={152} fontSize="32" fontWeight="900" textAnchor="middle" fill="#2fae6a">$</text>;
    if (mood === 'broke') return <text x={cx} y={152} fontSize="30" fontWeight="900" textAnchor="middle" fill="#c23a3a">✕</text>;
    if (mood === 'manic') return <React.Fragment><circle cx={cx} cy={140} r="13" fill="#fff" /><circle cx={cx} cy={140} r="3" fill="#161616" /></React.Fragment>;
    if (mood === 'panic') return <React.Fragment><circle cx={cx} cy={140} r="13" fill="#fff" /><circle cx={cx + (cx < 120 ? -6 : 6)} cy={141} r="3.5" fill="#161616" /></React.Fragment>;
    return <React.Fragment><circle cx={cx} cy={140} r="11" fill="#fff" /><circle cx={cx} cy={135} r="4.5" fill="#161616" /></React.Fragment>;
  };
  let mouth;
  if (mood === 'hype') mouth = <path d="M94 200 Q120 236 146 200 Q120 216 94 200 Z" fill="#7a2f2f" />;
  else if (mood === 'greedy') mouth = <React.Fragment><path d="M98 200 Q120 230 142 200 Q120 214 98 200 Z" fill="#7a2f2f" /><path d="M112 213 Q120 223 128 213 Z" fill="#d1706a" /></React.Fragment>;
  else if (mood === 'manic') mouth = <React.Fragment><ellipse cx="120" cy="208" rx="23" ry="16" fill="#6e2626" /><ellipse cx="120" cy="201" rx="16" ry="4" fill="#fff" /></React.Fragment>;
  else if (mood === 'panic') mouth = <ellipse cx="120" cy="212" rx="19" ry="21" fill="#5e2020" />;
  else if (mood === 'broke') mouth = <path d="M100 216 Q120 202 140 216" stroke="#6e2626" strokeWidth="5" fill="none" strokeLinecap="round" />;
  else mouth = <ellipse cx="120" cy="207" rx="12" ry="10" fill="#7a2f2f" />;
  return (
    <svg viewBox="0 0 240 300" className="pg-dave-svg" xmlns="http://www.w3.org/2000/svg">
      <path d="M90 300 Q90 256 120 248 Q150 256 150 300 Z" fill="#ece5d3" />
      <path d="M90 300 Q88 260 104 252 L120 300 Z" fill="#333a4d" />
      <path d="M150 300 Q152 260 136 252 L120 300 Z" fill="#333a4d" />
      <path d="M120 252 l-7 22 l7 8 l7 -8 Z" fill="#3a9a5a" />
      <path d="M150 266 Q198 248 192 210 L172 216 Q180 244 142 254 Z" fill="#333a4d" />
      <circle cx="188" cy="200" r="17" fill="#e8b98f" />
      <rect x="106" y="234" width="28" height="24" rx="8" fill="#dfa877" />
      <circle cx="120" cy="140" r="90" fill="#e8b98f" />
      <circle cx="34" cy="148" r="13" fill="#e8b98f" /><circle cx="206" cy="148" r="13" fill="#e8b98f" />
      <path d="M42 160 Q58 228 120 232 Q182 228 198 160 Q178 192 120 196 Q62 192 42 160 Z" fill="#a07040" opacity="0.75" />
      <path d="M46 92 q-12 -12 0 -24 q3 13 15 15 Z" fill="#5f4230" />
      <path d="M194 92 q12 -12 0 -24 q-3 13 -15 15 Z" fill="#5f4230" />
      <path d="M40 92 Q52 32 120 30 Q188 32 200 92 Q160 72 120 72 Q80 72 40 92 Z" fill="#d83a2f" />
      <path d="M150 84 Q212 78 228 102 Q212 111 150 104 Z" fill="#b52e26" />
      <text x="118" y="64" fontSize="21" fontWeight="900" textAnchor="middle" fill="#fff">SAL</text>
      {thief && <React.Fragment><path d="M26 126 Q120 110 214 126 L214 154 Q120 142 26 154 Z" fill="#14161d" /><path d="M60 118 Q120 108 180 118 L180 108 Q120 98 60 108 Z" fill="#14161d" /></React.Fragment>}
      <line x1="112" y1="140" x2="128" y2="140" stroke="#22406e" strokeWidth="6" />
      <line x1="58" y1="136" x2="34" y2="148" stroke="#22406e" strokeWidth="5" strokeLinecap="round" />
      <line x1="182" y1="136" x2="206" y2="148" stroke="#22406e" strokeWidth="5" strokeLinecap="round" />
      <circle cx="84" cy="140" r="35" fill="#eaf2ff" stroke="#22406e" strokeWidth="7" />
      <circle cx="156" cy="140" r="35" fill="#eaf2ff" stroke="#22406e" strokeWidth="7" />
      {lens(84)}{lens(156)}
      <path d="M120 152 q-11 26 -2 34 q11 6 22 0 q9 -8 -2 -34 Z" fill="#e0ac7e" />
      {mouth}
      {mood === 'worried' && <path d="M198 152 q8 16 0 24 q-10 -5 0 -24 Z" fill="#7fc9e8" />}
      {mood === 'panic' && <React.Fragment><path d="M40 150 q7 15 0 22 q-9 -5 0 -22 Z" fill="#7fc9e8" /><path d="M202 148 q7 15 0 22 q-9 -5 0 -22 Z" fill="#7fc9e8" /><path d="M120 24 l-4 -12 M120 24 l0 -14 M120 24 l4 -12" stroke="#5f4230" strokeWidth="3" strokeLinecap="round" /></React.Fragment>}
    </svg>
  );
}

function SalOverlay({ sal, cash, onPick }) {
  return (
    <div className={'pg-dave-overlay' + (sal.mood === 'panic' ? ' pg-panic-overlay' : '')}>
      <div className="pg-dave-bubble">
        <p className="pg-dave-name">{T('Cousin Sal')}</p>
        <p className="pg-dave-line">"{T(sal.line)}"</p>
        <div className="pg-dave-choices">
          {sal.mood === 'panic' && <span className="pg-point"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M2 12h15M12 6l7 6-7 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
          {sal.choices.map((ch, i) => { const cant = ch.need && cash < ch.need; return (
            <button key={i} className="pg-dave-btn" disabled={cant} onClick={() => onPick(ch)}>{cant ? L(`${ch.label} — can't afford it`, `${T(ch.label)}——付不起`) : T(ch.label)}{ch.note && !cant && <em>{T(ch.note)}</em>}</button>
          ); })}
        </div>
      </div>
      <div className={'pg-dave-guy' + (sal.mood === 'panic' ? ' pg-frantic' : '')}><SalGuy mood={sal.mood} /></div>
    </div>
  );
}

// His "绝活": he invades the UI to stop you selling one of his darlings.
function SalInterject({ name, onHold, onSell }) {
  return (
    <div className="pg-dave-overlay">
      <div className="pg-dave-bubble pg-interject-bubble">
        <p className="pg-dave-name">{T('Cousin Sal · barging in')}</p>
        <p className="pg-dave-line">{L(`"WAIT!! Don't sell ${name}!! It's about to bounce, cuz, I can FEEL it — just hold a little longer!!"`, `"等等！！别卖 ${name}！！马上就要反弹了老表，我感觉得到——再拿一会儿！！"`)}</p>
        <div className="pg-dave-choices">
          <button className="pg-dave-btn" onClick={onHold}>{T("…Fine, I'll keep holding")}<em>{T("Do it Sal's way.")}</em></button>
          <button className="pg-dave-btn pg-defy" onClick={onSell}>{T("No — I'm selling anyway")}<em>{T('Trust your own read.')}</em></button>
        </div>
      </div>
      <div className="pg-dave-guy pg-dave-burst"><SalGuy mood="manic" /></div>
    </div>
  );
}

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
const sPct = (x) => { const v = x * 100; return (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(Math.abs(v) < 10 ? 1 : 0) + '%'; };
const cls = (x) => (x > 0.005 ? 'up' : x < -0.005 ? 'down' : 'flat');

// The pouch (锦囊) — a proper brocade bag: bulbous body, cinched neck with a
// gold cord, ruffled top, tassels, and brocade motifs. Hangs from a cord.
const Bulb = () => <svg className="pg-bulb" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M12 3a6 6 0 0 0-3.4 10.9c.6.5 1 1.2 1.2 2.1h4.4c.2-.9.6-1.6 1.2-2.1A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M10 18.5h4M10.8 21h2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
const BillIcon = () => <svg viewBox="0 0 28 16" width="26" height="15" aria-hidden="true"><rect x="1" y="1" width="26" height="14" rx="2.5" fill="#7fb069" stroke="#3c6e3c" strokeWidth="1.4" /><circle cx="14" cy="8" r="4.2" fill="none" stroke="#3c6e3c" strokeWidth="1.2" /><path d="M14 5.5v5" stroke="#2c5230" strokeWidth="1.2" /></svg>;

function PouchIcon() {
  return (
    <svg viewBox="0 0 96 116" width="94" height="112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M48 0 v24" stroke="#8f6a1f" strokeWidth="3" />
      <path d="M34 30 Q29 17 38 24 Q40 13 48 21 Q56 13 58 24 Q67 17 62 30 Z" fill="#8f2b24" />
      <path d="M48 30 C 20 34 10 58 14 76 C 18 96 32 107 48 107 C 64 107 78 96 82 76 C 86 58 76 34 48 30 Z" fill="#b03526" />
      <path d="M48 30 C 30 33 18 44 15 58 Q 48 50 81 58 C 78 44 66 33 48 30 Z" fill="#9c2f27" />
      <rect x="30" y="27" width="36" height="9" rx="4.5" fill="#e8b64a" />
      <circle cx="48" cy="32" r="4" fill="#c9962f" />
      <path d="M44 36 q-8 12 -2 22 M52 36 q8 12 2 22" stroke="#e8b64a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="41" cy="61" r="2.8" fill="#e8b64a" />
      <circle cx="55" cy="61" r="2.8" fill="#e8b64a" />
      <path d="M41 64 l-3 9 M41 64 v10 M41 64 l3 9 M55 64 l-3 9 M55 64 v10 M55 64 l3 9" stroke="#e8b64a" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="33" cy="83" r="4.5" fill="none" stroke="#e8b64a" strokeWidth="1.6" opacity="0.7" />
      <circle cx="63" cy="87" r="6" fill="none" stroke="#e8b64a" strokeWidth="1.6" opacity="0.55" />
      <path d="M42 90 l6 -6 l6 6 l-6 6 Z" fill="none" stroke="#e8b64a" strokeWidth="1.6" opacity="0.7" />
    </svg>
  );
}

// The pouch survives runs — proven (and broken) links are earned knowledge.
const POUCH_KEY = 'itm_pouch_v1';
const loadPouch = () => { try { return JSON.parse(localStorage.getItem(POUCH_KEY)) || []; } catch { return []; } };
const savePouch = (links) => { try { localStorage.setItem(POUCH_KEY, JSON.stringify(links)); } catch (e) { /* private mode */ } };

function MarketChart({ upto, watch, companies, dates }) {
  const n = upto + 1;
  if (n < 2) return null;
  const series = companies.filter((c) => watch.includes(c.id) && c.prices[0] != null).map((c) => ({ id: c.id, name: c.name, vals: c.prices.slice(0, n).map((p) => (p / c.prices[0]) * 100) }));
  const all = series.flatMap((s) => s.vals).concat([100]);
  const min = Math.min(...all), max = Math.max(...all);
  const W = 360, H = 148, pL = 6, pR = 6, pT = 8, pB = 16;
  const X = (i) => pL + (i / (n - 1)) * (W - pL - pR);
  const Y = (v) => pT + (1 - (v - min) / ((max - min) || 1)) * (H - pT - pB);
  const sorted = series.slice().sort((a, b) => b.vals[n - 1] - a.vals[n - 1]);
  return (
    <div className="pg-chart-card">
      <p className="pg-chart-h">{L(`Every company since ${dates[0]} — as if you'd put $100 in each`, `自${T(dates[0])}以来的每家公司——假设各投了 $100`)}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="pg-chart">
        <line className="pg-chart-base" x1={pL} x2={W - pR} y1={Y(100)} y2={Y(100)} />
        <text className="pg-chart-lbl" x={pL} y={Y(100) - 3}>$100</text>
        {series.map((s) => <polyline key={s.id} points={s.vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')} fill="none" stroke={COLORS[s.id]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />)}
        {series.map((s) => <circle key={s.id} cx={X(n - 1)} cy={Y(s.vals[n - 1])} r="3" fill={COLORS[s.id]} />)}
        <text className="pg-chart-x" x={pL} y={H - 3}>{T(dates[0])}</text>
        <text className="pg-chart-x" x={W - pR} y={H - 3} textAnchor="end">{T(dates[upto])}</text>
      </svg>
      <div className="pg-chart-legend">
        {sorted.map((s) => { const chg = s.vals[n - 1] / 100 - 1; return <span key={s.id} className="pg-leg"><span className="pg-dot" style={{ background: COLORS[s.id] }} />{s.name} <em className={cls(chg)}>{sPct(chg)}</em></span>; })}
      </div>
      <p className="pg-chart-note">{T('Each company has its own colour — the dot on a card just matches its line up here. Nothing more.')}</p>
    </div>
  );
}

export default function PressureGame() {
  // Which chapter is loaded. Component-scope consts shadow the module-level
  // chapter-1 data, so every reference below follows the active era.
  useLangTick();   // re-render when the language toggles
  const [eraId, setEraId] = useState('covid');
  const ERA = ERAS.find((e) => e.id === eraId) || ERA_COVID;
  /* eslint-disable no-shadow */
  const { dates: DATES, moods: MUSIC_MOODS, headlines: HEADLINE, companies: COMPANIES, info: INFO, leads: LEADS, forces: FORCES, truth: TRUTH, startWatch: START_WATCH } = ERA;
  /* eslint-enable no-shadow */
  const [phase, setPhase] = useState('intro');
  const [t, setT] = useState(0);
  const [cash, setCash] = useState(START);
  const [shares, setShares] = useState({});
  const [avg, setAvg] = useState({});
  const [acts, setActs] = useState(ACTIONS);
  const [dugAt, setDugAt] = useState({});   // company -> period you last investigated (intel persists, then goes stale)
  const [pend, setPend] = useState({});
  const [salDone, setSalDone] = useState({});
  const [helped, setHelped] = useState(0);
  const [refused, setRefused] = useState(0);
  const [interject, setInterject] = useState(null);
  const [blocked, setBlocked] = useState({});
  const [indep, setIndep] = useState(0);
  const [wiseFinal, setWiseFinal] = useState(false);
  const [robbing, setRobbing] = useState(0);
  const [rentWarn, setRentWarn] = useState(null);
  const [unlocked, setUnlocked] = useState(START_WATCH);
  const [insight, setInsight] = useState(0);
  const [myLinks, setMyLinks] = useState(loadPouch);   // your hypotheses: { force, company, dir, status, sal? } — resolved ones survive runs
  const [verdicts, setVerdicts] = useState([]); // last period's map judgments
  const [pouchOpen, setPouchOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false); // re-open the pouch how-to after the first link exists
  const [salWait, setSalWait] = useState(false);
  const [hint, setHint] = useState(null);            // one-time first-touch nudges, Sal-voiced
  const hintsShown = useRef((() => { try { return JSON.parse(localStorage.getItem('itm_hints_v1')) || {}; } catch (e) { return {}; } })());
  function fireHint(key, en, zh) {
    if (hintsShown.current[key]) return;
    hintsShown.current[key] = 1;
    try { localStorage.setItem('itm_hints_v1', JSON.stringify(hintsShown.current)); } catch (e) { /* private mode */ }
    setHint({ key, en, zh });
  }
  useEffect(() => {
    if (phase !== 'play' || t === 0) return;
    setSalWait(true);
    const id = setTimeout(() => setSalWait(false), 3500);
    return () => clearTimeout(id);
  }, [phase, t]);
  const [soundOn, setSoundOn] = useState(() => { try { return localStorage.getItem('itm_sound') !== '0'; } catch (e) { return true; } });
  const lastVoice = useRef('');
  // Night school: once per period, 1 move. A real case (+2 if right) or an
  // investing basic (+1 if right). Closing without answering costs nothing —
  // but the same item waits for you, so there's no free rerolling.
  const [camp, setCamp] = useState(null);          // { mode: 'choose'|'case'|'concept', idx, pick, right } | null
  const [campDoneAt, setCampDoneAt] = useState({}); // period -> true (once per period)
  const campSeen = useRef([]);                      // case indices used this run
  const conceptSeen = useRef([]);                   // concept indices used this run
  const campPending = useRef({});                   // `${t}:case` / `${t}:concept` -> idx (anti-reroll)
  const [roll] = useState(Math.random());
  const [flash, setFlash] = useState('');
  const [free, setFree] = useState(false);

  // --- Cloud save -------------------------------------------------------
  // Signed-in players resume this run on any device. Signed-out players are
  // unaffected: the pouch still lives in localStorage and nothing is sent.
  const [cloudChecked, setCloudChecked] = useState(false);
  const [resumed, setResumed] = useState(false);
  const skipSave = useRef(true);   // don't write back the state we just loaded

  const snapshot = () => ({
    v: 2, era: eraId,
    phase, t, cash, shares, avg, acts, dugAt, pend, salDone,
    helped, refused, blocked, indep, wiseFinal, robbing,
    unlocked, insight, myLinks, free,
  });

  const applySnapshot = (s) => {
    setEraId(s.era ?? 'covid');
    setPhase(s.phase ?? 'play');
    setT(s.t ?? 0);
    setCash(s.cash ?? START);
    setShares(s.shares ?? {});
    setAvg(s.avg ?? {});
    setActs(s.acts ?? ACTIONS);
    setDugAt(s.dugAt ?? {});
    setPend(s.pend ?? {});
    setSalDone(s.salDone ?? {});
    setHelped(s.helped ?? 0);
    setRefused(s.refused ?? 0);
    setBlocked(s.blocked ?? {});
    setIndep(s.indep ?? 0);
    setWiseFinal(!!s.wiseFinal);
    setRobbing(s.robbing ?? 0);
    setUnlocked(s.unlocked ?? START_WATCH);
    setInsight(s.insight ?? 0);
    setMyLinks(s.myLinks ?? []);
    setFree(!!s.free);
  };

  // Load once, after the account bar has had a chance to restore the session.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await restoreSession();
      const saved = await loadSlice('pressure');
      if (cancelled) return;
      if (saved?.pouch) setMyLinks(saved.pouch);          // knowledge from past runs
      if (saved?.run && saved.run.phase === 'play') {
        applySnapshot(saved.run);
        setResumed(true);
      }
      setCloudChecked(true);
      // Let the state settle before autosave starts, so loading can't
      // immediately write the same thing back.
      setTimeout(() => { skipSave.current = false; }, 0);
    })();
    return () => { cancelled = true; };
  }, []);

  // Autosave, debounced: a run is worth keeping, but not one write per click.
  useEffect(() => {
    if (!cloudChecked || skipSave.current || !getUser()) return;
    const id = setTimeout(() => {
      saveSlice('pressure', {
        pouch: myLinks.filter((l) => l.status !== 'guess'),
        run: phase === 'play' ? snapshot() : null,
      });
    }, 1500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudChecked, phase, t, cash, shares, avg, acts, dugAt, pend, salDone,
      helped, refused, blocked, indep, wiseFinal, robbing, unlocked, insight,
      myLinks, free]);

  const price = (id) => COMPANIES.find((c) => c.id === id).prices[t];
  const holdings = COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * price(c.id), 0);
  const net = cash + holdings;
  const leadIds = new Set((LEADS[t] || []).map((l) => l.id));

  function salFor(turn) {
    const S = ERA.sal;
    if (turn === 4) {
      if (refused >= 2) return { mood: 'greedy', line: S.steal.line, choices: [{ label: '…Sal.', eff: { steal: 700 } }] };
      if (helped >= 1 && roll < 0.8) return { mood: 'worried', line: S.warn.line, choices: [{ label: 'Thanks, Sal — you too', eff: { cash: S.warn.cash, ...(S.warn.reveal ? { reveal: S.warn.reveal } : {}) }, note: S.warn.note }] };
      return { mood: S.plant.mood || 'manic', line: S.plant.line, choices: [{ label: S.plant.accept, eff: { plant: S.plant.plant }, note: S.plant.note }, { label: S.plant.decline }] };
    }
    if (turn === 5) {
      // The final crisis — the growth-arc reversal, era-flavoured.
      return { mood: S.final.mood, line: S.final.line, choices: [
        { label: S.final.doLabel, eff: S.final.allIn ? { allIn: S.final.allIn } : { dumpAll: true }, note: S.final.doNote },
        { label: S.final.wiseLabel, wise: true, note: S.final.wiseNote },
      ] };
    }
    return S.base[turn] || null;
  }
  // Sal never opens the show. Period 1 he waits for the player's first real
  // action (a move spent or a position taken), later periods he holds back a
  // few seconds so the headline and the pouch banner land first.
  const orientated = t > 0 || acts < ACTIONS || Object.values(shares).some((n) => n > 0);
  const salEvt = !salDone[t] && !salWait && orientated ? salFor(t) : null;

  // sound: music follows the market's mood; Sal babbles gibberish when he pops in
  useEffect(() => { if (phase === 'play') itmAudio.music(MUSIC_MOODS[t] || 'calm'); }, [phase, t]);
  useEffect(() => {
    const key = phase === 'play' && salEvt ? t + ':' + salEvt.mood : interject ? 'ij' + t + interject.id : '';
    if (key && lastVoice.current !== key) {
      lastVoice.current = key;
      itmAudio.pop();
      itmAudio.babble(salEvt ? salEvt.mood : 'manic');
    }
  }, [phase, t, salEvt, interject]);

  function toggleSound() {
    const on = !soundOn;
    setSoundOn(on);
    try { localStorage.setItem('itm_sound', on ? '1' : '0'); } catch (e) { /* private mode */ }
    itmAudio.setMuted(!on);
    if (on) itmAudio.tick();
  }
  const muteBtn = <button className="pg-mute" onClick={toggleSound} aria-label="Sound on or off"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />{soundOn ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /> : <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}</svg></button>;

  // Researching is what earns insight — the game rewards the habit it wants.
  function dig(id) { if (acts <= 0 || dugAt[id] === t) return; setDugAt({ ...dugAt, [id]: t }); setActs(acts - 1); setInsight(insight + 1); itmAudio.scribble(); fireHint('dig', '"Facts, cuz — money, price, news. Whether to buy is on you."', '"事实到手了表哥——钱、价格、新闻。买不买你自己拿主意。"'); }
  function unlockCash(c) { if (unlocked.includes(c.id) || cash < c.cost) return; setCash(cash - c.cost); setUnlocked([...unlocked, c.id]); itmAudio.unlock(); }
  function unlockXp(c) { if (unlocked.includes(c.id) || insight < c.xp) return; setInsight(insight - c.xp); setUnlocked([...unlocked, c.id]); itmAudio.unlock(); }

  // Draw / flip / erase one of YOUR causal links. Drawing STAKES 1 insight —
  // proven pays 2 back, broken loses it. Conviction should cost something.
  const linkOf = (force, company) => myLinks.find((l) => l.force === force && l.company === company);
  function setLink(force, company, dir) {
    const existing = linkOf(force, company);
    if (existing && existing.status !== 'guess') return;
    if (existing && existing.dir === dir) {                                    // tap again to erase
      setMyLinks(myLinks.filter((l) => !(l.force === force && l.company === company)));
      if (!existing.sal) setInsight(insight + 1);                              // stake back
      return;
    }
    if (existing) { setMyLinks(myLinks.map((l) => (l.force === force && l.company === company ? { ...l, dir } : l))); return; }
    if (insight < 1) return;
    setInsight(insight - 1);
    setMyLinks([...myLinks, { force, company, dir, status: 'guess' }]);
    itmAudio.tick();
  }
  function gig() { if (acts <= 0) return; setCash(cash + GIG); setActs(acts - 1); itmAudio.coin(); }

  function campOpen() {
    if (acts <= 0 || campDoneAt[t]) return;
    setCamp({ mode: 'choose' });
    itmAudio.scribble();
  }
  function drawItem(kind, list, seen) {
    const key = t + ':' + kind;
    if (campPending.current[key] == null) {
      const fresh = list.map((_, i) => i).filter((i) => !seen.current.includes(i));
      const pool = fresh.length ? fresh : list.map((_, i) => i);
      const idx = pool[Math.floor(Math.random() * pool.length)];
      seen.current.push(idx);
      campPending.current[key] = idx;
    }
    return campPending.current[key];
  }
  function campPickCase() { setCamp({ mode: 'case', idx: drawItem('case', STUDY_CASES, campSeen), pick: null, right: null }); }
  function campPickConcept() { setCamp({ mode: 'concept', idx: drawItem('concept', CONCEPTS, conceptSeen), pick: null, right: null }); }
  function campAnswer(pick) {
    if (!camp || camp.pick != null) return;
    const right = pick === STUDY_CASES[camp.idx].out.dir;
    setActs(acts - 1);
    setCampDoneAt({ ...campDoneAt, [t]: true });
    if (right) { setInsight(insight + 2); itmAudio.chime(); } else { itmAudio.womp(); }
    setCamp({ ...camp, pick, right });
  }
  function conceptAnswer(optIdx) {
    if (!camp || camp.pick != null) return;
    const right = optIdx === CONCEPTS[camp.idx].answer;
    setActs(acts - 1);
    setCampDoneAt({ ...campDoneAt, [t]: true });
    if (right) { setInsight(insight + 1); itmAudio.chime(); } else { itmAudio.womp(); }
    setCamp({ ...camp, pick: optIdx, right });
  }
  function buy(id, amt) {
    const p = price(id); const a = Math.min(amt, cash); if (a < 1) return;
    const ns = (shares[id] || 0) + a / p; const na = ns > 0 ? (((shares[id] || 0) * (avg[id] || 0)) + a) / ns : 0;
    setShares({ ...shares, [id]: ns }); setAvg({ ...avg, [id]: na }); setCash(cash - a);
    itmAudio.buy();
  }
  function sell(id, amt) {
    const p = price(id); const pos = (shares[id] || 0) * p; if (pos <= 0) return;
    const a = Math.min(amt == null ? pos : amt, pos); let ns = (shares[id] || 0) - a / p; if (ns < 1e-6) ns = 0;
    setShares({ ...shares, [id]: ns }); if (ns === 0) setAvg({ ...avg, [id]: 0 }); setCash(cash + a);
    itmAudio.sell();
  }
  function applyTrade(id) {
    const a = pend[id] || 0;
    // Sal's 4th-wall block: he won't let you dump his darlings while he's still bullish.
    if (a < 0 && ERA.salDarlings.includes(id) && t <= ERA.darlingUntil && !blocked[t + id] && (shares[id] || 0) * price(id) > 0.5) {
      setInterject({ id, amt: -a }); return;
    }
    // Rent guard: warn before a buy that would leave you short for rent.
    if (a > 0 && cash - Math.min(a, cash) < RENT) { setRentWarn({ id, amt: a }); return; }
    if (a > 0) buy(id, a); else if (a < 0) sell(id, -a);
    if (a) fireHint('trade', '"Position\'s on, cuz. The market only moves when you end the period."', '"仓位建好了表哥。市场要等你结束本期才会动。"');
    setPend({ ...pend, [id]: 0 });
  }
  function confirmRentBuy() { buy(rentWarn.id, rentWarn.amt); setPend({ ...pend, [rentWarn.id]: 0 }); setRentWarn(null); }
  function cancelRentBuy() { setPend({ ...pend, [rentWarn.id]: 0 }); setRentWarn(null); }
  function interjectHold() { setPend({ ...pend, [interject.id]: 0 }); setBlocked({ ...blocked, [t + interject.id]: true }); setInterject(null); }
  function interjectSell() { sell(interject.id, interject.amt); setPend({ ...pend, [interject.id]: 0 }); setBlocked({ ...blocked, [t + interject.id]: true }); setIndep(indep + 1); setInterject(null); }

  function salPick(ch) {
    const e = ch.eff || {};
    if (e.dumpAll) {
      const hv = COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * price(c.id), 0);
      setShares({}); setAvg({}); setCash(cash + hv);
    } else if (e.allIn) {
      const p = price(e.allIn);
      if (p && cash > 1) {
        const cur = shares[e.allIn] || 0; const ns = cur + cash / p;
        const na = ((cur * (avg[e.allIn] || 0)) + cash) / ns;
        setShares({ ...shares, [e.allIn]: ns }); setAvg({ ...avg, [e.allIn]: na }); setCash(0);
        itmAudio.buy();
      }
    } else {
      let nc = cash;
      if (e.cash) nc += e.cash;
      if (e.steal) { const amt = Math.min(e.steal, cash); nc -= amt; setRobbing(amt); setTimeout(() => setRobbing(0), 1600); itmAudio.sneak(); } else { itmAudio.tick(); }
      if (nc !== cash) setCash(nc);
    }
    if (e.reveal) {
      const nd = { ...dugAt }; e.reveal.forEach((id) => { nd[id] = t; }); setDugAt(nd);
      setUnlocked((u) => [...new Set([...u, ...e.reveal])]);
    }
    if (e.plant && !linkOf(e.plant.force, e.plant.company)) {
      setMyLinks([...myLinks, { ...e.plant, status: 'guess', sal: true }]);   // his line, no stake
    }
    if (ch.help) setHelped(helped + 1);
    if (ch.refuse) setRefused(refused + 1);
    if (ch.wise) setWiseFinal(true);
    setSalDone({ ...salDone, [t]: true });
  }

  function endMonth() {
    if (cash < RENT) { setFlash(L(`You're ${fmt(RENT - cash)} short on rent. Sell a holding to cover it — or you're out.`, `房租还差 ${fmt(RENT - cash)}。卖点持仓补上——不然就出局了。`)); return; }
    const afterRent = cash - RENT;
    const nt = t + 1;
    const ending = nt > DATES.length - 1;

    // The market judges every link whose force runs its course this period.
    const resolved = [];
    const nextLinks = myLinks.map((l) => {
      if (l.status !== 'guess') return l;
      const f = FORCES.find((x) => x.id === l.force);
      if (!(f.at.includes(t) && (ending || !f.at.includes(nt)))) return l;   // force still unfolding — wait
      const truth = TRUTH[l.force] && TRUTH[l.force][l.company];
      const ok = !!(truth && truth.dir === l.dir);
      const co = COMPANIES.find((c) => c.id === l.company);
      resolved.push({ force: f, name: co.name, dir: l.dir, ok, sal: l.sal,
        note: truth ? truth.note : "The world never really connected those two — that hunch didn't hold." });
      return { ...l, status: ok ? 'proven' : 'broken' };
    });
    setMyLinks(nextLinks);
    setVerdicts(resolved);
    savePouch(nextLinks.filter((l) => l.status !== 'guess'));   // earned knowledge survives runs
    const won = resolved.filter((r) => r.ok && !r.sal).length * 2;
    if (won) setInsight(insight + won);                          // stake pays double when proven
    itmAudio.kaching();
    if (resolved.length) setTimeout(() => itmAudio.verdict(resolved.filter((r) => r.ok).length, resolved.filter((r) => !r.ok).length), 500);
    if (nt > DATES.length - 1) {
      const endNet = afterRent + COMPANIES.reduce((sum, c) => sum + (shares[c.id] || 0) * (c.prices[t] || 0), 0);
      saveChapter(eraId, endNet);
      setCash(afterRent); setPhase('end'); itmAudio.win(); return;
    }
    const nextNet = afterRent + COMPANIES.reduce((s, c) => s + (shares[c.id] || 0) * c.prices[nt], 0);
    setCash(afterRent); setT(nt); setActs(ACTIONS); setPend({}); setFlash('');   // dugAt persists — old intel stays, marked stale
    if (nextNet >= FREEDOM) { setFree(true); saveChapter(eraId, nextNet); setPhase('end'); itmAudio.win(); return; }
    if (nt === ERA.alarmAt) setTimeout(() => itmAudio.alarm(), 600);   // the crash hits
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() { setCamp(null); setCampDoneAt({}); campSeen.current = []; conceptSeen.current = []; campPending.current = {}; setT(0); setCash(START); setShares({}); setAvg({}); setActs(ACTIONS); setDugAt({}); setPend({}); setSalDone({}); setHelped(0); setRefused(0); setInterject(null); setBlocked({}); setIndep(0); setWiseFinal(false); setRobbing(0); setRentWarn(null); setUnlocked(START_WATCH); setInsight(0); setMyLinks(loadPouch()); setVerdicts([]); setPouchOpen(false); setFlash(''); setFree(false); setResumed(false); setPhase('intro');
    // Drop the saved run as well, or the next visit would resume the run the
    // player just abandoned. The pouch is kept — that knowledge is earned.
    saveSlice('pressure', { pouch: loadPouch(), run: null });
  }

  function startEra(id) {
    const era = ERAS.find((x) => x.id === id) || ERA_COVID;
    setEraId(id);
    setCamp(null); setCampDoneAt({}); campSeen.current = []; conceptSeen.current = []; campPending.current = {};
    setT(0); setCash(START); setShares({}); setAvg({}); setActs(ACTIONS); setDugAt({}); setPend({}); setSalDone({});
    setHelped(0); setRefused(0); setInterject(null); setBlocked({}); setIndep(0); setWiseFinal(false); setRobbing(0);
    setRentWarn(null); setUnlocked(era.startWatch); setInsight(0); setMyLinks(loadPouch()); setVerdicts([]);
    setPouchOpen(false); setFlash(''); setFree(false); setResumed(false);
    itmAudio.start(soundOn);
    setPhase('play');
  }

  if (phase === 'intro') {
    const prog = loadChapters();
    return (
      <div className="pg"><div className="pg-col pg-mid">{muteBtn}
        <p className="pg-kick">{T('Investment Time Machine')}</p>
        <h1 className="pg-title">{T("You're broke. Rent is due. Don't get evicted — get free.")}</h1>
        <p className="pg-lead">{L('Everything in here is real — the companies, the prices, the headlines. You know what happens next. Nobody did back then.', '这里的一切都是真的——公司、价格、头条。接下来发生的事，你现在知道，当时没人知道。')}</p>
        {ERAS.map((era) => { const rec = prog[era.id]; const eraLocked = era.requires && !(prog[era.requires] && prog[era.requires].done); return (
          <button key={era.id} className={'pg-chapter' + (eraLocked ? ' locked' : '')} disabled={eraLocked} onClick={() => startEra(era.id)}>
            <span className="pg-ch-num">{L(`Chapter ${era.num}`, `第 ${era.num} 章`)}</span>
            <b>{T(era.title)}</b>
            <span className="pg-ch-sub">{T(era.sub)}</span>
            <span className={'pg-ch-state' + (rec && rec.done ? ' done' : '')}>{rec && rec.done ? L(`Cleared · best ${fmt(rec.net)}`, `已通关 · 最佳 ${fmt(rec.net)}`) : eraLocked ? L(`Finish chapter ${era.num - 1} to unlock`, `通关第 ${era.num - 1} 章解锁`) : L(`Start — ${era.startLabel}`, `开始——${T(era.startLabel)}`)}</span>
          </button>
        ); })}
        <ul className="pg-rules">
          <li>{L(<><b>Reach $15,000 and you're free.</b> That's the win. Cash and holdings both count.</>, <><b>攒到 $15,000，你就自由了。</b>这就是赢。现金和持仓都算数。</>)}</li>
          <li>{L(<><b>$4,000 to your name.</b> Rent is <b>$700 every period</b>. Miss it and you're out.</>, <><b>全部身家 $4,000。</b>每期房租 <b>$700</b>，交不上就出局。</>)}</li>
          <li>{L(<><b>3 moves a period.</b> Investigate for facts and insight, grind a side gig for cash, or hit night school.</>, <><b>每期 3 步。</b>调查换事实和洞察，打零工换现金，或者去上夜校。</>)}</li>
          <li>{L(<><b>Cousin Sal will not shut up.</b> He's family, he's confident, and he's usually wrong. Learn when to ignore him.</>, <><b>表哥 Sal 永远闭不上嘴。</b>他是家人、信心爆棚、而且基本都是错的。学会什么时候不听他的。</>)}</li>
          {myLinks.length > 0 && <li>{L(<><b>Your pouch carries {myLinks.length} tested link{myLinks.length > 1 ? 's' : ''}</b> — what you've proven about the world follows you into every era.</>, <><b>你的锦囊带着 {myLinks.length} 条经过检验的线</b>——你对世界证实过的判断，会跟你进每一个时代。</>)}</li>}
        </ul>
      </div></div>
    );
  }

  if (phase === 'end') {
    const won = free || net >= FREEDOM;
    const EPI = ERA.sal.epi;
    let epi;
    if (wiseFinal) epi = { mood: 'worried', line: indep > 0 ? EPI.wiseIndep : EPI.wise };
    else if (refused >= 2) epi = { mood: 'broke', line: EPI.refused };
    else if (helped >= 1) epi = { mood: 'broke', line: EPI.helped };
    else epi = { mood: 'broke', line: EPI.neutral };
    const nextEra = ERAS.find((e) => e.requires === eraId);
    return (
      <div className="pg"><div className="pg-col pg-mid">{muteBtn}
        <p className="pg-kick">{won ? T('You made it out') : T(ERA.endLabel)}</p>
        <h1 className="pg-title">{T(won ? "You're free." : 'You survived to the other side.')}</h1>
        <div className="pg-final"><span>{T('Net worth')}</span><b className={cls(net / START - 1)}>{fmt(net)}</b></div>
        {verdicts.length > 0 && (
          <div className="pg-verdicts">
            <p className="pg-verdicts-h">{T("The market's final word on your pouch")}</p>
            {verdicts.map((v, i) => (
              <div className={'pg-verdict ' + (v.ok ? 'ok' : 'no')} key={i}>
                <span className="pg-verdict-tag">{T(v.ok ? '✓ held up' : '✗ wrong')}</span>
                <p>{v.sal ? <b>{T('Sal said')}</b> : T('You said')} <b>{T(v.force.name)}</b> {T(v.dir === 'helps' ? 'helps' : 'hurts')} <b>{v.name}</b>{L('. ', '。')}{T(v.note)}
                  {!v.ok && v.sal && <em>{T("That line came straight from Sal's mouth. Worth remembering where you get your lines.")}</em>}</p>
              </div>
            ))}
          </div>
        )}

        <div className="pg-epilogue">
          <div className="pg-epi-guy"><SalGuy mood={epi.mood} /></div>
          <div className="pg-epi-bubble"><p className="pg-dave-name">{T('Cousin Sal')}</p><p className="pg-epi-line">"{T(epi.line)}"</p></div>
        </div>

        <p className="pg-lead">{won ? (ERA.blurbs.winZh ? L(ERA.blurbs.win(fmt(net)), ERA.blurbs.winZh(fmt(net))) : ERA.blurbs.win(fmt(net))) : (ERA.blurbs.surviveZh ? L(ERA.blurbs.survive, ERA.blurbs.surviveZh) : ERA.blurbs.survive)}</p>
        {indep > 0 && <p className="pg-lead pg-dim">{L(`You overruled Sal ${indep} time${indep === 1 ? '' : 's'} and trusted your own read. That's the whole point.`, `你顶住了 Sal ${indep} 次，相信了自己的判断。这正是整个游戏的意义。`)}</p>}
        {myLinks.filter((l) => l.status !== 'guess').length > 0 && (
          <p className="pg-lead pg-dim">{L(<>Your pouch keeps its {myLinks.filter((l) => l.status !== 'guess').length} tested link{myLinks.filter((l) => l.status !== 'guess').length > 1 ? 's' : ''}. The money resets — what you learned about the world doesn't.</>, <>你的锦囊留着 {myLinks.filter((l) => l.status !== 'guess').length} 条经过检验的线。钱会清零——你对世界学到的东西不会。</>)}</p>
        )}
        {nextEra && (
          <button className="pg-btn pg-primary" onClick={() => startEra(nextEra.id)}>{L(`Chapter ${nextEra.num} unlocked: ${nextEra.title} →`, `第 ${nextEra.num} 章已解锁：${T(nextEra.title)} →`)}</button>
        )}
        <button className={'pg-btn ' + (nextEra ? 'pg-secondary' : 'pg-primary')} onClick={restart}>{L('Back to chapters →', '返回选章 →')}</button>
      </div></div>
    );
  }

  const rentDanger = cash < RENT;
  const metForces = FORCES.filter((f) => f.at.some((p) => p <= t));
  const newForces = FORCES.filter((f) => Math.min(...f.at) === t);
  const activeForces = FORCES.filter((f) => f.at.includes(t));
  const provenCount = myLinks.filter((l) => l.status === 'proven').length;
  const mapAlerts = [];
  activeForces.forEach((f) => myLinks.forEach((l) => { if (l.force === f.id && l.status !== 'broken' && unlocked.includes(l.company)) mapAlerts.push({ f, l }); }));
  return (
    <div className={'pg' + (ERA.stormAt.includes(t) ? ' pg-storm' : '') + (salEvt && salEvt.mood === 'panic' ? ' pg-panicking' : '')}>
      <div className="pg-col">
        {muteBtn}
        <div className="pg-bar">
          <div className="pg-bar-l"><span className="pg-month">{T(DATES[t])}</span><span className="pg-sub">{L(`Period ${t + 1} of ${DATES.length}`, `第 ${t + 1} 期 / 共 ${DATES.length} 期`)}</span></div>
          <button className={'pg-pouch' + (mapAlerts.length ? ' hot' : '')} onClick={() => { setPouchOpen(true); itmAudio.pouch(); }} aria-label="Open your market map">
            <PouchIcon />
            {activeForces.length > 0 && <span className="pg-pouch-badge">{activeForces.length}</span>}
            <span className="pg-pouch-lbl">{L('pouch', '锦囊')}</span>
          </button>
          <div className={'pg-rent' + (rentDanger ? ' danger' : '')}><span>{T('Rent due')}</span><b>{fmt(RENT)}</b></div>
        </div>
        <div className="pg-stats">
          <div className={'pg-stat' + (robbing ? ' robbed' : '')}><span>{T('Cash')}</span><b className={rentDanger ? 'down' : ''}>{fmt(cash)}</b>{robbing ? <span className="pg-rob-amt">−{fmt(robbing)}</span> : null}</div>
          <div className="pg-stat"><span>{T('Invested')}</span><b>{fmt(holdings)}</b></div>
          <div className="pg-stat"><span>{T('Net worth')}</span><b>{fmt(net)}</b></div>
          <div className="pg-stat pg-freedom"><span>{T('Freedom')}</span><b>{Math.round(net / FREEDOM * 100)}%</b><i className="pg-free-goal">{L('goal $15,000', '目标 $15,000')}</i></div>
        </div>

        {resumed && (
          <p className="pg-resumed" onAnimationEnd={() => setResumed(false)}>
            Picked up where you left off.
          </p>
        )}
        <p className="pg-headline">{T(HEADLINE[t])}</p>
        {flash && <p className="pg-flash">{flash}</p>}
        {hint && !salEvt && (
          <button className="pg-hint" onClick={() => setHint(null)}>
            <span className="pg-hint-tag">SAL</span>
            <span className="pg-hint-text">{L(hint.en, hint.zh)}</span>
            <span className="pg-hint-x">×</span>
          </button>
        )}

        {newForces.length > 0 && (
          <button className="pg-newforce" onClick={() => setPouchOpen(true)}>
            {L(`Something new just landed in your pouch: ${newForces.map((f) => f.name).join(' · ')} — open it`, `有新东西落进了你的锦囊：${newForces.map((f) => T(f.name)).join(' · ')}——点开看看`)}
          </button>
        )}

        {verdicts.length > 0 && (
          <div className="pg-verdicts">
            <p className="pg-verdicts-h">{T('The market tested your pouch')}</p>
            {verdicts.map((v, i) => (
              <div className={'pg-verdict ' + (v.ok ? 'ok' : 'no')} key={i}>
                <span className="pg-verdict-tag">{T(v.ok ? '✓ held up' : '✗ wrong')}</span>
                <p>{v.sal ? <b>{T('Sal said')}</b> : T('You said')} <b>{T(v.force.name)}</b> {T(v.dir === 'helps' ? 'helps' : 'hurts')} <b>{v.name}</b>{L('. ', '。')}{T(v.note)}
                  {v.ok && !v.sal && <em className="pg-vwin">{T('Your stake pays: +2 insight')}</em>}
                  {!v.ok && v.sal && <em>{T("That line came straight from Sal's mouth. Worth remembering where you get your lines.")}</em>}
                  {!v.ok && !v.sal && <em>{T('Stake lost — conviction has a price.')}</em>}</p>
              </div>
            ))}
          </div>
        )}

        {mapAlerts.length > 0 && (
          <div className="pg-mapalert">
            <span className="pg-mapalert-h">{T('Your pouch is glowing')}</span>
            {mapAlerts.map(({ f, l }, i) => (
              <p key={i}><b>{T(f.name)}</b>{L(' is moving the market — your map says it ', ' 正在搅动市场——你的地图说它 ')}{(l.dir === 'helps' ? '▲ ' : '▼ ') + T(l.dir === 'helps' ? 'helps' : 'hurts')} <b>{COMPANIES.find((c) => c.id === l.company).name}</b>{L('.', '。')}</p>
            ))}
          </div>
        )}

        {rentWarn && (
          <div className="pg-rentwarn">
            <p>{L('That buy would leave you ', '买了这笔，你就只剩 ')}<b>{fmt(Math.max(0, cash - rentWarn.amt))}</b>{L(` — under this period's `, '——低于本期房租 ')}<b>{fmt(RENT)}</b>{L(" rent. Miss rent and you're evicted.", '。交不上房租就会被赶出去。')}</p>
            <div className="pg-rentwarn-btns">
              <button className="pg-rw-cancel" onClick={cancelRentBuy}>{L('Never mind', '算了')}</button>
              <button className="pg-rw-go" onClick={confirmRentBuy}>{L('Buy anyway', '还是要买')}</button>
            </div>
          </div>
        )}

        {salEvt && <SalOverlay sal={salEvt} cash={cash} onPick={salPick} />}
        {interject && <SalInterject name={COMPANIES.find((c) => c.id === interject.id).name} onHold={interjectHold} onSell={interjectSell} />}
        {robbing ? (
          <div className="pg-heist">
            <div className="pg-heist-guy"><SalGuy mood="greedy" thief /></div>
            <span className="pg-heist-cash c1"><BillIcon /></span>
            <span className="pg-heist-cash c2"><BillIcon /></span>
            <span className="pg-heist-cash c3"><BillIcon /></span>
          </div>
        ) : null}

        <div className="pg-time">
          <span className="pg-time-lbl">{L('Moves left', '剩余步数')}</span>
          <span className="pg-pips">{Array.from({ length: ACTIONS }).map((_, i) => <span key={i} className={'pg-pip' + (i < acts ? ' on' : '')} />)}</span>
          <span className="pg-insight"><Bulb />{L(`${insight} insight`, `${insight} 洞察`)}</span>
          <button className="pg-gig" disabled={acts <= 0} onClick={gig}>{L(`Side gig +${fmt(GIG)} (1 move)`, `打零工 +${fmt(GIG)}（花 1 步）`)}</button>
          <button className="pg-gig pg-study" disabled={acts <= 0 || !!campDoneAt[t]} onClick={campOpen}>{T(campDoneAt[t] ? 'Studied tonight' : 'Night school')}</button>
        </div>
        {t <= 1 && <p className="pg-insight-tip">{L('Investigating earns insight — you spend it in the pouch and to follow new companies.', '调查赚洞察——在锦囊里押注、关注新公司，花的都是它。')}</p>}

        {(LEADS[t] || []).length > 0 && (
          <div className="pg-leads">
            <span className="pg-leads-h">{T('Leads — worth investigating, not buy tips')}</span>
            {LEADS[t].map((l, i) => <p key={i} className="pg-lead-row"><b>{COMPANIES.find((c) => c.id === l.id).name}</b> — {T(l.why)}{!unlocked.includes(l.id) && <em className="pg-lead-locked">{L(" You don't follow them yet — find them below.", ' 你还没关注它——去下面解锁。')}</em>}</p>)}
          </div>
        )}

        {/* the monitor on your desk — the market lives on its screen */}
        <div className="pg-monitor">
          <div className="pg-monitor-screen">
            <MarketChart upto={t} watch={unlocked} companies={COMPANIES} dates={DATES} />
            {COMPANIES.filter((c) => unlocked.includes(c.id)).map((c) => {
          const p = price(c.id); const prev = t > 0 ? c.prices[t - 1] : null; const mv = prev ? p / prev - 1 : null;
          const pos = (shares[c.id] || 0) * p; const g = (shares[c.id] || 0) > 0 && (avg[c.id] || 0) > 0 ? p / avg[c.id] - 1 : 0;
          const dugP = dugAt[c.id]; const freshIntel = dugP === t;
          const info = dugP != null ? INFO[c.id][dugP] : null;
          const pd = pend[c.id] || 0; const canTrade = pos >= 1 || cash >= 1;
          return (
            <div className={'pg-card' + (leadIds.has(c.id) ? ' lead' : '')} key={c.id}>
              <div className="pg-card-top">
                <span className="pg-co">{t > 0 && <span className="pg-dot" style={{ background: COLORS[c.id] }} />}{c.name}{leadIds.has(c.id) && <span className="pg-tag">{T('lead')}</span>}</span>
                <span className="pg-pb"><b>${p}</b>{mv != null && <span className={'pg-mv ' + cls(mv)}>{sPct(mv)}</span>}</span>
              </div>
              {pos > 0.5 && <div className="pg-own">{L('you hold ', '你持有 ')}{fmt(pos)} <em className={cls(g)}>{sPct(g)}</em></div>}

              {info
                ? <div className={'pg-dossier' + (freshIntel ? '' : ' stale')}>
                    {!freshIntel && <p className="pg-stale-tag">{L(`Intel from ${DATES[dugP]} — the story has moved on since.`, `情报来自${T(DATES[dugP])}——之后故事已经变了。`)}</p>}
                    <p className="pg-biz">{T(c.biz)}</p>
                    <div className="pg-fact"><span className="pg-fk">{T('Money')}</span><span className="pg-fv">{T(info.m)}</span></div>
                    <div className="pg-fact"><span className="pg-fk">{T('Price')}</span><span className="pg-fv">{T(info.v)}</span></div>
                    <div className="pg-fact"><span className="pg-fk">{T('News')}</span><span className="pg-fv">{T(info.n)}</span></div>
                    {!freshIntel && <button className="pg-dig pg-redig" disabled={acts <= 0} onClick={() => dig(c.id)}>{acts <= 0 ? T('no moves left this period') : L(`Update intel — what's new in ${DATES[t]}? (1 move)`, `更新情报——${T(DATES[t])}有什么新变化？（花 1 步）`)}</button>}
                  </div>
                : <button className="pg-dig" disabled={acts <= 0} onClick={() => dig(c.id)}>{acts <= 0 ? T('no moves left this period') : L('Investigate (1 move · +1 insight)', '调查（花 1 步 · +1 洞察）')}</button>}

              {mapAlerts.filter((a) => a.l.company === c.id).map((a, i) => (
                <p className={'pg-tradecall' + (a.l.sal ? ' sal' : '')} key={i}>{L('Your pouch: ', '你的锦囊：')}<b>{T(a.f.name)}</b> {(a.l.dir === 'helps' ? '▲ ' : '▼ ') + T(a.l.dir === 'helps' ? 'helps' : 'hurts')} <b>{c.name}</b>{a.l.status === 'proven' ? L(' — proven.', '——已证实。') : a.l.sal ? L(" — Sal's line, not yours.", '——这是 Sal 的判断，不是你的。') : L(' — your call, unproven.', '——你的判断，未经证实。')}</p>
              ))}

              <div className="pg-tradebox">
                <input type="range" className="pg-slider" min={-Math.round(pos)} max={Math.round(cash)} step="50" value={pd} disabled={!canTrade}
                  onChange={(e) => setPend({ ...pend, [c.id]: +e.target.value })} />
                <div className="pg-slider-ends"><span>{pos >= 1 ? L(`◀ sell ${fmt(pos)}`, `◀ 卖出 ${fmt(pos)}`) : ''}</span><span>{cash >= 1 ? L(`buy ${fmt(cash)} ▶`, `买入 ${fmt(cash)} ▶`) : ''}</span></div>
                <button className={'pg-trade-btn' + (pd > 0 ? ' buy' : pd < 0 ? ' sell' : '')} disabled={!pd} onClick={() => applyTrade(c.id)}>
                  {pd > 0 ? L(`Buy ${fmt(pd)}`, `买入 ${fmt(pd)}`) : pd < 0 ? L(`Sell ${fmt(-pd)}`, `卖出 ${fmt(-pd)}`) : T('Drag the slider to buy or sell')}
                </button>
              </div>
            </div>
          );
            })}

            {COMPANIES.filter((c) => !unlocked.includes(c.id)).length > 0 && (
              <div className="pg-locked-wrap">
                <p className="pg-locked-h">{T("The rest of the market — you don't follow these yet")}</p>
                {COMPANIES.filter((c) => !unlocked.includes(c.id)).map((c) => {
                  const tight = cash >= c.cost && cash - c.cost < RENT;
                  const lp = c.prices[t]; const lprev = t > 0 ? c.prices[t - 1] : null; const lmv = lprev ? lp / lprev - 1 : null;
                  return (
                    <div className="pg-locked" key={c.id}>
                      <div className="pg-locked-top">
                        <span className="pg-co">{t > 0 && <span className="pg-dot" style={{ background: COLORS[c.id] }} />}{c.name} <span className="pg-lockchip">{T('not following')}</span></span>
                        {lp != null ? <span className="pg-pb"><b>${lp}</b>{lmv != null && <span className={'pg-mv ' + cls(lmv)}>{sPct(lmv)}</span>}</span> : <span className="pg-na">{T('not public yet')}</span>}
                      </div>
                      <p className="pg-teaser">{T(c.teasers[t])}</p>
                      <div className="pg-locked-btns">
                        <button className="pg-unlock" disabled={cash < c.cost || lp == null} onClick={() => unlockCash(c)}>{L(`Start following · ${fmt(c.cost)}`, `开始关注 · ${fmt(c.cost)}`)}</button>
                        <button className="pg-unlock xp" disabled={insight < c.xp || lp == null} onClick={() => unlockXp(c)}>{L(`Use ${c.xp} insight`, `用 ${c.xp} 洞察`)}</button>
                      </div>
                      {tight && <p className="pg-locked-warn">{T('Paying leaves you short for rent.')}</p>}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
          <div className="pg-monitor-foot"><span className="pg-monitor-led" /></div>
          <div className="pg-monitor-stand" />
          <div className="pg-monitor-base" />
        </div>

        {pouchOpen && (
          <div className="pg-pouch-wrap" onClick={() => setPouchOpen(false)}>
            <div className="pg-pouch-panel" onClick={(e) => e.stopPropagation()}>
              <div className="pg-map-head">
                <span className="pg-map-title">{L('Your pouch — the market map', '你的锦囊——市场地图')}</span>
                <span className="pg-map-score">{L(`${provenCount} proven · ${metForces.length}/${FORCES.length} forces · ${insight} insight`, `${provenCount} 条已证实 · ${metForces.length}/${FORCES.length} 个大势 · 洞察 ${insight}`)}</span>
              </div>
              <p className="pg-map-sub">{L(<>Your call on what moves whom — you can be wrong. Drawing a link stakes <b>1 insight</b>: proven pays back <b>2</b>, broken loses it. Proven links survive into your next run.</>, <>谁影响谁，由你判断——你可能判断错。连一条线押 <b>1 洞察</b>：被证实退 <b>2</b>，连错没收。已证实的线会跟进你的下一局。</>)}</p>
              {metForces.length === 0 && <p className="pg-pouch-empty">{T("Empty so far. Forces show up in the news — read the headlines, and they'll land in here.")}</p>}
              {metForces.length > 0 && myLinks.length > 0 && (
                <button className="pg-guide-toggle" onClick={() => setGuideOpen((o) => !o)}>{guideOpen ? L('Hide the how-to', '收起玩法说明') : L('How does the pouch work?', '锦囊怎么用？')}</button>
              )}
              {metForces.length > 0 && (myLinks.length === 0 || guideOpen) && (
                <div className="pg-pouch-guide">
                  <p className="pg-pouch-guide-h">{T('How the pouch works')}</p>
                  <p><b>1.</b> {L('Big forces (a lockdown, a rate hike…) land in here when they hit the news.', '大势（封锁、加息……）一上新闻，就会落进这里。')}</p>
                  <p><b>2.</b> {L(<>For each force, tap <b>▲ helps</b> or <b>▼ hurts</b> on a company — that's your read on the world. Each call stakes <b>1 insight</b>.</>, <>对每个大势，给公司点 <b>▲ 利好</b> 或 <b>▼ 利空</b>——这是你对世界的判断。每条押 <b>1 洞察</b>。</>)}</p>
                  <p><b>3.</b> {L("While that force is moving the market, your pouch buzzes and your call appears on the company's card — before you trade.", '这个大势搅动市场时，锦囊会发烫，你的判断会出现在公司卡片上——在你交易之前。')}</p>
                  <p><b>4.</b> {L(<>When the force plays out, the market grades you: right pays back <b>2 insight</b>, wrong loses the stake. Proven calls stay with you in every future run.</>, <>大势尘埃落定，市场给你打分：对了退 <b>2 洞察</b>，错了没收。已证实的判断跟你进每一局。</>)}</p>
                </div>
              )}
              {metForces.length > 0 && insight < 1 && <p className="pg-pouch-need">{T("You're out of insight — investigate companies to earn more before drawing new links.")}</p>}
              {metForces.map((f) => {
                const live = activeForces.includes(f);
                return (
                  <div className={'pg-force' + (live ? ' live' : '')} key={f.id}>
                    <div className="pg-force-top"><span className="pg-force-name">{T(f.name)}{live && <span className="pg-force-live">{T('live now')}</span>}</span></div>
                    <p className="pg-force-blurb">{T(f.blurb)}</p>
                    {COMPANIES.filter((c) => unlocked.includes(c.id)).map((c) => {
                      const l = linkOf(f.id, c.id);
                      return (
                        <div className="pg-link" key={c.id}>
                          <span className="pg-link-co"><span className="pg-dot" style={{ background: COLORS[c.id] }} />{c.name}
                            {l && l.sal && <em className="pg-link-salmark" title="Sal's line, not yours">SAL</em>}
                            {l && l.status === 'proven' && <em className="pg-link-badge ok">✓</em>}
                            {l && l.status === 'broken' && <em className="pg-link-badge no">✗</em>}
                          </span>
                          <span className="pg-link-btns">
                            <button className={'pg-link-btn' + (l && l.dir === 'helps' ? ' on-up' : '')} disabled={(l && l.status !== 'guess') || (!l && insight < 1)} onClick={() => setLink(f.id, c.id, 'helps')}>{'▲ ' + T('helps')}</button>
                            <button className={'pg-link-btn' + (l && l.dir === 'hurts' ? ' on-down' : '')} disabled={(l && l.status !== 'guess') || (!l && insight < 1)} onClick={() => setLink(f.id, c.id, 'hurts')}>{'▼ ' + T('hurts')}</button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {FORCES.filter((f) => !f.at.some((p) => p <= t)).map((f) => (
                <div className="pg-force pg-force-unmet" key={f.id}>
                  <span className="pg-force-name">???</span>
                  <p className="pg-force-blurb">{T("A force you haven't met yet. Keep reading the news — it's coming.")}</p>
                </div>
              ))}
              <button className="pg-pouch-x" onClick={() => setPouchOpen(false)}>{T('Close the pouch')}</button>
            </div>
          </div>
        )}

        {camp && (
          <div className="pg-pouch-wrap" onClick={() => { if (!camp.mode || camp.mode === 'choose' || camp.pick == null) setCamp(null); }}>
            <div className="pg-pouch-panel" onClick={(e) => e.stopPropagation()}>
              <div className="pg-map-head">
                <span className="pg-map-title">{T('Night school')}</span>
                <span className="pg-map-score">{T('1 move · once a period')}</span>
              </div>

              {camp.mode === 'choose' && (
                <React.Fragment>
                  <p className="ns-sal">{T('Sal, from the couch: "books, cuz? the market\'s RIGHT THERE."')}</p>
                  <button className="ns-course" onClick={campPickCase}>
                    <b>{T('A real moment from history')}</b>
                    <span>{T('Names hidden, real clues. Call UP or DOWN — right earns 2 insight.')}</span>
                  </button>
                  <button className="ns-course" onClick={campPickConcept}>
                    <b>{T('An investing basic')}</b>
                    <span>{T('Limit orders, bet sizing, diversification… Learn it, apply it once — right earns 1 insight.')}</span>
                  </button>
                  <button className="pg-pouch-x" onClick={() => setCamp(null)}>{T('Not tonight')}</button>
                </React.Fragment>
              )}

              {camp.mode === 'case' && (() => { const C = STUDY_CASES[camp.idx]; const answered = camp.pick != null; return (
                <React.Fragment>
                  <p className="ns-title">{T(C.title)}</p>
                  <p className="ns-sub">{T(C.sub)}</p>
                  {C.clues.map((cl, i) => (
                    <div className="ns-clue" key={i}>
                      <span className={'ns-chip ' + (cl.side === 1 ? 'up' : 'down')}>{L(cl.side === 1 ? 'says UP' : 'says DOWN', cl.side === 1 ? '看涨' : '看跌')}</span>
                      <div className="ns-clue-body">
                        <b>{T(cl.label)}</b>
                        <span>{T(cl.text)}</span>
                        <em>{T(cl.s === 3 ? 'a very strong clue' : cl.s === 2 ? 'a strong clue' : 'a quieter clue')}</em>
                      </div>
                    </div>
                  ))}
                  {!answered ? (
                    <React.Fragment>
                      <div className="ns-btns">
                        <button className="ns-btn up" disabled={acts <= 0} onClick={() => campAnswer(1)}>{T('It went UP')}</button>
                        <button className="ns-btn down" disabled={acts <= 0} onClick={() => campAnswer(-1)}>{T('It went DOWN')}</button>
                      </div>
                      <p className="ns-note">{T('Answering costs the move. Right earns 2 insight — study only beats digging if you can actually read.')}</p>
                      <button className="pg-pouch-x" onClick={() => setCamp(null)}>{T('Come back later — this case will wait')}</button>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <div className={'ns-verdict ' + (camp.right ? 'ok' : 'no')}>
                        <b>{T(camp.right ? 'You read it right.' : 'You read it wrong.')}</b> {L(`It went ${C.out.dir === 1 ? 'UP' : 'DOWN'} ${C.out.move}% ${C.out.when}.`, `它${C.out.dir === 1 ? '涨' : '跌'}了 ${Math.abs(C.out.move)}%（${T(C.out.when)}）。`)}
                      </div>
                      <p className="ns-reveal">{L('It was ', '它是 ')}<b>{C.name}</b>{L('. ', '。')}{T(C.story)}</p>
                      {C.fair && <p className="ns-lesson">{L('The careful read: ', '谨慎的读法：')}{T(C.fair.note)}</p>}
                      <p className={'ns-reward ' + (camp.right ? 'ok' : 'no')}>{T(camp.right ? '+2 insight earned.' : 'No insight tonight — but the lesson stays.')}</p>
                      <button className="pg-pouch-x" onClick={() => setCamp(null)}>{T('Back to the desk')}</button>
                    </React.Fragment>
                  )}
                </React.Fragment>
              ); })()}

              {camp.mode === 'concept' && (() => { const C = CONCEPTS[camp.idx]; const answered = camp.pick != null; return (
                <React.Fragment>
                  <p className="ns-title">{T(C.term)}</p>
                  <p className="ns-what">{T(C.what)}</p>
                  <p className="ns-example">{T(C.example)}</p>
                  <p className="ns-q">{T(C.q)}</p>
                  {C.opts.map((o, i) => {
                    const cls = answered ? (i === C.answer ? ' right' : i === camp.pick ? ' picked-wrong' : '') : '';
                    return <button key={i} className={'ns-opt' + cls} disabled={answered || acts <= 0} onClick={() => conceptAnswer(i)}>{T(o)}</button>;
                  })}
                  {!answered ? (
                    <React.Fragment>
                      <p className="ns-note">{T('Answering costs the move. Right earns 1 insight.')}</p>
                      <button className="pg-pouch-x" onClick={() => setCamp(null)}>{T('Come back later — this lesson will wait')}</button>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <p className="ns-lesson">{T(C.why)}</p>
                      <p className={'ns-reward ' + (camp.right ? 'ok' : 'no')}>{T(camp.right ? '+1 insight earned.' : 'No insight tonight — but now you know.')}</p>
                      <button className="pg-pouch-x" onClick={() => setCamp(null)}>{T('Back to the desk')}</button>
                    </React.Fragment>
                  )}
                </React.Fragment>
              ); })()}
            </div>
          </div>
        )}

        <button className={'pg-btn pg-primary pg-end' + (rentDanger ? ' danger' : '')} onClick={endMonth}>
          {rentDanger ? L(`Pay rent ${fmt(RENT)} — you're short`, `付房租 ${fmt(RENT)}——你的钱不够`) : L(`End period · pay ${fmt(RENT)} rent →`, `结束本期 · 付 ${fmt(RENT)} 房租 →`)}
        </button>
        <p className="pg-endsub">{t === DATES.length - 1 ? L('Last period — then we settle up.', '最后一期——然后就是总结算。') : L(`Then it's ${DATES[t + 1]}. The market moves. Rent comes again.`, `接下来是${T(DATES[t + 1])}。市场会动，房租也会再来。`)}</p>
      </div>
    </div>
  );
}
