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
    let retro = false;
    if (b.key !== "Sun" && b.key !== "Moon") {
      let d = lonOf(b.key, next) - lon;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      retro = d < 0;
    }
    const signIndex = Math.floor(lon / 30);
    return { ...b, lon, retro, signIndex, sign: SIGNS[signIndex], deg: lon - signIndex * 30 };
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
const pt = (lon, r) => [Math.cos(ang(lon)) * r, -Math.sin(ang(lon)) * r];

function drawWheel(svg, pos, aspects) {
  svg.innerHTML = "";
  const defs = el("defs", {}, svg);
  const g1 = el("radialGradient", { id: "core" }, defs);
  el("stop", { offset: "0%", "stop-color": "#e6d3a3", "stop-opacity": ".18" }, g1);
  el("stop", { offset: "100%", "stop-color": "#e6d3a3", "stop-opacity": "0" }, g1);
  el("circle", { r: 390, fill: "url(#core)" }, svg);

  const rings = [380, 330, 262, 150];
  rings.forEach((r, i) => el("circle", { r, class: "ring ring-" + i, pathLength: 1 }, svg));

  for (let d = 0; d < 360; d += 5) {
    const major = d % 30 === 0;
    const [x1, y1] = pt(d, 380);
    const [x2, y2] = pt(d, major ? 330 : d % 10 === 0 ? 362 : 370);
    el("line", { x1, y1, x2, y2, class: major ? "tick major" : "tick" }, svg);
  }
  SIGNS.forEach((s, i) => {
    const [gx, gy] = pt(i * 30 + 15, 296);
    const t = el("text", { x: gx, y: gy, class: "sign-glyph", "text-anchor": "middle", "dominant-baseline": "central" }, svg);
    t.textContent = TXT(s.g);
    const [lx, ly] = pt(i * 30 + 15, 352);
    const rot = ((180 - (i * 30 + 15)) + 90 + (i * 30 + 15 > 90 && i * 30 + 15 < 270 ? 180 : 0)) * -1;
    const l = el("text", { x: lx, y: ly, class: "sign-latin", "text-anchor": "middle", "dominant-baseline": "central", transform: `rotate(${rot} ${lx} ${ly})` }, svg);
    l.textContent = s.la.toUpperCase();
  });

  const lines = el("g", { class: "aspect-lines" }, svg);
  aspects.slice(0, 8).forEach((a, i) => {
    const [x1, y1] = pt(a.a.lon, 150);
    const [x2, y2] = pt(a.b.lon, 150);
    const ln = el("line", { x1, y1, x2, y2, class: "asp asp-" + a.asp.ang, style: `--i:${i}` }, lines);
    ln.setAttribute("pathLength", 1);
  });

  // spread bodies that sit close together on the ring
  const sorted = [...pos].sort((a, b) => a.lon - b.lon);
  const shown = new Map();
  sorted.forEach((b, i) => {
    let off = 0;
    for (let k = 0; k < i; k++) {
      const prev = sorted[k];
      if (Math.abs(prev.lon - b.lon) < 9 && shown.get(prev.key) === off) off += 1;
    }
    shown.set(b.key, off);
  });

  const planets = el("g", { class: "planet-layer" }, svg);
  pos.forEach((b, i) => {
    const r = 206 - shown.get(b.key) * 36;
    const g = el("g", { class: "planet", style: `--delay:${i * 90}ms` }, planets);
    const [x, y] = pt(b.lon, r);
    const [kx, ky] = pt(b.lon, 262);
    const [kx2, ky2] = pt(b.lon, 255);
    el("line", { x1: kx, y1: ky, x2: kx2, y2: ky2, class: "pin" }, g);
    el("circle", { cx: x, cy: y, r: 19, class: "planet-disc" }, g);
    const t = el("text", { x, y, class: "planet-glyph", "text-anchor": "middle", "dominant-baseline": "central" }, g);
    t.textContent = TXT(b.g);
    if (b.retro) {
      const r2 = el("text", { x: x + 17, y: y - 15, class: "retro-mark" }, g);
      r2.textContent = "℞";
    }
    g.dataset.lon = b.lon;
    g.dataset.cx = x;
    g.dataset.cy = y;
  });

  const core = el("g", { class: "core" }, svg);
  const sun = pos[0];
  const t1 = el("text", { y: -14, class: "core-sign", "text-anchor": "middle", "dominant-baseline": "central" }, core);
  t1.textContent = TXT(sun.sign.g);
  const t2 = el("text", { y: 32, class: "core-text", "text-anchor": "middle" }, core);
  t2.textContent = `SOL · ${sun.sign.la.toUpperCase()}`;

  sweepPlanets(svg);
}

function sweepPlanets(svg) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  svg.querySelectorAll(".planet").forEach((g, i) => {
    g.animate(
      [
        { transform: "rotate(-70deg)", opacity: 0 },
        { transform: "rotate(0deg)", opacity: 1 },
      ],
      { duration: 1900, delay: 500 + i * 90, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
    );
  });
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

function render() {
  const date = new Date(Date.now() + offsetDays * 86400000);
  const tp = taipeiParts(date);
  document.getElementById("romanDate").textContent = `${roman(tp.y)} · ${roman(tp.m)} · ${roman(tp.d)}`;
  document.getElementById("dateLine").textContent = `${tp.y}.${String(tp.m).padStart(2, "0")}.${String(tp.d).padStart(2, "0")} ${tp.wk} · 台北 ${tp.hh}:${tp.mm}`;

  const pos = compute(date);
  const aspects = findAspects(pos);
  drawWheel(document.getElementById("wheel"), pos, aspects);

  const moonInfo = drawMoon(document.getElementById("moon"), date);
  const phaseIdx = Math.round(moonInfo.phase / 45) % 8;

  document.getElementById("headline").textContent = headline(pos);
  const energy = document.getElementById("energy");
  energy.replaceChildren(...buildEnergy(pos, aspects, phaseIdx).map((t) => Object.assign(document.createElement("p"), { textContent: t })));

  const ul = document.getElementById("planets");
  ul.replaceChildren(
    ...pos.map((b, i) => {
      const li = document.createElement("li");
      li.style.setProperty("--i", i);
      li.innerHTML = `<span class="pg">${TXT(b.g)}</span><span class="pn"><b>${b.zh}</b><i>${b.la}</i></span><span class="ps">${TXT(b.sign.g)} ${b.sign.zh} <small>${fmtDeg(b.deg)}</small>${b.retro ? ' <span class="rx" title="逆行">℞</span>' : ""}</span><span class="pr">${b.role}</span>`;
      return li;
    }),
  );

  const asp = document.getElementById("aspects");
  const top = aspects.slice(0, 5);
  asp.replaceChildren(
    ...(top.length
      ? top.map((a, i) => {
          const d = document.createElement("article");
          d.style.setProperty("--i", i);
          d.innerHTML = `<div class="ag">${TXT(a.a.g)} ${TXT(a.asp.g)} ${TXT(a.b.g)}</div><h3>${a.a.zh} ${a.asp.name} ${a.b.zh}</h3><p class="la">${a.a.la} · ${a.asp.la} · ${a.b.la}　誤差 ${a.off.toFixed(1)}°</p><p>${a.asp.mean}</p>`;
          return d;
        })
      : [Object.assign(document.createElement("p"), { className: "prose", textContent: "今天沒有特別緊密的相位，是比較平靜、可以照自己步調走的一天。" })]),
  );

  document.getElementById("moonText").replaceChildren(
    ...[
      `${PHASES[phaseIdx][0]}，亮面約 ${Math.round(moonInfo.illum * 100)}%。`,
      PHASES[phaseIdx][1],
      `月亮目前在${pos[1].sign.zh}（${pos[1].sign.la}）${fmtDeg(pos[1].deg)}。`,
    ].map((t) => Object.assign(document.createElement("p"), { textContent: t })),
  );

  observeReveals();
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

document.getElementById("prev").addEventListener("click", () => { offsetDays -= 1; render(); });
document.getElementById("next").addEventListener("click", () => { offsetDays += 1; render(); });
document.getElementById("today").addEventListener("click", () => { offsetDays = 0; render(); });

stars();
render();
