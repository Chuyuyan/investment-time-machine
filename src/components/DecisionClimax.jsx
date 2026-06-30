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

const TOTAL = 10000;
const HOLD_MS = 1500;
const FRIEND = 'Marcus';
const DREAM = { label: 'First car', icon: '🚗', goal: 15400, gap: 5400 };

const LINES = [
  { id: 'all_in', text: "All in. I'm not watching this happen without me.", implied: 1.0 },
  { id: 'easy', text: 'This only goes up. Easy money.', implied: 1.0 },
  { id: 'afford', text: 'Put in what I can stand to lose. A quarter, maybe.', implied: 0.25 },
  { id: 'steady', text: 'No hero stuff. A small, steady slice.', implied: 0.4 },
  { id: 'wait', text: "I don't actually get what just happened. I'll wait.", implied: 0.0 },
];

const APPS = [
  { id: 'messages', label: 'Messages', icon: '💬', live: true },
  { id: 'savings', label: 'Savings', icon: '🏦', live: true },
  { id: 'trade', label: 'Trade', icon: '📈', live: true },
  { id: 'news', label: 'News', icon: '📰', live: true },
  { id: 'photos', label: 'Photos', icon: '📷', live: false },
  { id: 'maps', label: 'Maps', icon: '🗺️', live: false },
  { id: 'weather', label: 'Weather', icon: '⛅', live: false },
  { id: 'camera', label: 'Camera', icon: '📸', live: false },
];

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
  // wake | phone | house | say | move | away | done
  const [phase, setPhase] = useState('wake');
  // within 'phone': lock | home | messages | savings | trade
  const [screen, setScreen] = useState('lock');
  const [armed, setArmed] = useState(false); // market "opens" after breakfast
  const [msgRead, setMsgRead] = useState(false); // badge clears once you've looked
  const [newsRead, setNewsRead] = useState(false);

  const [said, setSaid] = useState(null);
  const [invested, setInvested] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hold, setHold] = useState(0);
  const [tick, setTick] = useState(118.42);
  const [checkShake, setCheckShake] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [returnBanner, setReturnBanner] = useState(null);

  // morning content that arrives on timers (the world reaching you)
  const [lockNotifs, setLockNotifs] = useState([]);
  const [threadMsgs, setThreadMsgs] = useState([]);
  const [threadDone, setThreadDone] = useState(false);
  const [typing, setTyping] = useState(false);
  const [momLines, setMomLines] = useState([]);
  const [momDone, setMomDone] = useState(false);
  const [momReady, setMomReady] = useState(false);
  const [worldMsgs, setWorldMsgs] = useState([]);

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

  const rec = (type, data) => log.current.push({ t: Math.round(performance.now()), type, ...data });
  const beep = (name) => {
    const a = audio.current;
    if (a && a[name]) a[name]();
  };

  useEffect(() => {
    audio.current = makeAudio();
  }, []);

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

  // ---- TEXT THREAD: the fuse, with a typing indicator ----------------------
  useEffect(() => {
    if (!(phase === 'phone' && screen === 'messages')) return;
    setThreadMsgs([]);
    setThreadDone(false);
    const convo = [
      [400, { who: 'them', text: 'ok you HAVE to see this' }],
      [1700, { who: 'them', text: 'NVDA. i put in last tuesday. up 40 percent already' }],
      [3400, { who: 'me', text: 'no way' }],
      [4400, { who: 'them', text: 'dead serious. my brother bought a CAR off this. cash 🚗' }],
      [6200, { who: 'them', text: "you're still like 5k short on yours right?" }],
      [8000, { who: 'them', text: 'this could close that gap like… this week. i’m telling you' }],
      [9800, { who: 'them', text: "you'll hate yourself if you watch this from the sidelines" }],
    ];
    const ids = [];
    convo.forEach(([ms, m]) => {
      if (m.who === 'them') ids.push(setTimeout(() => setTyping(true), Math.max(0, ms - 700)));
      ids.push(
        setTimeout(() => {
          setTyping(false);
          setThreadMsgs((p) => [...p, m]);
          if (m.who === 'them') {
            beep('ding');
            buzz(14);
          }
        }, ms),
      );
    });
    ids.push(setTimeout(() => setThreadDone(true), 10800));
    return () => ids.forEach(clearTimeout);
  }, [phase, screen]);

  // ---- HOME: after a beat, Mom calls you down ------------------------------
  useEffect(() => {
    if (!(phase === 'phone' && screen === 'home') || momReady) return;
    const id = setTimeout(() => setMomReady(true), 5000);
    return () => clearTimeout(id);
  }, [phase, screen, momReady]);

  // ---- HOUSE: mom interrupts, names the stakes (the brake) ------------------
  useEffect(() => {
    if (phase !== 'house') return;
    setMomLines([]);
    setMomDone(false);
    const lines = [
      [400, 'You up, honey? Breakfast’s getting cold.'],
      [2600, 'You’re not putting your savings into that chip stock everyone’s on about, are you?'],
      [5400, 'You’ve been saving two years for that car. Don’t throw it at a maybe.'],
    ];
    const ids = lines.map(([ms, text]) =>
      setTimeout(() => {
        setMomLines((p) => [...p, text]);
        beep('knock');
        buzz([12, 40, 12]);
      }, ms),
    );
    ids.push(setTimeout(() => setMomDone(true), 7000));
    return () => ids.forEach(clearTimeout);
  }, [phase]);

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
      newsOpened: newsReadIds.current.size,
    });
    setPhase('done');
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

  // ---- phone navigation ----------------------------------------------------
  function openApp(app) {
    beep('tap');
    buzz(8);
    if (app.id === 'messages') {
      setMsgRead(true); // opening the thread clears the badge, like a real phone
      return setScreen('messages');
    }
    if (app.id === 'news') {
      setNewsRead(true);
      return setScreen('news');
    }
    if (app.id === 'savings') return setScreen('savings');
    if (app.id === 'trade') return setScreen('trade');
    // decorative apps: a tiny shake handled in CSS via :active
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
    setScreen('home');
  }
  function goHome() {
    beep('tap');
    buzz(8);
    setScreen('home');
  }
  function leaveThreadToHouse() {
    rec('read_thread', {});
    setPhase('house');
  }
  function leaveHouse() {
    setArmed(true);
    rec('breakfast_done', {});
    setPhase('phone');
    setScreen('home');
  }
  function openTrade() {
    beep('tap');
    buzz(10);
    setScreen('trade');
  }
  function startDecision() {
    rec('open_trade', {});
    beep('tick');
    buzz(15);
    setPhase('say');
  }

  function replay() {
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
    holdProg.current = 0;
    setMetrics(null);
    setSaid(null);
    setInvested(0);
    setHold(0);
    setTick(118.42);
    setArmed(false);
    setMsgRead(false);
    setNewsRead(false);
    setMomReady(false);
    setLockNotifs([]);
    setThreadMsgs([]);
    setThreadDone(false);
    setTyping(false);
    setMomLines([]);
    setMomDone(false);
    setWorldMsgs([]);
    setScreen('lock');
    setPhase('wake');
  }

  function pokeBalance() {
    setCheckShake(true);
    buzz(25);
    setTimeout(() => setCheckShake(false), 450);
  }

  const inDecision = phase === 'say' || phase === 'move';
  const unread = msgRead ? 0 : 3;
  const newsUnread = newsRead ? 0 : 1;

  return (
    <div className={`climax phase-${phase}`} style={{ '--commit': fraction.toFixed(3) }}>
      {DEV && <div className="proto-badge">PROTOTYPE · day one · ?dev</div>}

      {phase === 'wake' && <WakeStage onWake={() => { setPhase('phone'); setScreen('lock'); }} />}

      {phase === 'phone' && (
        <PhoneFrame balance={TOTAL} screen={screen} onHome={goHome}>
          {screen === 'lock' && <LockScreen tick={tick} notifs={lockNotifs} onUnlock={unlock} />}
          {screen === 'home' && (
            <HomeScreen
              apps={APPS}
              armed={armed}
              unread={unread}
              newsUnread={newsUnread}
              momReady={momReady}
              onOpen={openApp}
              onMom={() => setPhase('house')}
            />
          )}
          {screen === 'messages' && (
            <ThreadScreen msgs={threadMsgs} typing={typing} done={threadDone} onContinue={leaveThreadToHouse} />
          )}
          {screen === 'news' && <NewsScreen onRead={readArticle} />}
          {screen === 'savings' && <SavingsScreen />}
          {screen === 'trade' && <TradeScreen tick={tick} armed={armed} onBuy={startDecision} />}
        </PhoneFrame>
      )}

      {phase === 'house' && (
        <HouseStage lines={momLines} done={momDone} onContinue={leaveHouse} />
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
          onReplay={replay}
        />
      )}
    </div>
  );
}

/* ------------------------------ Stage: WAKE -------------------------------- */
function WakeStage({ onWake }) {
  return (
    <button className="wake" onClick={onWake}>
      <p className="wake-time">Sunday · 7:14 AM</p>
      <div className="wake-phone">
        <span className="wake-buzz">📱</span>
      </div>
      <p className="wake-hint">Your phone is buzzing on the nightstand.</p>
      <p className="wake-tap">tap to reach for it</p>
    </button>
  );
}

/* ------------------------------ Phone frame -------------------------------- */
const SCREEN_TITLES = { messages: FRIEND, news: 'The Wire', savings: 'Savings', trade: 'Trade' };

function PhoneFrame({ balance, screen, onHome, children }) {
  const inApp = screen !== 'lock' && screen !== 'home';
  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="phone-status">
          <span>7:14</span>
          <span className="phone-bal">Savings · {money(balance)}</span>
          <span className="phone-sig">●●● 87%</span>
        </div>
        <div className={`phone-screen screen-${screen}`}>
          {inApp && (
            <div className="app-bar">
              <button className="app-back" onClick={onHome}>
                ‹ Home
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
      {notifs.length >= 3 && (
        <button className="lock-unlock" onClick={onUnlock}>
          <span className="lu-arrow">⌃</span> swipe up to open
        </button>
      )}
    </div>
  );
}

/* ------------------------------ HOME -------------------------------------- */
function HomeScreen({ apps, armed, unread, newsUnread, momReady, onOpen, onMom }) {
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

      {momReady && !armed && (
        <button className="home-mom" onClick={onMom}>
          🔔 Mom’s calling you down for breakfast — tap
        </button>
      )}

      <div className="home-grid">
        {apps.map((app) => {
          const glow = app.id === 'trade' && armed;
          const badge =
            app.id === 'messages' ? unread : app.id === 'news' ? newsUnread : 0;
          return (
            <button
              key={app.id}
              className={`app ${app.live ? 'live' : 'dead'} ${glow ? 'glow' : ''}`}
              onClick={() => onOpen(app)}
            >
              <span className="app-icon">{app.icon}</span>
              <span className="app-label">{app.label}</span>
              {badge > 0 && <span className="app-badge">{badge}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ MESSAGES ---------------------------------- */
function ThreadScreen({ msgs, typing, done, onContinue }) {
  const bodyRef = useRef(null);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing]);
  return (
    <div className="thread">
      <div className="thread-body" ref={bodyRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.who}`}>
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="bubble them typing">
            <span /> <span /> <span />
          </div>
        )}
      </div>
      {done && (
        <button className="thread-cont" onClick={onContinue}>
          “Breakfast!” — Mom, from downstairs ↓
        </button>
      )}
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

/* ------------------------------ TRADE ------------------------------------- */
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
  return (
    <div className="trade open">
      <p className="tr-sym">NVDA</p>
      <p className="tr-price">{tick.toFixed(2)}</p>
      <p className="tr-chg">▲ +24.4% today · still climbing</p>
      <div className="tr-hype">{FRIEND}: it just hit another high lol. don’t be the guy who watched.</div>
      <button className="tr-buy" onClick={onBuy}>
        Buy NVDA →
      </button>
      <p className="tr-note">{DREAM.icon} ${DREAM.gap.toLocaleString()} from your first car</p>
    </div>
  );
}

/* ------------------------------ Stage: HOUSE ------------------------------ */
function HouseStage({ lines, done, onContinue }) {
  return (
    <div className="house">
      <p className="house-room">🍳 Downstairs · the kitchen</p>
      <div className="house-lines">
        {lines.map((t, i) => (
          <p key={i} className="mom-line">
            <span className="mom-who">Mom</span>
            {t}
          </p>
        ))}
      </div>
      {done && (
        <button className="house-cont" onClick={onContinue}>
          You glance back at your phone… (market’s open now)
        </button>
      )}
    </div>
  );
}

/* ------------------------------- Ticker ------------------------------------ */
function Ticker({ tick, hot }) {
  return (
    <div className="climax-ticker" style={{ '--hot': hot.toFixed(3) }}>
      <span className="tk-sym">NVDA</span>
      <span className="tk-arrow">▲</span>
      <span className="tk-price">{tick.toFixed(2)}</span>
      <span className="tk-chg">+24.4% today</span>
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
function DoneStage({ said, invested, safe, price, metrics, worldMsgs, checkShake, onPoke, onReplay }) {
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

      <button className="replay-btn" onClick={onReplay}>
        Live the morning again
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
