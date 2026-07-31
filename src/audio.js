// itmAudio — all sound is synthesized live via Web Audio (no assets, no copyright).
// Sal's voice is procedural gibberish ("Salese"): short pitch-jumping square-wave
// syllables through a bandpass, Animal-Crossing/Minion style, flavoured per mood.
// Music is a generative pad loop whose chords/tempo shift with the market mood.

let ctx = null, master = null, musicGain = null;
let muted = false, currentMood = null;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.075;
    musicGain.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

// one enveloped oscillator note
function tone(freq, at, dur, { type = 'sine', gain = 0.2, to = null, dest = null } = {}) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(30, to), at + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0008, at + dur);
  o.connect(g); g.connect(dest || master);
  o.start(at); o.stop(at + dur + 0.03);
}

// short filtered-noise burst (swishes, scribbles, cash rustle)
function noise(at, dur, { gain = 0.15, freq = 1800, q = 0.8, type = 'bandpass' } = {}) {
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(master);
  src.start(at);
}

// ---- Sal's gibberish voice v2: formant synthesis, not beeps ----
// Each syllable = a sawtooth "glottis" with pitch glide + vibrato, pushed
// through 2-3 bandpass FORMANT filters shaped like real vowels (a/e/i/o/u),
// with occasional consonant noise onsets and Minion-style syllable repeats.
const VOWELS = [[700, 1220], [530, 1840], [320, 2250], [500, 900], [380, 940]];
const VOICES = {
  hype:    { pitch: 235, syl: 9,  dur: 0.11, gap: 0.045, arc: 0.22,  tract: 1.25, jitter: 0.05 },
  worried: { pitch: 175, syl: 8,  dur: 0.13, gap: 0.06,  arc: -0.18, tract: 1.1,  jitter: 0.03 },
  greedy:  { pitch: 200, syl: 9,  dur: 0.12, gap: 0.05,  arc: 0.08,  tract: 1.15, jitter: 0.04 },
  manic:   { pitch: 270, syl: 12, dur: 0.085, gap: 0.03, arc: 0.28,  tract: 1.3,  jitter: 0.07 },
  panic:   { pitch: 300, syl: 14, dur: 0.075, gap: 0.025, arc: 0.3,  tract: 1.35, jitter: 0.09 },
  broke:   { pitch: 135, syl: 6,  dur: 0.17, gap: 0.09,  arc: -0.25, tract: 1.0,  jitter: 0.025 },
};

function syllable(t, dur, pitch, vowel, P, out) {
  const src = ctx.createOscillator();
  src.type = 'sawtooth';
  const upTurn = P.arc > 0 && Math.random() < 0.3;
  src.frequency.setValueAtTime(pitch * (1.06 + Math.random() * 0.08), t);
  src.frequency.exponentialRampToValueAtTime(pitch * (upTurn ? 1.18 : 0.88 + Math.random() * 0.08), t + dur);
  const vib = ctx.createOscillator();
  vib.frequency.value = 5.5 + Math.random() * 3;
  const vibG = ctx.createGain();
  vibG.gain.value = pitch * P.jitter;
  vib.connect(vibG); vibG.connect(src.frequency);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(1, t + 0.022);
  env.gain.setValueAtTime(1, Math.max(t + 0.024, t + dur - 0.055));
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(env);
  const bands = [[vowel[0], 7, 1], [vowel[1], 9, 0.4], [2700, 11, 0.1]];
  bands.forEach(([fc, q, g]) => {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = fc * P.tract; bp.Q.value = q;
    const gg = ctx.createGain(); gg.gain.value = g;
    env.connect(bp); bp.connect(gg); gg.connect(out);
  });
  src.start(t); src.stop(t + dur + 0.03);
  vib.start(t); vib.stop(t + dur + 0.03);
}

// If the player recorded their own syllables (public/voice/1.mp3, 2.mp3, …),
// Sal speaks with THOSE — shuffled and pitch-shifted per mood, Banjo-Kazooie
// style. No recordings -> the formant synth below is the fallback.
let voiceBufs = [];
let voiceLoadStarted = false;
const VOICE_RATE = { hype: 1.12, worried: 0.88, greedy: 1.0, manic: 1.28, panic: 1.38, broke: 0.72 };

async function loadVoice() {
  if (voiceLoadStarted || !ctx) return;
  voiceLoadStarted = true;
  let misses = 0;
  for (let i = 1; i <= 16 && misses < 2; i++) {
    let hit = false;
    for (const ext of ['mp3', 'm4a', 'wav']) {
      try {
        const r = await fetch(`/voice/${i}.${ext}`);
        if (!r.ok) continue;
        const buf = await ctx.decodeAudioData(await r.arrayBuffer());
        if (buf.duration > 0.03 && buf.duration < 2) { voiceBufs.push(buf); hit = true; break; }
      } catch (e) { /* not there / not audio — fine */ }
    }
    misses = hit ? 0 : misses + 1;
  }
}

function sampleBabble(P, rate) {
  const out = ctx.createGain();
  out.gain.value = 0.9;
  out.connect(master);
  let t = ctx.currentTime + 0.03;
  let last = -1;
  for (let i = 0; i < P.syl; i++) {
    let k = Math.floor(Math.random() * voiceBufs.length);
    if (Math.random() < 0.28) k = last >= 0 ? last : k;   // the "ba-ba" repeat
    last = k;
    const src = ctx.createBufferSource();
    src.buffer = voiceBufs[k];
    src.playbackRate.value = rate * (0.92 + Math.random() * 0.18);
    const g = ctx.createGain();
    const dur = Math.min(voiceBufs[k].duration / src.playbackRate.value, 0.5);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1, t + 0.015);
    g.gain.setValueAtTime(1, Math.max(t + 0.02, t + dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(g); g.connect(out);
    src.start(t, 0, dur + 0.02);
    t += dur * 0.85 + P.gap * (0.5 + Math.random());
  }
}

function babble(mood) {
  if (!ensure() || muted) return;
  const P = VOICES[mood] || VOICES.hype;
  if (voiceBufs.length >= 3) { sampleBabble(P, VOICE_RATE[mood] || 1); return; }
  const out = ctx.createGain();
  out.gain.value = 0.55;
  out.connect(master);
  let t = ctx.currentTime + 0.03;
  let vowel = VOWELS[Math.floor(Math.random() * VOWELS.length)];
  for (let i = 0; i < P.syl; i++) {
    const pos = i / (P.syl - 1);
    const phrase = 1 + P.arc * Math.sin(pos * Math.PI) + (pos > 0.7 ? P.arc * 0.5 * (pos - 0.7) / 0.3 : 0);
    if (Math.random() > 0.28) vowel = VOWELS[Math.floor(Math.random() * VOWELS.length)];  // ~28%: repeat = "ba-ba"
    const last = i === P.syl - 1;
    const dur = P.dur * (last ? 1.7 : 0.7 + Math.random() * 0.6);
    if (Math.random() < 0.4) noise(t - 0.012, 0.028, { gain: 0.05, freq: 2800 + Math.random() * 2600, q: 1.4 });  // consonant onset
    syllable(t, dur, P.pitch * phrase * (0.95 + Math.random() * 0.1), vowel, P, out);
    t += dur + P.gap * (0.5 + Math.random());
  }
}

// ---- generative background music ----
const CHORDS = {
  calm:  [[220, 277.2, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7], [164.8, 207.7, 246.9]],
  boom:  [[261.6, 329.6, 392], [196, 246.9, 293.7], [220, 277.2, 329.6], [174.6, 220, 261.6]],
  tense: [[164.8, 196, 246.9], [155.6, 185, 233.1], [146.8, 174.6, 220], [155.6, 185, 233.1]],
  storm: [[146.8, 174.6, 220], [138.6, 164.8, 207.7], [130.8, 155.6, 196], [123.5, 146.8, 185]],
};
const BAR = { calm: 3.4, boom: 2.6, tense: 2.4, storm: 2.9 };

function music(mood) {
  if (!ensure()) return;
  if (mood === currentMood) return;
  currentMood = mood;
  if (window.__itmMusicTimer) clearInterval(window.__itmMusicTimer);
  const chords = CHORDS[mood] || CHORDS.calm;
  const bar = BAR[mood] || 3;
  let step = 0;
  const playBar = () => {
    if (!ctx || document.hidden) { step++; return; }
    const chord = chords[step % chords.length]; step++;
    const t0 = ctx.currentTime + 0.05;
    chord.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = mood === 'boom' ? 'triangle' : 'sine';
      o.frequency.value = f;
      o.detune.value = (Math.random() - 0.5) * (mood === 'storm' ? 16 : 6);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.5 / (i + 1), t0 + bar * 0.35);
      g.gain.linearRampToValueAtTime(0.0001, t0 + bar * 1.05);
      o.connect(g); g.connect(musicGain);
      o.start(t0); o.stop(t0 + bar * 1.1);
    });
    const b = ctx.createOscillator();
    b.type = 'sine'; b.frequency.value = chord[0] / 2;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0, t0);
    bg.gain.linearRampToValueAtTime(0.55, t0 + 0.4);
    bg.gain.linearRampToValueAtTime(0.0001, t0 + bar);
    b.connect(bg); bg.connect(musicGain);
    b.start(t0); b.stop(t0 + bar + 0.1);
  };
  playBar();
  window.__itmMusicTimer = setInterval(playBar, bar * 1000);
}

// ---- the sfx kit ----
function guard(fn) { return (...a) => { if (ensure() && !muted) fn(...a); }; }
const now = () => ctx.currentTime + 0.02;

export const itmAudio = {
  start(on) { muted = !on; if (ensure()) { master.gain.value = muted ? 0 : 0.5; loadVoice(); } },
  setMuted(m) { muted = m; if (ctx) master.gain.value = m ? 0 : 0.5; },
  music(mood) { music(mood); },
  ctxState: () => (ctx ? ctx.state : 'none'),
  babble,

  tick: guard(() => tone(620, now(), 0.05, { type: 'triangle', gain: 0.1 })),
  buy: guard(() => { const t = now(); tone(392, t, 0.08, { type: 'triangle', gain: 0.2 }); tone(587, t + 0.07, 0.12, { type: 'triangle', gain: 0.2 }); }),
  sell: guard(() => { const t = now(); tone(587, t, 0.08, { type: 'triangle', gain: 0.2 }); tone(392, t + 0.07, 0.12, { type: 'triangle', gain: 0.2 }); }),
  coin: guard(() => { const t = now(); tone(988, t, 0.05, { type: 'square', gain: 0.08 }); tone(1319, t + 0.05, 0.1, { type: 'square', gain: 0.08 }); }),
  kaching: guard(() => { const t = now(); noise(t, 0.06, { gain: 0.12, freq: 3200 }); tone(1175, t + 0.05, 0.07, { type: 'square', gain: 0.09 }); tone(1568, t + 0.11, 0.16, { type: 'square', gain: 0.09 }); }),
  alarm: guard(() => { const t = now(); tone(220, t, 0.16, { type: 'square', gain: 0.12 }); tone(220, t + 0.24, 0.16, { type: 'square', gain: 0.12 }); tone(185, t + 0.48, 0.3, { type: 'square', gain: 0.12, to: 150 }); }),
  pop: guard(() => { const t = now(); noise(t, 0.05, { gain: 0.14, freq: 900 }); tone(240, t, 0.1, { type: 'sine', gain: 0.22, to: 460 }); }),
  chime: guard(() => { const t = now(); [523.3, 659.3, 784].forEach((f, i) => tone(f, t + i * 0.09, 0.22, { type: 'triangle', gain: 0.14 })); }),
  womp: guard(() => { const t = now(); tone(220, t, 0.18, { type: 'sawtooth', gain: 0.1, to: 180 }); tone(180, t + 0.18, 0.3, { type: 'sawtooth', gain: 0.1, to: 130 }); }),
  verdict(ok, bad) { if (!ensure() || muted) return; if (ok > 0) this.chime(); if (bad > 0) setTimeout(() => this.womp(), ok > 0 ? 450 : 0); },
  pouch: guard(() => { const t = now(); noise(t, 0.12, { gain: 0.1, freq: 1400, q: 0.5 }); tone(1047, t + 0.1, 0.1, { type: 'triangle', gain: 0.08 }); }),
  scribble: guard(() => { const t = now(); for (let i = 0; i < 3; i++) noise(t + i * 0.07, 0.05, { gain: 0.09, freq: 2400 + i * 500, q: 1.5 }); }),
  unlock: guard(() => { const t = now(); tone(523.3, t, 0.08, { type: 'triangle', gain: 0.16 }); tone(784, t + 0.08, 0.16, { type: 'triangle', gain: 0.16 }); }),
  sneak: guard(() => { const t = now(); [330, 311, 294, 277].forEach((f, i) => tone(f, t + i * 0.11, 0.09, { type: 'square', gain: 0.08 })); noise(t + 0.5, 0.1, { gain: 0.1, freq: 2800 }); }),
  win: guard(() => { const t = now(); [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, t + i * 0.12, i === 3 ? 0.4 : 0.12, { type: 'triangle', gain: 0.16 })); }),
  lose: guard(() => { const t = now(); [392, 330, 262].forEach((f, i) => tone(f, t + i * 0.2, 0.3, { type: 'triangle', gain: 0.12, to: f * 0.94 })); }),
};
