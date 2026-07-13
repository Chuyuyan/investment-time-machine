import { useEffect, useMemo, useRef, useState } from 'react';
import { money } from '../format.js';

// ============================================================================
// THE NAKED LOOP, v3 — INSIGHT AS THE REWARD  (?proto=core)
//
// v2 verdict from playtest: educational but "feels like a test, not a game."
// The missing reward was INSIGHT — "oh, I finally see it" — not reflection.
//
// The experiment: history rhymes. Every real case secretly belongs to a SHAPE
// (a craze · a scare · a slow fade · a quiet machine · a coin flip). The game
// NEVER announces this. The player may start noticing on their own — and from
// round 4 they can ACT on the noticing: point at an earlier case ("this
// reminds me of that one"). Right rhyme = cash bonus for insight. Wrong = no
// penalty, just the truth. The reveal confirms rhymes only AFTER cases are
// seen (a ship's log, not a spoiler).
//
// The shapes are honest: every family holds a counter-example (the NVIDIA
// craze WON; the First Republic scare DIED). So the insight is never a fake
// rule — it's "the shape tells you which question matters, not the answer."
//
// The end report now shows what YOU discovered, not a lecture (the v2
// told-lesson block was the Duolingo part — deleted).
// ============================================================================

const STRENGTH = ['a small clue', 'a strong clue', 'a very strong clue'];
const RHYME_BONUS = 500;
const RHYME_FROM = 3; // rhyming unlocks once you've seen at least 3 cases

// v6 — THE REASON. Flip-cards tracked ATTENTION; the real skill is TRUST —
// which information you let shape your thinking. So: all clues open, always
// (reading is thinking; never gate it). But to place a bet you must tap the ONE
// clue that's carrying your call. That single act externalizes weighing. The
// ignored warning then detects itself (bet against a strong clue that history
// proved right → "you read it, you decided it didn't matter, it mattered"),
// and the report becomes a personal trust ledger: your own track record, per
// source. The human mistake isn't "never saw the warning" — it's "saw it and
// talked myself out of it." This mechanic catches exactly that.

// The five shapes, in plain words — and the QUESTION each shape makes decisive.
const FAMILIES = {
  craze: {
    word: 'a craze',
    question: 'Crazes usually end badly — but not always. The question that decides it: is the price assuming the story lasts forever?',
  },
  scare: {
    word: 'a scare',
    question: 'Scares usually pass — but not always. The question that decides it: is the business itself still working, or is the problem eating it?',
  },
  fade: {
    word: 'a slow fade',
    question: 'The question that decides it: is “cheap” a bargain — or just a smaller boat that is still sinking?',
  },
  machine: {
    word: 'a quiet machine',
    question: 'The question that decides it: is anything actually breaking? If not, boring keeps winning.',
  },
  flip: {
    word: 'a true coin flip',
    question: 'The question that decides it: can you afford the tails? Bet small or sit out — both are sound.',
  },
};

const CASES = [
  {
    short: 'NVIDIA',
    fam: 'craze',
    title: 'A computer-chip company that tripled last year',
    sub: 'early 2024 · everyone is talking about artificial intelligence',
    clues: [
      { side: 1, s: 3, label: 'Which way the price has been going', text: 'it tripled last year and is still climbing' },
      { side: 1, s: 3, label: 'Online buzz', text: 'everyone online says it simply cannot lose' },
      { side: -1, s: 3, label: 'Is the price fair for what you get?', text: 'one of the most expensive prices a stock has ever had' },
      { side: -1, s: 2, label: 'What the bosses did', text: 'the bosses sold hundreds of millions of dollars of their own shares' },
    ],
    out: { dir: 1, move: 140, when: 'over the next six months' },
    path: [100, 92, 128, 240],
    // beats carry hidden tags: kind 'fact' (the story itself changed) vs 'noise'
    // (opinions, price wiggles, hype). side = which direction it supports.
    // The game NEVER shows the tag — judging fact-vs-noise IS the skill.
    beats: [
      { p: 92, news: 'A big research firm calls AI spending “unsustainable.” Chip stocks slide.', marcus: 'bro it’s DROPPING. do we get out??', kind: 'noise', side: -1 },
      { p: 128, news: 'Blowout demand numbers. The doubters go quiet.', marcus: 'TOLD YOU 🚀🚀 never doubted it', kind: 'fact', side: 1 },
    ],
    name: 'NVIDIA · January 2024',
    story:
      'The chips powered the artificial-intelligence boom and demand exploded. The “impossibly expensive” stock more than doubled again. The bosses who sold missed out on billions.',
    fair: { dir: -1, note: 'The careful read said stay away — too expensive, and the bosses themselves were selling.' },
  },
  {
    short: 'GameStop',
    fam: 'craze',
    title: 'A dying mall store that jumped 1,500% in three weeks',
    sub: 'January 2021 · the internet has adopted it as a cause',
    clues: [
      { side: 1, s: 3, label: 'Which way the price has been going', text: 'up 1,500% in three weeks' },
      { side: 1, s: 3, label: 'Online buzz', text: 'the whole internet is screaming “buy” at once' },
      { side: -1, s: 3, label: 'The company’s real results', text: 'a shrinking mall store that loses money every year' },
      { side: -1, s: 2, label: 'What the experts say', text: 'nearly every expert says this will end badly' },
    ],
    out: { dir: -1, move: -85, when: 'within a month' },
    path: [100, 138, 60, 15],
    beats: [
      { p: 138, news: 'It’s up ANOTHER 38%. The crowd is chanting. People betting against it are getting destroyed.', marcus: 'IT’S STILL GOING 😭 this thing only knows up', kind: 'noise', side: 1 },
      { p: 60, news: 'Brokers restrict buying. The crowd fractures. The slide begins.', marcus: 'uh oh. it’s getting ugly in the group chat', kind: 'fact', side: -1 },
    ],
    name: 'GameStop · late January 2021',
    story:
      'The excitement ran out in days. It fell from $350 to under $50 within a month. The people who bought at the top were the ones who arrived last.',
    fair: { dir: -1, note: 'The careful read said the party was almost over — the business underneath could not carry that price.' },
  },
  {
    short: 'First Republic',
    fam: 'scare',
    title: 'A bank whose price collapsed on scary headlines',
    sub: 'March 2023 · two other banks just failed',
    clues: [
      { side: -1, s: 2, label: 'News headlines', text: 'frightening stories about banks failing, every single day' },
      { side: 1, s: 3, label: 'Is the price fair for what you get?', text: 'priced far below everything the bank owns on paper' },
      { side: 1, s: 2, label: 'What the bosses did', text: 'the bank’s own bosses were buying shares' },
      { side: -1, s: 3, label: 'The company’s real results', text: 'customers were pulling their money out, fast' },
    ],
    out: { dir: -1, move: -97, when: 'within two months' },
    name: 'First Republic Bank · March 2023',
    story:
      'The bosses were wrong about their own bank. Customers kept leaving, and the bank was seized and sold within two months. “Cheap” can keep getting cheaper — sometimes all the way to zero.',
    fair: { dir: 0, note: 'Genuinely hard: cheap price and bosses buying — but customers running for the door is the one thing a bank cannot survive.' },
  },
  {
    short: 'Meta',
    fam: 'scare',
    title: 'A famous internet company everyone says is finished',
    sub: 'November 2022 · down 75% this year',
    clues: [
      { side: -1, s: 2, label: 'Which way the price has been going', text: 'down 75% in a year' },
      { side: -1, s: 2, label: 'News headlines', text: 'story after story saying the company wasted billions and lost its way' },
      { side: 1, s: 3, label: 'The company’s real results', text: 'still earns tens of billions in profit every year' },
      { side: 1, s: 3, label: 'Is the price fair for what you get?', text: 'the cheapest it has ever been compared to its profits' },
    ],
    out: { dir: 1, move: 190, when: 'over the next year' },
    name: 'Meta (Facebook) · November 2022',
    story:
      'The panic was overdone. The profits were real, the price was not. It nearly tripled within a year — one of the great comebacks of the decade.',
    fair: { dir: 1, note: 'The careful read said the fear had gone further than the facts: a company earning that much, priced that low, usually recovers.' },
  },
  {
    short: 'Tesla',
    fam: 'flip',
    title: 'An electric-car maker the experts say is going bankrupt',
    sub: 'mid 2019 · more people bet against it than any stock in the world',
    clues: [
      { side: -1, s: 3, label: 'What the experts say', text: 'famous investors openly predict bankruptcy' },
      { side: -1, s: 2, label: 'People betting it will fall', text: 'more money bet against it than any other stock' },
      { side: 1, s: 1, label: 'What the bosses did', text: 'the boss bought $25 million of shares with his own money' },
      { side: 1, s: 2, label: 'The company’s real results', text: 'orders growing every single month' },
    ],
    out: { dir: 1, move: 900, when: 'over the next 18 months' },
    name: 'Tesla · June 2019',
    story:
      'It did not go bankrupt. Within 18 months it became the most valuable car company on earth, and the people betting against it lost more than on any stock in history.',
    fair: { dir: 0, note: 'A genuine coin flip at the time — real danger, real growth, and no way to be sure which would win.' },
  },
  {
    short: 'Sears',
    fam: 'fade',
    title: 'A legendary store chain at its cheapest price in 30 years',
    sub: '2014 · a famous investor runs it and keeps buying',
    clues: [
      { side: 1, s: 3, label: 'Is the price fair for what you get?', text: 'the lowest price in thirty years' },
      { side: 1, s: 2, label: 'What the bosses did', text: 'the famous investor in charge keeps buying shares' },
      { side: -1, s: 3, label: 'The company’s real results', text: 'sales have fallen every single year for years' },
      { side: -1, s: 2, label: 'News headlines', text: 'photo stories of empty stores and empty shelves' },
    ],
    out: { dir: -1, move: -90, when: 'over the next four years' },
    name: 'Sears · 2014',
    story:
      'Cheap was not enough. The stores kept emptying until there was nothing left, and the company went bankrupt in 2018. A dying business beats a cheap price, every time.',
    fair: { dir: -1, note: 'The careful read: when the business itself shrinks year after year, a low price is a trap, not a bargain.' },
  },
  {
    short: 'Apple',
    fam: 'machine',
    title: 'The world’s most famous phone maker, now called “boring”',
    sub: 'mid 2016 · experts say its best days are over',
    clues: [
      { side: -1, s: 2, label: 'What the experts say', text: '“the phone story is over” — growth has stalled' },
      { side: 1, s: 3, label: 'The company’s real results', text: 'enormous, steady profits, year after year' },
      { side: 1, s: 2, label: 'Is the price fair for what you get?', text: 'cheap compared to those profits' },
      { side: 1, s: 2, label: 'What the bosses did', text: 'the world’s most famous investor quietly started buying' },
    ],
    out: { dir: 1, move: 100, when: 'over the next two years' },
    name: 'Apple · mid 2016',
    story: 'Boring won. The quiet buying you could have seen in public records became one of the most profitable investments ever made.',
    fair: { dir: 1, note: 'The careful read said huge steady profits at a modest price is the best kind of boring.' },
  },
  {
    short: 'Zoom',
    fam: 'craze',
    title: 'The video-call company the whole world suddenly uses',
    sub: 'October 2020 · up 700% this year',
    clues: [
      { side: 1, s: 3, label: 'Which way the price has been going', text: 'up 700% in a year' },
      { side: 1, s: 3, label: 'Online buzz', text: 'every school, office and family on earth uses it daily' },
      { side: -1, s: 3, label: 'Is the price fair for what you get?', text: 'the price only makes sense if lockdowns last forever' },
      { side: -1, s: 2, label: 'What the bosses did', text: 'the bosses were steadily selling their own shares' },
    ],
    out: { dir: -1, move: -80, when: 'over the next 18 months' },
    name: 'Zoom · October 2020',
    story:
      'Everyone really did use it — and the stock still fell 80%, because the price had assumed even more than that. A true story can still be a bad price.',
    fair: { dir: -1, note: 'The careful read: when a price needs the emergency to last forever, it usually does not.' },
  },
  {
    short: 'Moderna',
    fam: 'flip',
    title: 'A medicine company racing to make the vaccine everyone is waiting for',
    sub: 'July 2020 · it has never sold a product in its life',
    clues: [
      { side: -1, s: 2, label: 'The company’s real results', text: 'has never sold a single product; loses money every year' },
      { side: 1, s: 3, label: 'News headlines', text: 'racing to make the vaccine the whole world needs' },
      { side: 1, s: 2, label: 'Online buzz', text: 'wild excitement — and wild doubt — everywhere' },
      { side: -1, s: 1, label: 'What the experts say', text: 'experts are split down the middle' },
    ],
    out: { dir: 1, move: 400, when: 'within a year' },
    name: 'Moderna · July 2020',
    story:
      'The vaccine worked. A pure gamble paid off 5-to-1. Remember both halves: it paid — and it was still a gamble. Most bets like this one lose.',
    fair: { dir: 0, note: 'A true coin flip — nobody on earth knew whether the science would work. Sitting out was just as sound as betting.' },
  },
  {
    short: 'Microsoft',
    fam: 'machine',
    title: 'A giant old software company everyone calls finished',
    sub: '2013 · a new boss is about to take over',
    clues: [
      { side: -1, s: 2, label: 'What the experts say', text: '“boring, out of ideas, the future belongs to others”' },
      { side: 1, s: 3, label: 'The company’s real results', text: 'nearly every business on earth still pays it every month' },
      { side: 1, s: 2, label: 'Is the price fair for what you get?', text: 'cheap compared to its steady profits' },
      { side: 1, s: 1, label: 'News headlines', text: 'a new boss with new ideas is about to take over' },
    ],
    out: { dir: 1, move: 50, when: 'over the next 18 months' },
    name: 'Microsoft · 2013',
    story: 'The “boring, finished” company went up tenfold over the following decade. Nobody tweeted about it. It just kept working.',
    fair: { dir: 1, note: 'The careful read: steady profits everyone depends on, at a cheap price, with a reason things might change.' },
  },
  {
    short: 'Cisco',
    fam: 'craze',
    title: 'The company building the internet itself',
    sub: 'March 2000 · briefly the most valuable company on earth',
    clues: [
      { side: 1, s: 2, label: 'Which way the price has been going', text: 'doubled in the last year' },
      { side: 1, s: 3, label: 'Online buzz', text: '“the internet is the future, and this company IS the internet”' },
      { side: 1, s: 2, label: 'The company’s real results', text: 'it really does sell the equipment the internet runs on' },
      { side: -1, s: 3, label: 'Is the price fair for what you get?', text: 'priced at two hundred years’ worth of its own profits' },
    ],
    out: { dir: -1, move: -80, when: 'over the next two years' },
    path: [100, 115, 70, 20],
    beats: [
      { p: 115, news: 'Still climbing. “This time is different,” everyone agrees.', marcus: 'up again!! the internet can’t lose 🚀', kind: 'noise', side: 1 },
      { p: 70, news: 'Dot-com customers start missing payments. Orders wobble for the first time.', marcus: 'ok that’s a real drop. this is fine. right?', kind: 'fact', side: -1 },
    ],
    name: 'Cisco · March 2000',
    story:
      'The internet WAS the future — and the stock still fell 80%, and took twenty years to see that price again. The story was right. The price was wrong.',
    fair: { dir: -1, note: 'The careful read: even a completely true story can cost too much.' },
  },
  {
    short: 'American Express',
    fam: 'scare',
    title: 'A famous payments company caught in a scandal',
    sub: '1964 · a fraud it lent money to just blew up',
    clues: [
      { side: -1, s: 2, label: 'News headlines', text: 'a huge scandal, and real money genuinely lost' },
      { side: -1, s: 2, label: 'Which way the price has been going', text: 'the stock nearly halved' },
      { side: 1, s: 3, label: 'The company’s real results', text: 'customers kept using the card exactly like before' },
      { side: -1, s: 1, label: 'What the experts say', text: '“the reputation is ruined”' },
    ],
    out: { dir: 1, move: 200, when: 'over the next three years' },
    name: 'American Express · 1964',
    story:
      'The scandal was real — but it touched a side business. Customers never stopped using the card. A young investor named Warren Buffett noticed exactly that, bet heavily, and it tripled.',
    fair: { dir: 1, note: 'The careful read: the scare was about a side business; the main business never blinked.' },
  },
  {
    short: 'Kodak',
    fam: 'fade',
    title: 'The photography giant everyone grew up with',
    sub: '2007 · phones are starting to take pictures',
    clues: [
      { side: 1, s: 1, label: 'Online buzz', text: 'one of the most beloved brand names on earth' },
      { side: 1, s: 2, label: 'Is the price fair for what you get?', text: 'the lowest price in twenty years' },
      { side: -1, s: 3, label: 'The company’s real results', text: 'film sales fall further every single year' },
      { side: -1, s: 1, label: 'News headlines', text: 'the bosses have promised a “digital turnaround” for a decade' },
    ],
    out: { dir: -1, move: -90, when: 'over the next five years' },
    name: 'Kodak · 2007',
    story: 'The turnaround never came. Bankrupt in 2012. A beloved name is a memory, not a business.',
    fair: { dir: -1, note: 'The careful read: when the world moves on, “cheap” just means the fade has started.' },
  },
  {
    short: 'Netflix',
    fam: 'scare',
    title: 'A streaming company that just made all its customers furious',
    sub: 'October 2011 · the boss botched a price change, the stock fell 75%',
    clues: [
      { side: -1, s: 2, label: 'Which way the price has been going', text: 'down 75% in a few months' },
      { side: -1, s: 2, label: 'News headlines', text: 'customers cancelling in anger; late-night shows mocking the boss' },
      { side: 1, s: 3, label: 'The company’s real results', text: 'streaming keeps growing underneath all the noise' },
      { side: 1, s: 1, label: 'What the bosses did', text: 'the boss admitted the mistake and reversed it' },
    ],
    out: { dir: 1, move: 400, when: 'over the next two years' },
    name: 'Netflix · October 2011',
    story:
      'The anger faded; the streaming kept growing. Within two years the stock was up several hundred percent. A mistake is not the same as a broken business.',
    fair: { dir: 1, note: 'The careful read: the customers were angry, but they were still watching. The business itself never stopped working.' },
  },
  // --- cases that BREAK the easy rules (the crowd right, the dead reviving,
  // --- the "safe" pick losing). Without these, "always bet the opposite"
  // --- scores 9/10 — a playtest proved it. The pool must punish every rule.
  {
    short: 'Amazon',
    fam: 'craze',
    title: 'A giant online store that famously never shows a profit',
    sub: '2015 · experts have called it overpriced for twenty years straight',
    clues: [
      { side: 1, s: 3, label: 'The company’s real results', text: 'sales grow relentlessly, every single year' },
      { side: -1, s: 3, label: 'Is the price fair for what you get?', text: 'by every normal measure, the price looks absurd' },
      { side: -1, s: 2, label: 'What the experts say', text: '“a bubble” — they have said so for years' },
      { side: 1, s: 2, label: 'Online buzz', text: 'customers love it more every year' },
    ],
    out: { dir: 1, move: 400, when: 'over the next four years' },
    path: [100, 85, 140, 500],
    beats: [
      { p: 85, news: 'A weak quarter. “The profits will never come,” the analysts repeat, again.', marcus: 'down 15%… maybe the experts were right about this one', kind: 'noise', side: -1 },
      { p: 140, news: 'The company reveals its cloud business. It is enormous, and it is pure profit.', marcus: 'ok WHERE did that come from 🤯', kind: 'fact', side: 1 },
    ],
    name: 'Amazon · 2015',
    story:
      'The profits were hiding on purpose — every dollar went straight back into growing. The “absurdly priced” store went up five-fold. Some things look expensive because they are actually cheap.',
    fair: { dir: 0, note: 'Genuinely hard: an absurd price on an unstoppable business. The whole question was which one mattered more.' },
  },
  {
    short: 'Nikola',
    fam: 'craze',
    title: 'A truck company briefly worth more than Ford',
    sub: 'June 2020 · it has never sold a single truck',
    clues: [
      { side: 1, s: 3, label: 'Online buzz', text: 'the internet has crowned it “the next Tesla”' },
      { side: 1, s: 2, label: 'Which way the price has been going', text: 'tripled in a month' },
      { side: -1, s: 3, label: 'The company’s real results', text: 'zero trucks sold, zero money earned — ever' },
      { side: -1, s: 2, label: 'Is the price fair for what you get?', text: 'worth more than Ford, which sells millions of vehicles a year' },
    ],
    out: { dir: -1, move: -95, when: 'over the next 18 months' },
    path: [100, 145, 40, 5],
    beats: [
      { p: 145, news: 'A huge truck-order announcement. The stock spikes 45% in days.', marcus: 'up 45%!! the haters are so quiet rn 🚀', kind: 'noise', side: 1 },
      { p: 40, news: 'A report claims the famous demo was a truck rolling downhill, engine off. The company admits it.', marcus: 'wait. WAIT. it was ROLLING DOWNHILL???', kind: 'fact', side: -1 },
    ],
    name: 'Nikola · June 2020',
    story:
      'A famous demo video turned out to be a truck rolling downhill with no engine. The founder left; the price collapsed 95%. “The next Tesla” is the most expensive sentence in investing.',
    fair: { dir: -1, note: 'The careful read: a price with no product underneath it is a story, not a business.' },
  },
  {
    short: 'AMD',
    fam: 'fade',
    title: 'A chipmaker everyone has left for dead',
    sub: '2015 · its giant rival has been winning for a decade straight',
    clues: [
      { side: -1, s: 2, label: 'Which way the price has been going', text: 'falling for years — now under two dollars' },
      { side: -1, s: 2, label: 'The company’s real results', text: 'losing money, cutting workers' },
      { side: 1, s: 2, label: 'What the bosses did', text: 'a respected new boss just took over, betting everything on one new design' },
      { side: -1, s: 1, label: 'What the experts say', text: '“game over,” most of them say' },
    ],
    out: { dir: 1, move: 400, when: 'over the next three years' },
    name: 'AMD · 2015',
    story:
      'The new design worked. The two-dollar stock eventually rose more than fifty-fold and took the lead from its giant rival. Left for dead is not the same as dead.',
    fair: { dir: 0, note: 'A true long shot: a dying company — but a real plan, a real leader, and nothing left to lose.' },
  },
  {
    short: 'Best Buy',
    fam: 'fade',
    title: 'An electronics chain everyone now uses as a showroom',
    sub: '2012 · people try the products in store, then buy online for less',
    clues: [
      { side: -1, s: 2, label: 'The company’s real results', text: 'sales slipping as shopping moves online' },
      { side: -1, s: 2, label: 'News headlines', text: '“retail is dead,” the stories all say' },
      { side: 1, s: 2, label: 'Is the price fair for what you get?', text: 'the cheapest price in its history' },
      { side: 1, s: 2, label: 'What the bosses did', text: 'a new boss arrives with a simple, believable plan' },
    ],
    out: { dir: 1, move: 200, when: 'over the next three years' },
    name: 'Best Buy · 2012',
    story:
      'The new boss matched online prices and turned the stores into pickup points. “Dead” retail tripled. A fade can turn — if someone actually changes the business.',
    fair: { dir: 0, note: 'The honest answer: it depended entirely on whether the plan would work — and nobody knew.' },
  },
  {
    short: 'Enron',
    fam: 'machine',
    title: 'An energy giant crowned “most innovative company” six years running',
    sub: '2001 · the numbers look amazing — and nobody can explain them',
    clues: [
      { side: 1, s: 3, label: 'The company’s real results', text: 'reported profits look spectacular' },
      { side: 1, s: 2, label: 'What the experts say', text: 'nearly every analyst says buy' },
      { side: -1, s: 1, label: 'News headlines', text: 'one lone reporter keeps asking how it actually makes money' },
      { side: -1, s: 2, label: 'What the bosses did', text: 'the bosses are quietly selling large amounts of their own shares' },
    ],
    out: { dir: -1, move: -99, when: 'within a year' },
    name: 'Enron · 2001',
    story:
      'The spectacular numbers were fake. It collapsed to nothing within a year. When nobody can explain how the money is made, that is not a detail — that is the whole question.',
    fair: { dir: -1, note: 'The careful read: profits nobody can explain, plus bosses selling — the two quietest clues were the ones that mattered.' },
  },
  {
    short: 'Intel',
    fam: 'machine',
    title: 'A famous chip giant that looks safe and cheap',
    sub: '2020 · steady profits, trusted name, low price',
    clues: [
      { side: 1, s: 2, label: 'The company’s real results', text: 'big, steady profits' },
      { side: 1, s: 2, label: 'Is the price fair for what you get?', text: 'cheap compared to those profits' },
      { side: 1, s: 1, label: 'What the experts say', text: '“the safe choice,” most say' },
      { side: -1, s: 3, label: 'News headlines', text: 'its newest chips keep arriving late — a smaller rival just pulled ahead' },
    ],
    out: { dir: -1, move: -40, when: 'over the next two years' },
    name: 'Intel · 2020',
    story:
      'Cheap and famous — but the product itself was falling behind. The “safe choice” lost 40% while its smaller rival multiplied. In technology, falling behind is the one thing cheap cannot fix.',
    fair: { dir: -1, note: 'The careful read: when the product is losing the race, steady past profits are just the rear-view mirror.' },
  },
];

function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// v7 — MAKE IT A GAME: something to lose, someone to beat, drama in the moment.
// (1) A CAREER fund that persists across chapters. Go broke → you're out. The
//     deepest real lesson (survival, sizing) becomes the actual game.
// (2) MARCUS, the rival. He follows the loudest clue every time, always bets
//     $1,000, never sits out. He calls his bet BEFORE you decide (pressure —
//     and we measure whether you follow him). He runs his own career fund.
//     Sometimes he'll beat you over ten rounds. That's variance, lived.
// (3) Juice: the P&L rolls, streaks get named.
// v8 — THE SECOND ACT. The old loop was read → bet → outcome: a quiz. A real
// investment decision UNFOLDS: you're in, the position moves against you, the
// news gets scary, Marcus screams — and NOW what do you do? Hold, add, or bail.
// Cases with a `path` (normalized prices, entry = 100) play out in beats; at
// each beat you choose. Selling early gets compared to holding ("you sold at
// the dip; it finished at +140% — right call, weak grip"). This is the Two
// Clocks as gameplay: every beat is the fast clock trying to shake you off
// your slow-clock thesis. Everyone can buy. Almost nobody can hold.
//
// And the LIFE layer: money is Saturdays. Ray pays $200 a shift — so a $2,000
// loss is ten Saturdays at the warehouse, and the career bar is the Civic bar.
const SHIFT = 200; // one Saturday warehouse shift, from Ray's offer
const CIVIC = 15400; // the dream, from the life prototype
const CAREER_KEY = 'itm_career_v1';
function loadCareer() {
  try {
    const c = JSON.parse(localStorage.getItem(CAREER_KEY) || 'null');
    if (c && typeof c.bank === 'number' && typeof c.marcus === 'number') return c;
  } catch {
    /* ignore */
  }
  return { bank: 10000, marcus: 10000, runs: 0 };
}
function saveCareer(c) {
  try {
    localStorage.setItem(CAREER_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

// the loudest clue's direction — Marcus's whole strategy, and the framework
// detector's reference point
const loudOf = (kase) => kase.clues.reduce((a, b) => (b.s > a.s ? b : a)).side;

// unrealized/realized P&L for a set of stakes at price p (entry-normalized).
// Longs gain as p rises; DOWN bets gain as p falls (and can lose more than the
// stake when p rips — that's real, and the game says so when it happens).
function pnlAt(stakes, d, p) {
  return Math.round(
    stakes.reduce((a, s) => a + (d > 0 ? s.amt * (p / s.entryP - 1) : s.amt * ((s.entryP - p) / s.entryP)), 0),
  );
}

// v10 — THE TAPE. Nine versions of text cards still read as a questionnaire,
// because nothing MOVED. Now the market is a live line that draws itself
// (~20s, the real history replayed), your P&L ticks, news interrupts and
// pauses the tape, and the sell/add buttons sit under your thumb the whole
// time. Sell early and the line keeps drawing WITHOUT you — you watch what
// you dodged or missed. Exits are graded by what you sold ON: a fact, a scary
// headline that changed nothing, or nothing at all except the price.
const TAPE_MS = 20000;

// price at tape-time t (0..1): straight lines between the real waypoints plus
// a wiggle that fades to zero at each waypoint (so history stays honest)
function priceAt(cse, t) {
  const P = cse.path;
  const n = P.length - 1;
  const x = Math.min(0.9999, Math.max(0, t)) * n;
  const k = Math.floor(x);
  const f = x - k;
  const base = P[k] + (P[k + 1] - P[k]) * f;
  const span = Math.max(...P) - Math.min(...P);
  const wig = span * 0.03 * Math.sin(t * 87 + k * 7) * Math.sin(Math.PI * f);
  return base + wig;
}

// the finished journey, with your actions marked on it — the result, visible
function MiniPath({ cse, events }) {
  const W = 320;
  const H = 90;
  const pts = [];
  for (let s = 0; s <= 80; s++) pts.push(priceAt(cse, s / 80));
  const lo = Math.min(...pts) - 4;
  const hi = Math.max(...pts) + 4;
  const X = (t) => 6 + t * (W - 12);
  const Y = (p) => 6 + (1 - (p - lo) / (hi - lo)) * (H - 12);
  const line = pts.map((p, s) => `${s ? 'L' : 'M'}${X(s / 80).toFixed(1)} ${Y(p).toFixed(1)}`).join(' ');
  const up = cse.path[cse.path.length - 1] >= 100;
  const MARK = { exit: { sym: '▼', cls: 'mk-exit' }, trim: { sym: '◆', cls: 'mk-trim' }, add: { sym: '▲', cls: 'mk-add' } };
  return (
    <svg className="minipath" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <line x1="0" y1={Y(100)} x2={W} y2={Y(100)} className="mp-entry" />
      <path d={line} className={`mp-line ${up ? 'up' : 'down'}`} fill="none" />
      <text x={X(0) + 2} y={Y(100) - 3} className="mp-tag">you got in here</text>
      {(events || []).map((e, i) => {
        const m = MARK[e.action];
        return m ? (
          <text key={i} x={X(e.t)} y={Y(e.p)} className={`mp-mark ${m.cls}`} textAnchor="middle">
            {m.sym}
          </text>
        ) : null;
      })}
    </svg>
  );
}

const BUST_FLOOR = 250; // can't place the minimum bet → you're out

// the rolling number — outcomes should be felt, not read
function CountUp({ to, prefix = '', suffix = '' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 900);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <>
      {prefix}
      {money(Math.abs(v))}
      {suffix}
    </>
  );
}

// CHAPTERS — each is built around ONE question, argued from both sides. The
// question is NEVER shown up front (announcing it would teach the lesson before
// the experience). The player lives the cases, then the report reveals: "every
// moment here was asking the same thing." Discovery, not instruction.
const CHAPTERS = [
  {
    id: 1,
    label: 'Chapter I',
    teaser: '5 real moments · one hidden question',
    shorts: ['GameStop', 'Amazon', 'Nikola', 'NVIDIA', 'Cisco'],
    question: 'Is loud the same as true?',
    revealText:
      'GameStop, Nikola and Cisco were loud — and wrong. Amazon and NVIDIA were loud — and RIGHT. So the answer is no, and also not the opposite: loudness tells you nothing by itself. The real tell was never the volume. It was whether a working business sat underneath the noise.',
  },
  {
    id: 2,
    label: 'Chapter II',
    teaser: '4 real moments · one hidden question',
    shorts: ['Meta', 'First Republic', 'Netflix', 'American Express'],
    question: 'When is a falling price a bargain?',
    revealText:
      'Meta, Netflix and American Express fell because people were scared. First Republic fell because the business itself was dying. Same scary headlines — opposite endings. The question that separated them: was the thing people feared actually breaking the business?',
  },
  {
    id: 3,
    label: 'Chapter III',
    teaser: '4 real moments · one hidden question',
    shorts: ['Sears', 'Kodak', 'AMD', 'Best Buy'],
    question: 'When is cheap a trap — and when is it a second chance?',
    revealText:
      'Sears and Kodak were cheap on the way to zero. AMD and Best Buy were cheap right before a rebirth. The difference was never the price. It was whether somebody was actually changing the company.',
  },
  {
    id: 4,
    label: 'Chapter IV',
    teaser: '4 real moments · one hidden question',
    shorts: ['Apple', 'Microsoft', 'Intel', 'Enron'],
    question: 'Does boring win?',
    revealText:
      'Apple and Microsoft: boring, profitable, unstoppable. Intel: boring — and quietly losing the race. Enron: excitement dressed up as a steady machine, and the numbers were fake. Boring wins when the machine still works and the numbers are real.',
  },
  {
    id: 5,
    label: 'The Exam',
    teaser: '10 moments, shuffled · no labels, no hints — like real life',
    mixed: true,
    question: null,
    revealText:
      'There was no hidden question this time. That is the point: in real life, all the questions arrive at once, unlabeled. The skill is recognizing which one each situation is asking.',
  },
];

export default function CoreLoop() {
  const [seed, setSeed] = useState(0);
  const [chapter, setChapter] = useState(null);
  const order = useMemo(() => {
    if (!chapter) return [];
    if (chapter.mixed) return shuffle(CASES).slice(0, 10);
    return shuffle(chapter.shorts.map((s) => CASES.find((k) => k.short === s)));
  }, [chapter, seed]);

  const [i, setI] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro | select | decide | reveal | done
  const [dir, setDir] = useState(0);
  const [size, setSize] = useState(500);
  const [rhyme, setRhyme] = useState(null); // index into `seen` the player points at
  const [reason, setReason] = useState(null); // the ONE clue carrying your call
  const [bankroll, setBankroll] = useState(() => loadCareer().bank); // the career fund
  const [marcusBank, setMarcusBank] = useState(() => loadCareer().marcus);
  const [runStart, setRunStart] = useState(() => loadCareer().bank);
  const [round, setRound] = useState(null);
  const [history, setHistory] = useState([]);
  const liveRef = useRef(null); // the open position while the case unfolds
  const tapeRef = useRef(null); // the running market: t, points, pause state
  const [, setTapeTick] = useState(0); // re-render pulse while the tape plays

  // the career persists — this is the "something to lose"
  useEffect(() => {
    saveCareer({ bank: bankroll, marcus: marcusBank, runs: loadCareer().runs });
  }, [bankroll, marcusBank]);

  const c = order[i];
  const seen = history.map((h) => h.case); // revealed cases, in order
  const marcusD = c ? loudOf(c) : 0; // Marcus always follows the loudest voice
  // Marcus is a person, not a bot: his last two results set his mood, and his
  // mood sets his size. Two wins → invincible, $2,000. Two losses → scared,
  // $500. He sizes on FEELINGS, not conviction — the anti-model, alive.
  const mh = history.slice(-2).map((h) => h.marcusPnl);
  const marcusMood = mh.length === 2 ? (mh.every((x) => x > 0) ? 'hot' : mh.every((x) => x < 0) ? 'scared' : 'even') : 'even';
  const marcusSize = marcusMood === 'hot' ? 2000 : marcusMood === 'scared' ? 500 : 1000;

  function commit(chosenDir) {
    const d = chosenDir === undefined ? dir : chosenDir;
    const bet = d === 0 ? 0 : size;
    const pnl = d === 0 ? 0 : Math.round(d * bet * (c.out.move / 100));
    const correct = d !== 0 && d === c.out.dir;
    // insight: did they point at a case with the same hidden shape?
    let rhymeResult = null;
    if (rhyme != null && seen[rhyme]) {
      rhymeResult = { target: seen[rhyme], good: seen[rhyme].fam === c.fam };
    }
    const bonus = rhymeResult?.good ? RHYME_BONUS : 0;
    const reasonClue = d !== 0 && reason != null ? c.clues[reason] : null;
    const marcusPnl = Math.round(marcusD * marcusSize * (c.out.move / 100)); // he never sits out, always holds
    const base = {
      case: c,
      rhymeResult,
      reasonLabel: reasonClue ? reasonClue.label : null,
      reasonRight: reasonClue ? reasonClue.side === c.out.dir : null, // did what you leaned on hold?
      marcusD,
      marcusPnl,
    };

    // Cases with a path don't resolve — they PLAY. The tape starts rolling.
    if (c.beats && c.beats.length > 0 && d !== 0) {
      liveRef.current = {
        d,
        stakes: [{ amt: bet, entryP: 100 }],
        orig: [{ amt: bet, entryP: 100 }],
        realized: 0,
        events: [],
        base,
        bonus,
      };
      tapeRef.current = { t: 0, pts: [], fired: {}, paused: false, activeEv: null, lastEv: null, lastResume: -1, soldOut: false };
      setPhase('live');
      return;
    }

    const rec = {
      ...base,
      d,
      bet,
      pnl,
      correct,
      soldEarly: false,
      missed: 0,
    };
    setRound(rec);
    setHistory((h) => [...h, rec]);
    setMarcusBank((v) => v + marcusPnl);
    const newBank = bankroll + pnl + bonus;
    setBankroll(newBank);
    setPhase(newBank < BUST_FLOOR ? 'bust' : 'reveal'); // go broke → you're out
  }

  // THE TAPE — the market runs; you act while it moves; the tape finishes with
  // or without you. Exits are graded by what you sold ON, not what the price did.
  useEffect(() => {
    if (phase !== 'live') return;
    let raf;
    let last = performance.now();
    const step = (now) => {
      const T = tapeRef.current;
      const L = liveRef.current;
      if (!T || !L || phase !== 'live') return;
      const dt = now - last;
      last = now;
      if (!T.paused) {
        T.t = Math.min(1, T.t + dt / TAPE_MS);
        T.pts.push({ t: T.t, p: priceAt(c, T.t) });
        if (T.pts.length > 400) T.pts.splice(0, T.pts.length - 400);
        // news lands at its waypoint and STOPS the tape — decision space
        c.beats.forEach((b, k) => {
          const evT = (k + 1) / (c.beats.length + 1);
          if (T.t >= evT && T.fired[k] === undefined) {
            T.fired[k] = T.t;
            if (!T.soldOut) {
              T.paused = true;
              T.activeEv = k;
            }
          }
        });
        if (T.t >= 1) {
          finishTape();
          return;
        }
      }
      setTapeTick((x) => x + 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, c]);

  // which news is the player reacting to right now? (paused on it, or just after)
  function tapeAttr() {
    const T = tapeRef.current;
    if (!T) return null;
    if (T.paused && T.activeEv != null) return c.beats[T.activeEv];
    if (T.lastEv != null && T.t - T.lastResume < 0.05) return c.beats[T.lastEv];
    return null;
  }

  function tapeResume() {
    const T = tapeRef.current;
    if (!T) return;
    T.lastEv = T.activeEv;
    T.lastResume = T.t;
    T.activeEv = null;
    T.paused = false;
  }

  function tapeAct(action) {
    const T = tapeRef.current;
    const L = liveRef.current;
    if (!T || !L || L.stakes.length === 0) return;
    const p = priceAt(c, T.t);
    const attr = tapeAttr();
    L.events.push({ action, p, t: T.t, kind: attr ? attr.kind : null, side: attr ? attr.side : 0 });
    if (action === 'add') L.stakes.push({ amt: 500, entryP: p });
    if (action === 'trim') {
      L.realized += Math.round(pnlAt(L.stakes, L.d, p) / 2);
      L.stakes = L.stakes.map((s) => ({ ...s, amt: s.amt / 2 }));
    }
    if (action === 'exit') {
      L.realized += pnlAt(L.stakes, L.d, p);
      L.stakes = [];
      T.soldOut = true; // the tape keeps rolling — you watch what you left
    }
    if (T.paused) tapeResume();
  }

  function finishTape() {
    const L = liveRef.current;
    const T = tapeRef.current;
    if (!L) return;
    const endP = c.path[c.path.length - 1];
    const pnl = L.realized + pnlAt(L.stakes, L.d, endP);
    const pnlEndFull = pnlAt(L.orig, L.d, endP);
    const exitEv = L.events.find((e) => e.action === 'exit');
    // graded by what you sold ON: 'fact' | 'noise' | 'price' | null
    const exitWhy = exitEv ? (exitEv.kind === 'fact' && exitEv.side === -L.d ? 'fact' : exitEv.kind ? 'noise' : 'price') : null;
    const rec = {
      ...L.base,
      d: L.d,
      bet: L.orig.reduce((a, s) => a + s.amt, 0) + L.events.filter((e) => e.action === 'add').length * 500,
      pnl,
      correct: L.d === c.out.dir,
      soldEarly: !!exitEv,
      exitP: exitEv ? exitEv.p : endP,
      endP,
      missed: pnlEndFull - pnl,
      exitWhy,
      deadHold: !exitEv && c.beats.some((b) => b.kind === 'fact' && b.side === -L.d),
      heldNoise: !exitEv && c.beats.some((b) => b.kind === 'noise' && b.side === -L.d),
      events: L.events,
      trims: L.events.filter((e) => e.action === 'trim').length,
    };
    liveRef.current = null;
    tapeRef.current = null;
    setRound(rec);
    setHistory((h) => [...h, rec]);
    setMarcusBank((v) => v + rec.marcusPnl);
    const newBank = bankroll + pnl + L.bonus;
    setBankroll(newBank);
    setPhase(newBank < BUST_FLOOR ? 'bust' : 'reveal');
  }

  function next() {
    if (i + 1 >= order.length) return setPhase('done');
    setI(i + 1);
    setDir(0);
    setRhyme(null);
    setReason(null);
    setRound(null);
    liveRef.current = null;
    tapeRef.current = null;
    setPhase('decide');
  }

  function startChapter(ch) {
    setChapter(ch);
    setSeed((x) => x + 1);
    setI(0);
    setDir(0);
    setRhyme(null);
    setReason(null);
    setRunStart(bankroll); // the career fund CARRIES — no reset between chapters
    setRound(null);
    setHistory([]);
    setPhase('decide');
  }

  function restart() {
    setChapter(null);
    setPhase('select');
  }

  function newCareer() {
    saveCareer({ bank: 10000, marcus: 10000, runs: 0 });
    setBankroll(10000);
    setMarcusBank(10000);
    setRunStart(10000);
    setChapter(null);
    setPhase('select');
  }

  if (phase === 'intro') {
    return (
      <div className="core">
        <div className="core-intro">
          <p className="core-kicker">10 real moments from history</p>
          <h1 className="core-h1">These all really happened. We hid the names. Would you have seen it coming?</h1>

          <details className="core-basics">
            <summary>New to stocks? 20 seconds of basics ▾</summary>
            <p>
              A <strong>stock</strong> is a small piece of a real company. Its <strong>price</strong> is what you pay to
              own one piece.
            </p>
            <p>
              Think of buying a corner shop that earns $10,000 a year. If the owner asks $50,000 — fair, you earn it
              back in 5 years. If they ask $2,000,000 — that’s 200 years of profits. Crazy, even for a great shop.
            </p>
            <p>
              So two clues sound alike but are different: <strong>“Which way the price has been going”</strong> is what
              people have been paying lately (the asking price is rising). <strong>“Is the price fair for what you
              get?”</strong> compares the price to what the company actually earns. A stock can be climbing AND
              absurdly overpriced at the same time — that is where most money is lost.
            </p>
          </details>

          <ul className="core-rules">
            <li>Real situations from stock-market history — with the clues people saw at the time.</li>
            <li>
              Every clue shows which way it points — <span className="rule-up">says UP</span> or{' '}
              <span className="rule-down">says DOWN</span> — and how loud it is. Loud is not the same as true.
            </li>
            <li>
              Call UP or DOWN, choose how much to bet, and <strong>tap the one clue that’s carrying your call</strong> —
              or sit out if you can’t tell.
            </li>
            <li>
              Then the reveal: which famous company it was, what really happened — and whether the thing you leaned on
              held.
            </li>
            <li className="rule-hint">One more thing: history has habits. Watch closely.</li>
          </ul>
          <button className="core-primary" onClick={() => setPhase('select')}>
            Choose a chapter →
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'select') {
    return (
      <div className="core">
        <div className="core-intro">
          <p className="core-kicker">pick a chapter</p>
          <h1 className="core-h1">Each chapter hides one question. Find it by playing.</h1>

          <div className="career-bar">
            <div className={`career-side you ${bankroll >= marcusBank ? 'lead' : ''}`}>
              <span className="career-name">You</span>
              <span className="career-amt">{money(bankroll)}</span>
            </div>
            <span className="career-vs">vs</span>
            <div className={`career-side marcus ${marcusBank > bankroll ? 'lead' : ''}`}>
              <span className="career-name">💬 Marcus</span>
              <span className="career-amt">{money(marcusBank)}</span>
            </div>
          </div>
          <div className="civic-bar">
            <div className="civic-head">
              <span>🚗 The Civic</span>
              <strong>{bankroll >= CIVIC ? 'you could buy it today' : `${money(CIVIC - bankroll)} to go`}</strong>
            </div>
            <div className="civic-track">
              <span style={{ width: `${Math.min(100, Math.round((bankroll / CIVIC) * 100))}%` }} />
            </div>
            <p className="civic-cap">
              {bankroll < 2500
                ? 'Bus pass. Instant noodles. The guitar’s back on Marketplace.'
                : bankroll < 8000
                  ? 'Every dollar in this fund is a Saturday you already worked.'
                  : bankroll < 13000
                    ? 'More than halfway to the Civic. Keep your head.'
                    : bankroll < CIVIC
                      ? 'So close you can smell the seats. Don’t do anything silly.'
                      : 'You could buy it today — or keep it invested and keep riding the bus. People face this exact choice.'}
            </p>
          </div>

          <p className="career-note">
            One fund, one career — it carries across every chapter. Marcus bets every round, always big, always with
            the loudest voice. Outlast him.{' '}
            <button className="career-reset" onClick={newCareer}>
              start a fresh career
            </button>
          </p>

          <div className="chapter-list">
            {CHAPTERS.map((ch) => (
              <button key={ch.id} className={`chapter-tile ${ch.mixed ? 'exam' : ''}`} onClick={() => startChapter(ch)}>
                <span className="ch-label">{ch.label}</span>
                <span className="ch-teaser">{ch.teaser}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'bust') {
    return (
      <div className="core">
        <div className="core-intro bust">
          <p className="core-kicker">career over</p>
          <h1 className="core-h1 bust-h1">You’re out.</h1>
          <p className="bust-line">
            The market didn’t end your run — your bet sizes did. Every case you were wrong about was survivable. The
            amounts weren’t.
          </p>
          <p className="bust-line">
            This is the first rule, and now you’ve felt it: <strong>stay in the game.</strong> The best call in the
            world is worthless if you’re not around to make the next one.
          </p>
          {marcusBank > 0 && (
            <p className="bust-line marcus-taunt">Marcus is still in, sitting on {money(marcusBank)}. That should sting a little.</p>
          )}
          <button className="core-primary" onClick={newCareer}>
            Start a new career →
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'done')
    return (
      <CoreReport
        chapter={chapter}
        history={history}
        bankroll={bankroll}
        runStart={runStart}
        marcusBank={marcusBank}
        onRestart={restart}
      />
    );

  // Rhyming lives in The Exam only: themed chapters share one shape (trivial to
  // rhyme, and the confirmation line would leak the hidden question early).
  const seenRhymable = !!chapter?.mixed && seen.length >= RHYME_FROM;

  return (
    <div className="core">
      <div className="core-top">
        <span>
          Moment {i + 1} of {order.length}
        </span>
        <span className="core-bank">{money(bankroll)}</span>
      </div>

      <div className="core-situation">
        <h2 className="core-title">{c.title}</h2>
        <p className="core-sub">{c.sub}</p>
      </div>

      <p className="core-clue-hint">
        {phase === 'decide'
          ? dir === 0
            ? 'The clues people saw at the time:'
            : 'Now tap the ONE clue that’s carrying your call:'
          : 'The clues, and what you leaned on:'}
      </p>
      <div className="core-signals">
        {c.clues.map((g, k) => {
          const isReason = reason === k;
          const leanable = phase === 'decide' && dir !== 0;
          const body = (
            <>
              <span className={`cs-side ${g.side > 0 ? 'up' : 'down'}`}>{g.side > 0 ? 'says UP' : 'says DOWN'}</span>
              <span className="cs-body">
                <span className="cs-label">
                  {g.label}
                  {isReason && <em className="cs-lean-tag"> · {phase === 'decide' ? 'you’re leaning on this' : 'what you leaned on'}</em>}
                </span>
                <span className="cs-read">{g.text}</span>
                <span className="cs-loud">{STRENGTH[g.s - 1]}</span>
              </span>
            </>
          );
          if (leanable)
            return (
              <button
                key={k}
                className={`core-sig leanable ${g.side > 0 ? 'bull' : 'bear'} ${isReason ? 'leaned' : ''}`}
                onClick={() => setReason(isReason ? null : k)}
              >
                {body}
              </button>
            );
          return (
            <div key={k} className={`core-sig ${g.side > 0 ? 'bull' : 'bear'} ${isReason ? 'leaned' : ''}`}>
              {body}
            </div>
          );
        })}
      </div>

      {phase === 'decide' && (
        <div className="core-decide">
          <div className="core-marcus">
            <span className="cm-who">💬 Marcus{marcusMood === 'hot' ? ' · on a heater' : marcusMood === 'scared' ? ' · down bad' : ''}</span>
            <span className="cm-text">
              {marcusMood === 'hot'
                ? `i literally cannot miss right now. going DOUBLE — $2,000 on ${marcusD > 0 ? 'UP' : 'DOWN'} 🚀🚀`
                : marcusMood === 'scared'
                  ? `i’m down bad man… only $500 on ${marcusD > 0 ? 'UP' : 'DOWN'} this time. i hate this feeling`
                  : marcusD > 0
                    ? 'loudest clue says UP — that’s enough for me. $1,000 in 🚀'
                    : 'the loud one says DOWN. $1,000 says it drops 📉'}
            </span>
          </div>

          {seenRhymable && (
            <div className="core-rhyme">
              <p className="core-rhyme-q">Does this one remind you of one you’ve already seen? (optional — noticing pays {money(RHYME_BONUS)})</p>
              <div className="core-rhyme-chips">
                {seen.map((sc, k) => (
                  <button
                    key={k}
                    className={`rhyme-chip ${rhyme === k ? 'sel' : ''}`}
                    onClick={() => setRhyme(rhyme === k ? null : k)}
                  >
                    {sc.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="core-q">So — what happened next?</p>
          <div className="core-dirs">
            <button className={`core-dir up ${dir === 1 ? 'sel' : ''}`} onClick={() => setDir(1)}>
              ▲ It went UP
            </button>
            <button className={`core-dir down ${dir === -1 ? 'sel' : ''}`} onClick={() => setDir(-1)}>
              ▼ It went DOWN
            </button>
          </div>
          {dir !== 0 && (
            <>
              <p className="core-q small">How sure are you?</p>
              <div className="core-sizes">
                {[250, 500, 1000].map((v) => (
                  <button key={v} className={`core-size ${size === v ? 'sel' : ''}`} onClick={() => setSize(v)}>
                    {money(v)}
                    <span>{v === 250 ? 'just a hunch' : v === 500 ? 'fairly sure' : 'very sure'}</span>
                  </button>
                ))}
              </div>
              {reason == null ? (
                <p className="core-lean-nudge">☝ tap the clue above that’s carrying your call — then you can bet</p>
              ) : (
                <>
                  {(() => {
                    // your thesis, written back to you — with the steelman
                    const r = c.clues[reason];
                    const counter = c.clues.filter((g) => g.side === -dir).sort((a, b) => b.s - a.s)[0];
                    return (
                      <div className="thesis-card">
                        <p className="th-h">Your thesis</p>
                        <p className="th-line">
                          <strong>{dir > 0 ? 'UP' : 'DOWN'}</strong> — because “{r.text}.”
                        </p>
                        {counter && (
                          <p className="th-counter">
                            The strongest voice against you: “{counter.text}” ({STRENGTH[counter.s - 1]}).
                          </p>
                        )}
                      </div>
                    );
                  })()}
                  <button className="core-primary" onClick={() => commit()}>
                    Commit {money(size)} to this thesis →
                  </button>
                </>
              )}
            </>
          )}
          <button className="core-skip" onClick={() => commit(0)}>
            Can’t tell — sit this one out, bet nothing
          </button>
        </div>
      )}

      {phase === 'live' &&
        liveRef.current &&
        tapeRef.current &&
        (() => {
          const L = liveRef.current;
          const T = tapeRef.current;
          const p = priceAt(c, T.t);
          const now = L.realized + pnlAt(L.stakes, L.d, p);
          const total = L.stakes.reduce((a, s) => a + s.amt, 0);
          const out = L.stakes.length === 0;
          // draw the tape so far
          const pts = T.pts;
          const allP = [100, ...c.path];
          const lo = Math.min(...allP) - 6;
          const hi = Math.max(...allP) + 6;
          const W = 320;
          const H = 130;
          const X = (t) => 4 + t * (W - 8);
          const Y = (v) => 4 + (1 - (v - lo) / (hi - lo)) * (H - 8);
          const line = pts.map((q, k) => `${k ? 'L' : 'M'}${X(q.t).toFixed(1)} ${Y(q.p).toFixed(1)}`).join(' ');
          const ev = T.paused && T.activeEv != null ? c.beats[T.activeEv] : null;
          return (
            <div className="core-tape">
              <div className="tape-top">
                <span className={`tape-price ${p >= 100 ? 'up' : 'down'}`}>
                  {p >= 100 ? '▲' : '▼'} {Math.abs(Math.round(p - 100))}% since you got in
                </span>
                <span className={`tape-pnl ${now >= 0 ? 'up' : 'down'}`}>
                  {out ? 'out · banked ' : total ? '' : ''}
                  {now >= 0 ? '+' : '−'}
                  {money(Math.abs(now))}
                </span>
              </div>
              <svg className="tape-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                <line x1="0" y1={Y(100)} x2={W} y2={Y(100)} className="mp-entry" />
                {pts.length > 1 && <path d={line} className={`mp-line ${p >= 100 ? 'up' : 'down'}`} fill="none" />}
                {pts.length > 0 && <circle cx={X(T.t)} cy={Y(p)} r="3" className="tape-dot" />}
              </svg>

              {ev ? (
                <div className="tape-news">
                  <p className="tn-text">{ev.news}</p>
                  <div className="core-marcus">
                    <span className="cm-who">💬 Marcus</span>
                    <span className="cm-text">{ev.marcus}</span>
                  </div>
                  {L.base.reasonLabel && !out && (
                    <p className="tn-reason">
                      Your reason for being in: “{L.base.reasonLabel.toLowerCase()}.” Does this actually change it?
                    </p>
                  )}
                  <button className="tape-resume" onClick={tapeResume}>
                    ▶ Keep watching
                  </button>
                </div>
              ) : (
                <p className="tape-hint">{out ? 'You’re out — watching from the sidelines.' : 'The market is moving. You can act any time.'}</p>
              )}

              {!out && (
                <div className="beat-actions">
                  <button className="beat-btn add" onClick={() => tapeAct('add')}>
                    ➕ Buy $500 more
                  </button>
                  <button className="beat-btn trim" onClick={() => tapeAct('trim')}>
                    Sell half
                  </button>
                  <button className="beat-btn sell" onClick={() => tapeAct('exit')}>
                    Sell everything
                  </button>
                </div>
              )}
            </div>
          );
        })()}

      {phase === 'reveal' && round && (
        <div className="core-reveal">
          <p className="core-reveal-name">
            This was <strong>{c.name}</strong>
          </p>
          <div className={`core-outcome ${c.out.dir > 0 ? 'up' : 'down'}`}>
            It went {c.out.dir > 0 ? 'UP' : 'DOWN'} {Math.abs(c.out.move)}% {c.out.when}
          </div>
          <div className={`core-pnl ${round.pnl > 0 ? 'up' : round.pnl < 0 ? 'down' : ''}`}>
            {round.d === 0 ? (
              'You sat out — nothing risked, nothing made'
            ) : (
              <>
                You {round.pnl >= 0 ? 'made ' : 'lost '}
                <CountUp to={round.pnl} prefix={round.pnl >= 0 ? '+' : '−'} />
              </>
            )}
          </div>

          {round.events && round.events.length >= 0 && c.path && (
            <div className="mini-wrap">
              <MiniPath cse={c} events={round.events} />
              <p className="mini-cap">
                the whole ride — ▲ where you bought more · ◆ where you sold half · ▼ where you got out
              </p>
            </div>
          )}

          {round.exitWhy === 'fact' && (
            <p className="core-exit-note good">
              You sold because the FACTS changed — that is the right reason to sell, whatever the price did next.
            </p>
          )}
          {round.exitWhy === 'noise' && (
            <p className="core-exit-note bad">
              You sold on a scary headline — one that changed nothing real about the company.
            </p>
          )}
          {round.exitWhy === 'price' && (
            <p className="core-exit-note bad">
              You sold when nothing had happened — except the price. The number scared you, not the facts.
            </p>
          )}
          {!round.soldEarly && round.deadHold && !round.correct && (
            <p className="core-exit-note bad">
              Mid-way, the facts turned against your reason for being in — and you stayed anyway. Staying loyal to a
              dead idea is the expensive kind of loyalty.
            </p>
          )}
          {!round.soldEarly && round.correct && round.heldNoise && (
            <p className="core-exit-note good">
              Scary headlines and a wild price came for you — and you held, because the facts behind your reason never
              changed. That is the skill.
            </p>
          )}

          {round.soldEarly && (
            <p className={`core-exit-note ${round.missed > 0 ? 'bad' : 'good'}`}>
              {round.missed > 0
                ? `For the record: holding to the end would have made ${money(round.missed)} more.`
                : `For the record: leaving saved you ${money(Math.abs(round.missed))}.`}
            </p>
          )}

          {round.d !== 0 && Math.abs(round.pnl) >= SHIFT && (
            <p className="core-shifts">
              {round.pnl < 0
                ? `That’s ${Math.round(Math.abs(round.pnl) / SHIFT)} Saturday shifts at the warehouse — gone. 🚗 The Civic is now ${money(Math.max(0, CIVIC - bankroll))} away.`
                : `That’s ${Math.round(round.pnl / SHIFT)} Saturday shifts you’ll never have to work. 🚗 The Civic is now ${money(Math.max(0, CIVIC - bankroll))} away.`}
            </p>
          )}

          {round.d === -1 && round.pnl < -round.bet && (
            <p className="core-short-note">
              Wait — you lost more than your {money(round.bet)} bet? Yes. That’s what betting on a fall does when the
              stock rises instead: your loss grows with the rise. This is real, and it’s why betting against stocks is
              the most dangerous move in investing.
            </p>
          )}

          {(() => {
            // streak: consecutive right calls, counting this one
            let streak = 0;
            for (let k = history.length - 1; k >= 0; k--) {
              if (history[k].d !== 0 && history[k].correct) streak++;
              else break;
            }
            return streak >= 2 ? <p className="core-streak">🔥 {streak} right in a row</p> : null;
          })()}

          <p className={`core-marcus-result ${round.marcusPnl >= 0 ? 'up' : 'down'}`}>
            💬 Marcus {round.marcusPnl >= 0 ? 'made +' : 'lost −'}
            {money(Math.abs(round.marcusPnl))} · score: you {money(bankroll)} — Marcus {money(marcusBank)}
          </p>

          {round.rhymeResult && (
            <p className={`core-rhyme-result ${round.rhymeResult.good ? 'good' : 'bad'}`}>
              {round.rhymeResult.good
                ? `You saw it before we said it: this is the same shape as ${round.rhymeResult.target.short} — ${FAMILIES[c.fam].word}. +${money(RHYME_BONUS)} for noticing. ${FAMILIES[c.fam].question}`
                : `Close — but ${round.rhymeResult.target.short} was ${FAMILIES[round.rhymeResult.target.fam].word}, and this was ${FAMILIES[c.fam].word}. Different shape, no penalty. Keep looking.`}
            </p>
          )}
          {!round.rhymeResult &&
            chapter?.mixed &&
            (() => {
              const kin = seen.slice(0, -1).filter((sc) => sc.fam === c.fam);
              return kin.length > 0 ? (
                <p className="core-rhyme-result quiet">
                  Worth noticing: this was the same shape as {kin.map((k) => k.short).join(' and ')} — {FAMILIES[c.fam].word}.
                </p>
              ) : null;
            })()}

          {round.reasonLabel && (
            <p className={`core-lean-echo ${round.reasonRight ? 'held' : 'broke'}`}>
              You leaned on “{round.reasonLabel}” — {round.reasonRight ? 'and it held.' : 'and it broke.'}
            </p>
          )}

          {(() => {
            // The human mistake: you READ the warning and decided it didn't matter.
            if (round.d === 0 || round.correct) return null;
            const warned = c.clues
              .filter((g) => g.side === c.out.dir && g.s >= 2)
              .sort((a, b) => b.s - a.s)[0];
            return warned ? (
              <p className="core-regret">
                You read “{warned.label}” — “{warned.text}.” You decided it didn’t matter. It was the one that
                mattered.
              </p>
            ) : null;
          })()}

          <p className="core-story">{c.story}</p>
          <p className="core-fair">
            {c.fair.note}{' '}
            {round.d !== 0 &&
              (c.fair.dir === 0
                ? round.correct
                  ? 'You called a coin flip right — enjoy it, but know it was a flip.'
                  : 'You called a coin flip wrong — that is not a mistake, it was a flip.'
                : round.correct && round.d === c.fair.dir
                  ? 'Your call matched the careful read, and this time history agreed. Clean win.'
                  : round.correct && round.d !== c.fair.dir
                    ? 'You went against the careful read and won. The difference between brave and lucky only shows up over many bets.'
                    : !round.correct && round.d === c.fair.dir
                      ? 'Your thinking was sound — and history went the other way anyway. That is not a mistake. That is investing.'
                      : 'You went against the careful read, and this time it cost you.')}
          </p>
          <button className="core-primary" onClick={next}>
            {i + 1 >= order.length ? 'See how you did across all 10 →' : 'Next moment →'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---- after the chapter: what YOU discovered (not a lecture) --------------- */
function CoreReport({ chapter, history, bankroll, runStart, marcusBank, onRestart }) {
  const bets = history.filter((h) => h.d !== 0);
  const right = bets.filter((h) => h.correct).length;
  const pnl = bankroll - runStart;
  const marcusRun = history.reduce((a, h) => a + (h.marcusPnl || 0), 0);
  const beatMarcus = pnl > marcusRun;
  const withMarcus = bets.filter((h) => h.d === h.marcusD);
  const againstMarcus = bets.filter((h) => h.d === -h.marcusD);
  const againstRight = againstMarcus.filter((h) => h.correct).length;
  const avg = (arr) => (arr.length ? arr.reduce((a, x) => a + x, 0) / arr.length : 0);
  const sureRight = avg(bets.filter((h) => h.correct).map((h) => h.bet));
  const sureWrong = avg(bets.filter((h) => !h.correct).map((h) => h.bet));
  const wellSized = sureRight > sureWrong + 50;

  const rhymesTried = history.filter((h) => h.rhymeResult).length;
  const rhymesRight = history.filter((h) => h.rhymeResult?.good).length;

  // Which shapes did this run actually contain (2+ members = a discoverable rhyme)?
  const byFam = {};
  history.forEach((h) => {
    (byFam[h.case.fam] = byFam[h.case.fam] || []).push(h.case.short);
  });
  const shapes = Object.entries(byFam).filter(([, v]) => v.length >= 2);

  const afterLoss = [];
  const afterWin = [];
  for (let k = 1; k < history.length; k++) {
    const prev = history[k - 1];
    const cur = history[k];
    if (cur.d === 0) continue;
    if (prev.pnl < 0) afterLoss.push(cur.bet);
    else if (prev.pnl > 0) afterWin.push(cur.bet);
  }
  const aL = avg(afterLoss);
  const aW = avg(afterWin);

  // The framework detector. Great investors DON'T judge from scratch each time —
  // they carry frameworks. So we never say "drop your rule." We show the rule
  // its own boundary: exactly where it earned, and exactly where it cost.
  const opposed = bets.filter((h) => h.d === -loudOf(h.case));
  const followed = bets.filter((h) => h.d === loudOf(h.case));
  const boundary = (group, name) => {
    const wins = group.filter((h) => h.correct).map((h) => h.case.short);
    const costs = group.filter((h) => !h.correct).map((h) => h.case.short);
    let line = `You have a framework: ${group.length} of your ${bets.length} bets ${name}. `;
    if (wins.length) line += `It earned on ${wins.join(', ')}. `;
    if (costs.length) line += `It cost you ${costs.join(', ')}. `;
    line +=
      'The best investors don’t throw their framework away — they learn exactly where it stops working. That edge is worth more than the rule itself.';
    return line;
  };
  const ruleLine =
    bets.length >= 4 && opposed.length >= bets.length * 0.7
      ? boundary(opposed, 'went AGAINST the loudest voice')
      : bets.length >= 4 && followed.length >= bets.length * 0.7
        ? boundary(followed, 'went WITH the loudest voice')
        : null;

  // THE TRUST LEDGER: which sources did you let carry your calls — and how did
  // each one actually treat you? Your own track record, per source. Not a rule.
  const trust = {}; // label -> { used, right }
  const availableLabels = new Set();
  history.forEach((h) => {
    h.case.clues.forEach((g) => availableLabels.add(g.label));
    if (h.reasonLabel) {
      trust[h.reasonLabel] = trust[h.reasonLabel] || { used: 0, right: 0 };
      trust[h.reasonLabel].used += 1;
      if (h.correct) trust[h.reasonLabel].right += 1;
    }
  });
  const trustRows = Object.entries(trust).sort((a, b) => b[1].used - a[1].used);
  const neverTrusted = [...availableLabels].filter((l) => !trust[l]);
  // overridden warnings: you bet against a strong clue that history proved right
  const overrides = bets.filter(
    (h) => !h.correct && h.case.clues.some((g) => g.side === h.case.out.dir && g.s >= 2),
  ).length;
  let lookLine = null;
  if (trustRows.length > 0 && history.length >= 4) {
    const parts = trustRows.map(([l, t]) => `“${l}” carried ${t.used} call${t.used > 1 ? 's' : ''} — ${t.right} held`);
    lookLine =
      `Your trust ledger: ${parts.join(' · ')}.` +
      (neverTrusted.length > 0 ? ` You never once leaned on “${neverTrusted[0]}”.` : '') +
      (overrides >= 2
        ? ` And ${overrides} times you read a strong warning, decided it didn’t matter — and it did. The clue was on the table. The talking-yourself-out-of-it was yours.`
        : '');
  }

  const best = bets.length ? Math.max(...bets.map((h) => h.pnl)) : 0;
  const concentrated = pnl > 0 && best > pnl * 0.6;

  return (
    <div className="core">
      <div className="core-report">
        <p className="core-kicker">{chapter ? `${chapter.label} · every moment really happened` : 'every moment really happened'}</p>
        <h1 className="core-h1">
          You called {right} of {bets.length} right{rhymesRight > 0 ? ` — and spotted ${rhymesRight} rhyme${rhymesRight > 1 ? 's' : ''} in history.` : '.'}
        </h1>

        {chapter?.question ? (
          <div className="core-quest">
            <p className="core-quest-k">Did you feel it? Every moment in this chapter was asking the same question:</p>
            <p className="core-quest-q">“{chapter.question}”</p>
            <p className="core-quest-t">{chapter.revealText}</p>
          </div>
        ) : chapter?.mixed ? (
          <p className="core-quest-t exam">{chapter.revealText}</p>
        ) : null}

        <div className={`report-vs ${beatMarcus ? 'won' : 'lost'}`}>
          {beatMarcus
            ? `You beat Marcus this chapter: ${pnl >= 0 ? '+' : '−'}${money(Math.abs(pnl))} to ${marcusRun >= 0 ? '+' : '−'}${money(Math.abs(marcusRun))}. Careers: you ${money(bankroll)}, him ${money(marcusBank)}.`
            : `Marcus beat you this chapter: his ${marcusRun >= 0 ? '+' : '−'}${money(Math.abs(marcusRun))} to your ${pnl >= 0 ? '+' : '−'}${money(Math.abs(pnl))}. A handful of bets is short — loud and lucky look identical over ten. The career is the real scoreboard: you ${money(bankroll)}, him ${money(marcusBank)}.`}
        </div>

        <div className="core-stats">
          <div className="core-stat">
            <span className={pnl >= 0 ? 'up' : 'down'}>
              {pnl >= 0 ? '+' : '−'}
              {money(Math.abs(pnl))}
            </span>
            your money result
          </div>
          <div className="core-stat big">
            <span>
              {right}/{bets.length}
            </span>
            calls that matched history
          </div>
          {chapter?.mixed ? (
            <div className="core-stat">
              <span>
                {rhymesRight}/{rhymesTried || 0}
              </span>
              shapes you noticed
            </div>
          ) : (
            <div className="core-stat">
              <span>{history.length - bets.length}</span>
              times you sat out
            </div>
          )}
        </div>

        <p className="core-cal">
          {wellSized
            ? 'You bet bigger on the calls you got right and smaller on the ones you got wrong — your confidence matched your judgment. That is a real skill, and most people never build it.'
            : 'You bet about as much when you were wrong as when you were right. Being sure and being right are not the same thing — noticing that gap is the whole skill.'}
        </p>

        {bets.length >= 4 && withMarcus.length >= bets.length * 0.7 && (
          <p className="core-cal mirror">
            You bet the same way as Marcus {withMarcus.length} of {bets.length} times. Maybe you both read it right —
            or maybe his voice was in the room while you decided. Worth knowing which.
          </p>
        )}
        {againstMarcus.length >= 3 && (
          <p className="core-cal mirror">
            When you disagreed with Marcus, you were right {againstRight} of {againstMarcus.length} times. That number
            — not the money — is whether you have your own eyes.
          </p>
        )}

        <p className="core-lesson-h pattern-h">The pattern you’re developing:</p>

        {(() => {
          const factExits = bets.filter((h) => h.exitWhy === 'fact').length;
          const noiseExits = bets.filter((h) => h.exitWhy === 'noise').length;
          const priceExits = bets.filter((h) => h.exitWhy === 'price').length;
          const deadHolds = bets.filter((h) => h.deadHold && !h.correct).length;
          if (factExits + noiseExits + priceExits + deadHolds === 0) return null;
          return (
            <p className="core-cal mirror">
              Why you sell: {factExits} time{factExits === 1 ? '' : 's'} because the facts changed · {noiseExits} on
              scary headlines that changed nothing · {priceExits} on the price alone.
              {deadHolds > 0 &&
                ` And ${deadHolds} time${deadHolds === 1 ? '' : 's'} the facts turned against you and you stayed anyway.`}{' '}
              Selling for the right reason matters more than selling at the right price.
            </p>
          );
        })()}

        {(() => {
          const shaken = bets.filter((h) => h.soldEarly && h.correct && h.missed > 100);
          return shaken.length >= 1 ? (
            <p className="core-cal mirror">
              You got shaken out {shaken.length === 1 ? 'once' : `${shaken.length} times`} — right call, sold on the
              wiggle ({shaken.map((h) => h.case.short).join(', ')}). The market’s favorite meal is a good thesis held
              with a weak grip.
            </p>
          ) : null;
        })()}

        {lookLine && <p className="core-cal mirror">{lookLine}</p>}

        {ruleLine && <p className="core-cal mirror">{ruleLine}</p>}

        {afterLoss.length > 0 && afterWin.length > 0 && Math.abs(aL - aW) > 75 && (
          <p className="core-cal mirror">
            {aL < aW
              ? `One more thing we noticed: right after a loss, your bets shrank (about ${money(Math.round(aL))} on average, versus ${money(Math.round(aW))} after a win). The clues didn’t change — your feelings did. Everyone does this. Almost nobody notices.`
              : `One more thing we noticed: right after a loss, your bets got BIGGER (about ${money(Math.round(aL))} on average, versus ${money(Math.round(aW))} after a win). Trying to win it back fast is how small losses become big ones.`}
          </p>
        )}

        {concentrated && (
          <p className="core-cal mirror">
            And look closely at your money result: {money(best)} of your +{money(pnl)} came from a single call. That is
            how real markets work — a few giant winners carry everything. It is also why owning a little of everything
            (a simple fund that holds the whole market) works so well in real life: it guarantees you never miss the
            one that carries the decade.
          </p>
        )}

        {chapter?.mixed && shapes.length > 0 && (
          <div className="core-lesson">
            <p className="core-lesson-h">The shapes hiding in this run — did you feel them?</p>
            {shapes.map(([fam, names]) => (
              <p key={fam}>
                <strong>{names.join(' · ')}</strong> — all {FAMILIES[fam].word}. {FAMILIES[fam].question}
              </p>
            ))}
          </div>
        )}

        {chapter?.mixed && (
          <p className="core-verdict">
            Same shapes, different endings — that is the point. The shape never tells you the answer. It tells you
            which question to ask.
          </p>
        )}
        <button className="core-primary" onClick={onRestart}>
          Choose another chapter →
        </button>
      </div>
    </div>
  );
}
