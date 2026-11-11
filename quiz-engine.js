/* Low-hand evaluation for the quiz page. Pure functions, also tested with node. */
(function (root) {
  const SUITS = ["s", "h", "d", "c"];
  // rank: 2..14 (14 = A)
  const RANK_LABEL = { 14: "A", 13: "K", 12: "Q", 11: "J", 10: "10" };
  const label = (r) => RANK_LABEL[r] || String(r);

  function groups(ranks) {
    const m = {};
    ranks.forEach((r) => (m[r] = (m[r] || 0) + 1));
    // sort by count desc, then rank desc
    return Object.entries(m)
      .map(([r, c]) => [+r, c])
      .sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  }
  function cmpArr(a, b) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const x = a[i] ?? -1, y = b[i] ?? -1;
      if (x !== y) return x < y ? -1 : 1;
    }
    return 0;
  }

  /* ---- A-5 low: A=1, straights/flushes ignored. Smaller key = better. ---- */
  function keyA5(cards) {
    const ranks = cards.map((c) => (c.r === 14 ? 1 : c.r));
    const g = groups(ranks);
    const shape = g.map((x) => x[1]).join("");
    const cat = { "11111": 0, "2111": 1, "221": 2, "311": 3, "32": 4, "41": 5 }[shape];
    return [cat, ...g.map((x) => x[0])];
  }
  /* ---- 2-7 low: A high, straights & flushes count. Smaller key = better. ---- */
  function keyDeuce(cards) {
    const ranks = cards.map((c) => c.r);
    const g = groups(ranks);
    const shape = g.map((x) => x[1]).join("");
    const flush = cards.every((c) => c.s === cards[0].s);
    const sorted = [...ranks].sort((a, b) => b - a);
    const straight = shape === "11111" && sorted[0] - sorted[4] === 4; // A-2-3-4-5 is NOT a straight here
    let cat;
    if (straight && flush) cat = 8;
    else if (shape === "41") cat = 7;
    else if (shape === "32") cat = 6;
    else if (flush) cat = 5;
    else if (straight) cat = 4;
    else cat = { "11111": 0, "2111": 1, "221": 2, "311": 3 }[shape];
    return [cat, ...g.map((x) => x[0])];
  }
  /* ---- Badugi: largest rainbow & unpaired subset, then lowest. A=1. ---- */
  function bestBadugi(cards) {
    let best = null;
    const n = cards.length;
    for (let mask = 1; mask < 1 << n; mask++) {
      const sub = cards.filter((_, i) => mask & (1 << i));
      const rs = sub.map((c) => (c.r === 14 ? 1 : c.r));
      const ss = sub.map((c) => c.s);
      if (new Set(rs).size !== rs.length || new Set(ss).size !== ss.length) continue;
      const desc = [...rs].sort((a, b) => b - a);
      const key = [-sub.length, ...desc]; // more cards first, then lower
      if (!best || cmpArr(key, best.key) < 0) best = { key, sub };
    }
    return best;
  }
  function keyBadugi(cards) { return bestBadugi(cards).key; }

  const CAT_A5 = ["ノーペア", "ワンペア", "ツーペア", "スリーカード", "フルハウス", "フォーカード"];
  const CAT_27 = ["ノーペア", "ワンペア", "ツーペア", "スリーカード", "ストレート", "フラッシュ", "フルハウス", "フォーカード", "ストレートフラッシュ"];

  function expand(ranks) { return groups(ranks).flatMap(([r, c]) => Array(c).fill(r)); }
  function describe(mode, cards) {
    if (mode === "a5") {
      const k = keyA5(cards);
      const rs = expand(cards.map((c) => (c.r === 14 ? 1 : c.r)));
      return `${rs.map((r) => (r === 1 ? "A" : label(r))).join("-")}（${CAT_A5[k[0]]}）`;
    }
    if (mode === "27") {
      const k = keyDeuce(cards);
      return `${expand(cards.map((c) => c.r)).map(label).join("-")}（${CAT_27[k[0]]}）`;
    }
    const b = bestBadugi(cards);
    const rs = b.key.slice(1).map((r) => (r === 1 ? "A" : label(r)));
    return `${b.sub.length}枚：${rs.join("-")}`;
  }
  const KEY = { a5: keyA5, "27": keyDeuce, badugi: keyBadugi };
  /* returns -1 if hand A wins, 1 if hand B wins, 0 tie */
  function compare(mode, a, b) { return cmpArr(KEY[mode](a), KEY[mode](b)); }

  function deck() {
    const d = [];
    for (const s of SUITS) for (let r = 2; r <= 14; r++) d.push({ r, s });
    return d;
  }
  function shuffle(a, rnd = Math.random) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  /* deal two hands that make an interesting question */
  function deal(mode, rnd = Math.random) {
    const size = mode === "badugi" ? 4 : 5;
    for (let tries = 0; tries < 400; tries++) {
      const d = shuffle(deck(), rnd);
      const a = d.slice(0, size), b = d.slice(size, size * 2);
      const lowish = (h) => h.filter((c) => (mode === "27" ? c.r <= 9 && c.r !== 14 : c.r <= 9 || c.r === 14)).length;
      const need = mode === "badugi" ? 3 : 4;
      if (lowish(a) < need || lowish(b) < need) continue;
      // keep some close calls: both hands same category most of the time
      const ka = KEY[mode](a), kb = KEY[mode](b);
      if (ka[0] !== kb[0] && rnd() < 0.6) continue;
      return { a, b };
    }
    const d = shuffle(deck(), rnd);
    return { a: d.slice(0, size), b: d.slice(size, size * 2) };
  }

  const api = { keyA5, keyDeuce, keyBadugi, bestBadugi, compare, describe, deal, label };
  if (typeof module !== "undefined") module.exports = api;
  else root.LowQuiz = api;
})(this);
