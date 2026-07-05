import { useState, useRef, useEffect } from 'react';
import { money } from '../format.js';

// ============================================================================
// DAY ONE — the morning that earns the decision.
//
// Two forces must be felt at the moment of choice, or the choice is hollow:
//   WEIGHT  — two years of savings, Mom, "no undo"   (the brake)
//   PULL    — the dream, close enough to ache         (the temptation)
// If only weight is present, discipline is free: the player just picks the
// answer they think the game wants. So the DREAM (a first car, $5,400 away) is
// omnipresent — lock screen, home, and the top of the drag track itself.
//
// Crucial guardrail: temptation is EMOTIONAL, never computed. We show the GAP
// (a fact) but never a projected RETURN (forbidden — outcomes wait for the
// Autopsy). The "this could close the gap this week" hype comes from Marcus,
// a character, not the game's UI. The player feels the pull; a wiser player
// hears it as hype. That's playing the situation, not the lesson.
//
// The phone IS the world: lock screen, home grid, apps you open and back out
// of, a Messages thread that types at you.
//
// Behavioral telemetry is captured silently (Investor-DNA substrate); the
// player-facing end is the WORLD CONTINUING, not analysis. Fingerprint = ?dev=1.
// ============================================================================

const DEV =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dev');
// ?report=1 shows the curiosity drop-off report instead of the game.
const REPORT =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('report');

// Human labels + canonical order for the funnel, so a report reads like the
// actual experience, not internal phase names.
const PHASE_LABELS = {
  promise: 'Opening hook',
  open: 'Cold open (Ray)',
  phone: 'The phone morning',
  say: 'Decision · what you tell yourself',
  move: 'Decision · the allocation',
  away: 'Stepped away',
  filling: 'Order filling',
  settle: '“What have I done”',
  done: 'The aftermath',
  night: 'The night',
  result: 'The Result',
  autopsy: 'The Autopsy',
  dayTwo: 'Day Two hook',
};
const PHASE_ORDER = Object.keys(PHASE_LABELS);

// Drop-off session state at MODULE scope — exactly one session per page load,
// immune to StrictMode's double-invoke and dev HMR remounts. A real reload
// re-evaluates the module and starts fresh.
let CURR_SESSION = null; // { S, H }
let CURR_PHASE = 'promise';

const TOTAL = 10000;
const HOLD_MS = 1500;
const FRIEND = 'Marcus';
const DREAM = { label: 'First car', icon: '🚗', goal: 15400, gap: 5400 };

// THE INCITING FRAME — the first thing you see. Not an explanation; a hook. It
// makes ONE promise — that this morning matters — and refuses to say why. It
// never names investing, decisions, or "the point." Curiosity, not context: the
// player chases the answer instead of being handed it. (Future-self, looking back.)
const PROMISE = [
  'March 2024.',
  'Years from now, you’ll still remember this morning.',
  'Not because of the money.',
  'Because of what you were about to decide.',
];

// The cold open — the GAP, before the market exists. The dream is worthless as
// information ("First car, $5,400 to go"); it only bites once the player has
// FELT the life it's missing. So Day One opens on a real interaction: Ray offers
// a paid Sunday shift, and YOU have to send the "can't — no ride." The
// realization ("a car would've cleared a grand out here") is delivered by Ray,
// a person, NOT a narrator — the player discovers it by doing it. When NVDA
// appears minutes later, it reads as a bridge across a gap they just lived.

const LINES = [
  { id: 'all_in', text: "All in. I'm not watching this happen without me.", implied: 1.0 },
  { id: 'easy', text: 'This only goes up. Easy money.', implied: 1.0 },
  { id: 'afford', text: 'Put in what I can stand to lose. A quarter, maybe.', implied: 0.25 },
  { id: 'steady', text: 'No hero stuff. A small, steady slice.', implied: 0.4 },
  { id: 'wait', text: "I don't actually get what just happened. I'll wait.", implied: 0.0 },
];

// A real phone, not a menu of game buttons. Each LIVE app does exactly one
// emotional job before the decision — Notes: the plan · Photos: attachment ·
// Maps: the cost of no car · Savings: the stakes · News: uncertainty ·
// Messages: pressure · Trade: commitment. Apps with no job (Weather, Music,
// Camera) stay as dim wallpaper — they make the phone feel owned without
// pretending to matter. What lights up is what changes how you feel.
const APPS = [
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'news', label: 'News', icon: '📰' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'photos', label: 'Photos', icon: '📷' },
  { id: 'maps', label: 'Maps', icon: '🗺️' },
  { id: 'savings', label: 'Savings', icon: '🏦' },
  { id: 'trade', label: 'Trade', icon: '📈' },
  { id: 'weather', label: 'Weather', icon: '⛅', dead: true },
  { id: 'music', label: 'Music', icon: '🎵', dead: true },
  { id: 'camera', label: 'Camera', icon: '📸', dead: true },
];

// Toasts are MARCUS's channel (pressure) plus the two singular signals — news
// breaking and the market opening. Mom is NOT here: she's a phone call (weight).
const TOAST_ICON = { marcus: '💬', news: '📰', market: '📈' };

// Mom's call — authored, paced WEIGHT. A call demands you stop and be present;
// a toast you flick away. That difference is the whole point.
const MOM_CALL = [
  'Morning, honey. You’ve been quiet up there.',
  'I saw the balance on the fridge tablet. You didn’t move the car money, did you?',
  'You worked two years of Saturdays for that.',
  'Don’t throw it at a maybe. …Just think first. For me. Okay?',
];

// TEXTURE — read-only glimpses of a life. No gameplay; they exist only to make
// the phone feel like it's genuinely yours, and quietly plant the stakes.
const PHOTOS = [
  { grad: 'linear-gradient(135deg,#38507a,#161f30)', emoji: '🚗', cap: 'the ’08 Civic. still up on Marketplace — $15,400.' },
  { grad: 'linear-gradient(135deg,#6b3a52,#241019)', emoji: '👥', cap: 'the depot crew. back when Marcus still worked here.' },
  { grad: 'linear-gradient(135deg,#3a5b48,#131f18)', emoji: '🏭', cap: 'last shift of the week. 4:50am.' },
  { grad: 'linear-gradient(135deg,#5a5030,#211d10)', emoji: '🎂', cap: 'mom’s birthday. Marcus drove you both.' },
];

const NOTE_BODY = `sep   4,100
oct   5,250
jan   7,800
may  10,000  ← here

goal  15,400  (the Civic)
left   5,400

≈ 7 more months. if nothing breaks.
unless something changes.`;

// The research layer has ONE job, and it's the opposite of Marcus's. Marcus =
// emotional pressure (FOMO, "everyone's getting rich"). News = COMPLEXITY: it
// should complicate what Marcus makes simple. Every source has a distinct
// emotional function, and none of them tells you what to do:
//   report     — dry, trustworthy, numbers. The TRUTH SOURCE. Slows you down.
//   warning    — a respected voice. Makes you nervous.
//   social     — the crowd, euphoric AND cracking with doubt. Contagious chaos.
//   explainer  — you understand the boom, and still can't answer the question.
// The earnings report is the spine: a careful reader sees that the business is
// genuinely booming AND the price is genuinely extreme — both true. The question
// stops being "is NVDA good?" and becomes "is it worth THIS price?" — which
// nobody can answer. Whether the player opens it is captured (read_news) so a
// later Autopsy can say "you decided on hype alone" or "you read it, went anyway."
const NEWS = [
  {
    id: 'earnings',
    tone: 'report',
    src: 'NVDA Investor Relations',
    time: 'Filed yesterday',
    head: 'Q3 results: revenue up 94%, data-center demand “unprecedented”',
    stats: [
      ['Revenue', '$18.1B · +94% YoY'],
      ['Data-center sales', '+206% YoY'],
      ['Gross margin', '74%'],
      ['Next-quarter guidance', 'Raised'],
      ['Price-to-sales', '~40× · 5-yr avg ~18×'],
    ],
    body:
      'By the numbers the business is, plainly, booming. The same filing notes ' +
      'the stock now trades at more than double its own historical valuation. ' +
      'Management declined to say whether that level is sustainable.',
  },
  {
    id: 'valuation',
    tone: 'warning',
    src: 'Marketwatch · Opinion',
    time: '2h',
    head: '“The best company at the worst price”',
    body:
      'Nobody disputes the business, the columnist writes — the problem is the ' +
      'price already assumes a decade of flawless growth. “It could keep ' +
      'climbing. It could halve. At this point you’re not investing, you’re ' +
      'predicting.”',
  },
  {
    id: 'reddit',
    tone: 'social',
    src: 'r/wallstreetbets',
    time: '14m',
    head: '🚀 turned $4k into $14k. just quit my job. AMA',
    body:
      'Top reply: “this is the way 🙌 to the moon.” Right under it, 2,100 ' +
      'upvotes: “screenshot this — this is exactly what the top feels like.” ' +
      'Nobody in the thread thinks it’s sane. They just can’t agree which kind.',
  },
  {
    id: 'explain',
    tone: 'explainer',
    src: 'The Wire · Explainer',
    time: '—',
    head: 'Why is the whole world suddenly buying AI chips?',
    body:
      'Data centers need them faster than factories can build them — that part ' +
      'is real. Whether the demand lasts a decade or burns out in a year is the ' +
      'one question every expert answers differently.',
  },
];

// Intraday price path — HISTORY, not prediction. Generated once so the line is
// stable (the live header number is what moves). It climbs from the open with
// real-looking jitter and one mid-morning dip that recovers — the "it almost
// scared you out, then ripped higher" shape that makes the FOMO honest. A chart
// exists here for BELIEF, not analysis: it shows what already happened and
// refuses to tell you what happens next.
const OPEN_PRICE = 95.2;
function buildSeries(open, close, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const p = i / (n - 1);
    const trend = open + (close - open) * (p * p * (3 - 2 * p)); // smoothstep
    const noise = Math.sin(i * 1.7) * 0.9 + Math.sin(i * 0.6) * 1.6;
    const dip = i > n * 0.34 && i < n * 0.5 ? -3.4 : 0; // the scare
    pts.push(+(trend + noise + dip).toFixed(2));
  }
  pts[0] = open;
  pts[n - 1] = close;
  return pts;
}
const SERIES = buildSeries(OPEN_PRICE, 118.42, 42);
const DAY_HIGH = Math.max(...SERIES);
const DAY_LOW = Math.min(...SERIES);

// ---- tiny synth so the prototype has game-feel without audio assets ----------
function makeAudio() {
  let ctx = null;
  const ensure = () => {
    if (typeof window === 'undefined') return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch {
      ctx = null;
    }
    return ctx;
  };
  const blip = (freq, dur, type = 'sine', gain = 0.06) => {
    const c = ensure();
    if (!c) return;
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g).connect(c.destination);
      const t = c.currentTime;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur);
    } catch {
      /* ignore */
    }
  };
  return {
    tick: () => blip(420, 0.03, 'square', 0.02),
    tap: () => blip(520, 0.04, 'sine', 0.04),
    ding: () => {
      blip(660, 0.06, 'sine', 0.05);
      setTimeout(() => blip(880, 0.08, 'sine', 0.05), 70);
    },
    knock: () => {
      blip(120, 0.08, 'sine', 0.12);
      setTimeout(() => blip(110, 0.1, 'sine', 0.1), 150);
    },
    heartbeat: (intensity = 1) => {
      blip(60, 0.12, 'sine', 0.08 * intensity);
      setTimeout(() => blip(48, 0.16, 'sine', 0.1 * intensity), 120);
    },
    thunk: () => {
      blip(90, 0.25, 'sine', 0.14);
      blip(55, 0.4, 'triangle', 0.12);
    },
    ignite: () => blip(700, 0.5, 'sawtooth', 0.05),
  };
}

function buzz(ms) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch {
    /* ignore */
  }
}

export default function DecisionClimax() {
  // promise | open | phone | say | move | away | filling | done | night | result | autopsy | dayTwo
  const [phase, setPhase] = useState('promise');
  // within 'phone': lock | home | messages | savings | trade
  const [screen, setScreen] = useState('lock');
  const [armed, setArmed] = useState(false); // the market opens on the world clock

  const [said, setSaid] = useState(null);
  const [invested, setInvested] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hold, setHold] = useState(0);
  const [tick, setTick] = useState(118.42);
  const [checkShake, setCheckShake] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [returnBanner, setReturnBanner] = useState(null);

  // The morning as a WORLD ON ITS OWN CLOCK. Marcus (pressure) and Mom (brake)
  // text you over time; news breaks; the market opens — all on timers, whatever
  // screen you're on. Toasts intrude. You roam; life happens TO you. No corridor.
  const [lockNotifs, setLockNotifs] = useState([]);
  const [morning, setMorning] = useState(false); // the world clock is running
  const [threadMsgs, setThreadMsgs] = useState([]); // Marcus thread
  const [momMsgs, setMomMsgs] = useState([]); // Mom thread
  const [notifs, setNotifs] = useState([]); // live toast queue (intrusions)
  const [seenMarcus, setSeenMarcus] = useState(0);
  const [seenMom, setSeenMom] = useState(0);
  const [newsBroken, setNewsBroken] = useState(false);
  const [newsSeen, setNewsSeen] = useState(false);
  const [momCall, setMomCall] = useState(null); // null | 'incoming' | 'active'
  const [worldMsgs, setWorldMsgs] = useState([]);
  const [outcome, setOutcome] = useState(null); // the second clock: what the night did

  const audio = useRef(null);
  const trackRef = useRef(null);
  const holdRaf = useRef(0);
  const holdStart = useRef(0);
  const lastBeat = useRef(0);
  const holdProg = useRef(0);
  const committed = useRef(false);

  // ---- behavioral log + counters (refs: mutate without re-rendering) --------
  const log = useRef([]);
  const investedRef = useRef(0);
  const moveStart = useRef(0);
  const firstTouch = useRef(null);
  const lastAlloc = useRef(0);
  const lastDir = useRef(0);
  const lastAllocT = useRef(0);
  const reversals = useRef(0);
  const allocChanges = useRef(0);
  const maxAlloc = useRef(0);
  const aborts = useRef(0);
  const walkAways = useRef(0);
  const totalAway = useRef(0);
  const awayStart = useRef(0);
  const newsReadIds = useRef(new Set()); // which sources were opened (diligence)
  const notifSeq = useRef(0); // unique ids for toast intrusions
  const marketOpened = useRef(false); // the market opens once, after Mom's call
  const momAnswered = useRef(null); // did you pick up Mom's call? (null = never came)
  const tickRef = useRef(118.42); // live price, as a ref (buy price at commit)

  const rec = (type, data) => log.current.push({ t: Math.round(performance.now()), type, ...data });
  const beep = (name) => {
    const a = audio.current;
    if (a && a[name]) a[name]();
  };

  useEffect(() => {
    audio.current = makeAudio();
  }, []);

  useEffect(() => {
    tickRef.current = tick; // keep the buy-price ref fresh
  }, [tick]);

  // ---- CURIOSITY DROP-OFF TRACKER ------------------------------------------
  // The whole point of a playtest: where did they lose interest? We log the
  // phase timeline + the moment they looked away (tab blur) or left (pagehide),
  // persisted to localStorage so a quit is captured. Headline: did they reach —
  // and act on — Day Two? Viewable at ?report=1; nothing shows during play.
  useEffect(() => {
    if (REPORT) return;
    if (!CURR_SESSION) {
      let H = [];
      try {
        H = JSON.parse(localStorage.getItem('itm_sessions') || '[]');
      } catch {
        H = [];
      }
      const S = {
        id: Date.now(),
        when: new Date().toLocaleString(),
        t0: performance.now(),
        events: [],
        furthest: 'promise',
        reachedDayTwo: false,
        replays: 0,
        ended: null,
      };
      H.push(S);
      if (H.length > 15) H = H.slice(-15);
      CURR_SESSION = { S, H };
      try {
        localStorage.setItem('itm_sessions', JSON.stringify(H));
      } catch {
        /* ignore */
      }
    }
    const save = () => {
      try {
        localStorage.setItem('itm_sessions', JSON.stringify(CURR_SESSION.H));
      } catch {
        /* ignore */
      }
    };
    const mark = (kind) => {
      const S = CURR_SESSION.S;
      const t = Math.round(performance.now() - S.t0);
      S.events.push({ phase: CURR_PHASE, t, kind });
      S.ended = { phase: CURR_PHASE, kind, t };
      save();
    };
    const onHide = () => mark('left');
    const onVis = () => document.hidden && mark('blur');
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // log every phase entry with its timestamp (the funnel)
  useEffect(() => {
    CURR_PHASE = phase;
    if (!CURR_SESSION) return;
    const S = CURR_SESSION.S;
    S.events.push({ phase, t: Math.round(performance.now() - S.t0) });
    S.furthest = phase;
    if (phase === 'dayTwo') S.reachedDayTwo = true;
    try {
      localStorage.setItem('itm_sessions', JSON.stringify(CURR_SESSION.H));
    } catch {
      /* ignore */
    }
  }, [phase]);

  // Live price ticker — climbs while you hesitate (urgency you can watch).
  useEffect(() => {
    const onTrade = phase === 'phone' && screen === 'trade';
    const active = onTrade || phase === 'say' || phase === 'move';
    if (!active) return;
    const fast = onTrade;
    const id = setInterval(
      () => setTick((t) => +(t + (Math.random() * (fast ? 1.4 : 0.7) - 0.2)).toFixed(2)),
      fast ? 650 : 1100,
    );
    return () => clearInterval(id);
  }, [phase, screen]);

  useEffect(() => () => cancelAnimationFrame(holdRaf.current), []);

  // ---- LOCK SCREEN: notifications land over time ----------------------------
  useEffect(() => {
    if (!(phase === 'phone' && screen === 'lock')) return;
    setLockNotifs([]);
    const seq = [
      [500, { app: 'Messages', from: FRIEND, text: 'you up?? 👀' }],
      [1900, { app: 'Messages', from: FRIEND, text: 'NVDA man. it is NOT stopping 🚀' }],
      [3600, { app: 'Messages', from: FRIEND, text: 'my brother just paid CASH for a car off his gains 😤' }],
      [5600, { app: 'News', from: 'The Wire', text: 'Chipmaker NVDA hits record as AI frenzy grips markets' }],
    ];
    const ids = seq.map(([ms, n]) =>
      setTimeout(() => {
        setLockNotifs((p) => [...p, n]);
        beep('ding');
        buzz(18);
      }, ms),
    );
    return () => ids.forEach(clearTimeout);
  }, [phase, screen]);

  // ---- THE MORNING: GUIDED FREEDOM -----------------------------------------
  // Not a corridor, not a barrage. Three tools, each distinct:
  //   Marcus  = PRESSURE — toasts, sparse (a fuse, not spam).
  //   News    = UNCERTAINTY — breaks once; a badge you can go read.
  //   Mom     = WEIGHT — a phone CALL that stops everything (not a toast).
  // You explore freely in the window; the market opens only after Mom's call
  // lands — so the emotional beats are paced even though you roam.
  useEffect(() => {
    if (!morning) return;
    const ids = [];
    const at = (ms, fn) => ids.push(setTimeout(fn, ms));
    // Marcus's pressure arrives as a growing badge, NOT a top pop-up — you feel
    // his panic climbing in the corner of your eye, without the UI shoving it in
    // your face. You discover it by opening Messages. Calm on arrival.
    const marcus = (text) => setThreadMsgs((p) => [...p, { who: 'them', text }]);
    at(2000, () => marcus('you up?? NVDA is NOT stopping rn 🚀'));
    at(8000, () => marcus('my brother literally bought a CAR off this. cash 🚗'));
    at(12000, () => {
      setNewsBroken(true); // a quiet News badge — uncertainty you can go find
      setNewsSeen(false);
    });
    at(16000, () => setMomCall((c) => (c === null && !committed.current ? 'incoming' : c)));
    at(32000, () => openMarket()); // fallback if the call is dodged or ignored
    return () => ids.forEach(clearTimeout);
  }, [morning]);

  // Mom's phone rings while incoming — a call insists, a toast doesn't.
  useEffect(() => {
    if (momCall !== 'incoming') return;
    const ring = () => {
      beep('knock');
      buzz([120, 80, 120]);
    };
    ring();
    const id = setInterval(ring, 1900);
    return () => clearInterval(id);
  }, [momCall]);

  // A real inbox: opening a conversation marks it read; the open thread stays read.
  useEffect(() => {
    if (screen === 'marcus') setSeenMarcus(threadMsgs.length);
  }, [screen, threadMsgs.length]);
  useEffect(() => {
    if (screen === 'mom') setSeenMom(momMsgs.length);
  }, [screen, momMsgs.length]);
  useEffect(() => {
    if (screen === 'news') setNewsSeen(true);
  }, [screen]);

  // ---- DONE: the world continues — both choices can ache -------------------
  useEffect(() => {
    if (phase !== 'done') return;
    setWorldMsgs([]);
    const f = investedRef.current / TOTAL;
    let seq;
    if (investedRef.current === 0) {
      seq = [
        [1400, { who: FRIEND, text: "wait you didn't?? my brother's literally driving his rn 💀" }],
        [3400, { who: 'dream', text: `${DREAM.icon} Still $${DREAM.gap.toLocaleString()} away.` }],
        [5200, { who: 'Mom', text: 'Good. That car will still be there. Eat something.' }],
      ];
    } else if (f > 0.7) {
      seq = [
        [1100, { who: FRIEND, text: 'LETS GOOO 🚀 told you' }],
        [3200, { who: 'The Wire', text: 'NVDA extends rally into the afternoon' }],
        [5200, { who: 'dream', text: `${DREAM.icon} For a second you see it parked outside, keys in your hand. Then it’s gone — you won’t know for a while.` }],
        [7000, { who: 'Mom', text: '…what did you do.' }],
      ];
    } else {
      seq = [
        [1100, { who: FRIEND, text: "nice. you're in at least 👊" }],
        [3000, { who: 'The Wire', text: 'NVDA swings hard into the afternoon — volume spikes' }],
        [4800, { who: 'dream', text: `${DREAM.icon} A little closer to the driveway. The rest is the market’s call now.` }],
        [6600, { who: 'Mom', text: 'Okay. Just don’t check it every five minutes.' }],
      ];
    }
    const ids = seq.map(([ms, m]) =>
      setTimeout(() => {
        setWorldMsgs((p) => [...p, m]);
        beep('ding');
        buzz(14);
      }, ms),
    );
    return () => ids.forEach(clearTimeout);
  }, [phase]);

  const fraction = invested / TOTAL;
  const safe = TOTAL - invested;

  // ---- MOVE IT: pointer → dollars, recording behavior as it happens ---------
  function setFromPointer(clientY) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let raw = (rect.bottom - clientY) / rect.height; // up = more
    raw = Math.max(0, Math.min(1, raw));
    // Resistance near the top: the last stretch toward all-in feels heavy
    // (quadratic ease over the top decile) but still REACHES 100% at the very
    // top — true all-in must be possible, or there's no temptation to resist.
    let f = raw <= 0.9 ? raw : 0.9 + 0.1 * Math.pow((raw - 0.9) / 0.1, 2);
    f = Math.max(0, Math.min(1, f));
    const dollars = Math.round((f * TOTAL) / 100) * 100;
    const prev = investedRef.current;
    if (dollars === prev) return;

    allocChanges.current += 1;
    if (firstTouch.current == null) firstTouch.current = performance.now();
    const dir = Math.sign(dollars - prev);
    if (dir !== 0 && lastDir.current !== 0 && dir !== lastDir.current) reversals.current += 1;
    if (dir !== 0) lastDir.current = dir;
    lastAlloc.current = dollars;
    lastAllocT.current = performance.now();
    if (dollars > maxAlloc.current) maxAlloc.current = dollars;
    investedRef.current = dollars;
    rec('alloc', { dollars });

    beep('tick');
    if (dollars >= 9800 && prev < 9800) buzz(30);
    setInvested(dollars);
  }

  const onTrackDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    setFromPointer(e.clientY);
  };
  const onTrackMove = (e) => dragging && setFromPointer(e.clientY);
  const onTrackUp = (e) => {
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // ---- HOLD TO COMMIT (releasing early = an aborted commit = hesitation) ----
  function holdLoop() {
    const elapsed = performance.now() - holdStart.current;
    const p = Math.min(1, elapsed / HOLD_MS);
    holdProg.current = p;
    setHold(p);
    const beatGap = 520 - p * 300;
    if (performance.now() - lastBeat.current > beatGap) {
      lastBeat.current = performance.now();
      if (audio.current) audio.current.heartbeat(0.6 + p);
      buzz(10 + Math.round(p * 20));
    }
    if (p >= 1) return commit();
    holdRaf.current = requestAnimationFrame(holdLoop);
  }
  function onHoldDown() {
    holdStart.current = performance.now();
    lastBeat.current = 0;
    rec('hold_start', { at: investedRef.current });
    holdRaf.current = requestAnimationFrame(holdLoop);
  }
  function stopHold() {
    cancelAnimationFrame(holdRaf.current);
    const p = holdProg.current;
    if (!committed.current && p > 0.03 && p < 0.99) {
      aborts.current += 1;
      rec('hold_abort', { p: +p.toFixed(2) });
    }
    holdProg.current = 0;
    holdStart.current = 0;
    setHold(0);
  }

  function commit() {
    cancelAnimationFrame(holdRaf.current);
    committed.current = true;
    beep('thunk');
    if (investedRef.current / TOTAL > 0.95) beep('ignite');
    buzz([40, 30, 120]);
    const now = performance.now();
    rec('commit', { dollars: investedRef.current });
    setMetrics({
      finalAlloc: investedRef.current,
      maxAlloc: maxAlloc.current,
      allocChanges: allocChanges.current,
      reversals: reversals.current,
      aborts: aborts.current,
      walkAways: walkAways.current,
      awayMs: Math.round(totalAway.current),
      deliberateMs: Math.round(now - moveStart.current - totalAway.current),
      pauseBeforeCommitMs: Math.round(now - (lastAllocT.current || moveStart.current)),
      readReport: newsReadIds.current.has('earnings'),
      openedWarning: newsReadIds.current.has('valuation'), // the voice that challenged Marcus
      openedSocial: newsReadIds.current.has('reddit'), // the crowd that cheered him
      openedExplainer: newsReadIds.current.has('explain'),
      newsOpened: newsReadIds.current.size,
      buyPrice: tickRef.current,
      momAnswered: momAnswered.current,
    });
    // The order goes through a broker ritual (Submitting → Filled), then a beat
    // of silence (settle) before the world reacts — the money has moved, and for
    // a moment it's just you and what you did.
    setPhase(investedRef.current > 0 ? 'filling' : 'settle');
  }

  // ---- STEP AWAY: a real decision, not abandonment. The world moves on. -----
  function stepAway() {
    walkAways.current += 1;
    awayStart.current = performance.now();
    rec('leave', { at: investedRef.current });
    buzz(15);
    setPhase('away');
  }
  function comeBack() {
    const awayMs = performance.now() - awayStart.current;
    totalAway.current += awayMs;
    const sec = awayMs / 1000;
    const mag = Math.min(4, Math.max(0.3, sec * 0.12));
    const deltaPct = +(mag * (Math.random() < 0.72 ? 1 : -0.5)).toFixed(2);
    setTick((t) => +(t * (1 + deltaPct / 100)).toFixed(2));
    setReturnBanner({ awayMs: Math.round(awayMs), deltaPct });
    rec('return', { awayMs: Math.round(awayMs), deltaPct });
    setPhase('move');
    setTimeout(() => setReturnBanner(null), 2800);
  }

  function chooseLine(line) {
    setSaid(line);
    moveStart.current = performance.now();
    lastAllocT.current = moveStart.current;
    rec('say', { id: line.id });
    beep('tick');
    buzz(15);
    setPhase('move');
  }

  // ---- toast intrusions: the world reaching you wherever you are -----------
  function pushToast(app, from, text) {
    const id = ++notifSeq.current;
    setNotifs((p) => [...p.slice(-2), { id, app, from, text }]); // at most 3 at once
    beep('ding');
    buzz(16);
    setTimeout(() => setNotifs((p) => p.filter((n) => n.id !== id)), 4400);
  }

  // ---- the market opens: the ONE beat that turns you toward the decision ---
  function openMarket() {
    if (marketOpened.current) return;
    marketOpened.current = true;
    setArmed(true);
    // The ONE interrupt that matters — and it doubles as a signpost to Trade.
    pushToast('market', 'Markets', 'NVDA is open · 9:30 — your call now');
    const say = (text) => setThreadMsgs((p) => [...p, { who: 'them', text }]); // badge, not a pop
    setTimeout(() => say('it’s OPEN and it’s already ripping. GO 🙏'), 2800);
    setTimeout(() => say('you’re 5k short on the car right? this closes it THIS WEEK'), 7000);
  }

  // ---- Mom's call: authored weight, then the market turns ------------------
  function answerMom() {
    beep('tap');
    buzz(12);
    momAnswered.current = true;
    rec('mom_call', { answered: true });
    setMomCall('active');
  }
  function endMomCall() {
    setMomCall(null);
    setMomMsgs((p) => [...p, { who: 'them', text: 'okay. love you. …call me after, alright?' }]);
    setTimeout(openMarket, 2400); // her weight lands first, THEN the market opens
  }
  function declineMom() {
    beep('tap');
    buzz(10);
    momAnswered.current = false;
    rec('mom_call', { answered: false });
    setMomCall(null);
    setMomMsgs((p) => [...p, { who: 'them', text: 'you didn’t pick up. …you’re not doing something silly with that money, are you?' }]);
    setTimeout(openMarket, 2400);
  }

  // ---- phone navigation: you roam freely; nothing is forced ---------------
  function openApp(app) {
    beep('tap');
    buzz(8);
    if (app.dead) return; // Camera etc.: just a tap, no gameplay
    rec('open_app', { id: app.id });
    setScreen(app.id); // ids map 1:1 to screens (messages→inbox, trade, photos…)
  }
  function openConvo(who) {
    beep('tap');
    buzz(6);
    setScreen(who); // 'marcus' | 'mom'
  }
  function openFromToast(n) {
    setNotifs((p) => p.filter((x) => x.id !== n.id));
    beep('tap');
    setScreen(n.app === 'market' ? 'trade' : n.app); // marcus | mom | news | trade
  }
  function readArticle(id) {
    beep('tap');
    buzz(6);
    newsReadIds.current.add(id);
    rec('read_news', { id }); // silent diligence signal for Investor DNA
  }
  function unlock() {
    beep('tap');
    buzz(10);
    rec('unlock', {});
    setScreen('home');
    setMorning(true); // the world starts moving the moment you're in
  }
  function goHome() {
    beep('tap');
    buzz(8);
    setScreen('home');
  }
  function goBack() {
    beep('tap');
    buzz(6);
    if (screen === 'marcus' || screen === 'mom') return setScreen('messages');
    setScreen('home');
  }
  function startDecision() {
    rec('open_trade', {});
    beep('tick');
    buzz(15);
    setPhase('say');
  }

  function replay() {
    if (CURR_SESSION) CURR_SESSION.S.replays += 1; // wanting more = a strong signal
    log.current = [];
    investedRef.current = 0;
    moveStart.current = 0;
    firstTouch.current = null;
    lastAlloc.current = 0;
    lastDir.current = 0;
    lastAllocT.current = 0;
    reversals.current = 0;
    allocChanges.current = 0;
    maxAlloc.current = 0;
    aborts.current = 0;
    walkAways.current = 0;
    totalAway.current = 0;
    newsReadIds.current = new Set();
    committed.current = false;
    marketOpened.current = false;
    holdProg.current = 0;
    setMetrics(null);
    setSaid(null);
    setInvested(0);
    setHold(0);
    setTick(118.42);
    setArmed(false);
    setMorning(false);
    setLockNotifs([]);
    setThreadMsgs([]);
    setMomMsgs([]);
    setNotifs([]);
    setSeenMarcus(0);
    setSeenMom(0);
    setNewsBroken(false);
    setNewsSeen(false);
    setMomCall(null);
    setWorldMsgs([]);
    setOutcome(null);
    momAnswered.current = null;
    tickRef.current = 118.42;
    setScreen('lock');
    setPhase('promise');
  }

  function pokeBalance() {
    setCheckShake(true);
    buzz(25);
    setTimeout(() => setCheckShake(false), 450);
  }

  // ---- THE SECOND CLOCK: what the night actually did -----------------------
  // A real overnight gamble. The AI boom tilts up, but the downside is real —
  // and it is DELIBERATELY independent of decision quality. A careful call can
  // lose; a reckless one can win. That gap is the whole lesson the Autopsy names.
  function revealResult() {
    const invested = investedRef.current;
    const up = Math.random() < 0.58;
    const mag = up ? 6 + Math.random() * 22 : 5 + Math.random() * 19;
    const movePct = +(up ? mag : -mag).toFixed(1);
    const pnl = Math.round((invested * movePct) / 100);
    setOutcome({ movePct, pnl, up: movePct >= 0, endValue: invested + pnl });
    rec('result', { movePct });
    beep('tick');
    setPhase('result');
  }

  const inDecision = phase === 'say' || phase === 'move';
  const msgBadge = threadMsgs.length - seenMarcus + (momMsgs.length - seenMom);
  const newsBadge = newsBroken && !newsSeen ? 4 : 0;

  if (REPORT) return <SessionReport />;

  return (
    <div className={`climax phase-${phase}`} style={{ '--commit': fraction.toFixed(3) }}>
      {DEV && <div className="proto-badge">PROTOTYPE · day one · ?dev</div>}

      {phase === 'promise' && (
        <PromiseStage
          onBegin={() => {
            rec('promise_done', {});
            setPhase('open');
          }}
        />
      )}

      {phase === 'open' && (
        <ColdOpen
          onEnter={() => {
            rec('cold_open_done', {});
            setPhase('phone');
            setScreen('lock');
          }}
        />
      )}

      {phase === 'phone' && (
        <PhoneFrame screen={screen} notifs={notifs} onHome={goHome} onBack={goBack} onToast={openFromToast}>
          {screen === 'lock' && <LockScreen tick={tick} notifs={lockNotifs} onUnlock={unlock} />}
          {screen === 'home' && (
            <HomeScreen
              apps={APPS}
              armed={armed}
              msgBadge={msgBadge}
              newsBadge={newsBadge}
              hint={
                armed
                  ? 'The market’s open. Open Trade when you’re ready.'
                  : 'Look around — your phone, your morning. The market opens at 9:30.'
              }
              onOpen={openApp}
            />
          )}
          {screen === 'messages' && (
            <MessagesInbox
              marcus={threadMsgs}
              mom={momMsgs}
              seenMarcus={seenMarcus}
              seenMom={seenMom}
              onOpen={openConvo}
            />
          )}
          {screen === 'marcus' && <ThreadScreen msgs={threadMsgs} who={FRIEND} />}
          {screen === 'mom' && <ThreadScreen msgs={momMsgs} who="Mom" />}
          {screen === 'news' && <NewsScreen onRead={readArticle} />}
          {screen === 'savings' && <SavingsScreen />}
          {screen === 'trade' && <TradeScreen tick={tick} armed={armed} onBuy={startDecision} />}
          {screen === 'photos' && <PhotosScreen />}
          {screen === 'notes' && <NotesScreen />}
          {screen === 'maps' && <MapsScreen />}
          {screen === 'weather' && <WeatherScreen />}
          {screen === 'music' && <MusicScreen />}
        </PhoneFrame>
      )}

      {phase === 'phone' && momCall && (
        <MomCall mode={momCall} lines={MOM_CALL} onAnswer={answerMom} onDecline={declineMom} onEnd={endMomCall} />
      )}

      {inDecision && <Ticker tick={tick} hot={fraction} />}

      {phase === 'say' && <SayStage onChoose={chooseLine} />}

      {phase === 'move' && (
        <MoveStage
          said={said}
          invested={invested}
          safe={safe}
          fraction={fraction}
          dragging={dragging}
          hold={hold}
          trackRef={trackRef}
          returnBanner={returnBanner}
          onTrackDown={onTrackDown}
          onTrackMove={onTrackMove}
          onTrackUp={onTrackUp}
          onHoldDown={onHoldDown}
          onHoldUp={stopHold}
          onStepAway={stepAway}
        />
      )}

      {phase === 'away' && <AwayStage tick={tick} onReturn={comeBack} />}

      {phase === 'filling' && (
        <FillingStage
          invested={invested}
          shares={tick > 0 ? Math.floor(invested / tick) : 0}
          price={tick}
          onDone={() => setPhase('settle')}
        />
      )}

      {phase === 'settle' && (
        <SettleStage
          invested={invested}
          shares={tick > 0 ? Math.floor(invested / tick) : 0}
          price={tick}
          onRelease={() => setPhase('done')}
        />
      )}

      {phase === 'done' && (
        <DoneStage
          said={said}
          invested={invested}
          safe={safe}
          price={tick}
          metrics={metrics}
          worldMsgs={worldMsgs}
          checkShake={checkShake}
          onPoke={pokeBalance}
          onSleep={() => setPhase('night')}
        />
      )}

      {phase === 'night' && <NightStage invested={invested} onMorning={revealResult} />}

      {phase === 'result' && (
        <ResultStage invested={invested} metrics={metrics} outcome={outcome} onNext={() => setPhase('autopsy')} />
      )}

      {phase === 'autopsy' && (
        <AutopsyStage invested={invested} said={said} metrics={metrics} outcome={outcome} onNext={() => setPhase('dayTwo')} />
      )}

      {phase === 'dayTwo' && (
        <DayTwoStage invested={invested} outcome={outcome} onReplay={replay} />
      )}
    </div>
  );
}

/* ------------------------------ Stage: INCITING FRAME (the hook) ---------- */
// Cinematic, one line at a time. Makes this morning feel significant and says
// nothing about why — the player leaves wanting to know. Ends by handing them
// the buzzing phone, straight into the morning, with no explanation.
function PromiseStage({ onBegin }) {
  const [i, setI] = useState(0);
  const last = i >= PROMISE.length - 1;
  return (
    <div className="promise" onClick={() => !last && setI((v) => v + 1)}>
      <div className="promise-dots">
        {PROMISE.map((_, k) => (
          <span key={k} className={`pr-dot ${k <= i ? 'on' : ''}`} />
        ))}
      </div>
      <p className="promise-line" key={i}>
        {PROMISE[i]}
      </p>
      {!last ? (
        <p className="promise-tap">tap to continue</p>
      ) : (
        <button
          className="promise-begin"
          onClick={(e) => {
            e.stopPropagation();
            onBegin();
          }}
        >
          <span className="pb-buzz">📱</span> your phone buzzes on the nightstand
        </button>
      )}
    </div>
  );
}

/* ------------------------------ Stage: COLD OPEN --------------------------- */
// The gap, lived — not narrated. Ray offers the Sunday shift; the player must
// send the "can't, no ride" themselves. Ray delivers the reframe. Ends on the
// phone buzzing again — Marcus, the market intruding on the gloom you just felt.
function ColdOpen({ onEnter }) {
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [gate, setGate] = useState(null); // 'reply' | 'ready' | null
  const bodyRef = useRef(null);
  const timers = useRef([]);
  const after = (ms, fn) => timers.current.push(setTimeout(fn, ms));
  const push = (m) => setMsgs((p) => [...p, m]);

  useEffect(() => {
    // Ray's opening burst
    after(700, () => push({ who: 'ray', text: 'you up?' }));
    after(1700, () => setTyping(true));
    after(2600, () => {
      setTyping(false);
      push({ who: 'ray', text: 'sunday run just opened. 200 cash, one shift' });
    });
    after(3700, () => setTyping(true));
    after(4700, () => {
      setTyping(false);
      push({ who: 'ray', text: 'you want it? gotta know by 8' });
    });
    after(5300, () => setGate('reply'));
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing, gate]);

  function reply(kind) {
    setGate(null);
    let t;
    if (kind === 'try') {
      push({ who: 'me', text: 'yeah — gimme a sec to sort a ride' });
      after(1400, () => push({ who: 'aside', text: 'Marcus won’t be up for hours. Mom’s car left an hour ago.' }));
      after(3200, () => push({ who: 'me', text: '…actually can’t. no way to get out there' }));
      t = 4200;
    } else {
      push({ who: 'me', text: 'can’t. no way out there on a sunday' });
      t = 1300;
    }
    // Ray delivers the realization — a person, not a narrator.
    after(t, () => setTyping(true));
    after(t + 950, () => {
      setTyping(false);
      push({ who: 'ray', text: '3rd sunday in a row man 😕' });
    });
    after(t + 2300, () => push({ who: 'ray', text: 'you had a car you’d have cleared a grand out here by now' }));
    after(t + 3800, () => push({ who: 'ray', text: 'offer stands whenever. get some sleep' }));
    after(t + 5000, () => setGate('ready'));
  }

  return (
    <div className="coldopen">
      <div className="cold-head">
        <span className="cold-contact">Ray</span>
        <span className="cold-sub">depot · dispatch</span>
      </div>
      <div className="cold-thread" ref={bodyRef}>
        <p className="cold-timestamp">Sunday 7:14 AM · your phone’s been lit up since midnight</p>
        {msgs.map((m, i) =>
          m.who === 'aside' ? (
            <p key={i} className="cold-aside">
              {m.text}
            </p>
          ) : (
            <div key={i} className={`bubble ${m.who === 'me' ? 'me' : 'them'}`}>
              {m.text}
            </div>
          ),
        )}
        {typing && (
          <div className="bubble them typing">
            <span /> <span /> <span />
          </div>
        )}
      </div>

      {gate === 'reply' && (
        <div className="cold-replies">
          <button className="cold-reply" onClick={() => reply('try')}>
            “yeah — I’ll sort a ride”
          </button>
          <button className="cold-reply" onClick={() => reply('no')}>
            “can’t. no way out there”
          </button>
        </div>
      )}

      {gate === 'ready' && (
        <button className="cold-enter" onClick={onEnter}>
          <span className="cold-buzz">📱</span>
          your phone buzzes again — it’s Marcus
        </button>
      )}
    </div>
  );
}

/* ------------------------------ Phone frame -------------------------------- */
const SCREEN_TITLES = {
  messages: 'Messages',
  marcus: FRIEND,
  mom: 'Mom',
  news: 'The Wire',
  savings: 'Savings',
  trade: 'Trade',
  photos: 'Photos',
  notes: 'Notes',
  maps: 'Maps',
  weather: 'Weather',
  music: 'Music',
};

function PhoneFrame({ screen, notifs, onHome, onBack, onToast, children }) {
  const inApp = screen !== 'lock' && screen !== 'home';
  const backLabel = screen === 'marcus' || screen === 'mom' ? 'Messages' : 'Home';
  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="phone-status">
          <span>{screen === 'trade' ? '9:30' : '7:14'}</span>
          <span className="phone-bal">Savings · {money(TOTAL)}</span>
          <span className="phone-sig">●●● 87%</span>
        </div>

        {/* the world reaching you — toasts intrude on whatever you're doing */}
        {notifs.length > 0 && (
          <div className="toast-layer">
            {notifs.map((n) => (
              <button key={n.id} className={`toast toast-${n.app}`} onClick={() => onToast(n)}>
                <span className="toast-from">
                  {TOAST_ICON[n.app] || '🔔'} {n.from}
                </span>
                <span className="toast-text">{n.text}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`phone-screen screen-${screen}`}>
          {inApp && (
            <div className="app-bar">
              <button className="app-back" onClick={onBack}>
                ‹ {backLabel}
              </button>
              <span className="app-title">{SCREEN_TITLES[screen] || ''}</span>
            </div>
          )}
          {children}
        </div>
        {screen !== 'lock' && (
          <button className="phone-homebar" onClick={onHome} aria-label="home">
            <span />
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ LOCK -------------------------------------- */
function LockScreen({ tick, notifs, onUnlock }) {
  return (
    <div className="lock">
      <div className="lock-clock">
        <span className="lock-h">7:14</span>
        <span className="lock-d">Sunday, June 14</span>
      </div>
      <div className="lock-goal">
        <span className="lg-icon">{DREAM.icon}</span>
        <span className="lg-text">{DREAM.label} — ${DREAM.gap.toLocaleString()} to go</span>
      </div>
      <div className="lock-notifs">
        {notifs.map((n, i) => (
          <div key={i} className="notif">
            <span className="notif-app">{n.app === 'Messages' ? `💬 ${n.from}` : `📰 ${n.from}`}</span>
            <span className="notif-text">{n.text}</span>
          </div>
        ))}
        {notifs.length === 0 && <p className="lock-quiet">·</p>}
      </div>
      {notifs.length >= 1 && (
        <button className="lock-unlock" onClick={onUnlock}>
          <span className="lu-arrow">⌃</span> swipe up to open
        </button>
      )}
    </div>
  );
}

/* ------------------------------ HOME -------------------------------------- */
// The home base you roam. The dream widget keeps the stakes present; the grid is
// a real phone (mostly texture). Nothing glows, nothing nags — the world reaches
// you through toasts, not a rail.
function HomeScreen({ apps, armed, msgBadge, newsBadge, hint, onOpen }) {
  return (
    <div className="home">
      <div className="home-goal">
        <span className="hg-icon">{DREAM.icon}</span>
        <div className="hg-meta">
          <span className="hg-label">{DREAM.label}</span>
          <div className="hg-bar">
            <span style={{ width: `${(10000 / DREAM.goal) * 100}%` }} />
          </div>
          <span className="hg-sub">${DREAM.gap.toLocaleString()} to go</span>
        </div>
      </div>

      <div className="home-grid">
        {apps.map((app) => {
          const badge = app.id === 'messages' ? msgBadge : app.id === 'news' ? newsBadge : 0;
          const glow = app.id === 'trade' && armed; // Trade lights up only once the market's open
          return (
            <button
              key={app.id}
              className={`app ${app.dead ? 'dead' : 'live'} ${glow ? 'glow' : ''}`}
              onClick={() => onOpen(app)}
            >
              <span className="app-icon">{app.icon}</span>
              <span className="app-label">{app.label}</span>
              {badge > 0 && <span className="app-badge">{badge}</span>}
              {glow && <span className="app-open">OPEN</span>}
            </button>
          );
        })}
      </div>

      {/* guided freedom: always a visible next step, never a forced one */}
      {hint && <p className={`home-hint ${armed ? 'go' : ''}`}>{hint}</p>}
    </div>
  );
}

/* ------------------------------ MESSAGES: inbox + threads ----------------- */
function MessagesInbox({ marcus, mom, seenMarcus, seenMom, onOpen }) {
  const rows = [
    { who: 'marcus', name: FRIEND, msgs: marcus, seen: seenMarcus, avatar: '🧑🏻' },
    { who: 'mom', name: 'Mom', msgs: mom, seen: seenMom, avatar: '👩🏻' },
  ];
  return (
    <div className="inbox">
      {rows.map((r) => {
        const last = r.msgs[r.msgs.length - 1];
        const unread = r.msgs.length - r.seen;
        return (
          <button key={r.who} className={`inbox-row ${unread > 0 ? 'unread' : ''}`} onClick={() => onOpen(r.who)}>
            <span className="inbox-avatar">{r.avatar}</span>
            <div className="inbox-meta">
              <span className="inbox-name">{r.name}</span>
              <span className="inbox-preview">{last ? last.text : 'No messages yet'}</span>
            </div>
            {unread > 0 && <span className="inbox-badge">{unread}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ThreadScreen({ msgs, who }) {
  const bodyRef = useRef(null);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs]);
  return (
    <div className="thread">
      <div className="thread-body" ref={bodyRef}>
        {msgs.length === 0 && <p className="thread-empty">No messages from {who} yet.</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.who}`}>
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ TEXTURE apps (no gameplay) ---------------- */
function PhotosScreen() {
  return (
    <div className="photos">
      <div className="photos-grid">
        {PHOTOS.map((p, i) => (
          <div key={i} className="photo">
            <span className="photo-img" style={{ background: p.grad }}>
              {p.emoji}
            </span>
            <span className="photo-cap">{p.cap}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesScreen() {
  return (
    <div className="notes-app">
      <div className="note">
        <p className="note-title">car fund 🚗</p>
        <pre className="note-body">{NOTE_BODY}</pre>
      </div>
    </div>
  );
}

function MapsScreen() {
  return (
    <div className="mini-app">
      <div className="map-tile">🗺️</div>
      <p className="mini-label">Recent</p>
      <div className="mini-row">
        <span>📍 The depot</span>
        <span>41 min</span>
      </div>
      <div className="mini-row">
        <span>📍 Home</span>
        <span>—</span>
      </div>
      <p className="mini-note">No car on file — directions are transit only.</p>
    </div>
  );
}

function WeatherScreen() {
  return (
    <div className="mini-app center">
      <p className="wx-temp">61°</p>
      <p className="wx-cond">Clear · Sunday</p>
      <p className="mini-note">A good day for a drive. If you had one.</p>
    </div>
  );
}

function MusicScreen() {
  return (
    <div className="mini-app center">
      <div className="music-art">🎵</div>
      <p className="mini-label">Last played</p>
      <p className="music-track">“Runnin’ Down a Dream”</p>
      <p className="mini-note">paused · 1:12</p>
    </div>
  );
}

/* ------------------------------ Mom's call (WEIGHT) ----------------------- */
// A full-screen call that stops everything. Marcus you flick away; Mom you have
// to face. Answering plays her out at her pace; you decide when to hang up.
function MomCall({ mode, lines, onAnswer, onDecline, onEnd }) {
  const [shown, setShown] = useState(0);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (mode !== 'active') return;
    const ids = lines.map((_, i) => setTimeout(() => setShown(i + 1), 400 + i * 2700));
    const tick = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => {
      ids.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [mode, lines]);

  if (mode === 'incoming') {
    return (
      <div className="call-screen incoming">
        <div className="call-top">
          <span className="call-status">incoming call</span>
          <span className="call-avatar">👩🏻</span>
          <span className="call-name">Mom</span>
          <span className="call-sub">mobile</span>
        </div>
        <div className="call-actions">
          <button className="call-btn decline" onClick={onDecline}>
            <span className="cb-icon">✕</span>
            Decline
          </button>
          <button className="call-btn answer" onClick={onAnswer}>
            <span className="cb-icon">✆</span>
            Answer
          </button>
        </div>
      </div>
    );
  }

  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, '0');
  const doneTalking = shown >= lines.length;
  return (
    <div className="call-screen active">
      <div className="call-top">
        <span className="call-avatar small">👩🏻</span>
        <span className="call-name">Mom</span>
        <span className="call-timer">
          {mm}:{ss}
        </span>
      </div>
      <div className="call-lines">
        {lines.slice(0, shown).map((l, i) => (
          <p key={i} className="call-line">
            {l}
          </p>
        ))}
      </div>
      {doneTalking && <p className="call-hint">she’s waiting for an answer — hang up when you’re ready</p>}
      <button className={`call-btn end ${doneTalking ? 'ready' : ''}`} onClick={onEnd}>
        <span className="cb-icon">✕</span>
        {doneTalking ? 'End call' : 'Hang up'}
      </button>
    </div>
  );
}

/* ------------------------------ NEWS (research layer) --------------------- */
function NewsScreen({ onRead }) {
  const [open, setOpen] = useState(null);
  const toggle = (id) => {
    setOpen((cur) => {
      const next = cur === id ? null : id;
      if (next) onRead(id);
      return next;
    });
  };
  return (
    <div className="news">
      <p className="news-kicker">Four takes on the same morning. They don’t agree.</p>
      <div className="news-list">
        {NEWS.map((s) => (
          <button
            key={s.id}
            className={`story tone-${s.tone} ${open === s.id ? 'open' : ''}`}
            onClick={() => toggle(s.id)}
          >
            <div className="story-meta">
              <span className="story-src">{s.src}</span>
              <span className="story-time">{s.time}</span>
            </div>
            <div className="story-head">{s.head}</div>
            {open === s.id && (
              <div className="story-open">
                {s.stats && (
                  <div className="story-stats">
                    {s.stats.map(([k, v]) => (
                      <div key={k} className="stat-row">
                        <span className="stat-k">{k}</span>
                        <span className="stat-v">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="story-body">{s.body}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ SAVINGS ----------------------------------- */
function SavingsScreen() {
  const pct = Math.round((10000 / DREAM.goal) * 100);
  return (
    <div className="savings">
      <p className="sv-label">Savings</p>
      <p className="sv-amount">{money(10000)}</p>
      <div className="sv-goal">
        <div className="sv-goal-head">
          <span className="sv-goal-icon">{DREAM.icon}</span>
          <span className="sv-goal-name">{DREAM.label}</span>
          <span className="sv-goal-cost">{money(DREAM.goal)}</span>
        </div>
        <div className="sv-bar">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="sv-goal-foot">
          <span>{pct}% there</span>
          <strong>${DREAM.gap.toLocaleString()} to go</strong>
        </div>
      </div>
      <p className="sv-note">Every paycheck since 2024. The warehouse, the weekend shifts.</p>
    </div>
  );
}

/* ------------------------------ TRADE (brokerage) ------------------------- */
// The chart is HISTORY, not prediction: a believable intraday line that shows
// what already happened and says nothing about what comes next. It's here for
// belief, not analysis — no projected returns, no decision-support, just the
// look of a real broker so the money feels real when it moves.
function PriceChart({ series }) {
  const w = 320;
  const h = 116;
  const pad = 5;
  const min = DAY_LOW - 1.5;
  const max = DAY_HIGH + 1.5;
  const range = max - min || 1;
  const X = (i) => pad + (i / (series.length - 1)) * (w - pad * 2);
  const Y = (v) => pad + (1 - (v - min) / range) * (h - pad * 2);
  const line = series.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${X(series.length - 1).toFixed(1)} ${h} L${X(0).toFixed(1)} ${h} Z`;
  const lx = X(series.length - 1);
  const ly = Y(series[series.length - 1]);
  const oy = Y(series[0]);
  return (
    <svg className="tr-chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="nvGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(46,204,113,0.32)" />
          <stop offset="100%" stopColor="rgba(46,204,113,0)" />
        </linearGradient>
      </defs>
      <line className="tr-chart-open" x1="0" y1={oy} x2={w} y2={oy} vectorEffect="non-scaling-stroke" />
      <path d={area} fill="url(#nvGrad)" />
      <path className="tr-chart-line" d={line} fill="none" vectorEffect="non-scaling-stroke" />
      <circle className="tr-chart-dot" cx={lx} cy={ly} r="3" />
    </svg>
  );
}

function TradeScreen({ tick, armed, onBuy }) {
  if (!armed) {
    return (
      <div className="trade closed">
        <p className="tr-sym">NVDA</p>
        <p className="tr-price dim">{tick.toFixed(2)}</p>
        <div className="tr-closed">
          <span className="tr-lock">🔒</span>
          <p>Market opens at 9:30.</p>
          <p className="tr-closed-sub">Go have breakfast. It’ll still be here.</p>
        </div>
      </div>
    );
  }
  const chgAbs = tick - OPEN_PRICE;
  const chgPct = (chgAbs / OPEN_PRICE) * 100;
  return (
    <div className="trade open">
      <div className="tr-top">
        <div className="tr-id">
          <span className="tr-ticker">NVDA</span>
          <span className="tr-name">NVIDIA Corp · NASDAQ</span>
        </div>
        <div className="tr-quote">
          <span className="tr-last">{tick.toFixed(2)}</span>
          <span className="tr-delta">▲ {chgAbs.toFixed(2)} ({chgPct.toFixed(1)}%)</span>
        </div>
      </div>

      <PriceChart series={SERIES} />
      <div className="tr-axis">
        <span>9:30</span>
        <span>11:00</span>
        <span>12:30</span>
        <span>Now</span>
      </div>

      <div className="tr-facts">
        <div>
          <span>Open</span>
          <strong>{OPEN_PRICE.toFixed(2)}</strong>
        </div>
        <div>
          <span>Day range</span>
          <strong>
            {DAY_LOW.toFixed(2)}–{DAY_HIGH.toFixed(2)}
          </strong>
        </div>
        <div>
          <span>Volume</span>
          <strong>487M</strong>
        </div>
      </div>

      <div className="tr-hype">
        <span className="tr-hype-who">💬 {FRIEND}</span>
        it just hit another high lol. don’t be the guy who watched.
      </div>

      <div className="tr-order">
        <div className="tr-power">
          <span>Buying power</span>
          <strong>{money(TOTAL)}</strong>
        </div>
        <button className="tr-buy" onClick={onBuy}>
          Buy NVDA
        </button>
      </div>
      <p className="tr-note">{DREAM.icon} ${DREAM.gap.toLocaleString()} from your first car</p>
    </div>
  );
}

/* ------------------------------- Ticker ------------------------------------ */
function Ticker({ tick, hot }) {
  const chgPct = ((tick - OPEN_PRICE) / OPEN_PRICE) * 100;
  return (
    <div className="climax-ticker" style={{ '--hot': hot.toFixed(3) }}>
      <span className="tk-sym">NVDA</span>
      <span className="tk-arrow">▲</span>
      <span className="tk-price">{tick.toFixed(2)}</span>
      <span className="tk-chg">+{chgPct.toFixed(1)}% today</span>
    </div>
  );
}

/* ------------------------------ Stage: SAY --------------------------------- */
function SayStage({ onChoose }) {
  return (
    <div className="climax-say">
      <p className="climax-kicker">The buy screen is open. Your thumb’s hovering.</p>
      <div className="say-dream">
        <span>{DREAM.icon} ${DREAM.gap.toLocaleString()} from the car</span>
        <span>💰 two years saved on the line</span>
      </div>
      <p className="climax-sub">Before your thumb moves — what are you telling yourself?</p>
      <div className="say-lines">
        {LINES.map((l, i) => (
          <button
            key={l.id}
            className="say-line"
            style={{ animationDelay: `${i * 90}ms` }}
            onClick={() => onChoose(l)}
          >
            {l.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Stage: MOVE -------------------------------- */
function MoveStage({
  said,
  invested,
  safe,
  fraction,
  dragging,
  hold,
  trackRef,
  returnBanner,
  onTrackDown,
  onTrackMove,
  onTrackUp,
  onHoldDown,
  onHoldUp,
  onStepAway,
}) {
  const pctHeight = `${(fraction * 100).toFixed(2)}%`;
  const allIn = fraction > 0.95;
  const near = fraction > 0.6;
  return (
    <div className="climax-move">
      {returnBanner && (
        <p className="return-banner">
          While you were gone, NVDA moved{' '}
          <strong className={returnBanner.deltaPct >= 0 ? 'up' : 'down'}>
            {returnBanner.deltaPct >= 0 ? '+' : ''}
            {returnBanner.deltaPct}%
          </strong>
        </p>
      )}
      <p className="said-reminder">You said: “{said.text}”</p>

      <div className="move-body">
        <div
          ref={trackRef}
          className={`move-track ${dragging ? 'dragging' : ''} ${allIn ? 'allin' : ''} ${near ? 'near' : ''}`}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          onPointerCancel={onTrackUp}
        >
          <div className={`dream-top ${near ? 'near' : ''} ${allIn ? 'reach' : ''}`}>
            <span className="dream-icon">{DREAM.icon}</span>
            <span className="dream-cap">{allIn ? 'right there.' : near ? 'getting close…' : DREAM.label}</span>
          </div>
          <div className="track-fill" style={{ height: pctHeight }} />
          <div className="track-thumb" style={{ bottom: pctHeight }}>
            <span className="thumb-grip" />
          </div>
          {fraction === 0 && <div className="track-hint">drag up — toward the car</div>}
        </div>

        <div className="move-readout">
          <div className="ro in">
            <span className="ro-label">Toward the car</span>
            <span className="ro-val">{money(invested)}</span>
          </div>
          <div className="ro safe">
            <span className="ro-label">Two years, safe</span>
            <span className="ro-val">{money(safe)}</span>
          </div>
        </div>
      </div>

      {near && (
        <p className={`dream-whisper ${allIn ? 'reach' : ''}`}>
          {allIn
            ? 'you can almost feel the wheel in your hands.'
            : 'you let yourself picture it — keys in your hand by summer, not next year.'}
        </p>
      )}

      <button
        className={`hold-btn ${hold > 0 ? 'holding' : ''}`}
        onPointerDown={onHoldDown}
        onPointerUp={onHoldUp}
        onPointerLeave={onHoldUp}
        onPointerCancel={onHoldUp}
      >
        <span className="hold-fill" style={{ width: `${(hold * 100).toFixed(1)}%` }} />
        <span className="hold-label">
          {invested === 0 ? 'Hold to walk away' : `Hold to commit ${money(invested)}`}
        </span>
      </button>
      <div className="move-footer">
        <span className="hold-note">No undo. Once it's in, it's in.</span>
        <button className="step-away-btn" onClick={onStepAway}>
          Not ready? Step away →
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Stage: AWAY -------------------------------- */
function AwayStage({ tick, onReturn }) {
  return (
    <div className="climax-away">
      <p className="away-line">You put the phone down.</p>
      <p className="away-sub">The market doesn't wait for you. Neither does the day.</p>
      <p className="away-price">
        NVDA <span>{tick.toFixed(2)}</span> — still moving without you.
      </p>
      <button className="primary-btn" onClick={onReturn}>
        Pick it back up
      </button>
    </div>
  );
}

/* ------------------------------ Stage: DONE -------------------------------- */
function DoneStage({ said, invested, safe, price, metrics, worldMsgs, checkShake, onPoke, onSleep }) {
  const [shownSafe, setShownSafe] = useState(TOTAL);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - p, 3);
      setShownSafe(Math.round((TOTAL + (safe - TOTAL) * eased) / 100) * 100);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [safe]);

  const m = metrics || {};
  const shares = price > 0 ? Math.floor(invested / price) : 0;
  const impliedDollars = Math.round((said.implied * TOTAL) / 100) * 100;
  const gap = invested - impliedDollars;
  const gapBig = Math.abs(gap) >= 2500;
  const walkedAway = invested === 0;

  const hesitated =
    (m.reversals || 0) >= 2 ||
    (m.aborts || 0) >= 1 ||
    (m.walkAways || 0) >= 1 ||
    m.maxAlloc - m.finalAlloc >= 2000 ||
    (m.deliberateMs || 0) > 6000;

  return (
    <div className="climax-done">
      <p className="done-kicker">{walkedAway ? 'You put the phone down.' : 'It’s done.'}</p>
      <p className="done-status">
        {walkedAway ? 'Nothing in. The morning moves on.' : 'The money’s in. No taking it back now.'}
      </p>

      <button className={`balance-card ${checkShake ? 'shake' : ''}`} onClick={onPoke}>
        <span className="bc-label">Savings</span>
        <span className="bc-val">{money(shownSafe)}</span>
        {!walkedAway && <span className="bc-locked">{money(invested)} moved toward the car</span>}
      </button>
      {checkShake && !walkedAway && <p className="locked-flash">It’s already in. You can’t undo it.</p>}

      {!walkedAway && (
        <div className="position-card">
          <div className="pos-head">
            <span className="pos-sym">NVDA</span>
            <span className="pos-state">● Position open</span>
          </div>
          <div className="pos-row">
            <span>You bought</span>
            <strong>
              {shares} shares @ ${price.toFixed(2)}
            </strong>
          </div>
          <div className="pos-row">
            <span>Now worth</span>
            <strong className="pos-blur" aria-label="hidden">
              $▮▮▮▮▮
            </strong>
          </div>
          <p className="pos-foot">You’ll check this a hundred times today. It won’t tell you a thing.</p>
        </div>
      )}

      <div className="world-feed">
        {worldMsgs.map((w, i) => (
          <div
            key={i}
            className={`world-msg ${
              w.who === 'Mom' ? 'mom' : w.who === 'The Wire' ? 'news' : w.who === 'dream' ? 'dream' : 'friend'
            }`}
          >
            {w.who !== 'dream' && <span className="world-who">{w.who}</span>}
            <span className="world-text">{w.text}</span>
          </div>
        ))}
      </div>

      <button className="sleep-btn" onClick={onSleep}>
        {walkedAway ? 'Get on with your day →' : 'Try to get some sleep →'}
      </button>

      {DEV && (
        <>
          <div className="fingerprint">
            <div className="fp-head">
              <span>Behavioral fingerprint (dev)</span>
              <strong className={hesitated ? 'yes' : 'no'}>
                {hesitated ? 'Hesitated' : "Didn't blink"}
              </strong>
            </div>
            <Fp label="Deliberated for" val={`${((m.deliberateMs || 0) / 1000).toFixed(1)}s`} />
            <Fp label="Allocation changes" val={m.allocChanges || 0} flag={(m.allocChanges || 0) >= 6} />
            <Fp label="Pull-backs (reversals)" val={m.reversals || 0} flag={(m.reversals || 0) >= 2} />
            <Fp
              label="Highest, then settled"
              val={`${money(m.maxAlloc || 0)} → ${money(m.finalAlloc || 0)}`}
              flag={m.maxAlloc - m.finalAlloc >= 2000}
            />
            <Fp label="Commits started, let go" val={m.aborts || 0} flag={(m.aborts || 0) >= 1} />
            <Fp
              label="Times stepped away"
              val={`${m.walkAways || 0}${m.walkAways ? ` (${(m.awayMs / 1000).toFixed(0)}s)` : ''}`}
              flag={(m.walkAways || 0) >= 1}
            />
            <Fp label="Paused before committing" val={`${((m.pauseBeforeCommitMs || 0) / 1000).toFixed(1)}s`} />
            <Fp label="Sources opened" val={`${m.newsOpened || 0} of 4`} flag={(m.newsOpened || 0) === 0} />
            <Fp label="Read the earnings report" val={m.readReport ? 'yes' : 'no'} flag={!m.readReport} />
          </div>

          {!walkedAway && (
            <p className="research-verdict">
              {!m.readReport
                ? 'Decided on hype. Never opened the numbers.'
                : invested / TOTAL > 0.6
                  ? 'You read the warning. You went big anyway.'
                  : 'You read the report, then sized it carefully.'}
            </p>
          )}

          <div className="saydo">
            <div className="saydo-row">
              <span>You said</span>
              <em>“{said.text}”</em>
            </div>
            <div className="saydo-row">
              <span>That sounds like</span>
              <strong>{said.implied === 0 ? 'nothing' : `~${money(impliedDollars)}`}</strong>
            </div>
            <div className="saydo-row">
              <span>Your thumb committed</span>
              <strong className={gapBig ? 'flag' : ''}>{money(invested)}</strong>
            </div>
            {gapBig && (
              <p className="saydo-verdict">
                {gap > 0
                  ? 'Your words said careful. Your hands said more.'
                  : "You talked big, then your hands pulled back."}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Fp({ label, val, flag }) {
  return (
    <div className="fp-row">
      <span>{label}</span>
      <strong className={flag ? 'flag' : ''}>{val}</strong>
    </div>
  );
}

/* ------------------------------ Stage: FILLING ---------------------------- */
// The order ritual — the instant the money actually, irreversibly moves.
// Submitting… → Filled. Pure believability: no number here computes an outcome.
function FillingStage({ invested, shares, price, onDone }) {
  const [step, setStep] = useState('submitting'); // submitting | filled
  useEffect(() => {
    const t1 = setTimeout(() => setStep('filled'), 1150);
    const t2 = setTimeout(onDone, 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);
  return (
    <div className={`filling step-${step}`}>
      {step === 'submitting' ? (
        <>
          <div className="fill-spinner" />
          <p className="fill-status">Submitting order…</p>
          <p className="fill-detail">Buy {shares} NVDA · market order</p>
          <p className="fill-sub">Moving {money(invested)} from Savings</p>
        </>
      ) : (
        <>
          <div className="fill-check">✓</div>
          <p className="fill-status filled">Order filled</p>
          <p className="fill-detail">
            {shares} shares @ ${price.toFixed(2)}
          </p>
          <p className="fill-sub debit">−{money(invested)} from Savings</p>
        </>
      )}
    </div>
  );
}

/* ------------------------------ Stage: SETTLE (what have I done) ----------- */
// The held breath. The order is filled; the world hasn't reacted yet. It's just
// you and a number that refuses to resolve. The only thing you can DO is check
// it — and it gives you nothing. You discover the weight by reaching for an
// answer that isn't there, not by being told to feel it. You have to decide to
// stop looking before the day moves on.
function SettleStage({ invested, shares, price, onRelease }) {
  const walkedAway = invested === 0;
  const [checks, setChecks] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), walkedAway ? 2600 : 3400);
    return () => clearTimeout(t);
  }, [walkedAway]);

  const checkLines = [
    'It won’t tell you anything.',
    'You check it again anyway.',
    'You know it won’t change. You look anyway.',
  ];
  const abstainLines = [
    'Still there. All of it.',
    'You keep opening it to make sure it’s real.',
  ];
  const lines = walkedAway ? abstainLines : checkLines;
  const check = () => {
    setChecks((c) => c + 1);
    buzz(22);
  };
  const showRelease = ready || checks >= 3;

  return (
    <div className="settle">
      <p className="settle-time">7:41 AM</p>

      <button className="settle-check" onClick={check}>
        <span className="settle-sym">
          {walkedAway ? 'Savings' : 'NVDA · your position'}
        </span>
        {walkedAway ? (
          <span className="settle-val safe">{money(TOTAL)}</span>
        ) : (
          <span key={checks} className={`settle-val pos-blur ${checks ? 'shook' : ''}`}>
            $▮▮▮▮▮
          </span>
        )}
        <span className="settle-sub">
          {walkedAway ? 'untouched' : `${shares} shares @ $${price.toFixed(2)}`}
        </span>
      </button>

      {checks > 0 && (
        <p key={checks} className="settle-echo">
          {lines[Math.min(checks - 1, lines.length - 1)]}
        </p>
      )}
      {checks === 0 && <p className="settle-hint">tap to check it</p>}

      {showRelease && (
        <button className="settle-release" onClick={onRelease}>
          {walkedAway ? 'Set the phone down →' : 'Lock the phone. Try to look away →'}
        </button>
      )}
    </div>
  );
}

/* ------------------------------ Stage: NIGHT (the hook) ------------------- */
// Day One's open loop. The outcome is deliberately withheld (Two Clocks), so
// the reason to come back is a QUESTION, not an answer: the position sits open
// all night, and a premarket message arrives — then cuts off. You find out
// tomorrow. That gap is the hook.
function NightStage({ invested, onMorning }) {
  const walkedAway = invested === 0;
  const [beat, setBeat] = useState(0); // 0 quiet · 1 typing · 2 message · 3 morning
  useEffect(() => {
    const ids = [
      setTimeout(() => setBeat(1), 2200),
      setTimeout(() => setBeat(2), 4300),
      setTimeout(() => setBeat(3), 5900),
    ];
    return () => ids.forEach(clearTimeout);
  }, []);
  const cliff = walkedAway
    ? 'bro. premarket is INSANE. you really didn’t get in?? 😭'
    : 'bro. did you see premarket?? you’re not gonna—';
  return (
    <div className="night">
      <p className="night-time">2:47 AM</p>
      <p className="night-line">
        {walkedAway
          ? 'You didn’t put anything in. So why are you still awake?'
          : 'You should be asleep. It’s in there all night — doing something you can’t see.'}
      </p>

      <div className="night-pos">
        <span className="night-pos-label">{walkedAway ? 'Still in Savings' : 'NVDA · position open'}</span>
        <span className="night-pos-val pos-blur">$▮▮▮▮▮</span>
      </div>

      {beat >= 1 && (
        <div className="night-phone">
          {beat === 1 && (
            <div className="bubble them typing night-typing">
              <span /> <span /> <span />
            </div>
          )}
          {beat >= 2 && <div className="bubble them night-cliff">{cliff}</div>}
        </div>
      )}

      {beat >= 3 && (
        <div className="night-end">
          <p className="night-tbc">The longest night of your life. Then the alarm.</p>
          <button className="night-morning" onClick={onMorning}>
            ☀︎ Monday · 9:29 AM — see what the night did →
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   THE PAYOFF — Result (the second clock) → Autopsy (decouple + reveal) →
   Day Two. The whole bet: does the player leave understanding their decision
   better, not just richer or poorer?
   ========================================================================== */

// Decision quality — graded on PROCESS, deliberately blind to the outcome.
// Facing the numbers and the doubt, sizing sanely, not deciding on pure hype.
function gradeDecision(m) {
  m = m || {};
  const frac = (m.finalAlloc || 0) / TOTAL;
  let dq = 0;
  if (m.readReport) dq += 34; // faced the actual numbers
  if (m.openedWarning) dq += 22; // faced the voice that challenged the hype
  dq += Math.min(m.newsOpened || 0, 4) * 4; // breadth of looking
  if (frac <= 0.5) dq += 16;
  else if (frac <= 0.8) dq += 8; // sizing sanity
  if ((m.deliberateMs || 0) > 5000) dq += 10; // didn't blink
  if (m.momAnswered === true) dq += 6; // stopped to hear the brake
  dq = Math.max(0, Math.min(100, dq));
  return { dq, good: dq >= 50, frac };
}

// Process × outcome → the four honest verdicts. The result never sets the grade.
function verdictOf(good, up) {
  if (good && up)
    return { key: 'earned', title: 'Earned.', line: 'You did the work and it paid. Don’t let the win rewrite the story — this time skill and luck happened to agree.' };
  if (good && !up)
    return { key: 'unlucky', title: 'Sound. Unlucky.', line: 'You did it right and still lost money. That isn’t a mistake — it’s what investing feels like. Good decision, bad dice. Make it again.' };
  if (!good && up)
    return { key: 'lucky', title: 'Lucky. Not good.', line: 'It worked — and that’s the trap. You got paid for a bet you didn’t understand. Do this enough times and the market collects it all back.' };
  return { key: 'reckless', title: 'That’s the bill.', line: 'Hype in, money out. Nothing here was thought through, and the morning noticed.' };
}

/* ------------------------------ Stage: RESULT ----------------------------- */
function ResultStage({ invested, outcome, onNext }) {
  const walkedAway = invested === 0;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (walkedAway) return;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min(1, (now - start) / 1200);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(outcome.endValue * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [walkedAway, outcome]);

  if (walkedAway) {
    const wouldHave = Math.round((TOTAL * outcome.movePct) / 100);
    return (
      <div className="result">
        <p className="result-kicker">You put nothing in. The night still had an answer.</p>
        <p className={`result-move ${outcome.up ? 'up' : 'down'}`}>
          NVDA {outcome.up ? '▲' : '▼'} {Math.abs(outcome.movePct)}% overnight
        </p>
        <div className="result-cf">
          <span className="result-cf-label">The {money(TOTAL)} you kept</span>
          <span className="result-cf-val">{money(TOTAL)}</span>
          <span className="result-cf-note">
            {outcome.up
              ? `would’ve been ${money(TOTAL + wouldHave)}. You left ${money(wouldHave)} on the table.`
              : `would’ve been ${money(TOTAL + wouldHave)}. You dodged a ${money(-wouldHave)} hit — it’s all still yours.`}
          </span>
        </div>
        <button className="result-next" onClick={onNext}>
          So — right call, or scared call? →
        </button>
      </div>
    );
  }

  const pnl = outcome.pnl;
  const shifts = Math.max(1, Math.round(Math.abs(pnl) / 200));
  return (
    <div className="result">
      <p className="result-kicker">The number you couldn’t see all night —</p>
      <p className={`result-value ${outcome.up ? 'up' : 'down'}`}>{money(shown)}</p>
      <p className={`result-move ${outcome.up ? 'up' : 'down'}`}>
        NVDA {outcome.up ? '▲' : '▼'} {Math.abs(outcome.movePct)}% overnight · {pnl >= 0 ? '+' : '−'}
        {money(Math.abs(pnl))}
      </p>
      <p className="result-gut">
        {outcome.up
          ? pnl >= DREAM.gap
            ? `${DREAM.icon} That’s the whole gap. You could buy the car today.`
            : `${DREAM.icon} +${money(pnl)}. The driveway got ${Math.round((pnl / DREAM.gap) * 100)}% closer — overnight.`
          : `${DREAM.icon} ${money(Math.abs(pnl))} — about ${shifts} Saturday shifts — gone before breakfast.`}
      </p>
      <button className="result-next" onClick={onNext}>
        But was it the right call? →
      </button>
    </div>
  );
}

/* ------------------------------ Stage: AUTOPSY ---------------------------- */
// A mirror, not a scoreboard. It reveals what was invisible while you decided,
// separates what happened from what you did, and lets you convict yourself.
function AutopsyStage({ invested, said, metrics, outcome, onNext }) {
  const m = metrics || {};
  const line = said ? said.text : '';
  const walkedAway = invested === 0;
  const g = gradeDecision(m);

  const acts = [];
  acts.push({
    kicker: 'The two clocks',
    head: 'What happened isn’t what you did.',
    body: 'The market just handed you a number. It is not your grade. A careful call can lose; a careless one can win. Hold them apart — or you’ll learn exactly the wrong lesson from today.',
  });

  // The reveal — your relationship to disconfirming information (the echo chamber).
  let echoHead, echoBody;
  if (m.readReport && m.openedWarning) {
    echoHead = 'You faced the doubt.';
    echoBody =
      'You opened the earnings report AND the column that called it “the best company at the worst price.” You saw the case for and the case against, and moved anyway. That’s not recklessness — that’s a decision made with your eyes open.';
  } else if ((m.newsOpened || 0) === 0) {
    echoHead = 'You didn’t look at all.';
    echoBody =
      'Four sources sat one tap away. You opened none. The only voice you let into the room was the one screaming at you to buy.';
  } else if (m.openedSocial && !m.openedWarning) {
    echoHead = 'You went looking for a yes.';
    echoBody =
      'You opened r/wallstreetbets — the room already agreeing with Marcus. The one voice that pushed back — “you’re not investing, you’re predicting” — you left unread. You didn’t research the trade. You collected permission for it.';
  } else if (!m.readReport) {
    echoHead = 'You read around the numbers.';
    echoBody =
      'You sampled a few takes but never opened the earnings report itself — the one place the actual figures lived. You weighed opinions and skipped the evidence.';
  } else {
    echoHead = 'You checked the company, not the price.';
    echoBody =
      'You opened the report — good — but skipped the voice challenging the valuation. You confirmed NVDA was strong, never whether it was worth this.';
  }
  acts.push({ kicker: 'What you let in', head: echoHead, body: echoBody });

  // Words vs. hands (+ Mom).
  const impliedDollars = said ? Math.round((said.implied * TOTAL) / 100) * 100 : 0;
  const gap = (m.finalAlloc || 0) - impliedDollars;
  let wordsBody;
  if (Math.abs(gap) >= 2500) {
    wordsBody =
      gap > 0
        ? `The words were careful. The thumb wasn’t — ${money(m.finalAlloc)} against a plan of about ${money(impliedDollars)}. The story you told yourself and the move you made were two different people.`
        : `You talked big, then pulled back to ${money(m.finalAlloc)}. Somewhere between the sentence and the tap, you flinched. Worth knowing which one is the real you.`;
  } else {
    wordsBody = `For once the words and the hands agreed — ${money(m.finalAlloc)}, about what you said you’d do. You meant it.`;
  }
  if (m.momAnswered === false) wordsBody += ' And you sent your mom to voicemail before you did it.';
  else if (m.momAnswered === true) wordsBody += ' Your mom asked you to think first — you picked up, and decided anyway.';
  if (!walkedAway) acts.push({ kicker: 'Words vs. hands', head: `“${line}”`, body: wordsBody });

  // The verdict — on the decision, not the result.
  const v = walkedAway
    ? g.good
      ? { key: 'earned', title: 'Passed — on purpose.', line: 'You did the reading and decided it wasn’t worth it. Whatever the stock did overnight, that was a real call, not a flinch.' }
      : { key: 'reckless', title: 'Frozen, not chosen.', line: 'You didn’t weigh it and pass — you just didn’t move. Doing nothing felt safe, but it wasn’t a decision. Next time, that difference is everything.' }
    : verdictOf(g.good, outcome.up);
  acts.push({ kicker: 'The verdict · on the decision, not the result', head: v.title, body: v.line, tone: v.key });

  // Reflection + Investor DNA seed (self-discovery, never a score).
  let dna;
  if (walkedAway) dna = g.good ? 'You’d rather miss out than be wrong.' : 'When it counts, you freeze.';
  else if (!m.openedWarning && g.frac > 0.6) dna = 'When the crowd gets loud, your allocation gets big.';
  else if (!m.openedWarning) dna = 'You trust the voices that already agree with you.';
  else if (m.readReport && m.openedWarning) dna = 'You look before you leap.';
  else dna = 'You decide fast, and explain it to yourself later.';
  acts.push({
    kicker: 'Investor DNA · entry 001',
    head: dna,
    body: 'One morning isn’t a pattern — it’s the first dot. Live enough of these and this line becomes a portrait: who you actually are when money meets uncertainty.',
    dna: true,
  });

  const [step, setStep] = useState(0);
  const last = step >= acts.length - 1;
  const a = acts[step];
  return (
    <div className="autopsy-slice">
      <div className="au-dots">
        {acts.map((_, i) => (
          <span key={i} className={`au-dot ${i <= step ? 'on' : ''}`} />
        ))}
      </div>
      <div className={`au-act ${a.tone ? `tone-${a.tone}` : ''} ${a.dna ? 'dna' : ''}`} key={step}>
        <p className="au-kicker">{a.kicker}</p>
        <p className="au-head">{a.head}</p>
        <p className="au-body">{a.body}</p>
      </div>
      <button className="au-next" onClick={() => (last ? onNext() : setStep((s) => s + 1))}>
        {last ? 'Carry it into Day Two →' : 'Go on →'}
      </button>
    </div>
  );
}

/* ------------------------------ Stage: DAY TWO ---------------------------- */
// The loop closes and pulls forward: your world changed because of the call you
// made, and a new one is already waiting.
function DayTwoStage({ invested, outcome, onReplay }) {
  const walkedAway = invested === 0;
  const pnl = walkedAway ? 0 : outcome.pnl;
  const worth = TOTAL + pnl; // your money now
  const gap = Math.max(0, DREAM.goal - worth);
  const pct = Math.min(100, Math.round((worth / DREAM.goal) * 100));
  const hook = walkedAway
    ? outcome.up
      ? 'so… it ran without us. still think it’s too expensive?? 😅'
      : 'ok you might’ve been right lol. still watching?'
    : outcome.up
      ? 'WE’RE UP 🚀 do we let it ride or take the car money off the table??'
      : 'rough open man. do we hold or cut it before it gets worse??';
  return (
    <div className="daytwo">
      <p className="d2-kicker">Monday. The week’s only just started.</p>
      <p className="d2-line">
        {walkedAway
          ? 'Your savings are exactly where they were. But the way you look at them changed.'
          : outcome.up
            ? 'You carry a win you’re not sure you earned — and a chart you’ll now check every hour.'
            : 'You carry a loss, and a mom who didn’t say “I told you so.” She didn’t have to.'}
      </p>

      <div className="d2-goal">
        <div className="d2-goal-head">
          <span>{DREAM.icon} {DREAM.label}</span>
          <strong>{gap > 0 ? `${money(gap)} to go` : 'fully funded'}</strong>
        </div>
        <div className="d2-bar">
          <span style={{ width: `${pct}%` }} className={outcome && !outcome.up && !walkedAway ? 'down' : ''} />
        </div>
        <div className="d2-goal-foot">
          <span>Your money now</span>
          <strong className={pnl > 0 ? 'up' : pnl < 0 ? 'down' : ''}>{money(worth)}</strong>
        </div>
      </div>

      <div className="d2-hook">
        <span className="d2-hook-who">💬 {FRIEND}</span>
        <span className="d2-hook-text">{hook}</span>
      </div>

      <p className="d2-tbc">Day Two picks up right here — a new call, already shaped by this one.</p>
      <button className="d2-replay" onClick={onReplay}>
        ↻ Live Day One again
      </button>
    </div>
  );
}

/* ==========================================================================
   THE INSTRUMENT — "where did curiosity drop?" Reads the sessions logged to
   localStorage during play. Headline: how many reached (and acted on) Day Two,
   and where the rest fell away. This is how a playtest becomes data.
   ========================================================================== */
function SessionReport() {
  let sessions = [];
  try {
    sessions = JSON.parse(localStorage.getItem('itm_sessions') || '[]');
  } catch {
    sessions = [];
  }
  const recent = [...sessions].reverse();
  const label = (p) => PHASE_LABELS[p] || p;
  const fmt = (ms) => (ms >= 1000 ? (ms / 1000).toFixed(ms >= 10000 ? 0 : 1) + 's' : Math.round(ms) + 'ms');
  const reachedDayTwo = sessions.filter((s) => s.reachedDayTwo).length;

  const drops = {};
  sessions
    .filter((s) => !s.reachedDayTwo)
    .forEach((s) => {
      const p = s.ended?.phase || s.furthest;
      drops[p] = (drops[p] || 0) + 1;
    });
  const worst = Object.entries(drops).sort((a, b) => b[1] - a[1])[0];

  const dwellOf = (s) => {
    const entries = (s.events || []).filter((e) => !e.kind);
    // merge consecutive identical phases (StrictMode can double-log the first)
    const merged = [];
    for (const e of entries) {
      if (merged.length && merged[merged.length - 1].phase === e.phase) continue;
      merged.push(e);
    }
    const rows = [];
    for (let i = 0; i < merged.length; i++) {
      const end = merged[i + 1]?.t ?? s.ended?.t ?? merged[i].t;
      rows.push({ phase: merged[i].phase, dwell: Math.max(0, end - merged[i].t) });
    }
    return rows;
  };
  const durOf = (s) => s.ended?.t ?? s.events?.[s.events.length - 1]?.t ?? 0;

  const textReport = () => {
    const lines = [`ITM playtest — ${sessions.length} session(s) · ${reachedDayTwo} reached Day Two`];
    if (worst) lines.push(`Most common drop-off: ${label(worst[0])} (${worst[1]}×)`);
    lines.push('');
    recent.forEach((s, i) => {
      lines.push(`#${recent.length - i} · ${s.when}`);
      lines.push(`  reached ${label(s.furthest)}${s.reachedDayTwo ? ' ✓ Day Two' : ''} · ${fmt(durOf(s))}${s.replays ? ` · replayed ${s.replays}×` : ''}`);
      if (s.ended && !s.reachedDayTwo) lines.push(`  left at ${label(s.ended.phase)} (${s.ended.kind})`);
      dwellOf(s).forEach((r) => lines.push(`    ${label(r.phase)} — ${fmt(r.dwell)}`));
      lines.push('');
    });
    return lines.join('\n');
  };

  return (
    <div className="report">
      <h2 className="rp-title">Where did curiosity drop?</h2>
      <div className="rp-summary">
        <div className="rp-stat">
          <span>{sessions.length}</span>sessions
        </div>
        <div className="rp-stat big">
          <span>
            {reachedDayTwo}/{sessions.length || 0}
          </span>
          wanted Day Two
        </div>
        <div className="rp-stat">
          <span>{worst ? label(worst[0]) : '—'}</span>most common drop-off
        </div>
      </div>

      {recent.length === 0 && (
        <p className="rp-empty">
          No sessions yet. Play the game in this browser (<code>?proto=decision</code>), then come back to{' '}
          <code>?proto=decision&amp;report=1</code>.
        </p>
      )}

      <div className="rp-list">
        {recent.map((s, i) => {
          const done = s.reachedDayTwo;
          return (
            <div key={s.id} className={`rp-card ${done ? 'done' : 'dropped'}`}>
              <div className="rp-card-head">
                <span className="rp-when">
                  #{recent.length - i} · {s.when}
                </span>
                <span className={`rp-badge ${done ? 'ok' : 'no'}`}>{done ? '✓ reached Day Two' : 'dropped'}</span>
              </div>
              <div className="rp-reached">
                Got to <strong>{label(s.furthest)}</strong> · {fmt(durOf(s))}
                {s.replays ? ` · replayed ${s.replays}×` : ''}
                {s.ended && !done ? <span className="rp-left"> — left at {label(s.ended.phase)} ({s.ended.kind})</span> : null}
              </div>
              <div className="rp-track">
                {dwellOf(s).map((r, k) => (
                  <div key={k} className="rp-seg">
                    <span className="rp-seg-label">{label(r.phase)}</span>
                    <span className="rp-seg-time">{fmt(r.dwell)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rp-actions">
        <button onClick={() => navigator.clipboard?.writeText(textReport())}>Copy report</button>
        <button
          onClick={() => {
            localStorage.removeItem('itm_sessions');
            window.location.reload();
          }}
        >
          Clear
        </button>
        <a href="?proto=decision">← back to the game</a>
      </div>
    </div>
  );
}
