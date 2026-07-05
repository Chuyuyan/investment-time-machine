import { useMemo, useState } from 'react';
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
      { side: 1, s: 3, label: 'The price lately', text: 'it tripled last year and is still climbing' },
      { side: 1, s: 3, label: 'Online buzz', text: 'everyone online says it simply cannot lose' },
      { side: -1, s: 3, label: 'How expensive it is', text: 'one of the most expensive prices a stock has ever had' },
      { side: -1, s: 2, label: 'What the bosses did', text: 'the bosses sold hundreds of millions of dollars of their own shares' },
    ],
    out: { dir: 1, move: 140, when: 'over the next six months' },
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
      { side: 1, s: 3, label: 'The price lately', text: 'up 1,500% in three weeks' },
      { side: 1, s: 3, label: 'Online buzz', text: 'the whole internet is screaming “buy” at once' },
      { side: -1, s: 3, label: 'The company’s real results', text: 'a shrinking mall store that loses money every year' },
      { side: -1, s: 2, label: 'What the experts say', text: 'nearly every expert says this will end badly' },
    ],
    out: { dir: -1, move: -85, when: 'within a month' },
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
      { side: 1, s: 3, label: 'How expensive it is', text: 'priced far below everything the bank owns on paper' },
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
      { side: -1, s: 2, label: 'The price lately', text: 'down 75% in a year' },
      { side: -1, s: 2, label: 'News headlines', text: 'story after story saying the company wasted billions and lost its way' },
      { side: 1, s: 3, label: 'The company’s real results', text: 'still earns tens of billions in profit every year' },
      { side: 1, s: 3, label: 'How expensive it is', text: 'the cheapest it has ever been compared to its profits' },
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
      { side: 1, s: 3, label: 'How expensive it is', text: 'the lowest price in thirty years' },
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
      { side: 1, s: 2, label: 'How expensive it is', text: 'cheap compared to those profits' },
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
      { side: 1, s: 3, label: 'The price lately', text: 'up 700% in a year' },
      { side: 1, s: 3, label: 'Online buzz', text: 'every school, office and family on earth uses it daily' },
      { side: -1, s: 3, label: 'How expensive it is', text: 'the price only makes sense if lockdowns last forever' },
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
      { side: 1, s: 2, label: 'How expensive it is', text: 'cheap compared to its steady profits' },
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
      { side: 1, s: 2, label: 'The price lately', text: 'doubled in the last year' },
      { side: 1, s: 3, label: 'Online buzz', text: '“the internet is the future, and this company IS the internet”' },
      { side: 1, s: 2, label: 'The company’s real results', text: 'it really does sell the equipment the internet runs on' },
      { side: -1, s: 3, label: 'How expensive it is', text: 'priced at two hundred years’ worth of its own profits' },
    ],
    out: { dir: -1, move: -80, when: 'over the next two years' },
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
      { side: -1, s: 2, label: 'The price lately', text: 'the stock nearly halved' },
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
      { side: 1, s: 2, label: 'How expensive it is', text: 'the lowest price in twenty years' },
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
      { side: -1, s: 2, label: 'The price lately', text: 'down 75% in a few months' },
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
      { side: -1, s: 3, label: 'How expensive it is', text: 'by every normal measure, the price looks absurd' },
      { side: -1, s: 2, label: 'What the experts say', text: '“a bubble” — they have said so for years' },
      { side: 1, s: 2, label: 'Online buzz', text: 'customers love it more every year' },
    ],
    out: { dir: 1, move: 400, when: 'over the next four years' },
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
      { side: 1, s: 2, label: 'The price lately', text: 'tripled in a month' },
      { side: -1, s: 3, label: 'The company’s real results', text: 'zero trucks sold, zero money earned — ever' },
      { side: -1, s: 2, label: 'How expensive it is', text: 'worth more than Ford, which sells millions of vehicles a year' },
    ],
    out: { dir: -1, move: -95, when: 'over the next 18 months' },
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
      { side: -1, s: 2, label: 'The price lately', text: 'falling for years — now under two dollars' },
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
      { side: 1, s: 2, label: 'How expensive it is', text: 'the cheapest price in its history' },
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
      { side: 1, s: 2, label: 'How expensive it is', text: 'cheap compared to those profits' },
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
  const [bankroll, setBankroll] = useState(10000);
  const [round, setRound] = useState(null);
  const [history, setHistory] = useState([]);

  const c = order[i];
  const seen = history.map((h) => h.case); // revealed cases, in order

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
    const rec = { case: c, d, bet, pnl, correct, rhymeResult };
    setRound(rec);
    setHistory((h) => [...h, rec]);
    setBankroll((v) => v + pnl + bonus);
    setPhase('reveal');
  }

  function next() {
    if (i + 1 >= order.length) return setPhase('done');
    setI(i + 1);
    setDir(0);
    setRhyme(null);
    setRound(null);
    setPhase('decide');
  }

  function startChapter(ch) {
    setChapter(ch);
    setSeed((x) => x + 1);
    setI(0);
    setDir(0);
    setRhyme(null);
    setBankroll(10000);
    setRound(null);
    setHistory([]);
    setPhase('decide');
  }

  function restart() {
    setChapter(null);
    setPhase('select');
  }

  if (phase === 'intro') {
    return (
      <div className="core">
        <div className="core-intro">
          <p className="core-kicker">10 real moments from history</p>
          <h1 className="core-h1">These all really happened. We hid the names. Would you have seen it coming?</h1>
          <ul className="core-rules">
            <li>Real situations from stock-market history, with the clues people saw at the time.</li>
            <li>
              Every clue says which way it points — <span className="rule-up">says UP</span> or{' '}
              <span className="rule-down">says DOWN</span> — and how loud it is. Loud is not the same as true.
            </li>
            <li>Call UP or DOWN and choose how much to bet — or sit out if you can’t tell.</li>
            <li>Then the reveal: which famous company it was, and what really happened next.</li>
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

  if (phase === 'done')
    return <CoreReport chapter={chapter} history={history} bankroll={bankroll} onRestart={restart} />;

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

      <p className="core-clue-hint">The clues people saw at the time:</p>
      <div className="core-signals">
        {c.clues.map((g, k) => (
          <div key={k} className={`core-sig ${g.side > 0 ? 'bull' : 'bear'}`}>
            <span className={`cs-side ${g.side > 0 ? 'up' : 'down'}`}>{g.side > 0 ? 'says UP' : 'says DOWN'}</span>
            <span className="cs-body">
              <span className="cs-label">{g.label}</span>
              <span className="cs-read">{g.text}</span>
              <span className="cs-loud">{STRENGTH[g.s - 1]}</span>
            </span>
          </div>
        ))}
      </div>

      {phase === 'decide' && (
        <div className="core-decide">
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
              <button className="core-primary" onClick={() => commit()}>
                Bet {money(size)} that it went {dir === 1 ? 'UP' : 'DOWN'} →
              </button>
            </>
          )}
          <button className="core-skip" onClick={() => commit(0)}>
            Can’t tell — sit this one out, bet nothing
          </button>
        </div>
      )}

      {phase === 'reveal' && round && (
        <div className="core-reveal">
          <p className="core-reveal-name">
            This was <strong>{c.name}</strong>
          </p>
          <div className={`core-outcome ${c.out.dir > 0 ? 'up' : 'down'}`}>
            It went {c.out.dir > 0 ? 'UP' : 'DOWN'} {Math.abs(c.out.move)}% {c.out.when}
          </div>
          <div className={`core-pnl ${round.pnl > 0 ? 'up' : round.pnl < 0 ? 'down' : ''}`}>
            {round.d === 0
              ? 'You sat out — nothing risked, nothing made'
              : round.pnl >= 0
                ? `You made +${money(round.pnl)}`
                : `You lost −${money(Math.abs(round.pnl))}`}
          </div>

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
function CoreReport({ chapter, history, bankroll, onRestart }) {
  const bets = history.filter((h) => h.d !== 0);
  const right = bets.filter((h) => h.correct).length;
  const pnl = bankroll - 10000;
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
  const loudOf = (kase) => kase.clues.reduce((a, b) => (b.s > a.s ? b : a)).side;
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
