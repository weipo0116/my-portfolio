import * as A from "astronomy-engine";

/* ---------- theme (dark / light) ---------- */
let starRgb = "230,211,163";
const THEME_KEY = "astra-theme";
function applyTheme(mode) {
  document.documentElement.dataset.theme = mode;
  starRgb = mode === "light" ? "138,106,34" : "230,211,163";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", mode === "light" ? "#f5efe0" : "#07080f");
  const btn = document.getElementById("themeBtn");
  if (btn) {
    btn.setAttribute("aria-pressed", String(mode === "light"));
    btn.setAttribute("aria-label", mode === "light" ? "切換為深色模式" : "切換為淺色模式");
  }
}
(() => {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* storage unavailable */ }
  applyTheme(saved === "light" ? "light" : "dark");
})();
import "./astro.css";

/* ---------- static tables ---------- */
const SIGNS = [
  { zh: "牡羊座", la: "Aries", g: "♈", el: "火", tone: "直接、開創、想先出手" },
  { zh: "金牛座", la: "Taurus", g: "♉", el: "土", tone: "穩定、感官、想把事做扎實" },
  { zh: "雙子座", la: "Gemini", g: "♊", el: "風", tone: "好奇、多線、想交換資訊" },
  { zh: "巨蟹座", la: "Cancer", g: "♋", el: "水", tone: "敏感、護巢、想靠近熟悉的人" },
  { zh: "獅子座", la: "Leo", g: "♌", el: "火", tone: "舞台、溫暖、想被看見" },
  { zh: "處女座", la: "Virgo", g: "♍", el: "土", tone: "細緻、整理、想把流程修好" },
  { zh: "天秤座", la: "Libra", g: "♎", el: "風", tone: "平衡、審美、想讓關係順" },
  { zh: "天蠍座", la: "Scorpius", g: "♏", el: "水", tone: "深入、專注、想挖到底" },
  { zh: "射手座", la: "Sagittarius", g: "♐", el: "火", tone: "遠望、自由、想擴張視野" },
  { zh: "摩羯座", la: "Capricornus", g: "♑", el: "土", tone: "責任、結構、想一步步爬升" },
  { zh: "水瓶座", la: "Aquarius", g: "♒", el: "風", tone: "抽離、創新、想換個角度" },
  { zh: "雙魚座", la: "Pisces", g: "♓", el: "水", tone: "柔軟、想像、想留白與共感" },
];

const BODIES = [
  { key: "Sun", zh: "太陽", la: "Sol", g: "☉", role: "核心意志與今天的主題" },
  { key: "Moon", zh: "月亮", la: "Luna", g: "☽", role: "情緒與直覺的底色" },
  { key: "Mercury", zh: "水星", la: "Mercurius", g: "☿", role: "溝通、思考與交易" },
  { key: "Venus", zh: "金星", la: "Venus", g: "♀", role: "關係、金錢與審美" },
  { key: "Mars", zh: "火星", la: "Mars", g: "♂", role: "行動力與衝突" },
  { key: "Jupiter", zh: "木星", la: "Iuppiter", g: "♃", role: "機會與擴張" },
  { key: "Saturn", zh: "土星", la: "Saturnus", g: "♄", role: "紀律與限制" },
  { key: "Uranus", zh: "天王星", la: "Uranus", g: "♅", role: "變動與突破" },
  { key: "Neptune", zh: "海王星", la: "Neptunus", g: "♆", role: "想像與模糊" },
  { key: "Pluto", zh: "冥王星", la: "Pluto", g: "♇", role: "深層轉化" },
];

const ASPECTS = [
  { name: "合相", la: "Coniunctio", ang: 0, orb: 7, g: "☌", mean: "兩股能量疊在一起，放大彼此，很難分開處理。" },
  { name: "六分相", la: "Sextilis", ang: 60, orb: 4, g: "⚹", mean: "順手的合作機會，主動開口就會有回應。" },
  { name: "四分相", la: "Quadratum", ang: 90, orb: 6, g: "□", mean: "有張力，逼你做取捨；把它當成推你行動的壓力。" },
  { name: "三分相", la: "Trigonum", ang: 120, orb: 6, g: "△", mean: "流動順暢，天生配合，適合推進原本就想做的事。" },
  { name: "對分相", la: "Oppositio", ang: 180, orb: 7, g: "☍", mean: "兩端拉扯，需要找中間點，也容易看見對方的立場。" },
];

const PHASES = [
  ["新月", "適合重新設定意圖，先安靜，再開始。"],
  ["蛾眉月", "剛起步的能量，小幅度地試做就好。"],
  ["上弦月", "會遇到阻力，也是決定要不要堅持的時刻。"],
  ["盈凸月", "調整細節、補足不足，離成果很近。"],
  ["滿月", "情緒與結果都明顯，適合收成、也適合說開。"],
  ["虧凸月", "分享與回饋的時段，把學到的整理出來。"],
  ["下弦月", "放掉不合用的做法，做減法。"],
  ["殘月", "收尾與休息，留時間給自己恢復。"],
];

const ROMAN = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];
const roman = (n) => ROMAN.reduce((s, [v, r]) => { while (n >= v) { s += r; n -= v; } return s; }, "");

/* ---------- astronomy ---------- */
const TXT = (g) => g + "\uFE0E";
const norm = (d) => ((d % 360) + 360) % 360;

function lonOf(key, date) {
  if (key === "Moon") return norm(A.EclipticGeoMoon(date).lon);
  const vec = A.GeoVector(A.Body[key], date, true);
  return norm(A.Ecliptic(vec).elon);
}

function compute(date) {
  const next = new Date(date.getTime() + 86400000);
  return BODIES.map((b) => {
    const lon = lonOf(b.key, date);
    let d = lonOf(b.key, next) - lon; // signed motion over the next 24h
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const retro = b.key !== "Sun" && b.key !== "Moon" && d < 0;
    const signIndex = Math.floor(lon / 30);
    return { ...b, lon, retro, motion: d, signIndex, sign: SIGNS[signIndex], deg: lon - signIndex * 30 };
  });
}

function findAspects(pos) {
  const main = pos.slice(0, 7);
  const out = [];
  for (let i = 0; i < main.length; i++) {
    for (let j = i + 1; j < main.length; j++) {
      let diff = Math.abs(main[i].lon - main[j].lon);
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECTS) {
        const off = Math.abs(diff - asp.ang);
        if (off <= asp.orb) out.push({ a: main[i], b: main[j], asp, off });
      }
    }
  }
  return out.sort((x, y) => x.off - y.off);
}

/* ---------- text ---------- */
const fmtDeg = (d) => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, "0")}′`;

function taipeiParts(date) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "long", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(date);
  const o = Object.fromEntries(f.map((p) => [p.type, p.value]));
  return { y: +o.year, m: +o.month, d: +o.day, wk: o.weekday, hh: o.hour, mm: o.minute };
}

function buildEnergy(pos, aspects, phaseIdx) {
  const sun = pos[0], moon = pos[1], mer = pos[2], ven = pos[3], mar = pos[4];
  const parts = [];
  parts.push(
    `太陽在${sun.sign.zh}：今天的主題偏向「${sun.sign.tone}」。${sun.sign.el}象星座當道，` +
      ({ 火: "行動比討論更有效。", 土: "做實際、可驗收的事最划算。", 風: "多聊、多連結，點子會從對話冒出來。", 水: "先照顧感受，再談效率。" })[sun.sign.el],
  );
  parts.push(
    `月亮在${moon.sign.zh}：情緒底色是「${moon.sign.tone}」。` +
      (moon.sign.el === sun.sign.el ? "月亮與太陽同元素，內外一致，做決定比較不糾結。" : "月亮與太陽元素不同，內心想要的和表面該做的有點落差，給自己一點緩衝。"),
  );
  if (mer.retro) parts.push(`水星逆行中（${mer.sign.zh}）：合約、行程、訊息先再確認一次，備份重要檔案，舊事重提比開新局順利。`);
  else parts.push(`水星在${mer.sign.zh}，順行：溝通與判斷如常，適合談事情與簽約。`);
  parts.push(`金星在${ven.sign.zh}${ven.retro ? "（逆行）" : ""}：關係與消費的取向是「${ven.sign.tone}」。火星在${mar.sign.zh}${mar.retro ? "（逆行）" : ""}：行動風格是「${mar.sign.tone}」。`);
  parts.push(`月相「${PHASES[phaseIdx][0]}」：${PHASES[phaseIdx][1]}`);
  return parts;
}

function headline(pos) {
  const sun = pos[0], moon = pos[1];
  return `日行${sun.sign.zh}，月入${moon.sign.zh}——${sun.sign.tone.split("、")[0]}為體，${moon.sign.tone.split("、")[0]}為用。`;
}

const ACTION = {
  火: "把想做的事先動手做出第一步，別等到萬事俱備。",
  土: "挑一件可以做完、可以驗收的事，穩穩推進。",
  風: "多聊、多問、多連結，點子會從對話裡冒出來。",
  水: "先照顧自己和身邊人的感受，再談效率。",
};

function buildSummary(pos, aspects, phaseIdx) {
  const sun = pos[0], moon = pos[1], mer = pos[2];
  const first = (b) => b.sign.tone.split("、")[0];
  const s1 = `今天整體氣氛偏「${first(sun)}」（太陽在${sun.sign.zh}），情緒底色是「${first(moon)}」（月亮在${moon.sign.zh}）。`;
  const hard = aspects.find((a) => a.asp.ang === 90 || a.asp.ang === 180);
  let s2;
  if (mer.retro) s2 = "水星逆行中，重要訊息與合約多確認一次，舊事重提比開新局順利。";
  else if (phaseIdx === 0 || phaseIdx === 4) s2 = `月相是${PHASES[phaseIdx][0]}，${PHASES[phaseIdx][1]}`;
  else if (hard) s2 = `留意${hard.a.zh}與${hard.b.zh}的${hard.asp.name}：${hard.asp.mean}`;
  else s2 = "沒有特別緊張的相位，可以照自己的步調走。";
  return `${s1}${s2}建議：${ACTION[sun.sign.el]}`;
}

function buildTags(pos, aspects, phaseIdx) {
  const sun = pos[0], mer = pos[2];
  const good = aspects.find((a) => a.asp.ang === 120 || a.asp.ang === 60);
  const hard = aspects.find((a) => a.asp.ang === 90 || a.asp.ang === 180);
  return [
    ["適合", good ? `${good.a.zh}${good.asp.name}${good.b.zh}：${good.asp.mean.split("，")[0]}` : ACTION[sun.sign.el].split("，")[0]],
    ["留意", mer.retro ? "水星逆行：訊息、合約、行程多確認" : hard ? `${hard.a.zh}${hard.asp.name}${hard.b.zh}：${hard.asp.mean.split("；")[0].split("，")[0]}` : "沒有特別需要避開的地方"],
    ["月相", `${PHASES[phaseIdx][0]}：${PHASES[phaseIdx][1].split("，")[0]}`],
  ];
}

/* ---------- wheel ---------- */
const NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};
// 0° Aries at the left (9 o'clock), signs run counter-clockwise like a classical chart.
const ang = (lon) => ((180 - lon) * Math.PI) / 180;
const pt = (lon, r) => [Math.cos(ang(lon)) * r, Math.sin(ang(lon)) * r]; // y grows downward, so longitude runs counter-clockwise on screen
const delta = (a, b) => { let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// The static frame (rings, ticks, signs) is drawn once per svg; only planets, aspect lines
// and the core are rebuilt, so stepping between days can animate each body along the ecliptic.
function buildFrame(svg) {
  svg.innerHTML = "";
  const defs = el("defs", {}, svg);
  const g1 = el("radialGradient", { id: `${svg.id}-core` }, defs);
  el("stop", { offset: "0%", "stop-color": "#e6d3a3", "stop-opacity": ".18" }, g1);
  el("stop", { offset: "100%", "stop-color": "#e6d3a3", "stop-opacity": "0" }, g1);
  el("circle", { r: 390, fill: `url(#${svg.id}-core)` }, svg);
  [380, 330, 262, 150].forEach((r, i) => el("circle", { r, class: "ring ring-" + i, pathLength: 1 }, svg));
  for (let d = 0; d < 360; d += 5) {
    const major = d % 30 === 0;
    const [x1, y1] = pt(d, 380);
    const [x2, y2] = pt(d, major ? 330 : d % 10 === 0 ? 362 : 370);
    el("line", { x1, y1, x2, y2, class: major ? "tick major" : "tick" }, svg);
  }
  SIGNS.forEach((s, i) => {
    const mid = i * 30 + 15;
    const [gx, gy] = pt(mid, 296);
    el("text", { x: gx, y: gy, class: "sign-glyph", "text-anchor": "middle", "dominant-baseline": "central" }, svg).textContent = TXT(s.g);
    const [lx, ly] = pt(mid, 352);
    const a = 180 - mid;
    const rot = a + 90 + (Math.sin((a * Math.PI) / 180) > 0 ? 180 : 0); // tangent text, kept upright
    el("text", { x: lx, y: ly, class: "sign-latin", "text-anchor": "middle", "dominant-baseline": "central", transform: `rotate(${rot} ${lx} ${ly})` }, svg).textContent = s.la.toUpperCase();
  });
  svg.dataset.built = "1";
}

function updateWheel(svg, pos, aspects, prev, opts = {}) {
  const dur = opts.dur ?? 1700;
  if (!svg.dataset.built) buildFrame(svg);
  svg.querySelector(".dyn")?.remove();
  const dyn = el("g", { class: "dyn" }, svg);

  const lines = el("g", { class: "aspect-lines" }, dyn);
  aspects.slice(0, 8).forEach((a, i) => {
    const [x1, y1] = pt(a.a.lon, 150);
    const [x2, y2] = pt(a.b.lon, 150);
    const ln = el("line", { x1, y1, x2, y2, class: "asp asp-" + a.asp.ang, style: `--i:${i}`, pathLength: 1 }, lines);
    ln.dataset.pair = `${a.a.key}-${a.b.key}`;
  });

  // time track: where each body stood on the baseline day (today) and the path it took to get here
  const track = el("g", { class: "track" }, dyn);
  if (opts.ghost) {
    opts.ghost.pos.forEach((g0, i) => {
      const cur = pos[i];
      const R = 236;
      const [gx, gy] = pt(g0.lon, R);
      const grp = el("g", { class: "ghost", "data-key": g0.key }, track);
      const cum = opts.ghost.cum[i];
      if (Math.abs(cum) >= 0.4 && Math.abs(cum) < 340) {
        const [ex, ey] = pt(cur.lon, R);
        el("path", { d: `M ${gx} ${gy} A ${R} ${R} 0 ${Math.abs(cum) > 180 ? 1 : 0} ${cum > 0 ? 0 : 1} ${ex} ${ey}`, class: "arc", fill: "none" }, grp);
      }
      el("circle", { cx: gx, cy: gy, r: 11, class: "ghost-disc" }, grp);
      el("text", { x: gx, y: gy, class: "ghost-glyph", "text-anchor": "middle", "dominant-baseline": "central" }, grp).textContent = TXT(g0.g);
    });
  }

  // spread bodies that sit close together
  const sorted = [...pos].sort((a, b) => a.lon - b.lon);
  const lane = new Map();
  sorted.forEach((b, i) => {
    let off = 0;
    for (let k = 0; k < i; k++) if (Math.abs(sorted[k].lon - b.lon) < 9 && lane.get(sorted[k].key) === off) off += 1;
    lane.set(b.key, off);
  });

  const trails = el("g", { class: "trails" }, dyn);
  const layer = el("g", { class: "planet-layer" }, dyn);
  pos.forEach((b, i) => {
    const r = 206 - lane.get(b.key) * 36;
    const g = el("g", { class: "planet", "data-key": b.key }, layer);
    const [x, y] = pt(b.lon, r);
    const [kx, ky] = pt(b.lon, 262);
    const [kx2, ky2] = pt(b.lon, 255);
    el("line", { x1: kx, y1: ky, x2: kx2, y2: ky2, class: "pin" }, g);
    el("circle", { cx: x, cy: y, r: 19, class: "planet-disc" }, g);
    el("text", { x, y, class: "planet-glyph", "text-anchor": "middle", "dominant-baseline": "central" }, g).textContent = TXT(b.g);
    if (b.retro) el("text", { x: x + 17, y: y - 15, class: "retro-mark" }, g).textContent = "℞";

    if (reduceMotion) return;
    const old = prev?.[i];
    if (!old) {
      g.animate([{ transform: "rotate(-70deg)", opacity: 0 }, { transform: "rotate(0deg)", opacity: 1 }], { duration: 1900, delay: 500 + i * 90, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
      return;
    }
    // move along the ecliptic: counter-clockwise on screen when longitude grows
    const d = delta(old.lon, b.lon);
    if (Math.abs(d) < 0.01) return;
    g.animate([{ transform: `rotate(${d}deg)` }, { transform: "rotate(0deg)" }], { duration: dur, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
    if (Math.abs(d) >= 0.4 && !opts.ghost) {
      const [sx, sy] = pt(old.lon, r);
      const trail = el("path", { d: `M ${sx} ${sy} A ${r} ${r} 0 0 ${d > 0 ? 0 : 1} ${x} ${y}`, class: "trail", fill: "none" }, trails);
      trail.animate([{ opacity: 0.9 }, { opacity: 0.9, offset: 0.55 }, { opacity: 0 }], { duration: 3200, easing: "ease-out", fill: "forwards" });
    }
  });

  const sun = pos[0];
  const core = el("g", { class: "core" }, dyn);
  el("text", { y: -14, class: "core-sign", "text-anchor": "middle", "dominant-baseline": "central" }, core).textContent = TXT(sun.sign.g);
  el("text", { y: 32, class: "core-text", "text-anchor": "middle" }, core).textContent = `SOL · ${sun.sign.la.toUpperCase()}`;
}

/* ---------- moon ---------- */
// Textured moon: lit area is clipped from a shaded sphere with maria and craters;
// the dark side keeps a faint earthshine so the whole disc stays readable.
const MARIA = [[-18, -14, 17, 12], [6, -21, 10, 8], [17, -6, 12, 8], [35, -11, 5, 7], [-35, 2, 10, 21], [-14, 19, 12, 8], [-31, 24, 6, 5], [3, 3, 6, 5], [26, 10, 6, 4]];
const CRATERS = [[-4, 35, 3.2, 1], [-21, 4, 2.6, 0.8], [-9, -28, 2.2, 0.7], [20, 24, 2.4, 0.6], [30, -26, 1.8, 0.5], [-38, -16, 2, 0.5], [12, 38, 1.6, 0.5], [-26, 33, 1.8, 0.5], [38, 12, 1.6, 0.5], [-6, 12, 1.5, 0.6], [8, -4, 1.4, 0.5], [-30, -32, 1.4, 0.5]];

function drawMoon(svg, date) {
  svg.innerHTML = "";
  const phase = A.MoonPhase(date); // 0..360, 0 = new
  const illum = A.Illumination(A.Body.Moon, date).phase_fraction;
  const r = 50;
  const defs = el("defs", {}, svg);
  const sph = el("radialGradient", { id: "mSph", cx: "42%", cy: "38%", r: "75%" }, defs);
  el("stop", { offset: "0%", class: "ms ms0" }, sph);
  el("stop", { offset: "70%", class: "ms ms1" }, sph);
  el("stop", { offset: "100%", class: "ms ms2" }, sph);
  const limb = el("radialGradient", { id: "mLimb", cx: "50%", cy: "50%", r: "50%" }, defs);
  el("stop", { offset: "72%", "stop-color": "#000", "stop-opacity": "0" }, limb);
  el("stop", { offset: "100%", "stop-color": "#000", "stop-opacity": "0.42" }, limb);
  const earth = el("radialGradient", { id: "mEarth", cx: "50%", cy: "50%", r: "50%" }, defs);
  el("stop", { offset: "0%", class: "me0" }, earth);
  el("stop", { offset: "100%", class: "me1" }, earth);
  const blur = el("filter", { id: "mBlur", x: "-40%", y: "-40%", width: "180%", height: "180%" }, defs);
  el("feGaussianBlur", { stdDeviation: "2.3" }, blur);
  const soft = el("filter", { id: "mSoft", x: "-40%", y: "-40%", width: "180%", height: "180%" }, defs);
  el("feGaussianBlur", { stdDeviation: "0.5" }, soft);

  const waxing = phase < 180;
  const k = Math.cos((phase * Math.PI) / 180);
  const rx = Math.abs(k) * r;
  const lit = `M 0 ${-r} A ${r} ${r} 0 0 ${waxing ? 1 : 0} 0 ${r}`;
  const crescent = k > 0; // less than half lit
  const term = `A ${rx} ${r} 0 0 ${crescent ? (waxing ? 0 : 1) : waxing ? 1 : 0} 0 ${-r}`;
  const clip = el("clipPath", { id: "mLit" }, defs);
  el("path", { d: `${lit} ${term} Z` }, clip);
  const disc = el("clipPath", { id: "mDisc" }, defs);
  el("circle", { r }, disc);

  // dark side + earthshine, with the maria faintly visible
  el("circle", { r, class: "moon-dark" }, svg);
  el("circle", { r, fill: "url(#mEarth)" }, svg);
  const ghost = el("g", { "clip-path": "url(#mDisc)", opacity: "0.35" }, svg);
  MARIA.forEach(([x, y, a, b]) => el("ellipse", { cx: x, cy: y, rx: a, ry: b, class: "moon-maria", filter: "url(#mBlur)" }, ghost));

  // lit surface
  const g = el("g", { "clip-path": "url(#mLit)" }, svg);
  el("circle", { r, fill: "url(#mSph)" }, g);
  const surf = el("g", { "clip-path": "url(#mDisc)" }, g);
  MARIA.forEach(([x, y, a, b]) => el("ellipse", { cx: x, cy: y, rx: a, ry: b, class: "moon-maria", filter: "url(#mBlur)" }, surf));
  CRATERS.forEach(([x, y, cr, o]) => {
    el("circle", { cx: x + 0.5, cy: y + 0.7, r: cr, class: "moon-crater-shadow", opacity: o * 0.6, filter: "url(#mSoft)" }, surf);
    el("circle", { cx: x, cy: y, r: cr * 0.8, class: "moon-crater-rim", opacity: o, filter: "url(#mSoft)" }, surf);
  });
  // rays around Tycho
  for (let i = 0; i < 9; i++) {
    const ang = (i / 9) * Math.PI * 2 + 0.3;
    el("line", { x1: -4, y1: 35, x2: -4 + Math.cos(ang) * 11, y2: 35 + Math.sin(ang) * 11, class: "moon-ray" }, surf);
  }
  el("circle", { r, fill: "url(#mLimb)" }, g);
  el("circle", { r, class: "moon-rim" }, svg);
  return { phase, illum, side: waxing ? 1 : -1 };
}

/* ---------- period events & sign fortunes ---------- */
const DAY = 86400000;
const noonTaipei = (tp) => new Date(Date.UTC(tp.y, tp.m - 1, tp.d, 4, 0, 0)); // 12:00 in Taipei
const md = (date) => { const t = taipeiParts(date); return `${t.m}/${t.d}`; };

function cumulative(baseDate, targetDate) {
  // follow each body day by day so retrograde loops and the Moon's laps are counted honestly
  const days = Math.round((targetDate - baseDate) / DAY);
  const sign = days >= 0 ? 1 : -1;
  const out = BODIES.map(() => 0);
  for (let k = 0; k < Math.abs(days); k++) {
    const a = new Date(baseDate.getTime() + sign * k * DAY);
    const b = new Date(baseDate.getTime() + sign * (k + 1) * DAY);
    BODIES.forEach((bd, i) => { out[i] += delta(lonOf(bd.key, a), lonOf(bd.key, b)); });
  }
  return out;
}

function periodEvents(d0, d1) {
  const lo = d0 < d1 ? d0 : d1, hi = d0 < d1 ? d1 : d0;
  const days = Math.round((hi - lo) / DAY);
  const ev = [];
  let prev = compute(lo);
  for (let k = 1; k <= days; k++) {
    const when = new Date(lo.getTime() + k * DAY);
    const now = compute(when);
    now.forEach((b, i) => {
      const was = prev[i];
      if (b.key === "Moon" && days > 8) return; // too frequent for long ranges
      if (b.signIndex !== was.signIndex) ev.push({ t: when, icon: "→", text: `${b.zh}進入${b.sign.zh}`, kind: "ingress" });
      if (b.retro !== was.retro) ev.push({ t: when, icon: "℞", text: `${b.zh}${b.retro ? "轉為逆行" : "恢復順行"}`, kind: "retro" });
    });
    prev = now;
  }
  const phase = (deg, label) => {
    let from = lo;
    for (;;) {
      const t = A.SearchMoonPhase(deg, from, (hi - from) / DAY + 1);
      if (!t || t.date > hi) break;
      ev.push({ t: t.date, icon: deg === 0 ? "●" : "○", text: label, kind: "moon" });
      from = new Date(t.date.getTime() + DAY);
    }
  };
  phase(0, "新月"); phase(180, "滿月");
  return ev.sort((a, b) => a.t - b.t);
}

const HOUSE = ["自我與形象", "財務與資源", "溝通與學習", "家庭與內在", "戀愛與創作", "日常與健康", "伴侶與合作", "深度連結", "遠行與進修", "事業與聲望", "朋友與社群", "獨處與潛意識"];
const HF = {
  love: [0.8, 0.3, 0.3, 0.4, 1, -0.2, 1, -0.1, 0.5, 0.2, 0.6, -0.4],
  career: [0.6, 0.4, 0.2, 0, 0.2, 0.7, 0.3, -0.1, 0.4, 1, 0.5, -0.4],
  money: [0.3, 1, 0.2, 0.1, 0.2, 0.3, 0.2, 0.7, 0.2, 0.4, 0.8, -0.5],
};
// weight per category, and the planet's nature (+ supportive, − restrictive)
const PW = {
  Sun: { love: 0.4, career: 0.8, money: 0.4, n: 0.7 },
  Moon: { love: 0.7, career: 0.3, money: 0.3, n: 0.4 },
  Mercury: { love: 0.3, career: 0.6, money: 0.5, n: 0.5 },
  Venus: { love: 1, career: 0.4, money: 0.8, n: 1 },
  Mars: { love: 0.5, career: 0.8, money: 0.3, n: 0.4 },
  Jupiter: { love: 0.5, career: 0.9, money: 1, n: 1 },
  Saturn: { love: 0.5, career: 0.6, money: 0.5, n: -0.8 },
};
const CATS = { love: "感情", career: "事業", money: "財運" };
// Plain-language copy for the general public: each sign has its own voice per category,
// then a short tip by how the day scores, then the planet that drives it.
const SIGN_LINE = {
  love: [
    "你直來直往的魅力很吃香，心動就別繞圈子。",
    "你愛得穩、慢熱卻長久，細水長流最適合你。",
    "你話題多又機靈，用聊天就能把距離拉近。",
    "你的體貼很動人，也記得說出自己的需要。",
    "你自帶光芒，大方表達喜歡會被看見。",
    "你的細心很加分，只要別對對方太挑剔。",
    "你懂得營造氣氛，但別為了和諧吞下真心話。",
    "你要的是深度，真心話比曖昧更有力量。",
    "你的樂觀很有感染力，給彼此一點自由空間。",
    "你慢熱卻認真，偶爾放下防備會更靠近。",
    "你需要有趣的靈魂，保有自己也願意靠近一步。",
    "你的感受力很強，溫柔之餘也要守住界線。",
  ],
  career: [
    "你的行動力是招牌，想到就先動手試試看。",
    "你踏實累積的功夫到位，照自己的節奏走就好。",
    "你的資訊與人脈是武器，多問多連結會有收穫。",
    "你重視團隊氣氛，把細心用在關鍵細節上。",
    "你很適合站上舞台，主動扛下一個亮點任務。",
    "你是細節控，把流程整理好效率會更高。",
    "你擅長協調溝通，適合當團隊裡的那座橋。",
    "你專注力驚人，鑽進一件事就能看見突破。",
    "你的視野夠廣，大方向對了就放手去闖。",
    "你的責任感讓人信任，按計畫一步步往上爬。",
    "你的創意與獨到想法是亮點，大方提出來。",
    "你的靈感與同理心是天賦，把想法具體寫下來。",
  ],
  money: [
    "你出手向來果斷，花錢前多留一秒想一想。",
    "你對價值有自己的眼光，品質比折扣更重要。",
    "你點子很多，挑一個真正值得投入的就好。",
    "你天生會存，為家人與安心感花錢最值得。",
    "你愛請客也愛好東西，量力而為更有面子。",
    "你精打細算很在行，也替自己留點小獎勵。",
    "你講究質感與美感，買之前多比較一下。",
    "你直覺敏銳，資源配置多看長期。",
    "你偏好體驗勝過物品，旅行與學習是好花費。",
    "你長於規劃，穩健累積比一次衝刺更適合。",
    "你的想法走在前面，新工具新方法先小額試。",
    "你容易心軟，借貸與衝動消費要多留空間。",
  ],
};
const TIP = {
  love: { hi: "今天互動運順，適合主動聊聊、約個會。", mid: "感情運平穩，日常的小關心就很加分。", lo: "今天情緒較敏感，先聽對方說完再回應。" },
  career: { hi: "工作上有推進力，適合提案、談合作。", mid: "節奏平穩，把手邊的事做完做好就很棒。", lo: "進度可能卡卡，先確認方向、別硬碰硬。" },
  money: { hi: "財運有亮點，留意好機會與可靠的收入。", mid: "收支持平，維持原本的預算就好。", lo: "支出容易失控，大額決定先緩一天。" },
};
const AREA = ["自己的狀態與形象", "荷包與資源", "說話與學習", "家與安心感", "戀愛與玩樂", "日常作息與身體", "另一半與合作", "深層關係與共同資源", "眼界與遠方", "事業與名聲", "朋友與圈子", "獨處與休息"];

// whole-sign houses counted from each sun sign
function rawFortune(pos) {
  return SIGNS.map((_, si) => {
    const res = {};
    for (const cat of Object.keys(CATS)) {
      let total = 0;
      const parts = [];
      for (const b of pos.slice(0, 7)) {
        const w = PW[b.key];
        const house = ((b.signIndex - si + 12) % 12) + 1;
        let n = w.n;
        if (b.retro) n *= 0.5;
        let c = w[cat] * n * HF[cat][house - 1];
        if (b.key === "Mercury" && b.retro && cat !== "love") c -= 0.15;
        total += c;
        parts.push({ b, house, c });
      }
      parts.sort((x, y) => Math.abs(y.c) - Math.abs(x.c));
      res[cat] = { total, top: parts[0] };
    }
    return res;
  });
}

function toStars(values) {
  const lo = Math.min(...values), hi = Math.max(...values);
  const span = hi - lo || 1;
  return values.map((v) => 1 + Math.round((4 * (v - lo)) / span));
}

function fortuneNote(si, cat, stars, top) {
  const { b, house, c } = top;
  const tier = stars >= 4 ? "hi" : stars === 3 ? "mid" : "lo";
  return {
    text: `${SIGN_LINE[cat][si]}${TIP[cat][tier]}`,
    why: `${b.zh}${b.retro ? "（逆行）" : ""}正走到你的「${AREA[house - 1]}」，${c >= 0 ? "帶來助力" : "要多留心"}`,
  };
}

function dayFortune(pos) {
  const raw = rawFortune(pos);
  const out = {};
  for (const cat of Object.keys(CATS)) {
    const stars = toStars(raw.map((r) => r[cat].total));
    out[cat] = SIGNS.map((sg, i) => {
      const n = fortuneNote(i, cat, stars[i], raw[i][cat].top);
      return { sign: sg, stars: stars[i], score: raw[i][cat].total, note: n.text, why: n.why };
    });
  }
  return out;
}

function weekFortune(date) {
  const tp = taipeiParts(date);
  const dow = (new Date(Date.UTC(tp.y, tp.m - 1, tp.d)).getUTCDay() + 6) % 7; // Monday = 0
  const mon = new Date(noonTaipei(tp).getTime() - dow * DAY);
  const days = Array.from({ length: 7 }, (_, k) => new Date(mon.getTime() + k * DAY));
  const raws = days.map((d) => rawFortune(compute(d)));
  const mid = rawFortune(compute(days[3]));
  const WK = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
  const out = {};
  for (const cat of Object.keys(CATS)) {
    const avg = SIGNS.map((_, i) => raws.reduce((n, r) => n + r[i][cat].total, 0) / 7);
    const stars = toStars(avg);
    out[cat] = SIGNS.map((sg, i) => {
      const per = raws.map((r) => r[i][cat].total);
      const best = per.indexOf(Math.max(...per)), worst = per.indexOf(Math.min(...per));
      const n = fortuneNote(i, cat, stars[i], mid[i][cat].top);
      return { sign: sg, stars: stars[i], score: avg[i], note: n.text, why: n.why, extra: `本週最順：${WK[best]}；較需留意：${WK[worst]}` };
    });
  }
  return { data: out, from: days[0], to: days[6] };
}

/* ---------- render ---------- */
let offsetDays = 0;
let prevPos = null;
let shownDate = null;
let lastRender = 0;
let fortuneMode = "day";
let fortuneCat = "love";
let currentFortune = null;
let currentWeek = null;

const $ = (id) => document.getElementById(id);
const para = (t) => Object.assign(document.createElement("p"), { textContent: t });
const sgn = (n, d = 1) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(d)}°`;
const clampOff = (n) => Math.max(-30, Math.min(30, n));

function render({ dur = 1700 } = {}) {
  const now = new Date();
  const date = new Date(now.getTime() + offsetDays * DAY);
  const tp = taipeiParts(date);
  shownDate = `${tp.y}-${tp.m}-${tp.d}`;
  lastRender = Date.now();
  $("romanDate").textContent = `${roman(tp.y)} · ${roman(tp.m)} · ${roman(tp.d)}`;
  const dateText = `${tp.y}.${String(tp.m).padStart(2, "0")}.${String(tp.d).padStart(2, "0")} ${tp.wk}`;
  $("dateLine").textContent = `${dateText} · 台北 ${tp.hh}:${tp.mm}`;
  $("dlgDate").textContent = dateText;
  const nt = new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", hour12: false, hour: "2-digit", minute: "2-digit" }).format(now);
  $("updated").textContent = `更新 ${nt} · 台北`;
  $("updatedNote").textContent = `資料更新於 ${nt}（台北 UTC+8）。看「今日」時，畫面每 5 分鐘自動重算一次，跨過台北午夜會換成新的一天。`;

  const pos = compute(date);
  const aspects = findAspects(pos);

  // baseline for comparisons = today; when browsing another day we draw the time track
  let ghost = null;
  let basePos = null;
  if (offsetDays !== 0) {
    basePos = compute(now);
    ghost = { pos: basePos, cum: cumulative(now, date) };
  }
  updateWheel($("wheelBg"), pos, aspects, prevPos, { dur });
  updateWheel($("wheelMain"), pos, aspects, prevPos, { dur, ghost });
  if (prevPos) {
    const moved = pos.map((b, i) => ({ b, d: Math.abs(delta(prevPos[i].lon, b.lon)) })).filter((x) => x.d > 0.4).sort((x, y) => y.d - x.d)[0];
    $("motionHint").textContent = moved ? `${moved.b.zh}移動了 ${moved.d.toFixed(1)}°（金色弧線是這次的軌跡）` : "";
  } else $("motionHint").textContent = "";
  prevPos = pos;

  const moonInfo = drawMoon($("moon"), date);
  const phaseIdx = Math.round(moonInfo.phase / 45) % 8;

  $("headline").textContent = headline(pos);
  $("summary").textContent = buildSummary(pos, aspects, phaseIdx);
  $("tags").replaceChildren(
    ...buildTags(pos, aspects, phaseIdx).map(([k, v]) => {
      const li = document.createElement("li");
      li.innerHTML = `<b>${k}</b><span></span>`;
      li.querySelector("span").textContent = v;
      return li;
    }),
  );
  $("energy").replaceChildren(...buildEnergy(pos, aspects, phaseIdx).map(para));

  // ---- dialog: time box, period changes, table, aspects ----
  $("tbRange").value = clampOff(offsetDays);
  const rel = offsetDays === 0 ? "今天" : offsetDays > 0 ? `未來 ${offsetDays} 天` : `過去 ${-offsetDays} 天`;
  $("tbLabel").textContent = `${rel} · ${dateText}`;
  $("tbBtns").querySelectorAll("button").forEach((b) => b.classList.toggle("on", Number(b.dataset.off) === offsetDays));

  const periodSec = $("periodSec");
  if (offsetDays !== 0) {
    periodSec.hidden = false;
    const evs = periodEvents(now, date);
    const lines = [`相對今天（空心虛線圈與弧線是今天的位置與走過的路）：`];
    $("period").replaceChildren(
      ...[
        ...[Object.assign(document.createElement("li"), { className: "ev-head", textContent: lines[0] })],
        ...(evs.length
          ? evs.map((e) => {
              const li = document.createElement("li");
              li.className = "ev " + e.kind;
              li.innerHTML = `<i>${e.icon}</i><b>${md(e.t)}</b><span></span>`;
              li.querySelector("span").textContent = e.text;
              return li;
            })
          : [Object.assign(document.createElement("li"), { className: "ev", textContent: "這段期間沒有換座、逆行或新滿月。" })]),
      ],
    );
  } else periodSec.hidden = true;

  const cum = ghost?.cum;
  $("planets").replaceChildren(
    ...pos.map((b, i) => {
      const li = document.createElement("li");
      li.dataset.key = b.key;
      const mv = `${b.motion >= 0 ? "+" : "−"}${Math.abs(b.motion).toFixed(b.key === "Moon" ? 1 : 2)}°`;
      let diff = "";
      if (cum) {
        const laps = Math.abs(cum[i]) >= 360 ? `（繞行 ${(Math.abs(cum[i]) / 360).toFixed(1)} 圈）` : "";
        const changed = basePos[i].signIndex !== b.signIndex ? `　${basePos[i].sign.zh} → ${b.sign.zh}` : "";
        diff = `<small class="mv diff">較今天 ${sgn(cum[i], Math.abs(cum[i]) < 10 ? 2 : 1)}${laps}${changed}</small>`;
      }
      li.innerHTML = `<span class="pg">${TXT(b.g)}</span><span class="pn"><b>${b.zh}</b><i>${b.la}</i></span><span class="ps">${TXT(b.sign.g)} ${b.sign.zh} <small>${fmtDeg(b.deg)}</small>${b.retro ? ' <span class="rx" title="逆行">℞</span>' : ""}</span><span class="pr">${b.role}<small class="mv">24 小時移動 ${mv}</small>${diff}</span>`;
      return li;
    }),
  );

  const top = aspects.slice(0, 5);
  $("aspects").replaceChildren(
    ...(top.length
      ? top.map((a) => {
          const d = document.createElement("article");
          d.dataset.pair = `${a.a.key}-${a.b.key}`;
          d.dataset.keys = `${a.a.key},${a.b.key}`;
          d.innerHTML = `<div class="ag">${TXT(a.a.g)} ${TXT(a.asp.g)} ${TXT(a.b.g)}</div><h3>${a.a.zh} ${a.asp.name} ${a.b.zh}</h3><p class="la">${a.a.la} · ${a.asp.la} · ${a.b.la}　誤差 ${a.off.toFixed(1)}°</p><p>${a.asp.mean}</p>`;
          return d;
        })
      : [Object.assign(document.createElement("p"), { className: "prose", textContent: "今天沒有特別緊密的相位，是比較平靜、可以照自己步調走的一天。" })]),
  );

  $("moonText").replaceChildren(
    ...[
      `${PHASES[phaseIdx][0]}，亮面約 ${Math.round(moonInfo.illum * 100)}%。`,
      PHASES[phaseIdx][1],
      `月亮目前在${pos[1].sign.zh}（${pos[1].sign.la}）${fmtDeg(pos[1].deg)}。`,
    ].map(para),
  );

  currentFortune = dayFortune(pos);
  currentWeek = weekFortune(date);
  renderFortune();
  observeReveals();
}

function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }

function renderFortune() {
  const week = fortuneMode === "week";
  const list = (week ? currentWeek.data : currentFortune)[fortuneCat];
  const tier = (st) => (st >= 4 ? "旺" : st === 3 ? "平穩" : "留意");
  const groups = [
    ["旺", "近期順風，適合主動出擊", (r) => r.stars >= 4],
    ["平穩", "照節奏走，不需要特別調整", (r) => r.stars === 3],
    ["留意", "放慢一點，先顧好基本盤", (r) => r.stars <= 2],
  ];
  $("weekEvents").replaceChildren();
  if (week) {
    const evs = periodEvents(currentWeek.from, currentWeek.to);
    $("fortuneNote").textContent = `本週：${md(currentWeek.from)}（週一）– ${md(currentWeek.to)}（週日）。分數是 12 個星座之間的相對高低，取整週平均。`;
    $("weekEvents").replaceChildren(
      ...(evs.length ? evs : [{ t: currentWeek.from, icon: "·", text: "本週沒有換座、逆行或新滿月", kind: "" }]).map((e) => {
        const li = document.createElement("li");
        li.className = "ev " + e.kind;
        li.innerHTML = `<i>${e.icon}</i><b>${md(e.t)}</b><span></span>`;
        li.querySelector("span").textContent = e.text;
        return li;
      }),
    );
  } else {
    $("fortuneNote").textContent = "依今天行星的位置，換算每個星座在感情、事業、財運上的順逆。星數是 12 個星座之間的相對高低，看個大方向、當作聊天話題就好。";
  }
  const box = $("fortune");
  box.replaceChildren(
    ...groups.map(([name, sub, fn]) => {
      const rows = list.filter(fn).sort((a, b) => b.score - a.score);
      const sec = document.createElement("section");
      sec.className = "fgroup g-" + (name === "旺" ? "hi" : name === "平穩" ? "mid" : "lo");
      sec.innerHTML = `<h3><b>${name}</b><span>${sub}</span><em>${rows.length} 個星座</em></h3>`;
      const ul = document.createElement("ul");
      rows.forEach((r, i) => {
        const li = document.createElement("li");
        li.style.setProperty("--i", i);
        li.innerHTML = `<span class="fg">${TXT(r.sign.g)}</span><span class="fn"><b>${r.sign.zh}</b><i>${r.sign.la}</i></span><span class="fs" aria-label="${r.stars} 顆星">${stars(r.stars)}</span><span class="ft"></span>`;
        const ft = li.querySelector(".ft");
        ft.append(Object.assign(document.createElement("span"), { className: "ft-main", textContent: r.note }));
        ft.append(Object.assign(document.createElement("small"), { className: "ft-why", textContent: [r.extra, r.why].filter(Boolean).join("　·　") }));
        ul.appendChild(li);
      });
      if (!rows.length) ul.innerHTML = '<li class="empty">這一組目前沒有星座</li>';
      sec.appendChild(ul);
      return sec;
    }),
  );
  void tier;
}

function renderLegend() {
  const rows = [
    ["℞", "逆行：從地球看，這顆星暫時「倒退」，通常提醒回頭檢查、重做舊事。"],
    ...ASPECTS.map((a) => [TXT(a.g), `${a.name}（${a.ang}°，容許誤差 ${a.orb}°）：${a.mean}`]),
    ["線條顏色", "金＝合相、藍＝六分、紅＝四分、綠＝三分、橘＝對分。"],
    ["虛線空心圈", "切換到別的日子時，今天的位置會以外圈的空心圓標示，弧線是這段期間走過的路；月亮繞太快，只在文字顯示累計角度。"],
    ["輪盤方向", "牡羊 0° 在左側，星座逆時針排列；星體由內圈往外圈錯開，避免重疊。"],
  ];
  $("legend").replaceChildren(
    ...rows.map(([k, v]) => {
      const li = document.createElement("li");
      li.innerHTML = `<b></b><span></span>`;
      li.querySelector("b").textContent = k;
      li.querySelector("span").textContent = v;
      return li;
    }),
  );
}

/* ---------- reveal on scroll ---------- */
let io;
function observeReveals() {
  io?.disconnect();
  io = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.15 },
  );
  document.querySelectorAll(".reveal").forEach((n) => { n.classList.remove("in"); io.observe(n); });
}

/* ---------- starfield ---------- */
function stars_() {
  const c = document.getElementById("stars");
  const ctx = c.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w, h, list;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = c.width = innerWidth * dpr;
    h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + "px";
    c.style.height = innerHeight + "px";
    list = Array.from({ length: Math.round((innerWidth * innerHeight) / 5200) }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: (Math.random() * 1.1 + 0.3) * dpr,
      p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2,
    }));
  };
  const frame = (t) => {
    ctx.clearRect(0, 0, w, h);
    for (const s of list) {
      const a = reduce ? 0.6 : 0.35 + 0.45 * Math.sin(t / 1000 * s.s + s.p);
      ctx.fillStyle = `rgba(${starRgb},${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  };
  resize();
  addEventListener("resize", resize);
  requestAnimationFrame(frame);
}

const go = (n, dur) => { offsetDays = n; render({ dur }); };
$("prev").addEventListener("click", () => go(offsetDays - 1));
$("next").addEventListener("click", () => go(offsetDays + 1));
$("today").addEventListener("click", () => go(0));
$("tbBtns").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) go(Number(b.dataset.off), 1500); });
let rafId = 0;
$("tbRange").addEventListener("input", (e) => {
  const v = Number(e.target.value);
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => go(v, 500));
});

$("modeSeg").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  fortuneMode = b.dataset.mode;
  $("modeSeg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
  renderFortune();
});
$("catSeg").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  fortuneCat = b.dataset.cat;
  $("catSeg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
  renderFortune();
});

/* hover / tap focus: the table, the aspect cards and the wheel highlight each other */
const dlg = $("chartDialog");
const wheelMain = $("wheelMain");
function setFocus(keys, pair) {
  const on = keys.length > 0;
  wheelMain.classList.toggle("dim", on);
  wheelMain.querySelectorAll(".planet, .ghost").forEach((g) => g.classList.toggle("hot", keys.includes(g.dataset.key)));
  wheelMain.querySelectorAll(".asp").forEach((l) => l.classList.toggle("hot", !!pair && l.dataset.pair === pair));
  $("planets").querySelectorAll("li").forEach((li) => li.classList.toggle("hot", keys.includes(li.dataset.key)));
  $("aspects").querySelectorAll("article").forEach((c) => c.classList.toggle("hot", (!!pair && c.dataset.pair === pair) || (!pair && keys.length === 1 && c.dataset.keys.split(",").includes(keys[0]))));
}
const focusFrom = (t) => {
  const row = t.closest?.("#planets li, .planet");
  if (row) return [[row.dataset.key], null];
  const card = t.closest?.("#aspects article");
  if (card) return [card.dataset.keys.split(","), card.dataset.pair];
  return [[], null];
};
dlg.addEventListener("pointerover", (e) => { if (e.pointerType === "touch") return; const [k, p] = focusFrom(e.target); setFocus(k, p); });
dlg.addEventListener("pointerleave", () => setFocus([], null));
dlg.addEventListener("click", (e) => {
  if (e.target === dlg) return;
  const [k, p] = focusFrom(e.target);
  if (k.length && matchMedia("(hover: none)").matches) setFocus(k, p);
});

$("openChart").addEventListener("click", () => { dlg.showModal(); document.body.classList.add("lock"); });
const closeDlg = () => dlg.close();
$("closeChart").addEventListener("click", closeDlg);
dlg.addEventListener("click", (e) => { if (e.target === dlg) closeDlg(); }); // click on backdrop
dlg.addEventListener("close", () => { document.body.classList.remove("lock"); setFocus([], null); });

// keep "today" current: recompute every 5 minutes and when the Taipei date rolls over
setInterval(() => {
  if (offsetDays !== 0) return;
  const tp = taipeiParts(new Date());
  if (`${tp.y}-${tp.m}-${tp.d}` !== shownDate || Date.now() - lastRender >= 5 * 60000) render({ dur: 1200 });
}, 30000);

renderLegend();
stars_();
render();

// floating dock once the hero has scrolled away
new IntersectionObserver(([e]) => $("dock").classList.toggle("show", !e.isIntersecting), { threshold: 0.05 }).observe(document.querySelector(".hero"));

document.getElementById("themeBtn").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* storage unavailable */ }
});
