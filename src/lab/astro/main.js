import * as A from "astronomy-engine";
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

function updateWheel(svg, pos, aspects, prev) {
  if (!svg.dataset.built) buildFrame(svg);
  svg.querySelector(".dyn")?.remove();
  const dyn = el("g", { class: "dyn" }, svg);

  const lines = el("g", { class: "aspect-lines" }, dyn);
  aspects.slice(0, 8).forEach((a, i) => {
    const [x1, y1] = pt(a.a.lon, 150);
    const [x2, y2] = pt(a.b.lon, 150);
    el("line", { x1, y1, x2, y2, class: "asp asp-" + a.asp.ang, style: `--i:${i}`, pathLength: 1 }, lines);
  });

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
    const g = el("g", { class: "planet" }, layer);
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
    g.animate([{ transform: `rotate(${d}deg)` }, { transform: "rotate(0deg)" }], { duration: 1700, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
    if (Math.abs(d) >= 0.4) {
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
function drawMoon(svg, date) {
  svg.innerHTML = "";
  const phase = A.MoonPhase(date); // 0..360, 0 = new
  const illum = A.Illumination(A.Body.Moon, date).phase_fraction;
  el("circle", { r: 50, class: "moon-dark" }, svg);
  const waxing = phase < 180;
  // terminator: ellipse with rx = 50*|cos(phase)|
  const k = Math.cos((phase * Math.PI) / 180);
  const rx = Math.abs(k) * 50;
  const r = 50;
  const side = waxing ? 1 : -1; // lit limb on the right when waxing
  const lit = `M 0 ${-r} A ${r} ${r} 0 0 ${waxing ? 1 : 0} 0 ${r}`;
  const crescent = k > 0; // less than half lit
  const term = `A ${rx} ${r} 0 0 ${crescent ? (waxing ? 0 : 1) : waxing ? 1 : 0} 0 ${-r}`;
  el("path", { d: `${lit} ${term} Z`, class: "moon-lit" }, svg);
  el("circle", { r: 50, class: "moon-rim" }, svg);
  return { phase, illum, side };
}

/* ---------- render ---------- */
let offsetDays = 0;
let prevPos = null;
let shownDate = null;

const $ = (id) => document.getElementById(id);
const para = (t) => Object.assign(document.createElement("p"), { textContent: t });

function render() {
  const date = new Date(Date.now() + offsetDays * 86400000);
  const tp = taipeiParts(date);
  shownDate = `${tp.y}-${tp.m}-${tp.d}`;
  $("romanDate").textContent = `${roman(tp.y)} · ${roman(tp.m)} · ${roman(tp.d)}`;
  const dateText = `${tp.y}.${String(tp.m).padStart(2, "0")}.${String(tp.d).padStart(2, "0")} ${tp.wk}`;
  $("dateLine").textContent = `${dateText} · 台北 ${tp.hh}:${tp.mm}`;
  $("dlgDate").textContent = dateText;

  const pos = compute(date);
  const aspects = findAspects(pos);
  // the same bodies glide from where they were; the chart is never redrawn from scratch
  updateWheel($("wheelBg"), pos, aspects, prevPos);
  updateWheel($("wheelMain"), pos, aspects, prevPos);
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

  $("planets").replaceChildren(
    ...pos.map((b, i) => {
      const li = document.createElement("li");
      li.style.setProperty("--i", i);
      const mv = `${b.motion >= 0 ? "+" : "−"}${Math.abs(b.motion).toFixed(b.key === "Moon" ? 1 : 2)}°`;
      li.innerHTML = `<span class="pg">${TXT(b.g)}</span><span class="pn"><b>${b.zh}</b><i>${b.la}</i></span><span class="ps">${TXT(b.sign.g)} ${b.sign.zh} <small>${fmtDeg(b.deg)}</small>${b.retro ? ' <span class="rx" title="逆行">℞</span>' : ""}</span><span class="pr">${b.role}<small class="mv">24 小時移動 ${mv}</small></span>`;
      return li;
    }),
  );

  const top = aspects.slice(0, 5);
  $("aspects").replaceChildren(
    ...(top.length
      ? top.map((a, i) => {
          const d = document.createElement("article");
          d.style.setProperty("--i", i);
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

  observeReveals();
}

function renderLegend() {
  const rows = [
    ["℞", "逆行：從地球看，這顆星暫時「倒退」，通常提醒回頭檢查、重做舊事。"],
    ...ASPECTS.map((a) => [TXT(a.g), `${a.name}（${a.ang}°，容許誤差 ${a.orb}°）：${a.mean}`]),
    ["線條顏色", "金＝合相、藍＝六分、紅＝四分、綠＝三分、橘＝對分。"],
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
function stars() {
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
      ctx.fillStyle = `rgba(230,211,163,${a})`;
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

$("prev").addEventListener("click", () => { offsetDays -= 1; render(); });
$("next").addEventListener("click", () => { offsetDays += 1; render(); });
$("today").addEventListener("click", () => { offsetDays = 0; render(); });

const dlg = $("chartDialog");
$("openChart").addEventListener("click", () => { dlg.showModal(); document.body.classList.add("lock"); });
const closeDlg = () => dlg.close();
$("closeChart").addEventListener("click", closeDlg);
dlg.addEventListener("click", (e) => { if (e.target === dlg) closeDlg(); }); // click on backdrop
dlg.addEventListener("close", () => document.body.classList.remove("lock"));

// keep "today" current if the page stays open past midnight (Taipei time)
setInterval(() => {
  if (offsetDays !== 0) return;
  const tp = taipeiParts(new Date());
  if (`${tp.y}-${tp.m}-${tp.d}` !== shownDate) render();
}, 60000);

renderLegend();
stars();
render();
