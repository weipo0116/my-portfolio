/* Synastry (合盤): two natal charts side by side.
   Pure computation, no DOM and no astronomy engine: it takes ecliptic longitudes and returns what to say.
   Output describes a style of getting along; it never scores the pair as a whole. */
import COPY from "./synastry-copy.json";

export const SYN_BODIES = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
export const SYN_ZH = { Sun: "太陽", Moon: "月亮", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星" };
const ASPECT_GLYPH = { 0: "☌", 60: "⚹", 90: "□", 120: "△", 180: "☍" };

// angle, orb in degrees, kind, how loud this kind is
const ASPECTS = [
  { ang: 0, orb: 7, kind: "conj", f: 1 },
  { ang: 60, orb: 4, kind: "soft", f: 0.6 },
  { ang: 90, orb: 6, kind: "hard", f: 0.9 },
  { ang: 120, orb: 6, kind: "soft", f: 0.8 },
  { ang: 180, orb: 7, kind: "hard", f: 0.9 },
];

// [your body, their body, weight]. A conjunction counts as "easy" where it is warmth, as "tense" where it is pressure.
export const SYN_FACES = [
  { k: "attract", zh: "來電", conj: "easy", pairs: [["Venus", "Mars", 1], ["Mars", "Venus", 1], ["Venus", "Venus", 0.7], ["Sun", "Venus", 0.6], ["Venus", "Sun", 0.6]] },
  { k: "comfort", zh: "相處", conj: "easy", pairs: [["Moon", "Moon", 1], ["Sun", "Moon", 0.8], ["Moon", "Sun", 0.8], ["Sun", "Sun", 0.6], ["Moon", "Venus", 0.7], ["Venus", "Moon", 0.7], ["Jupiter", "Sun", 0.5], ["Sun", "Jupiter", 0.5], ["Jupiter", "Moon", 0.5], ["Moon", "Jupiter", 0.5]] },
  { k: "talk", zh: "溝通", conj: "easy", pairs: [["Mercury", "Mercury", 1], ["Mercury", "Moon", 0.6], ["Moon", "Mercury", 0.6], ["Mercury", "Sun", 0.6], ["Sun", "Mercury", 0.6], ["Mercury", "Venus", 0.5], ["Venus", "Mercury", 0.5]] },
  { k: "friction", zh: "磨合", conj: "tense", pairs: [["Mars", "Moon", 0.9], ["Moon", "Mars", 0.9], ["Mars", "Sun", 0.7], ["Sun", "Mars", 0.7], ["Mars", "Mars", 0.6], ["Saturn", "Moon", 0.9], ["Moon", "Saturn", 0.9], ["Saturn", "Venus", 0.7], ["Venus", "Saturn", 0.7], ["Saturn", "Sun", 0.6], ["Sun", "Saturn", 0.6], ["Saturn", "Mars", 0.5], ["Mars", "Saturn", 0.5]] },
];

const SIGN_EL = ["fire", "earth", "air", "water", "fire", "earth", "air", "water", "fire", "earth", "air", "water"]; // by sign index, Aries first
const EL_ORDER = ["fire", "earth", "air", "water"];

function fnv(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const norm = (d) => ((d % 360) + 360) % 360;
const sep = (a, b) => { const d = norm(a - b); return d > 180 ? 360 - d : d; };
const pick = (arr, seed) => (arr?.length ? arr[fnv(seed) % arr.length] : "");

function aspectOf(a, b, pair) {
  const d = sep(a.lon, b.lon);
  const luminary = pair[0] === "Sun" || pair[0] === "Moon" || pair[1] === "Sun" || pair[1] === "Moon";
  for (const asp of ASPECTS) {
    const orb = asp.orb - (luminary ? 0 : 1);
    const dev = Math.abs(d - asp.ang);
    if (dev <= orb) return { ...asp, dev, orb: orb };
  }
  return null;
}

/* you / them: { Sun: { lon, unc? }, Moon: ..., ... }  (unc = how far the position could be off, in degrees)
   seed: any string that is stable for this pair of people, so the wording does not flicker on re-render */
export function compare(you, them, seed) {
  const notes = [];
  const faces = SYN_FACES.map((face) => {
    const rows = [];
    for (const pair of face.pairs) {
      const [ka, kb, w] = pair;
      const a = you[ka], b = them[kb];
      if (!a || !b) continue;
      const asp = aspectOf(a, b, pair);
      if (!asp) continue;
      const tight = 1 - asp.dev / asp.orb;
      const s = (0.35 + 0.65 * tight) * asp.f * w;
      const key = `${ka}-${kb}`;
      const copy = COPY.pairs?.[key]?.[asp.kind];
      const tense = asp.kind === "hard" || (asp.kind === "conj" && face.conj === "tense");
      rows.push({
        key, a: ka, b: kb, kind: asp.kind, ang: asp.ang, glyph: ASPECT_GLYPH[asp.ang], dev: asp.dev, s, tense,
        approx: (a.unc || 0) > 1.5 || (b.unc || 0) > 1.5,
        text: pick(copy, `${seed}|${key}|${asp.kind}`),
      });
    }
    rows.sort((x, y) => y.s - x.s);
    const easy = rows.filter((r) => !r.tense).reduce((n, r) => n + r.s, 0);
    const tense = rows.filter((r) => r.tense).reduce((n, r) => n + r.s, 0);
    const total = easy + tense;
    const big = face.pairs.length > 7;
    const tier = total >= (big ? 1.6 : 1.1) ? "strong" : total >= (big ? 0.6 : 0.4) ? "some" : "quiet";
    const tone = tense > easy * 1.3 ? "Tense" : easy > tense * 1.3 ? "Easy" : "Mixed";
    const headKey = tier === "strong" ? `strong${tone}` : tier;
    return {
      k: face.k, zh: face.zh, rows, easy, tense, total, tier, tone: tone.toLowerCase(),
      head: pick(COPY.face?.[face.k]?.[headKey], `${seed}|${face.k}|${headKey}`),
    };
  });
  if (faces.some((f) => f.rows.some((r) => r.approx))) notes.push("有一邊的出生時間只知道大概，月亮的位置會有幾度的誤差，標「約」的那幾句只能參考。");

  // elements of the two Suns (the base colour) and the two Moons (the emotional rhythm)
  const elText = (body, table) => {
    const a = you[body], b = them[body];
    if (!a || !b) return "";
    const key = [SIGN_EL[Math.floor(norm(a.lon) / 30)], SIGN_EL[Math.floor(norm(b.lon) / 30)]].sort((x, y) => EL_ORDER.indexOf(x) - EL_ORDER.indexOf(y)).join("-");
    return pick(COPY[table]?.[key], `${seed}|${table}|${key}`);
  };

  // the one-line overview: where it is smoothest, where it needs working at
  const gentle = faces.filter((f) => f.easy >= 0.5 && f.tier !== "quiet").sort((x, y) => y.easy - x.easy)[0];
  const tense = faces.filter((f) => f.tense >= 0.5 && f.tier !== "quiet").sort((x, y) => y.tense - x.tense)[0];
  let overview;
  if (gentle && tense && gentle.k === tense.k) overview = `「${gentle.zh}」這一面順和緊都有，起伏會比較明顯。`;
  else if (gentle && tense) overview = `「${gentle.zh}」是你們最順的地方，「${tense.zh}」則是比較需要慢慢磨合的地方。`;
  else if (gentle) overview = `「${gentle.zh}」是你們最順的地方，其他面向沒有特別卡的點。`;
  else if (tense) overview = `「${tense.zh}」是比較需要磨合的地方，其他面向沒有特別強的連結。`;
  else overview = "你們之間沒有特別突出的連結，不算強烈，也沒有特別卡，關係怎麼走比較看你們怎麼相處。";

  return { faces, sun: elText("Sun", "elem"), moon: elText("Moon", "moonElem"), overview, notes };
}

export const synastryReady = () => Boolean(COPY?.pairs && COPY?.face && COPY?.elem);
