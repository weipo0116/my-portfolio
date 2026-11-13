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
import NATAL_READ from "./natal-read.json";
import { compare, SYN_ZH, synastryReady } from "./synastry.js";
import FORTUNE_COPY from "./fortune-copy.json"; // per category: daily and weekly lines by house × star tier, Moon-aspect and retrograde lines // plain-language natal reading: per point a question, a sentence per sign and per house

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

// aspect text that names what the two bodies stand for, so cards of the same aspect type differ
const ASP_PHRASE = { 合相: "綁在一起、互相放大", 六分相: "互相幫一把，主動開口就有回應", 四分相: "互相拉扯，逼你做取捨", 三分相: "配合得很順，適合往前推", 對分相: "兩邊拉鋸，要找中間點" };
const pairMean = (a) => `${a.a.zh}管「${a.a.role}」，${a.b.zh}管「${a.b.role}」：兩者${ASP_PHRASE[a.asp.name] || a.asp.mean}。`;

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

/* ---------- daily rhythm (what actually changes day to day) ----------
   Sun / Mercury / Venus / Mars barely move in 24h, so the day-to-day difference
   comes from the Moon: it changes sign every ~2.3 days, makes a new exact aspect to
   a planet every few hours, and sometimes runs "void of course" (no more major aspects
   before it leaves its sign). We scan the Moon every 30 min and the planets every 6 h. */
const H = 3600000;
const WEEK = [
  { zh: "週日", pl: "太陽", g: "☉", theme: "主場感與曝光度偏高，適合露臉、做決定、整理自己的方向。" },
  { zh: "週一", pl: "月亮", g: "☽", theme: "情緒與直覺放大，適合照顧自己、家人和生活節奏。" },
  { zh: "週二", pl: "火星", g: "♂", theme: "行動與競爭的日子，適合運動、推進卡住的事，也要防急躁。" },
  { zh: "週三", pl: "水星", g: "☿", theme: "溝通與資訊流動快，適合談事、學習、處理文書與交易。" },
  { zh: "週四", pl: "木星", g: "♃", theme: "擴張與貴人運，適合規劃長線、進修、拜訪有經驗的人。" },
  { zh: "週五", pl: "金星", g: "♀", theme: "關係與審美的日子，適合約會、談合作、犒賞自己。" },
  { zh: "週六", pl: "土星", g: "♄", theme: "結構與責任的日子，適合整理、清掃、補完拖延的事。" },
];
const WK_IDX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

// Moon in each sign: how it feels, a short tag, what suits, what to go easy on.
const MOON_SIGN = [
  { feel: "情緒來得快、去得也快，坐不住，想先動手再說。", short: "想先衝", doit: "把拖著的事先動手做第一步，或出門動一動。", avoid: "一句話就嗆回去，或做完才想" },
  { feel: "想吃好、睡好、摸得到的安心，步調放慢也沒關係。", short: "要安穩", doit: "好好吃一餐、整理錢與物品，做看得到成果的事。", avoid: "硬逼自己趕進度，或衝動換方案" },
  { feel: "腦袋轉很快、話很多，注意力容易被切成好幾份。", short: "想聊想逛", doit: "回訊息、約人聊聊、蒐集資料、短途移動。", avoid: "一次開太多線，什麼都做一半" },
  { feel: "敏感、念舊、想回到熟悉的人和地方，容易被小事觸動。", short: "想回家", doit: "回家吃飯、聯絡家人老友、煮點東西、早點休息。", avoid: "把別人隨口一句話當針對你" },
  { feel: "想被看見、被肯定，心裡有舞台，也特別慷慨。", short: "想被看見", doit: "表達自己、展示作品、帶著玩心做事、稱讚身邊的人。", avoid: "為了面子硬撐或亂花錢" },
  { feel: "挑剔、想把細節弄對，看什麼都想順手修一下。", short: "想整理", doit: "清單、整理、校對、修流程、照顧身體作息。", avoid: "對自己和別人太苛刻" },
  { feel: "在意氣氛與公平，想讓關係順，也容易猶豫不決。", short: "想和諧", doit: "談合作、處理人際、逛展、整理外表與空間。", avoid: "為了不得罪人而一直拖著不答覆" },
  { feel: "情緒濃、專注、直覺很準，也容易鑽牛角尖或吃醋。", short: "想挖深", doit: "做需要專注的深度工作、看清真正的問題、獨處。", avoid: "翻舊帳、試探別人、情緒性冷戰" },
  { feel: "心情開闊，想出走、想學新東西，說話也比較直。", short: "想走遠", doit: "出門走走、規劃旅行或進修、運動、說出大方向。", avoid: "亂承諾，或話說得太滿" },
  { feel: "情緒收得很緊，責任感強，比較不想示弱。", short: "要扛事", doit: "排優先順序、處理公事與長期目標、守住界線。", avoid: "把自己逼太緊，忽略休息" },
  { feel: "抽離、有點宅，腦中想法多，對朋友和社群有興趣。", short: "想換角度", doit: "跟朋友或社群互動、研究新工具、嘗試不一樣的做法。", avoid: "冷處理關係，或為了反而反" },
  { feel: "柔軟、同理心滿格，容易恍神，也最容易被氣氛影響。", short: "想放空", doit: "聽音樂、創作、散步、睡飽，留白給直覺。", avoid: "重要決定、簽約，或幫別人扛太多情緒" },
];

// Moon–planet aspects. soft = sextile/trine, hard = square/opposition, conj = conjunction.
const MOON_PL = {
  Sun: { soft: "內在需求和外在目標對得上，決定下得順，適合見重要的人。", hard: "想要的和該做的互相拉扯，情緒寫在臉上；大決定晚點再下。", conj: "新月前後：先安靜，把想重新開始的事寫下來。", opp: "滿月前後：情緒和結果都很明顯，適合收成，也適合把話說開。" },
  Mercury: { soft: "思路清楚、說話有條理，適合談事、寫作、面試、約人。", hard: "想太多或話說太快，容易誤會；訊息送出前多讀一遍。", conj: "心思和話語同步，要講重點的時候很好用。" },
  Venus: { soft: "人際柔和、品味在線，適合約會、談合作、買想要的東西。", hard: "容易想要太多、對關係挑剔；花錢和表態先等一下。", conj: "感受特別細，想被疼愛，也想好好對待自己。" },
  Mars: { soft: "有幹勁、反應快，適合運動、推進卡住的事、做需要體力的工作。", hard: "火氣和急躁上升，容易頂嘴或受小傷；開車、討論都慢一點。", conj: "衝動值高，把力氣花在體力活或運動上最划算。" },
  Jupiter: { soft: "樂觀、大方，貴人和機會容易出現，適合提出請求。", hard: "容易過度承諾、吃多買多；把計畫抓小一點。", conj: "心情被放大，信心很足，記得留一點餘裕。" },
  Saturn: { soft: "踏實、耐得住，適合處理雜務和長期計畫。", hard: "情緒偏低壓、覺得被限制或被評價；早點休息，別苛責自己。", conj: "比較嚴肅、有點孤單；適合獨處、收尾、檢討。" },
};
const PL_WEIGHT = { Sun: 5, Mars: 4, Saturn: 4, Venus: 3, Jupiter: 3, Mercury: 3 };
const PLANETS = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const PL_ZH = { Sun: "太陽", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星" };
const PL_G = { Sun: "☉", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄" };
const ASP_ANGS = [[0, 0], [60, 1], [90, 2], [120, 3], [180, 4], [240, 3], [270, 2], [300, 1]]; // [angle, ASPECTS index]
const aspKind = (ang) => (ang === 0 ? "conj" : ang === 60 || ang === 120 || ang === 240 || ang === 300 ? "soft" : "hard");
const wrap180 = (d) => { d = norm(d); return d > 180 ? d - 360 : d; };
const fmtT = (t) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Taipei", hour: "2-digit", minute: "2-digit", hour12: false }).format(t);
const SIGN_RULER = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const RULER_ZH = { Sun: "太陽", Moon: "月亮", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星" };

const dayCache = new Map();
function dayInfo(date) {
  const tp = taipeiParts(date);
  const key = `${tp.y}-${tp.m}-${tp.d}`;
  if (dayCache.has(key)) return dayCache.get(key);
  const start = Date.UTC(tp.y, tp.m - 1, tp.d) - 8 * H; // Taipei midnight
  const end = start + 24 * H;
  const t0 = start - 24 * H;
  const STEP = H / 2;
  const n = 168; // 84 h window: 24 h before the day to 36 h after (to find the next ingress)
  const ts = [], moon = [];
  for (let i = 0; i <= n; i++) {
    ts.push(t0 + i * STEP);
    moon.push(norm(A.EclipticGeoMoon(new Date(ts[i])).lon));
  }
  const pl = {};
  for (const k of PLANETS) {
    pl[k] = [];
    for (let j = 0; j <= 14; j++) pl[k].push(lonOf(k, new Date(t0 + j * 6 * H)));
  }
  const lonP = (k, t) => {
    const x = (t - t0) / (6 * H), i = Math.min(13, Math.floor(x)), f = x - i;
    return pl[k][i] + wrap180(pl[k][i + 1] - pl[k][i]) * f;
  };
  const ing = [], asp = [];
  for (let i = 0; i < n; i++) {
    const s0 = Math.floor(moon[i] / 30), s1 = Math.floor(moon[i + 1] / 30);
    if (s0 !== s1) {
      const need = wrap180(s1 * 30 - moon[i]), d = wrap180(moon[i + 1] - moon[i]);
      ing.push({ kind: "ing", t: ts[i] + (need / d) * STEP, sign: s1 });
    }
    for (const k of PLANETS) {
      const pa = lonP(k, ts[i]), pb = lonP(k, ts[i + 1]);
      for (const [ang, ai] of ASP_ANGS) {
        const f0 = wrap180(moon[i] - pa - ang), f1 = wrap180(moon[i + 1] - pb - ang);
        if (f0 < 0 && f1 >= 0 && f1 - f0 < 10) asp.push({ kind: "asp", t: ts[i] + (-f0 / (f1 - f0)) * STEP, p: k, ang, ai });
      }
    }
  }
  // void-of-course: from the Moon's last exact aspect in a sign until it leaves that sign
  const voc = [];
  ing.forEach((g, idx) => {
    const prev = idx ? ing[idx - 1].t : null;
    const from0 = prev ?? t0;
    const inSign = asp.filter((a) => a.t > from0 && a.t < g.t);
    const vs = inSign.length ? Math.max(...inSign.map((a) => a.t)) : prev;
    if (vs == null) return;
    const a = Math.max(vs, start), b = Math.min(g.t, end);
    if (b - a >= H / 2) voc.push({ from: a, to: b, full: [vs, g.t] });
  });
  // moon sign segments clipped to the day
  const bounds = [start, ...ing.filter((g) => g.t > start && g.t < end).map((g) => g.t), end];
  const signAt = (t) => Math.floor(moon[Math.min(n, Math.max(0, Math.round((t - t0) / STEP)))] / 30);
  const segs = bounds.slice(0, -1).map((a, i) => ({ from: a, to: bounds[i + 1], sign: signAt((a + bounds[i + 1]) / 2) }));
  const events = [...ing, ...asp].filter((e) => e.t >= start && e.t < end).sort((a, b) => a.t - b.t);
  const sunN = lonP("Sun", start + 12 * H);
  const age = (norm(moon[Math.round((start + 12 * H - t0) / STEP)] - sunN) / 360) * 29.53;
  const info = { ms: { t0, STEP, moon }, key, start, end, wk: WEEK[WK_IDX[tp.wk]], events, segs, voc, age, dom: segs.reduce((m, s) => (s.to - s.from > m.to - m.from ? s : m)).sign };
  dayCache.set(key, info);
  return info;
}

const evKind = (e) => aspKind(e.ang);
const evScore = (e) => PL_WEIGHT[e.p] + (e.ang === 0 || e.ang === 180 ? 1 : 0);
function evText(e) {
  const a = ASPECTS[e.ai], k = evKind(e), tb = MOON_PL[e.p];
  const mean = e.p === "Sun" && k === "hard" && e.ang === 180 ? tb.opp : e.p === "Sun" && k === "hard" && e.ang !== 180 ? `上／下弦月：${tb.hard}` : tb[k];
  return { title: `月亮 ${a.g} ${PL_ZH[e.p]}`, name: `月亮${a.name}${PL_ZH[e.p]}`, mean };
}
const bestOf = (info, kinds) => info.events.filter((e) => e.kind === "asp" && kinds.includes(evKind(e))).sort((a, b) => evScore(b) - evScore(a))[0];
const bestSoft = (info) => bestOf(info, ["soft", "conj"]);
const bestHard = (info) => bestOf(info, ["hard"]);
const timeAt = (e) => fmtT(e.t);

function buildEnergy(pos, aspects, phaseIdx, info) {
  const sun = pos[0], moon = pos[1], mer = pos[2], ven = pos[3], mar = pos[4];
  const deanIdx = Math.min(2, Math.floor(sun.deg / 10));
  const decRuler = RULER_ZH[SIGN_RULER[(sun.signIndex + 4 * deanIdx) % 12]];
  const rx = (b) => (b.retro ? " ℞" : "");
  return [
    { g: sun.g, k: `太陽 · ${sun.sign.zh} ${Math.floor(sun.deg)}°`, t: `這個月的主旋律：${sun.sign.tone}。目前在第 ${deanIdx + 1} 旬，帶一點${decRuler}的味道。` },
    { g: mer.g, k: `水星 · ${mer.sign.zh}${rx(mer)}`, t: mer.retro ? "逆行中：合約、行程、訊息再確認一次，備份檔案；舊事重提比開新局順。" : "順行：溝通與判斷如常，適合談事情與簽約。" },
    { g: ven.g, k: `金星 · ${ven.sign.zh}${rx(ven)}`, t: `關係與花錢的取向：${ven.sign.tone}。${ven.retro ? "逆行時適合回頭整理舊關係與舊帳，不急著買大東西。" : ""}` },
    { g: mar.g, k: `火星 · ${mar.sign.zh}${rx(mar)}`, t: `做事的方式：${mar.sign.tone}。${mar.retro ? "逆行時力氣容易內耗，先把舊的收尾。" : ""}` },
  ];
}

function headline(pos, info) {
  const m = MOON_SIGN[info.dom], ms = SIGNS[info.dom];
  if (info.segs.length > 1) {
    const a = info.segs[0].sign, b = info.segs[1].sign;
    return `${info.wk.zh}${info.wk.pl}日，月亮 ${fmtT(info.segs[1].from)} 從${SIGNS[a].zh}進${SIGNS[b].zh}——${MOON_SIGN[a].short}轉${MOON_SIGN[b].short}。`;
  }
  return `${info.wk.zh}${info.wk.pl}日，月在${ms.zh}——${m.short}。`;
}

const ACTION_FALLBACK = "照自己的步調走，把一件事做完。";
function buildSummary(pos, aspects, phaseIdx, info) {
  const mer = pos[2];
  const ms = SIGNS[info.dom], m = MOON_SIGN[info.dom];
  const s1 = `${info.wk.zh}由${info.wk.pl}當值：${info.wk.theme}`;
  const sg2 = info.segs.length > 1 ? info.segs[1].sign : null;
  const s2 = sg2 == null ? `月亮在${ms.zh}：${m.feel}` : `月亮上半天在${SIGNS[info.segs[0].sign].zh}：${MOON_SIGN[info.segs[0].sign].feel}${fmtT(info.segs[1].from)} 後進${SIGNS[sg2].zh}：${MOON_SIGN[sg2].feel}`;
  const hard = bestHard(info), soft = bestSoft(info);
  const key = [hard, soft].filter(Boolean).sort((a, b) => evScore(b) - evScore(a))[0];
  const s3 = !key && mer.retro ? "水星逆行中，重要訊息與合約多確認一次。" : "";
  const lines = [["當值", `${info.wk.zh} · ${info.wk.pl}日`, info.wk.theme]];
  if (sg2 == null) lines.push(["月亮", `在${ms.zh}`, m.feel]);
  else {
    lines.push(["月亮", `${fmtT(info.segs[1].from)} 前在${SIGNS[info.segs[0].sign].zh}`, MOON_SIGN[info.segs[0].sign].feel]);
    lines.push(["", `${fmtT(info.segs[1].from)} 後進${SIGNS[sg2].zh}`, MOON_SIGN[sg2].feel]);
  }
  if (s3) lines.push(["水星", "逆行中", "重要訊息與合約多確認一次。"]);
  return { lines, text: [s1, s2, s3].filter(Boolean).join(""), advice: `${m.doit}${key && evKind(key) === "hard" ? `留意：${m.avoid}。` : `少碰：${m.avoid}。`}` };
}

function buildTags(pos, aspects, phaseIdx, info) {
  const mer = pos[2];
  const soft = bestSoft(info), hard = bestHard(info), v = info.voc[0];
  const m = MOON_SIGN[info.dom];
  const when = (e) => `${timeAt(e)} 前後最明顯（${evText(e).name}）`;
  return [
    ["適合", m.doit, soft ? when(soft) : ""],
    ["留意", `${m.avoid}。`, v ? `${fmtT(v.from)}–${fmtT(v.to)} 月亮空轉，不開新局` : hard ? when(hard) : mer.retro ? "水星逆行：訊息、合約多確認" : ""],
    ["月相", `${PHASES[phaseIdx][0]}：${PHASES[phaseIdx][1]}`, `月齡 ${info.age.toFixed(1)} 天`],
  ];
}

// "what's different from the day before": built from the same scan, so it reads as a real diff
function diffLines(info, prev, pos, prevPos) {
  const out = [];
  out.push({ k: "當值星", t: `${prev.wk.zh}${prev.wk.pl} → ${info.wk.zh}${info.wk.pl}：${info.wk.theme}` });
  const a = prev.segs[prev.segs.length - 1].sign, b = info.segs[0].sign;
  if (a === b && info.segs.length === 1) out.push({ k: "月亮", t: `仍在${SIGNS[b].zh}，情緒基調延續前一天：${MOON_SIGN[b].short}。` });
  else {
    const last = info.segs[info.segs.length - 1].sign;
    out.push({ k: "月亮", t: `${SIGNS[a].zh} → ${SIGNS[last].zh}${info.segs.length > 1 ? `（${fmtT(info.segs[1].from)} 換座）` : ""}：${MOON_SIGN[last].short}。` });
  }
  const cnt = (i, kinds) => i.events.filter((e) => e.kind === "asp" && kinds.includes(evKind(e))).length;
  const cs = cnt(info, ["soft"]), ch = cnt(info, ["hard"]), ps = cnt(prev, ["soft"]), ph = cnt(prev, ["hard"]);
  const net = cs - ch - (ps - ph);
  out.push({ k: "相位", t: `順的 ${cs}（前一天 ${ps}）、緊的 ${ch}（前一天 ${ph}）——${cs + ch === 0 ? "今天幾乎沒有相位，比較安靜" : net > 0 ? "比前一天順一些" : net < 0 && ch > ph ? "比前一天緊一些" : net < 0 ? "順的變少，節奏平淡一些" : "和前一天差不多"}。` });
  out.push({ k: "空轉", t: info.voc.length ? `${info.voc.map((v) => `${fmtT(v.from)}–${fmtT(v.to)}`).join("、")} 月亮空轉${prev.voc.length ? "（前一天也有）" : "（前一天沒有）"}。` : `沒有月亮空轉${prev.voc.length ? "（前一天有）" : ""}，時段都可以正常開始新事。` });
  out.push({ k: "月齡", t: `${prev.age.toFixed(1)} → ${info.age.toFixed(1)} 天${Math.round(prev.age / 3.69) !== Math.round(info.age / 3.69) ? "，月相換了一階" : ""}。` });
  const slow = [];
  pos.forEach((p, i) => {
    if (p.key === "Moon") return;
    const q = prevPos[i];
    if (q.signIndex !== p.signIndex) slow.push(`${p.zh}進入${p.sign.zh}`);
    if (q.retro !== p.retro) slow.push(`${p.zh}${p.retro ? "開始逆行" : "恢復順行"}`);
  });
  if (slow.length) out.push({ k: "大事", t: `${slow.join("、")}。` });
  return out;
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
// Procedural moon surface: fractal noise + maria blobs + power-law craters, lit from the
// upper left and rendered once to a canvas. The lit phase is a soft mask over it.
const MARIA = [[-0.34, -0.28, 0.3, 0.22], [0.1, -0.4, 0.17, 0.15], [0.33, -0.1, 0.22, 0.15], [0.68, -0.2, 0.09, 0.12], [-0.68, 0.04, 0.18, 0.4], [-0.28, 0.38, 0.22, 0.14], [-0.6, 0.45, 0.1, 0.1], [0.06, 0.06, 0.12, 0.1], [0.5, 0.22, 0.1, 0.07]];
let moonTex = null;
function moonTexture() {
  if (moonTex) return moonTex;
  const N = 420, R = N / 2;
  let seed = 7;
  const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // value noise
  const G = 64, grid = Float32Array.from({ length: G * G }, rnd);
  const vn = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const g = (i, j) => grid[(((j % G) + G) % G) * G + (((i % G) + G) % G)];
    return (g(xi, yi) * (1 - u) + g(xi + 1, yi) * u) * (1 - v) + (g(xi, yi + 1) * (1 - u) + g(xi + 1, yi + 1) * u) * v;
  };
  const fbm = (x, y) => { let a = 0.5, f = 1, t = 0; for (let o = 0; o < 5; o++) { t += a * vn(x * f, y * f); a *= 0.5; f *= 2.03; } return t; };
  const h = new Float32Array(N * N), alb = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const nx = (x - R) / R, ny = (y - R) / R;
    const i = y * N + x;
    h[i] = fbm(nx * 5 + 11, ny * 5 + 3) * 0.6;
    let m = 0;
    for (const [cx, cy, rx, ry] of MARIA) { const d = ((nx - cx) / rx) ** 2 + ((ny - cy) / ry) ** 2; m += Math.exp(-d * 1.0); }
    const edge = fbm(nx * 7 + 40, ny * 7 + 9);
    m = Math.min(1, Math.max(0, m * (0.75 + edge * 0.5) - 0.12));
    alb[i] = 0.78 - 0.34 * m + (fbm(nx * 11 + 5, ny * 11 + 21) - 0.5) * 0.2;
  }
  // craters: many small, few large
  const craters = [];
  for (let k = 0; k < 150; k++) {
    const r = 2.5 + Math.pow(rnd(), 4.6) * 44;
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (R - r * 0.4);
    craters.push([R + Math.cos(a) * d, R + Math.sin(a) * d, r]);
  }
  craters.push([R - 0.09 * R, R + 0.72 * R, 15]); // Tycho
  craters.push([R - 0.4 * R, R + 0.1 * R, 17]); // Copernicus
  for (const [cx, cy, r] of craters) {
    const bright = r > 12 ? 0.08 : 0.03;
    const x0 = Math.max(0, Math.floor(cx - r * 1.7)), x1 = Math.min(N - 1, Math.ceil(cx + r * 1.7));
    const y0 = Math.max(0, Math.floor(cy - r * 1.7)), y1 = Math.min(N - 1, Math.ceil(cy + r * 1.7));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - cx, y - cy) / r;
      let dh = 0;
      if (d < 1) dh = -0.4 * (1 - d * d) * (0.5 + r / 90);
      dh += 0.12 * Math.exp(-((d - 1.02) ** 2) / 0.03) * (0.5 + r / 90);
      const i = y * N + x;
      h[i] += dh * 0.6;
      if (d < 1.9) alb[i] += bright * Math.exp(-d * d * 0.7);
    }
  }
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(N, N);
  for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
    const nx = (x - R) / R, ny = (y - R) / R, rr = Math.hypot(nx, ny);
    const i = y * N + x, o = i * 4;
    if (rr > 1) { img.data[o + 3] = 0; continue; }
    const gx = h[i + 1] - h[i - 1], gy = h[i + N] - h[i - N];
    const shade = 1 + (-gx - gy) * 0.95; // light from the upper left
    const limb = 1 - 0.38 * Math.pow(rr, 3.2);
    const v = Math.max(0.05, Math.min(1, alb[i] * shade * limb));
    img.data[o] = v * 238;
    img.data[o + 1] = v * 232;
    img.data[o + 2] = v * 216;
    img.data[o + 3] = rr > 0.985 ? Math.round(255 * (1 - (rr - 0.985) / 0.015)) : 255;
  }
  ctx.putImageData(img, 0, 0);
  moonTex = c.toDataURL("image/png");
  return moonTex;
}

function drawMoon(svg, date) {
  svg.innerHTML = "";
  const phase = A.MoonPhase(date); // 0..360, 0 = new
  const illum = A.Illumination(A.Body.Moon, date).phase_fraction;
  const r = 50;
  const defs = el("defs", {}, svg);
  const soft = el("filter", { id: "mTerm", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
  el("feGaussianBlur", { stdDeviation: "1.1" }, soft);

  const waxing = phase < 180;
  const k = Math.cos((phase * Math.PI) / 180);
  const rx = Math.abs(k) * r;
  const lit = `M 0 ${-r} A ${r} ${r} 0 0 ${waxing ? 1 : 0} 0 ${r}`;
  const crescent = k > 0; // less than half lit
  const term = `A ${rx} ${r} 0 0 ${crescent ? (waxing ? 0 : 1) : waxing ? 1 : 0} 0 ${-r}`;
  const mask = el("mask", { id: "mLitMask", maskUnits: "userSpaceOnUse", x: -60, y: -60, width: 120, height: 120 }, defs);
  el("path", { d: `${lit} ${term} Z`, fill: "#fff", filter: "url(#mTerm)" }, mask);

  const tex = moonTexture();
  el("circle", { r, class: "moon-dark" }, svg);
  el("image", { href: tex, x: -r, y: -r, width: r * 2, height: r * 2, opacity: "0.17", class: "moon-earthshine" }, svg);
  el("image", { href: tex, x: -r, y: -r, width: r * 2, height: r * 2, mask: "url(#mLitMask)" }, svg);
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
      if (b.signIndex !== was.signIndex) ev.push({ t: when, icon: TXT(b.g), text: `${b.zh}進入${b.sign.zh}`, kind: "ingress" });
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
// Daily text for the fortune card. The Moon's solar house sets the theme for ~2.5 days,
// and the Moon's exact aspects that day add a line for the categories that planet rules,
// so the wording follows the shown day's sky instead of only the sign and star tier.
// [text, do, avoid] per house (1-12) per category
const HOUSE_CAT = {
  love: [
    ["你的狀態寫在臉上，打扮一下、主動一點更有吸引力。", "整理外型", "等對方先開口"],
    ["在意安全感與實際付出，一頓好飯比甜言蜜語更打動人。", "一起吃頓好的", "用錢衡量感情"],
    ["話題和訊息都變多，傳一則訊息就能拉近距離。", "主動傳訊息", "已讀不回"],
    ["想待在熟悉的人身邊，在家吃飯、窩著聊天最療癒。", "陪家人或另一半", "排太多外出行程"],
    ["心動指數高，適合約會、表白、做浪漫的事。", "約會或表白", "壓抑心動"],
    ["實際的照顧比浪漫更重要，幫對方做一件小事就很加分。", "幫對方一個小忙", "挑剔小毛病"],
    ["注意力在對方身上，一對一好好聊最有效。", "一對一深聊", "只顧自己的步調"],
    ["感受變深，適合談信任與承諾，也容易敏感吃醋。", "說出真心話", "試探對方"],
    ["想要新鮮感，一起去沒去過的地方，或聊聊未來。", "安排小旅行", "一成不變"],
    ["心思偏向工作，記得留一點時間給在乎的人。", "預留約會時間", "把工作情緒帶回家"],
    ["朋友圈是好緣分的來源，聚會或團體活動容易遇到對的人。", "參加聚會", "把自己關起來"],
    ["需要一點獨處，感情先放慢，給彼此一些空間。", "留空間給彼此", "逼對方表態"],
  ],
  career: [
    ["注意力回到自己身上，適合定下目標、主動開一個頭。", "自己先開頭", "等人分配"],
    ["適合處理報價、預算、資源分配這類實際的事。", "談報價與預算", "做白工"],
    ["訊息量大，適合回信、開會、寫文件、學新東西。", "清信箱、寫文件", "一心多用"],
    ["心思容易飄回家，適合處理文書、整理工作環境。", "整理桌面與檔案", "硬撐加班"],
    ["創意和表現欲旺，適合提點子、做簡報、展示作品。", "提點子", "只做例行公事"],
    ["適合處理細節、修流程，把待辦一項項做完。", "清待辦清單", "拖延小事"],
    ["適合談合作、找人搭檔、處理客戶關係。", "談合作", "單打獨鬥"],
    ["適合鑽研一件難題，處理別人不想碰的深水區。", "專注攻一件難事", "到處分心"],
    ["適合進修、規劃長期方向，接觸不同領域的人。", "上課進修", "只看眼前"],
    ["表現容易被看見，適合處理大事、和主管溝通。", "向上報告", "低調躲事"],
    ["團隊合作順，適合找同事一起腦力激盪。", "團隊討論", "什麼都自己扛"],
    ["適合收尾、整理、做幕後工作，不急著開新案。", "收尾舊案", "開新坑"],
  ],
  money: [
    ["比較想花在自己身上，買之前問一句：是需要還是心情？", "投資自己", "情緒性購物"],
    ["對錢特別敏感，適合記帳、檢查收支。", "記帳對帳", "衝動下單"],
    ["資訊多，比價查資料很有效率，但別被話術帶走。", "比價查資料", "聽信小道消息"],
    ["花錢偏向家用，添購實用的東西比較值。", "添購家用", "為家人過度花費"],
    ["玩樂開銷容易變多，娛樂預算先抓好。", "設娛樂預算", "為面子請客"],
    ["適合整理訂閱、帳單、保險這類例行財務。", "整理訂閱帳單", "忽略小額支出"],
    ["合夥與共同支出要講清楚，簽約前多看一眼。", "講清楚分攤", "隨口答應借錢"],
    ["適合處理貸款、稅務、共同財產等深一層的財務。", "處理稅務貸款", "高風險投機"],
    ["花在學習與旅行上的錢比較值得。", "投資學習", "衝動訂行程"],
    ["收入跟表現連動，適合談加薪、爭取獎金。", "爭取應得的", "不好意思開口"],
    ["人脈帶來資訊與機會，但團購湊單要克制。", "交換資訊", "跟風團購"],
    ["容易恍神漏掉細節，大額支出延後再說。", "延後大額支出", "沒看清楚就付款"],
  ],
};
// which categories each planet speaks to, and what an easy / hard Moon aspect to it means there
const ASP_CAT = {
  Sun: { cats: ["career"], soft: "目標清楚，決定下得順。", hard: "想要的和該做的會打架，大決定晚點再下。" },
  Mercury: { cats: ["career", "money"], soft: "腦袋清楚、說話有條理，談事比價都順手。", hard: "容易講錯或看漏，訊息和帳單送出前多看一遍。" },
  Venus: { cats: ["love", "money"], soft: "人緣好、氣氛甜，眼光也準。", hard: "容易想要太多，表態和花錢先等等。" },
  Mars: { cats: ["career", "love"], soft: "行動力強，適合推進卡住的事。", hard: "容易急躁頂嘴，說話慢半拍。" },
  Jupiter: { cats: ["money", "career"], soft: "容易遇到機會和貴人。", hard: "容易答應太多、買太多，抓小一點。" },
  Saturn: { cats: ["career", "money"], soft: "耐得住，適合處理長期的事。", hard: "壓力感比較重，先把該做的做完。" },
};
// 13:33 -> 下午 1 點半; everyday wording for the fortune card
function plainTime(t) {
  const [hh, mm] = fmtT(t).split(":").map(Number);
  let h = hh, half = false;
  if (mm >= 45) h += 1; else if (mm >= 15) half = true;
  h %= 24;
  const part = h < 5 ? "凌晨" : h < 11 ? "早上" : h < 13 ? "中午" : h < 18 ? "下午" : "晚上";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${part} ${h12} 點${half ? "半" : ""}`;
}
const VOC_CAT = {
  love: "感情上的話先別急著說死。",
  career: "適合收尾整理，新提案晚點再丟。",
  money: "簽約和大額付款先緩一緩。",
};
// void-of-course in plain words: "下午 3 點以後" / "晚上 10 點半以前" / "A 到 B 之間"
function vocSpan(info, v) {
  const a = v.from <= info.start, b = v.to >= info.end;
  if (a && b) return "整天";
  if (a) return `${plainTime(v.to)}以前`;
  if (b) return `${plainTime(v.from)}以後`;
  return `${plainTime(v.from)}到${plainTime(v.to)}之間`;
}
function dayAspectFor(info, cat, used = new Set()) {
  // each Moon aspect is told once per card, so two categories never repeat the same sentence
  const evs = info.events.filter((e) => e.kind === "asp" && ASP_CAT[e.p]?.cats.includes(cat) && !used.has(e));
  if (!evs.length) return null;
  // the planet's main category first, then the stronger aspect
  const e = evs.sort((a, b) => (ASP_CAT[a.p].cats[0] === cat ? 0 : 1) - (ASP_CAT[b.p].cats[0] === cat ? 0 : 1) || evScore(b) - evScore(a))[0];
  used.add(e);
  const k = evKind(e);
  const hard = k === "hard" || (k === "conj" && (e.p === "Mars" || e.p === "Saturn"));
  // the last aspect before a void-of-course stretch sits right on its start: say "before X" so it
  // never reads as "good around 3pm" next to "decisions after 3pm go nowhere"
  const v = info.voc.find((x) => Math.abs(e.t - x.full[0]) < H || (e.t >= x.from && e.t <= x.to));
  const when = v ? `${plainTime(v.full[0])}以前` : `${plainTime(e.t)}前後`;
  const tail = v && !hard ? "，把要談的事趁這之前談完" : "";
  const pol = hard ? "hard" : "soft";
  const line = copyLine(FORTUNE_COPY[cat]?.aspect?.[e.p]?.[pol], `${info.key}|${cat}|${e.p}`) || ASP_CAT[e.p][pol];
  return { hard, text: `${when}，${line.replace(/。$/, "")}${tail}。` };
}
function moonHouseOf(info, si) {
  // the house the Moon spends most of the shown day in, for this sun sign
  return signDist(info.dom, si);
}
// One of a few written lines, fixed for a given seed so a page reload says the same thing.
function copyLine(arr, seed) {
  return arr?.length ? arr[fnv(seed) % arr.length] : null;
}
// which slow-moving retrogrades speak to each category (the line is said once per card)
const RETRO_CAT = { love: ["Venus", "Mars", "Mercury"], career: ["Mercury", "Mars"], money: ["Mercury", "Venus"] };
function dailyNote(si, cat, used, stars) {
  const info = currentDay.info;
  const h = moonHouseOf(info, si);
  const [old, doit, avoid] = HOUSE_CAT[cat][h];
  // the Moon's house sets the theme, the star count sets the tone; the date picks the wording
  // the Moon stays in a house 2–3 days, so the two lines take turns day by day instead of by chance
  const lines = FORTUNE_COPY[cat]?.daily?.[h]?.[tierOf(stars)];
  const text = lines?.length ? lines[(Math.round(info.start / DAY) + fnv(`${si}|${cat}`)) % lines.length] : old;
  const asp = dayAspectFor(info, cat, used);
  let extra = asp ? asp.text : "";
  if (!extra && !used.has("retro")) {
    const r = RETRO_CAT[cat].find((k) => currentDay.pos.find((b) => b.key === k)?.retro);
    const line = r && copyLine(FORTUNE_COPY[cat]?.retro?.[r], `${info.key}|${si}|${cat}|retro`);
    if (line) { extra = line; used.add("retro"); }
  }
  const v = info.voc[0];
  // a void-of-course window is said once in the headline; here only when it is the day's whole story
  if (!extra && v) extra = VOC_CAT[cat];
  return { text: `${text}${extra}`, doit, avoid };
}


// Houses only change when a planet changes sign, so on most days the ranking would not move.
// Add a smooth aspect to the middle of each sun sign: the Moon sweeps ~13° a day and the inner
// planets ~1°, so the score drifts day to day instead of jumping only on sign changes.
const SIGN_ASPECTS = [[0, 8, 0.6], [60, 6, 0.5], [90, 7, -0.6], [120, 7, 0.7], [180, 8, -0.5]];
function aspectPull(b, si) {
  let diff = Math.abs(b.lon - (si * 30 + 15));
  if (diff > 180) diff = 360 - diff;
  let pull = 0;
  for (const [ang, orb, v] of SIGN_ASPECTS) {
    const off = Math.abs(diff - ang);
    if (off >= orb) continue;
    const strength = Math.cos((off / orb) * (Math.PI / 2));
    // Saturn's easy aspects help less than its hard ones hurt
    pull += (b.key === "Saturn" && v > 0 ? 0.3 * v : v) * strength;
  }
  // the Moon is the day-to-day mover in a daily reading, so it counts double
  return b.key === "Moon" ? pull * 2 : pull;
}

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
        c += w[cat] * aspectPull(b, si);
        total += c;
        parts.push({ b, house, c });
      }
      parts.sort((x, y) => Math.abs(y.c) - Math.abs(x.c));
      res[cat] = { total, parts };
    }
    return res;
  });
}

function toStars(values) {
  const lo = Math.min(...values), hi = Math.max(...values);
  const span = hi - lo || 1;
  return values.map((v) => 1 + Math.round((4 * (v - lo)) / span));
}

// The reason must come from the transit that actually moved this score:
// strongest helper for 4-5 stars, strongest drag for 1-2 stars, strongest of either for 3.
function driverOf(parts, stars) {
  const byC = parts.slice().sort((x, y) => y.c - x.c);
  if (stars >= 4) return byC[0];
  if (stars <= 2) return byC[byC.length - 1];
  return parts.slice().sort((x, y) => Math.abs(y.c) - Math.abs(x.c))[0];
}

// category-specific wording, so 財運 never repeats the 事業 sentence
const WHY_TAIL = {
  love: { hi: "替感情運加分", mid: "對感情的影響不大，照常相處即可", lo: "要多留心感情上的敏感與誤會" },
  career: { hi: "替工作推進加分", mid: "對工作的影響平穩，照節奏走", lo: "要多留心工作上的卡關與溝通" },
  money: { hi: "替財運加分", mid: "對收支的影響平穩，照預算走", lo: "要多留心支出與金錢上的決定" },
};

function fortuneNote(si, cat, stars, parts, week = false, seed = "") {
  const { b, house, c } = driverOf(parts, stars);
  const tier = tierOf(stars);
  let tail = WHY_TAIL[cat][tier];
  if (tier === "hi" && c < 0) tail = `對${CATS[cat]}的阻力相對小`; // all pulls were negative; this sign is least affected
  if (tier === "lo" && c >= 0) tail = `對${CATS[cat]}的助力偏弱，要多留心`;
  // a week reads from where its driving planet sits and how the week scores, not a fixed sign line
  const weekLine = week && copyLine(FORTUNE_COPY[cat]?.week?.[house - 1]?.[tier], `${seed}|${si}|${cat}`);
  return {
    text: weekLine || `${SIGN_LINE[cat][si]}${TIP[cat][tier]}`,
    why: `${week ? "本週中段" : ""}${b.zh}${b.retro ? "（逆行）" : ""}走到你的「${AREA[house - 1]}」，${tail}`,
  };
}

function dayFortune(pos) {
  const raw = rawFortune(pos);
  const out = {};
  for (const cat of Object.keys(CATS)) {
    const stars = toStars(raw.map((r) => r[cat].total));
    out[cat] = SIGNS.map((sg, i) => {
      const n = fortuneNote(i, cat, stars[i], raw[i][cat].parts);
      return { sign: sg, stars: stars[i], score: raw[i][cat].total, note: n.text, why: n.why };
    });
  }
  return out;
}

// "11/2–11/8" for the Monday-to-Sunday week that contains date (Taipei)
function weekSpan(date) {
  const tp = taipeiParts(date);
  const dow = (new Date(Date.UTC(tp.y, tp.m - 1, tp.d)).getUTCDay() + 6) % 7;
  const mon = new Date(noonTaipei(tp).getTime() - dow * DAY);
  return `${md(mon)}–${md(new Date(mon.getTime() + 6 * DAY))}`;
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
      // sum each planet's push over the seven days; keep the mid-week house for the wording
      const parts = mid[i][cat].parts.map((p) => ({ ...p, c: raws.reduce((n, r) => n + r[i][cat].parts.find((q) => q.b.key === p.b.key).c, 0) / 7 }));
      const n = fortuneNote(i, cat, stars[i], parts, true, md(days[0]));
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
const SIGN_KEY = "astra-sign";
let fortuneSign = "all"; // "all" or a sign index 0-11
try { const v = localStorage.getItem(SIGN_KEY); if (v && v !== "all" && Number(v) >= 0 && Number(v) < 12) fortuneSign = Number(v); } catch { /* storage unavailable */ }
const SIGN_DATES = ["3/21–4/19", "4/20–5/20", "5/21–6/21", "6/22–7/22", "7/23–8/22", "8/23–9/22", "9/23–10/23", "10/24–11/22", "11/23–12/21", "12/22–1/19", "1/20–2/18", "2/19–3/20"];
let currentFortune = null;
let currentWeek = null;
let currentDay = null; // { tp, headline, summary, advice } for the shown date

/* ---------- "my fortune" view (general audience) ---------- */
const DO_DONT = {
  love: {
    hi: [["主動約對方", "大方說出喜歡"], ["想太多而錯過", "故意冷處理"]],
    mid: [["日常的小關心", "一起吃頓飯"], ["翻舊帳", "拿別人的感情比較"]],
    lo: [["先照顧好自己的情緒", "重要的話等冷靜再說"], ["深夜聊沉重話題", "用已讀不回試探"]],
  },
  career: {
    hi: [["提案、爭取任務", "跨部門合作"], ["過度謙虛", "拖延回覆"]],
    mid: [["收尾手上的工作", "整理待辦清單"], ["臨時改方向", "同時開太多新坑"]],
    lo: [["多確認一次細節", "先做最重要的一件"], ["衝動回信", "當眾否定別人"]],
  },
  money: {
    hi: [["檢視投資配置", "談報價或加薪"], ["跟風下大注", "忘了記帳"]],
    mid: [["照預算消費", "整理訂閱與帳單"], ["為折扣買不需要的東西", "隨口答應借錢"]],
    lo: [["延後大額支出", "先存一筆預備金"], ["衝動購物", "高風險投機"]],
  },
};
const LUCKY_COLORS = [["深藍", "#1f3a68"], ["酒紅", "#7a1f2b"], ["墨綠", "#1f4d3a"], ["象牙白", "#efe6d2"], ["金色", "#c9a35a"], ["霧紫", "#7d6b9a"], ["琥珀", "#c98a2b"], ["石墨灰", "#4a4d55"], ["珊瑚橘", "#e07a5f"], ["天空藍", "#7fb3d5"], ["橄欖綠", "#7d8b4a"], ["玫瑰粉", "#d99aa5"]];
const LUCKY_DIRS = ["東", "東南", "南", "西南", "西", "西北", "北", "東北"];
const VIEW_KEY = "astra-view";
const tierOf = (st) => (st >= 4 ? "hi" : st === 3 ? "mid" : "lo");
const TIER_ZH = { hi: "旺", mid: "平穩", lo: "留意" };
const dayNoun = () => (offsetDays === 0 ? "今天" : offsetDays === -1 ? "昨天" : offsetDays === 1 ? "明天" : "這天");
const dayWord = () => (offsetDays === 0 ? "今日" : offsetDays === -1 ? "昨日" : offsetDays === 1 ? "明日" : "這天");

const $ = (id) => document.getElementById(id);
const para = (t) => Object.assign(document.createElement("p"), { textContent: t });
const sgn = (n, d = 1) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(d)}°`;
// how far from today you can browse. Comparisons follow every body day by day from today,
// so the cost grows with distance; half a year keeps a tap well under a second on phones.
const MAX_OFF = 180;
const clampOff = (n) => Math.max(-MAX_OFF, Math.min(MAX_OFF, n));

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
  // text equivalent of the wheel for screen readers (aria-describedby on #wheelMain)
  $("wheelAlt").replaceChildren(
    ...pos.map((b) => Object.assign(document.createElement("li"), { textContent: `${b.zh} ${b.sign.zh} ${Math.floor(b.deg)}°${b.retro ? " 逆行" : ""}` })),
  );

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

  const info = dayInfo(date);
  const prevInfo = dayInfo(new Date(date.getTime() - DAY));
  $("headline").textContent = headline(pos, info);
  {
    const sm = buildSummary(pos, aspects, phaseIdx, info);
    $("summary").replaceChildren(
      ...sm.lines.map(([k, h, t]) => {
        const p = document.createElement("p");
        p.innerHTML = "<b></b><span><strong></strong><em></em></span>";
        p.querySelector("b").textContent = k;
        p.querySelector("strong").textContent = h;
        p.querySelector("em").textContent = t;
        return p;
      }),
    );
    $("advice").textContent = sm.advice;
  }
  $("tags").replaceChildren(
    ...buildTags(pos, aspects, phaseIdx, info).map(([k, v, w]) => {
      const li = document.createElement("li");
      li.innerHTML = `<b>${k}</b><span></span><small></small>`;
      li.querySelector("span").textContent = v;
      li.querySelector("small").textContent = w;
      return li;
    }),
  );
  $("energy").replaceChildren(
    ...buildEnergy(pos, aspects, phaseIdx, info).map((r) => {
      const li = document.createElement("li");
      li.innerHTML = "<i></i><div><b></b><span></span></div>";
      li.querySelector("i").textContent = TXT(r.g);
      li.querySelector("b").textContent = r.k;
      li.querySelector("span").textContent = r.t;
      return li;
    }),
  );
  renderHouses(info);
  renderAlert(info);
  renderAhead(date);
  lastSky = { info, pos };
  renderPersonal();
  renderRhythm(info, prevInfo, pos, compute(new Date(date.getTime() - DAY)));
  $("dbDate").textContent = fortuneMode === "week" && document.documentElement.dataset.view !== "chart" ? `${weekSpan(date)}` : `${tp.m}/${tp.d} ${info.wk.zh}`;
  $("dbSub").textContent = `${offsetDays === 0 ? "今日" : offsetDays === -1 ? "昨日" : offsetDays === 1 ? "明日" : offsetDays > 0 ? `+${offsetDays}天` : `${offsetDays}天`} · 月${SIGNS[info.dom].zh.replace("座", "")} · ${info.wk.pl}日`;
  $("dbToday").classList.toggle("on", offsetDays === 0);

  // ---- dialog: time box, period changes, table, aspects ----
  $("tbRange").value = clampOff(offsetDays);
  const rel = offsetDays === 0 ? "今天" : offsetDays > 0 ? `未來 ${offsetDays} 天` : `過去 ${-offsetDays} 天`;
  $("tbLabel").textContent = `${rel} · ${dateText}`;
  $("tbBtns").querySelectorAll("button").forEach((b) => {
    const st = Number(b.dataset.step);
    if (st === 0) b.classList.toggle("on", offsetDays === 0);
    else b.disabled = st < 0 ? offsetDays <= -MAX_OFF : offsetDays >= MAX_OFF;
  });

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
          : [Object.assign(document.createElement("li"), { className: "ev ev-empty", textContent: "這段期間沒有換座、逆行或新滿月。" })]),
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
        const laps = Math.abs(cum[i]) >= 360 ? `<span>（繞行 ${(Math.abs(cum[i]) / 360).toFixed(1)} 圈）</span>` : "";
        const changed = basePos[i].signIndex !== b.signIndex ? `<span class="chg">${basePos[i].sign.zh} → ${b.sign.zh}</span>` : "";
        diff = `<small class="mv diff"><span>較今天 ${sgn(cum[i], Math.abs(cum[i]) < 10 ? 2 : 1)}</span>${laps}${changed}</small>`;
      }
      li.innerHTML = `<span class="pg">${TXT(b.g)}</span><span class="pn" title="${b.la}"><b>${b.zh}</b><small class="prole">${b.role}</small></span><span class="ps">${TXT(b.sign.g)} ${b.sign.zh} <small>${fmtDeg(b.deg)}</small>${b.retro ? ' <span class="rx" title="逆行">℞</span>' : ""}</span><span class="pr"><small class="mv">24 小時移動 ${mv}</small>${diff}</span>`;
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
          d.innerHTML = `<div class="ag">${TXT(a.a.g)} ${TXT(a.asp.g)} ${TXT(a.b.g)}</div><h3>${a.a.zh} ${a.asp.name} ${a.b.zh}</h3><p class="la">${a.a.la} · ${a.asp.la} · ${a.b.la}　誤差 ${a.off.toFixed(1)}°</p><p>${pairMean(a)}</p>`;
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
  {
    const sm = buildSummary(pos, aspects, phaseIdx, info);
    currentDay = { tp, info, pos, headline: headline(pos, info), summary: sm.text, advice: sm.advice };
  }
  renderToday();
  observeReveals();
}

// Solar houses: treat your Sun sign as the 1st house, so the Moon's sign today
// tells which area of life it is passing through for you.
const HOUSES = [
  ["自我", "外表、狀態、主動開始", "命宮", "別人第一眼看到的你，也是你開始一件事的方式。"],
  ["金錢", "收入、花費、自我價值", "財帛宮", "你怎麼賺錢、怎麼花錢，什麼讓你覺得踏實。"],
  ["溝通", "訊息、學習、短程移動", "兄弟宮", "你說話和學習的方式，以及身邊的兄弟姊妹、鄰居。"],
  ["家", "家人、居所、內在安全感", "田宅宮", "家和根源，你真正能放鬆、做回自己的地方。"],
  ["玩樂", "戀愛、創作、興趣", "子女宮", "戀愛、玩樂和創作，讓你發光、覺得好玩的事。"],
  ["日常", "工作流程、健康、作息", "奴僕宮", "每天的工作和作息，你怎麼照顧身體與流程。"],
  ["伴侶", "合作、一對一關係", "夫妻宮", "伴侶與合作對象，你在一對一關係裡的樣子。"],
  ["深層", "共享資源、信任、親密", "疾厄宮", "共同的金錢、信任與親密，也是你蛻變的地方。"],
  ["遠方", "旅行、進修、信念", "遷移宮", "遠行、進修和信念，讓你眼界打開的事。"],
  ["事業", "目標、名聲、上司", "官祿宮", "事業與社會角色，你希望被世界記住的樣子。"],
  ["朋友", "社群、團隊、願望", "福德宮", "朋友、社群和對未來的願望，你屬於哪一群人。"],
  ["休息", "獨處、潛意識、收尾", "玄秘宮", "潛意識與獨處，需要休息、放下和收尾的地方。"],
];
// Which sign is the 1st house: the Ascendant when known (whole-sign houses, the usual way),
// otherwise the Sun sign (solar houses). Visitors with both can switch.
// Houses are counted from the Ascendant, as in any natal chart. Without a birth time there is no
// Ascendant, so the Sun sign stands in (the way sun-sign horoscope columns do) and the page says so.
function houseBase() {
  const { Asc, Sun } = NATAL.sign;
  if (Asc != null) return { sign: Asc, by: "asc" };
  if (Sun != null) return { sign: Sun, by: "sun" };
  return { sign: null, by: null };
}
// ---- what each house covers (used by the house list in section III) ----
const HQ = { a: ["角宮", "最有力量、最容易被看見的位置，事情會直接發生在你身上"], s: ["續宮", "累積與穩定的位置，事情在這裡慢慢存起來"], c: ["果宮", "學習與調整的位置，力量偏幕後、偏轉換"] };
const HOUSE_INFO = [
  { q: "a", domain: "身體、外貌、性格給人的第一印象，也是你面對人生的起手式", ask: "我是怎麼出場的？別人第一眼看到什麼？" },
  { q: "s", domain: "自己賺的錢、能動用的資源、才能，以及對自己價值的感受", ask: "我靠什麼養活自己？什麼讓我覺得有底氣？" },
  { q: "c", domain: "日常溝通、文字、基礎學習、短途移動，以及兄弟姊妹和鄰居", ask: "我怎麼想、怎麼說、怎麼學？" },
  { q: "a", domain: "家庭與父母、房子、根源，以及人生後段的生活", ask: "我從哪裡來？哪裡讓我真正安心？" },
  { q: "s", domain: "戀愛、創作、子女、娛樂與投機", ask: "什麼讓我快樂、讓我想表現自己？" },
  { q: "c", domain: "日常工作、作息、健康、勞務，以及同事、下屬和寵物", ask: "我每天怎麼過？身體和工作習慣好不好？" },
  { q: "a", domain: "伴侶、婚姻、合夥、客戶，也包括公開的競爭對手", ask: "我會遇到什麼樣的人？一對一的關係怎麼經營？" },
  { q: "s", domain: "別人的錢（貸款、遺產、伴侶的收入）、稅、信任與親密，以及危機和轉化", ask: "我怎麼面對共享、失去與重生？" },
  { q: "c", domain: "高等教育、出國與遠行、信仰與人生觀、出版與法律", ask: "我相信什麼？眼界往哪裡打開？" },
  { q: "a", domain: "事業、社會地位、名聲、上司與權威", ask: "我想讓世界記得我做了什麼？" },
  { q: "s", domain: "朋友、社群與人脈、對未來的願望，也包括工作帶來的收益", ask: "我屬於哪一群人？想要什麼樣的未來？" },
  { q: "c", domain: "潛意識、獨處、隱藏的事、休養與修行，也是容易自我耗損的地方", ask: "我在哪裡需要退一步、放下或療癒？" },
];

// Natal chart wheel: Ascendant on the left, zodiac counter-clockwise, whole-sign houses,
// planets at their exact degrees (sign middle when only the sign is known), major aspects in the centre.
const NATAL_SHORT = { Sun: "日", Moon: "月", Mercury: "水", Venus: "金", Mars: "火", Jupiter: "木", Saturn: "土", Uranus: "天", Neptune: "海", Pluto: "冥" };
function natalWheel(base) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "-170 -170 340 340");
  svg.setAttribute("class", "natal-wheel");
  svg.setAttribute("role", "img");
  const mk = (tag, attrs, parent = svg) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); parent.appendChild(n); return n; };
  const exact = NATAL.deg.Sun != null;
  const lonOfK = (k) => (exact && NATAL.deg[k] != null ? NATAL.deg[k] : NATAL.sign[k] * 30 + 15);
  const asc = NATAL.sign.Asc != null ? lonOfK("Asc") : base.sign * 30;
  const P = (lon, r) => { const a = Math.PI + ((lon - asc) * Math.PI) / 180; return [r * Math.cos(a), -r * Math.sin(a)]; };
  const R0 = 160, R1 = 134, R2 = 112, R3 = 60;
  mk("circle", { r: R0 + 8, class: "nw-bg" });
  mk("circle", { r: R0, class: "nw-ring" }); mk("circle", { r: R1, class: "nw-ring" }); mk("circle", { r: R2, class: "nw-ring" }); mk("circle", { r: R3, class: "nw-ring faint" });
  for (let i = 0; i < 12; i++) {
    const [x0, y0] = P(i * 30, R2), [x1, y1] = P(i * 30, R0);
    mk("line", { x1: x0, y1: y0, x2: x1, y2: y1, class: "nw-div" });
    const [gx, gy] = P(i * 30 + 15, (R0 + R1) / 2);
    const t = mk("text", { x: gx, y: gy, class: "nw-sign" + (i === base.sign ? " first" : "") }); t.textContent = TXT(SIGNS[i].g);
    const h = signDist(i, base.sign);
    const [hx, hy] = P(i * 30 + 15, (R1 + R2) / 2);
    const ht = mk("text", { x: hx, y: hy, class: "nw-house" }); ht.textContent = String(h + 1);
  }
  // Ascendant axis
  if (NATAL.sign.Asc != null) {
    const [ax, ay] = P(asc, R0 + 4), [dx, dy] = P(asc + 180, R0 + 4);
    mk("line", { x1: ax, y1: ay, x2: dx, y2: dy, class: "nw-axis" });
    const [lx, ly] = P(asc, R0 + 2);
    const ag = mk("g", { class: "nw-pt", "data-k": "Asc", tabindex: "0" });
    const at = mk("text", { x: lx - 2, y: ly - 8, class: "nw-ac" }, ag); at.textContent = "AC 上升";
    mk("title", {}, ag).textContent = `上升 ${SIGNS[NATAL.sign.Asc].zh}`;
  }
  // planets, nudged apart when they sit within 8° of each other
  const keys = NATAL_KEYS.filter(([k]) => k !== "Asc" && NATAL.sign[k] != null).map(([k]) => k);
  const pts = keys.map((k) => ({ k, lon: norm(lonOfK(k)) })).sort((a, b) => a.lon - b.lon);
  let prev = -99, lane = 0;
  for (const p of pts) { lane = p.lon - prev < 8 ? lane + 1 : 0; p.r = R2 - 14 - (lane % 3) * 12; prev = p.lon; }
  // aspects (exact degrees only)
  if (exact) {
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      let d = Math.abs(pts[i].lon - pts[j].lon); if (d > 180) d = 360 - d;
      const asp = ASPECTS.find((a) => a.ang > 0 && Math.abs(d - a.ang) <= a.orb);
      if (!asp) continue;
      const [x0, y0] = P(pts[i].lon, R3), [x1, y1] = P(pts[j].lon, R3);
      mk("line", { x1: x0, y1: y0, x2: x1, y2: y1, class: "nw-asp " + (asp.ang === 60 || asp.ang === 120 ? "soft" : "hard") });
    }
  }
  const BODY_G = Object.fromEntries(BODIES.map((b) => [b.key, b.g]));
  for (const p of pts) {
    const [tx, ty] = P(p.lon, R2), [ix, iy] = P(p.lon, R2 - 6);
    mk("line", { x1: tx, y1: ty, x2: ix, y2: iy, class: "nw-tick" });
    const [x, y] = P(p.lon, p.r);
    const grp = mk("g", { class: "nw-pt", "data-k": p.k, tabindex: "0" });
    mk("circle", { cx: x, cy: y, r: 11, class: "nw-hit" }, grp);
    const g = mk("text", { x, y, class: "nw-planet" }, grp); g.textContent = TXT(BODY_G[p.k]);
    const [nx, ny] = P(p.lon, p.r - 13);
    mk("text", { x: nx, y: ny, class: "nw-name" }, grp).textContent = NATAL_SHORT[p.k];
    mk("title", {}, grp).textContent = `${NATAL_ZH[p.k]} ${SIGNS[NATAL.sign[p.k]].zh}${exact ? ` ${Math.floor(p.lon % 30)}°` : ""}`;
  }
  svg.setAttribute("aria-label", `出生星盤圖：${pts.map((p) => `${NATAL_ZH[p.k]}在${SIGNS[NATAL.sign[p.k]].zh}`).join("、")}`);
  const fig = document.createElement("figure");
  fig.className = "nw-fig";
  fig.append(svg);
  const cap = document.createElement("figcaption");
  cap.textContent = (NATAL.sign.Asc != null ? "左側 AC 是上升，逆時針是第 1 到 12 宮。" : "還沒有上升，暫以太陽星座放在左側當第 1 宮。") + (exact ? "中間線條：綠＝和諧相位，紅＝緊張相位。" : "沒有出生資料，行星先放在星座中間示意。");
  fig.append(cap);
  return fig;
}

function natalEmphasis(base) {
  const keys = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].filter((k) => NATAL.sign[k] != null);
  const hs = keys.map((k) => signDist(NATAL.sign[k], base.sign));
  const out = [];
  // a crowded house counts when at least two personal planets (Sun–Saturn) are in it; outer planets alone are generational
  const by = Array.from({ length: 12 }, () => []);
  for (const [k, zh] of NATAL_KEYS) if (k !== "Asc" && NATAL.sign[k] != null) by[signDist(NATAL.sign[k], base.sign)].push([k, zh]);
  by.forEach((ps, i) => {
    const personal = ps.filter(([k]) => keys.includes(k)).length;
    if (ps.length >= 3 && personal >= 2) out.push(`${ps.map(([, zh]) => zh).join("、")}都在第 ${i + 1} 宮（${HOUSES[i][0]}）：人生的重心明顯在「${HOUSES[i][1]}」，這裡的事會一再回來找你，也是你最能長出實力的地方。`);
  });
  if (base.by === "asc" && keys.length >= 6) {
    const up = hs.filter((h) => h >= 6).length, east = hs.filter((h) => h >= 9 || h <= 2).length;
    if (up >= 5) out.push("大部分行星在地平線上方（第 7–12 宮）：你的舞台偏向外面的世界，關係、事業、社群會推著你成長。");
    if (keys.length - up >= 5) out.push("大部分行星在地平線下方（第 1–6 宮）：你的力量偏向自己的生活、家庭和實際技能，先把自己的地基打好最重要。");
    if (east >= 5) out.push("行星偏東邊（靠近上升）：你習慣自己作主、自己開路，主動出擊比等待更適合你。");
    if (keys.length - east >= 5) out.push("行星偏西邊（靠近下降）：很多機會來自別人，合作和人際會是你的槓桿。");
  }
  return out;
}

// Section IV reading: one card per point. Title = the plain question the point answers,
// then a sentence for its sign and, when the Ascendant is known, one for its house plus a tip.
const NATAL_CARD_KEYS = ["Asc", "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const OUTER_KEYS = ["Uranus", "Neptune", "Pluto"];
function natalCards(base, hot) {
  const el = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls || "", textContent: text || "" });
  const BODY_G = Object.fromEntries(BODIES.map((b) => [b.key, b.g]));
  const housed = base.by === "asc";
  const out = [];
  const head = el("div", "nr-head");
  head.append(el("p", "hr-sub", "逐顆讀你的星盤"));
  const toggle = el("button", "linkbtn nr-all", "全部展開");
  toggle.type = "button";
  head.append(toggle);
  out.push(head);
  if (!housed) out.push(el("p", "nr-note", "還沒有出生時間，下面先只講星座。每顆星落在第幾宮（用在人生哪個領域）要有出生時間才算得出來。"));
  const list = el("div", "nr-list");
  const card = (k, open) => {
    const d = document.createElement("details");
    d.className = "nr-card";
    d.dataset.k = k;
    d.open = open;
    d.innerHTML = '<summary><span class="nr-g" aria-hidden="true"></span><span class="nr-t"><strong></strong><small></small></span></summary><div class="nr-body"></div>';
    list.append(d);
    return d;
  };
  let opened = 0;
  for (const k of NATAL_CARD_KEYS) {
    const si = NATAL.sign[k];
    if (si == null) continue;
    const R = NATAL_READ[k], sg = SIGNS[si];
    const d = card(k, opened++ < 3);
    d.querySelector(".nr-g").textContent = k === "Asc" ? "AC" : TXT(BODY_G[k]);
    d.querySelector("strong").textContent = R.q;
    const body = d.querySelector(".nr-body");
    body.append(el("p", "nr-sign", natalLine(R.bySign[si], k)));
    if (k === "Asc") {
      // the Asc's house text follows the chart ruler (the planet that rules the rising sign)
      const ruler = SIGN_RULER[si], rs = NATAL.sign[ruler];
      d.querySelector("small").textContent = `上升 · ${sg.zh}`;
      if (housed && rs != null) {
        const rh = signDist(rs, base.sign);
        body.append(
          el("p", "nr-lead", `守護上升${sg.zh.replace("座", "")}的是${RULER_ZH[ruler]}，它落在第 ${rh + 1} 宮（${HOUSES[rh][0]}），說明你的人生主力放在哪裡：`),
          el("p", "nr-house", natalLine(R.byHouse[rh], k, 2).where),
          el("p", "nr-tip", natalLine(R.byHouse[rh], k, 2).tip),
        );
      }
    } else {
      const h = signDist(si, base.sign);
      d.querySelector("small").textContent = housed ? `${NATAL_ZH[k]} · ${sg.zh} · 第 ${h + 1} 宮（${HOUSES[h][0]}）` : `${NATAL_ZH[k]} · ${sg.zh}`;
      if (housed) { const hr = natalLine(R.byHouse[h], k, 2); body.append(el("p", "nr-house", hr.where), el("p", "nr-tip", hr.tip)); }
    }
  }
  // Uranus, Neptune, Pluto: one compact card, they stay in a sign for years
  const outer = OUTER_KEYS.filter((k) => NATAL.sign[k] != null);
  if (outer.length) {
    const d = card("outer", false);
    d.querySelector(".nr-g").textContent = outer.map((k) => TXT(BODY_G[k])).join("");
    d.querySelector("strong").textContent = "同一代人的共同背景";
    d.querySelector("small").textContent = outer.map((k) => NATAL_ZH[k]).join("、");
    const body = d.querySelector(".nr-body");
    body.append(el("p", "nr-sign", housed
      ? "這三顆星走得很慢，同一年前後出生的人都在同一個星座，所以它們說的是你們這一代的共同背景；落在哪一宮才是你個人的部分。"
      : "這三顆星走得很慢，同一年前後出生的人都在同一個星座，說的是你們這一代的共同背景。要有出生時間排出宮位，才看得出它們落在你人生的哪個領域。"));
    const ul = el("ul", "nr-outer");
    for (const k of outer) {
      const si = NATAL.sign[k], h = signDist(si, base.sign), li = document.createElement("li");
      li.dataset.k = k;
      li.append(el("b", "", housed ? `${NATAL_ZH[k]} · 第 ${h + 1} 宮` : `${NATAL_ZH[k]} · ${SIGNS[si].zh}`), el("span", "", housed ? natalLine(NATAL_READ[k].byHouse[h], k, 2) : NATAL_READ[k].q));
      ul.append(li);
    }
    body.append(ul);
  }
  out.push(list);
  const sync = () => { toggle.textContent = [...list.children].every((c) => c.open) ? "全部收合" : "全部展開"; };
  toggle.addEventListener("click", () => { const open = toggle.textContent === "全部展開"; list.querySelectorAll(".nr-card").forEach((c) => { c.open = open; }); sync(); });
  list.addEventListener("toggle", sync, true);
  sync();
  // a card under the pointer lights up its planet in the table and the wheel above
  list.addEventListener("pointerover", (e) => { const c = e.target.closest(".nr-card"); const k = e.target.closest("[data-k]")?.dataset.k; if (c && k && k !== "outer") hot(k); });
  list.addEventListener("pointerleave", () => hot(null));
  return out;
}

function renderHouseRead(base) {
  const box = $("houseRead");
  $("natalIntro").textContent = base.sign == null
    ? "在「你的今日」填上出生資料（或選好星座），這裡會排出你的出生星盤：每顆星在哪個星座、哪一宮，以及怎麼讀。"
    : "星體位置表和星盤圖可以互相對照，點任何一顆星，兩邊會一起標出來。往下每張卡回答一個問題：星座說你是什麼樣子，宮位說這股力量用在人生哪裡。最後附上進階的宮主星參考。";
  if (base.sign == null) { box.replaceChildren(); return; }
  const el = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls || "", textContent: text || "" });
  const parts = [];

  // 0. at a glance: every body, its sign and its house
  const BODY_G = Object.fromEntries(BODIES.map((b) => [b.key, b.g]));
  const rowsT = NATAL_KEYS.filter(([k]) => NATAL.sign[k] != null).map(([k, zh]) => {
    const sg = SIGNS[NATAL.sign[k]], h = signDist(NATAL.sign[k], base.sign);
    const deg = NATAL.deg[k] != null ? ` ${Math.floor(NATAL.deg[k] % 30)}°` : "";
    return [k === "Asc" ? "AC" : TXT(BODY_G[k]), zh, `${TXT(sg.g)} ${sg.zh}${deg}`, `第 ${h + 1} 宮 · ${HOUSES[h][0]}`, k];
  });
  const tbl = document.createElement("table");
  tbl.className = "hr-table";
  tbl.innerHTML = "<thead><tr><th scope=\"col\" colspan=\"2\">星體</th><th scope=\"col\">星座</th><th scope=\"col\">宮位</th></tr></thead><tbody></tbody>";
  tbl.querySelector("tbody").append(...rowsT.map((r) => {
    const tr = document.createElement("tr");
    tr.dataset.k = r[4];
    tr.tabIndex = 0;
    r.slice(0, 4).forEach((c, i) => tr.append(el(i === 1 ? "th" : "td", i === 0 ? "g" : "", c)));
    tr.children[1].setAttribute("scope", "row");
    return tr;
  }));
  const fold = document.createElement("details");
  fold.className = "hr-tablefold";
  fold.open = true;
  fold.innerHTML = "<summary><span>星體位置與星盤圖</span><small>點一顆星，表和圖會一起標出</small></summary>";
  const wheel = natalWheel(base);
  const pair = el("div", "hr-pair");
  pair.append(tbl, wheel);
  fold.append(pair);
  // table row ⇄ wheel point: hover, focus or tap one and both light up
  const hot = (k) => {
    pair.querySelectorAll("[data-k]").forEach((n) => n.classList.toggle("hot", n.dataset.k === k));
    pair.classList.toggle("focus", !!k);
  };
  pair.addEventListener("pointerover", (e) => { const n = e.target.closest("[data-k]"); if (n) hot(n.dataset.k); });
  pair.addEventListener("pointerleave", () => hot(null));
  pair.addEventListener("focusin", (e) => { const n = e.target.closest("[data-k]"); if (n) hot(n.dataset.k); });
  pair.addEventListener("focusout", () => hot(null));
  pair.addEventListener("click", (e) => { const n = e.target.closest("[data-k]"); hot(n ? n.dataset.k : null); });

  // 1. overall emphasis
  const emph = natalEmphasis(base);
  if (emph.length) {
    const ul = el("ul", "hr-emph");
    ul.append(...emph.map((t) => el("li", "", t)));
    parts.push(el("p", "hr-sub", "先看重點"), ul);
  }

  // 2. one card per point: the question it answers, then its sign, its house and a tip
  parts.push(...natalCards(base, hot));

  // 3. house rulers: where each house's ruling planet sits shows where that area's energy goes
  const rulers = [];
  for (let i = 0; i < 12; i++) {
    const sign = (base.sign + i) % 12, r = SIGN_RULER[sign];
    if (NATAL.sign[r] == null) continue;
    const j = signDist(NATAL.sign[r], base.sign);
    const t = i === j
      ? `宮主${RULER_ZH[r]}就在本宮。這件事你很能自己作主，力量集中。`
      : `宮主${RULER_ZH[r]}在第 ${j + 1} 宮，這件事常常要透過「${HOUSES[j][0]}：${HOUSES[j][1]}」來展開。`;
    rulers.push([`第 ${i + 1} 宮`, `${HOUSES[i][0]}（${HOUSES[i][1]}）`, t]);
  }
  let rulerFold = null;
  if (rulers.length) {
    const d = document.createElement("details");
    d.className = "hr-rulers";
    d.open = matchMedia("(min-width: 900px)").matches; // side column on wide screens: open for side-by-side reading
    d.innerHTML = "<summary><span>進階：宮主星飛到哪裡</span></summary>";
    d.append(el("p", "hr-tip", "每一宮所在的星座都有一顆守護星（宮主星）。宮主星落在哪一宮，就表示這一宮的事情會往哪裡發展、要從哪裡著手。這是看盤時把十二宮串成故事的方法。"));
    const ul = el("ul", "hr-rl");
    ul.append(...rulers.map(([a, b, t]) => { const li = document.createElement("li"); li.append(el("b", "", a), el("span", "", `${b}：${t}`)); return li; }));
    d.append(ul);
    rulerFold = d;
  }

  const tip = el("p", "hr-tip", base.by === "asc"
    ? "宮位從上升排起，一個星座就是一宮（整宮制，最古老也最好上手的分法）。"
    : "還沒有上升，宮位暫用太陽星座排，只能看大方向。填上出生時間算出上升，或在「你的今日」直接選上升星座，宮位才會準。");
  // top: table | wheel. below: reading and advice on the left, house rulers on the right as reference
  const left = el("div", "hr-left"), right = el("div", "hr-right");
  left.append(...parts, tip);
  if (rulerFold) right.append(rulerFold);
  const cols = el("div", "hr-cols" + (rulerFold ? "" : " single"));
  cols.append(left, right);
  box.replaceChildren(fold, cols);
}

// the natal reading only depends on the birth data, so day steps and the 5-minute refresh keep
// it (and any cards the visitor opened) as is
let houseReadKey = "";
function renderHouses(info) {
  const segs = info.segs;
  const hb = houseBase();
  const base = hb.sign ?? 0;
  const set = hb.sign != null;
  const rk = JSON.stringify([NATAL.sign, NATAL.deg, hb]);
  if (rk !== houseReadKey) { houseReadKey = rk; renderHouseRead(hb); }
  const cur = segs.map((sg) => signDist(sg.sign, base));
  const placed = NATAL_KEYS.filter(([k]) => k !== "Asc" && NATAL.sign[k] != null).map(([k, zh]) => ({ k, zh, h: signDist(NATAL.sign[k], base) }));
  $("housesNote").textContent = (!set ? "還沒有你的資料，先用牡羊座當第 1 宮示範。填上出生資料（或選上升星座）就會換成你的宮位。"
    : hb.by === "asc" ? `你的上升是${SIGNS[base].zh}，所以第 1 宮是${SIGNS[base].zh}，往下每個星座各是一宮。`
    : `宮位要從上升排起，上升要有出生時間才算得出來。現在先用你的太陽星座${SIGNS[base].zh}暫代第 1 宮（報紙星座運勢的排法），宮位只能參考；填上出生時間或選上升星座就會換成準確的。`) +
    (placed.length ? "小字是你的行星落在哪一宮，那個領域就是你天生比較用力的地方。" : "");
  $("houses").replaceChildren(
    ...HOUSES.map((h, i) => {
      const sg = SIGNS[(base + i) % 12];
      const li = document.createElement("li");
      const here = cur.indexOf(i);
      if (here >= 0) li.className = "now";
      li.innerHTML = '<em></em><div class="hb"><p class="hn"><b></b><small></small></p><p class="hs"></p><p class="hp"></p></div><i></i>';
      li.querySelector("em").textContent = i + 1;
      li.querySelector("b").textContent = h[0];
      li.querySelector("small").textContent = h[2];
      li.querySelector(".hs").textContent = `${HOUSE_INFO[i].domain}。${HQ[HOUSE_INFO[i].q][0]}：${HOUSE_INFO[i].ask}`;
      const mine = placed.filter((x) => x.h === i);
      const hp = li.querySelector(".hp");
      if (mine.length) hp.textContent = `你的${mine.map((x) => `${x.zh}（${SIGNS[NATAL.sign[x.k]].zh}）`).join("、")}在這`;
      else hp.remove();
      li.querySelector("i").textContent = `${TXT(sg.g)} ${sg.zh.replace("座", "")}`;
      if (here >= 0) {
        const tag = document.createElement("span");
        tag.className = "moon-tag";
        tag.textContent = segs.length > 1 ? (here === 0 ? `☽ 月亮 ~${fmtT(segs[1].from)}` : `☽ 月亮 ${fmtT(segs[1].from)}~`) : "☽ 月亮在此";
        li.querySelector(".hn").appendChild(tag);
      }
      return li;
    }),
  );
}

/* ---------- personal: your placements × today's sky ---------- */
const NATAL_KEY = "astra-natal";
const NATAL_KEYS = [["Sun", "太陽"], ["Moon", "月亮"], ["Asc", "上升"], ["Mercury", "水星"], ["Venus", "金星"], ["Mars", "火星"], ["Jupiter", "木星"], ["Saturn", "土星"], ["Uranus", "天王星"], ["Neptune", "海王星"], ["Pluto", "冥王星"]];
const PERSONAL_KEYS = ["Sun", "Moon", "Asc", "Mercury", "Venus", "Mars"]; // outer planets stay in one sign for years, so a sign-only match says little
const NATAL_ZH = Object.fromEntries(NATAL_KEYS);
const NATAL_ROLE = { Sun: "核心與自信", Moon: "情緒需求", Asc: "身體與第一印象", Mercury: "想法與溝通", Venus: "感情與喜好", Mars: "行動與脾氣", Jupiter: "信念與機會", Saturn: "責任與界線", Uranus: "求變的衝動", Neptune: "想像與理想", Pluto: "深層的執著" };
const NATAL_TIP = {
  Sun: { soft: "做自己很順，適合主動爭取、讓人看見你。", hard: "外在要求和你想走的方向有點衝突，先把力氣留給最重要的一件事。", conj: "你的主場日，精神和存在感都高，適合開始新計畫。" },
  Moon: { soft: "心情穩、容易被理解，適合和親近的人相處。", hard: "情緒比較容易被觸動，咖啡少一點、早點休息。", conj: "月亮回到你的月亮星座（每月一次）：情緒很真實，最適合照顧自己的需要。" },
  Asc: { soft: "氣色和人緣都不錯，適合見新朋友、面試、拍照。", hard: "容易覺得被注視、有點累，穿舒服一點、行程別排太滿。", conj: "存在感特別強，也比較敏感，適合打理外表、換個新開始。" },
  Mercury: { soft: "腦袋清楚，適合寫東西、提案、解釋複雜的事。", hard: "想法亂、容易說錯話，重要訊息晚點再發。", conj: "直覺和思考同步，隨手記下冒出來的點子。" },
  Venus: { soft: "人緣和桃花都好，適合約會、買喜歡的東西。", hard: "在感情裡比較敏感、想要更多；花錢先冷靜一下。", conj: "特別想被寵愛，好好犒賞自己。" },
  Mars: { soft: "幹勁足，適合運動、處理拖很久的事。", hard: "容易不耐煩，避免硬碰硬，把火氣花在運動上。", conj: "衝勁很強，去做一件需要一點勇氣的事。" },
  Jupiter: { soft: "樂觀和運氣站在你這邊，適合提出請求。", hard: "容易誇口或吃太多，量力而為。", conj: "心胸打開，適合學新東西。" },
  Saturn: { soft: "踏實、穩得住，適合處理長期的事。", hard: "壓力感上升，別一次扛太多。", conj: "比較嚴肅，適合收尾和整理。" },
  Uranus: { soft: "冒出新點子，適合試試不一樣的做法。", hard: "坐不住、想打破常規，計畫可能臨時變動。", conj: "很想做點不一樣的事，靈感來得突然。" },
  Neptune: { soft: "直覺和同理心變強，適合創作、聽音樂。", hard: "容易恍神或想太美，重要的事多確認。", conj: "感受特別細膩，留點時間放空。" },
  Pluto: { soft: "專注力很深，適合處理需要毅力的事。", hard: "情緒容易鑽牛角尖，別在這時翻舊帳。", conj: "會想把一件事徹底弄清楚。" },
};
const HOUSE_TIP = [
  "注意力回到自己身上：狀態、外表、想開始的事。", "在意錢和安全感：適合記帳、整理物品、想想什麼對你有價值。",
  "訊息變多：適合回信、學習、短程移動、和兄弟姊妹或鄰居聊聊。", "想待在家：適合整理居所、陪家人、早點休息。",
  "想玩想愛：適合約會、創作、做喜歡的事。", "專注日常：適合整理工作流程、運動、照顧身體。",
  "注意力在別人身上：適合一對一的談話、合作、陪伴另一半。", "情緒變深：適合談信任、處理共同財務，也適合獨自消化。",
  "想往外走：適合規劃旅行、上課、讀一本有分量的書。", "目光放在事業：適合處理工作上的大事、和上司溝通。",
  "想和朋友在一起：適合社群、團隊、聊聊未來想做的事。", "需要休息：適合獨處、睡飽、把事情收尾，不急著開新局。",
];
const SLOW = [
  ["Saturn", "土星", 3, "這一兩年"], ["Jupiter", "木星", 3, "這幾個月"], ["Mars", "火星", 2.5, "這幾週"],
  ["Uranus", "天王星", 2, "這幾年"], ["Neptune", "海王星", 2, "這幾年"], ["Pluto", "冥王星", 2, "這幾年"],
];
const SLOW_TIP = {
  Saturn: { soft: "慢慢打地基的時期，努力會被看見。", hard: "正在被考驗，壓力是在逼你調整結構。", conj: "進入重整期，責任變多，也會變得更成熟。" },
  Jupiter: { soft: "有機會擴張，適合提出請求、往外走。", hard: "容易過度，小心承諾太多或花太多。", conj: "迎來一段成長期，好運和機會被放大。" },
  Mars: { soft: "得到一股推力，適合衝刺。", hard: "容易起摩擦，衝動前先數到十。", conj: "被點燃，精力旺，但也容易急。" },
  Uranus: { soft: "有新鮮的轉機，可以試試不一樣的方法。", hard: "可能有意外變動，保持彈性。", conj: "想打破舊框架，變化來得突然。" },
  Neptune: { soft: "直覺和想像力變強，適合創作與靈性。", hard: "容易看不清或過度理想化，重要的事多查證。", conj: "界線變模糊，敏感也更有同理心。" },
  Pluto: { soft: "有力量深入改造，適合斷捨離。", hard: "被推著面對深層議題，放手會比較輕鬆。", conj: "正在經歷深層轉變，舊的自己慢慢退場。" },
};
const CITIES = [
  ["台北", 25.04, 121.56, 8], ["新北", 25.01, 121.46, 8], ["基隆", 25.13, 121.74, 8], ["桃園", 24.99, 121.30, 8], ["新竹", 24.80, 120.97, 8],
  ["苗栗", 24.56, 120.82, 8], ["台中", 24.15, 120.67, 8], ["彰化", 24.08, 120.54, 8], ["南投", 23.91, 120.68, 8], ["雲林", 23.71, 120.43, 8],
  ["嘉義", 23.48, 120.45, 8], ["台南", 22.99, 120.21, 8], ["高雄", 22.63, 120.30, 8], ["屏東", 22.67, 120.49, 8], ["宜蘭", 24.75, 121.75, 8],
  ["花蓮", 23.99, 121.60, 8], ["台東", 22.76, 121.14, 8], ["澎湖", 23.57, 119.58, 8], ["金門", 24.43, 118.32, 8], ["馬祖", 26.16, 119.95, 8],
  ["香港", 22.32, 114.17, 8], ["澳門", 22.20, 113.54, 8], ["上海", 31.23, 121.47, 8], ["北京", 39.90, 116.41, 8], ["廣州", 23.13, 113.26, 8],
  ["新加坡", 1.35, 103.82, 8], ["吉隆坡", 3.14, 101.69, 8], ["曼谷", 13.76, 100.50, 7], ["東京", 35.68, 139.69, 9], ["首爾", 37.57, 126.98, 9],
  ["雪梨", -33.87, 151.21, 10], ["倫敦", 51.51, -0.13, 0], ["紐約", 40.71, -74.01, -5], ["洛杉磯", 34.05, -118.24, -8], ["溫哥華", 49.28, -123.12, -8],
];
const COUNTRIES = [["台灣", 0, 20], ["港澳與中國", 20, 25], ["亞洲其他", 25, 30], ["歐美與大洋洲", 30, 36]];
function fillCities(sel) {
  const c = COUNTRIES.find(([n]) => n === $("bCountry").value) || COUNTRIES[0];
  $("bCity").innerHTML = CITIES.map((x, i) => [x, i]).slice(c[1], c[2]).map(([x, i]) => `<option value="${i}">${x[0]}</option>`).join("");
  if (sel != null) $("bCity").value = String(sel);
  $("bTz").value = String(CITIES[Number($("bCity").value)][3]);
}
const TZS = [-10, -9, -8, -7, -6, -5, -4, -3, 0, 1, 2, 3, 5.5, 7, 8, 9, 9.5, 10, 11, 12];

let NATAL = { sign: {}, deg: {}, birth: null };
try {
  const raw = JSON.parse(localStorage.getItem(NATAL_KEY) || "null");
  if (raw && typeof raw === "object") NATAL = { sign: raw.sign || {}, deg: raw.deg || {}, birth: raw.birth || null };
} catch { /* storage unavailable */ }
if (NATAL.sign.Sun == null) {
  try { const v = localStorage.getItem("astra-sign"); if (v != null && v !== "all" && Number(v) >= 0 && Number(v) < 12) NATAL.sign.Sun = Number(v); } catch { /* storage unavailable */ }
}
const saveNatal = () => { try { localStorage.setItem(NATAL_KEY, JSON.stringify(NATAL)); } catch { /* storage unavailable */ } };
let lastSky = null; // { info, pos }

const signDist = (a, b) => (a - b + 12) % 12;
const SIGN_ASP = { 0: "conj", 2: "soft", 10: "soft", 4: "soft", 8: "soft", 3: "hard", 9: "hard", 6: "hard" };
const ASP_WORD = { 0: "合相", 2: "六分", 10: "六分", 4: "三分", 8: "三分", 3: "四分", 9: "四分", 6: "對分" };

function ascendant(date, lat, lon) {
  const lst = ((A.SiderealTime(date) * 15 + lon) % 360 + 360) % 360;
  const r = Math.PI / 180, th = lst * r, eps = 23.4393 * r, ph = lat * r;
  return norm(Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(ph) * Math.sin(eps))) / r);
}

function buildNatalForm() {
  const mk = (k, zh) => {
    const lab = document.createElement("label");
    lab.innerHTML = `<span>${zh}</span><select data-k="${k}"><option value="">不知道</option>${SIGNS.map((s, i) => `<option value="${i}">${s.g}︎ ${s.zh}</option>`).join("")}</select>`;
    return lab;
  };
  $("natalMain").replaceChildren(...NATAL_KEYS.slice(0, 3).map(([k, zh]) => mk(k, zh)));
  $("natalMore").replaceChildren(...NATAL_KEYS.slice(3).map(([k, zh]) => mk(k, zh)));
  $("bCountry").innerHTML = COUNTRIES.map(([n]) => `<option>${n}</option>`).join("");
  fillCities();
  $("bTz").innerHTML = TZS.map((z) => `<option value="${z}">UTC${z >= 0 ? "+" : "−"}${Math.abs(z)}</option>`).join("");
  $("natal").addEventListener("change", (e) => {
    const sel = e.target.closest("select[data-k]");
    if (sel) {
      const k = sel.dataset.k, v = sel.value === "" ? null : Number(sel.value);
      if (v == null) delete NATAL.sign[k]; else NATAL.sign[k] = v;
      if (NATAL.deg[k] != null && (v == null || Math.floor(NATAL.deg[k] / 30) !== v)) delete NATAL.deg[k]; // manual change overrides the computed degree
      saveNatal();
      renderPersonal();
      renderToday();
    }
    if (e.target.id === "bCountry") fillCities();
    if (e.target.id === "bSlot") $("bTimeWrap").hidden = e.target.value !== "exact";
    if (e.target.id === "bCity") $("bTz").value = String(CITIES[Number(e.target.value)][3]);
  });
  $("bCalc").addEventListener("click", calcBirth);
  $("bClear").addEventListener("click", () => {
    NATAL = { sign: {}, deg: {}, birth: null };
    saveNatal();
    setBirthDate(""); $("bTime").value = ""; $("bSlot").value = "exact";
    syncNatalForm();
    renderPersonal();
    renderToday();
  });
  syncNatalForm();
}
// birth date as year (typed) + month + day (pickers): the native date picker makes the year hard to reach
const bOpt = (v, t) => Object.assign(document.createElement("option"), { value: v, textContent: t });
function fillBirthDays() {
  const y = Number($("bY").value) || 2000, m = Number($("bM").value) || 1;
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const keep = $("bD").value;
  $("bD").replaceChildren(bOpt("", "—"), ...Array.from({ length: n }, (_, i) => bOpt(String(i + 1), String(i + 1))));
  if (keep && Number(keep) <= n) $("bD").value = keep;
}
$("bM").replaceChildren(bOpt("", "—"), ...Array.from({ length: 12 }, (_, i) => bOpt(String(i + 1), String(i + 1))));
fillBirthDays();
$("bY").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); if (e.target.value.length === 4) fillBirthDays(); });
$("bM").addEventListener("change", fillBirthDays);
function birthDate() {
  const y = Number($("bY").value), m = Number($("bM").value), d = Number($("bD").value);
  if (!(y >= 1900 && y <= 2100 && m && d)) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function setBirthDate(v) {
  const [y, m, d] = v ? v.split("-").map(Number) : ["", "", ""];
  $("bY").value = y ? String(y) : "";
  $("bM").value = m ? String(m) : "";
  fillBirthDays();
  $("bD").value = d ? String(d) : "";
}

function syncNatalForm() {
  syncPaths();
  $("natal").querySelectorAll("select[data-k]").forEach((s) => { const v = NATAL.sign[s.dataset.k]; s.value = v == null ? "" : String(v); });
  const b = NATAL.birth;
  const ci = b?.city ?? 0;
  $("bCountry").value = (COUNTRIES.find(([, a, z]) => ci >= a && ci < z) || COUNTRIES[0])[0];
  fillCities(ci);
  $("bTz").value = String(b?.tz ?? CITIES[b?.city ?? 0][3]);
  if (b) { setBirthDate(b.date || ""); $("bTime").value = b.time || ""; $("bSlot").value = b.slot || (b.time ? "exact" : "unknown"); }
  $("bTimeWrap").hidden = $("bSlot").value !== "exact";
}
// birth time not known exactly: estimate from the middle of the window the visitor remembers
const BIRTH_SLOTS = { day: [6, 18, "白天"], eve: [18, 24, "晚上"], night: [0, 6, "半夜"], unknown: [0, 24, "不知道時間"] };
function calcBirth() {
  const d = birthDate(), ci = Number($("bCity").value), tz = Number($("bTz").value);
  let slot = $("bSlot").value;
  const tm = slot === "exact" ? $("bTime").value : "";
  if (slot === "exact" && !tm) slot = "unknown";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { $("bNote").textContent = "請先填出生年（西元，例如 1995）、月、日。"; return; }
  const [y, m, dd] = d.split("-").map(Number);
  const at = (h, mi = 0) => new Date(Date.UTC(y, m - 1, dd, h, mi) - tz * H);
  const win = BIRTH_SLOTS[slot];
  const [hh, mi] = tm ? tm.split(":").map(Number) : [(win[0] + win[1]) / 2, 0];
  const date = at(hh, mi);
  const deg = {};
  for (const k of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"]) deg[k] = lonOf(k, date);
  const c = CITIES[ci];
  if (tm) deg.Asc = ascendant(date, c[1], c[2]);
  NATAL.deg = deg;
  NATAL.sign = Object.fromEntries(Object.entries(deg).map(([k, v]) => [k, Math.floor(v / 30)]));
  NATAL.birth = { date: d, time: tm, slot, city: ci, tz };
  saveNatal();
  syncNatalForm();
  if (tm) {
    $("bNote").textContent = `已算出：太陽${SIGNS[NATAL.sign.Sun].zh}、月亮${SIGNS[NATAL.sign.Moon].zh}、上升${SIGNS[NATAL.sign.Asc].zh}。宮位已經依上升排好，相位也改用準確度數。`;
  } else {
    // the Moon moves ~0.5° an hour, so a 6–24 h window can straddle two signs; the Sun can too on a cusp day
    const ends = [at(win[0]), new Date(at(win[1]).getTime() - 60000)];
    const span = (k) => [...new Set(ends.map((t) => Math.floor(lonOf(k, t) / 30)))];
    const list = (k) => span(k).map((i) => SIGNS[i].zh).join("或");
    const moonS = span("Moon"), sunS = span("Sun");
    const how = slot === "unknown" ? "時間不確定，先用中午 12:00 估算" : `已用${win[2]}的中間時間（${String(hh).padStart(2, "0")}:00）估算`;
    $("bNote").textContent = `${how}：太陽${list("Sun")}、月亮${list("Moon")}。` +
      (moonS.length > 1 ? `月亮在這段時間換了星座，目前先用${SIGNS[NATAL.sign.Moon].zh}；之後想起準確時間可以再算一次。` : "這段時間裡月亮都在同一個星座，結果可以放心參考。") +
      (sunS.length > 1 ? "你剛好生在太陽換星座的那天，太陽星座要看出生時間。" : "") +
      "沒有準確時間，所以算不出上升。";
  }
  renderPersonal();
  renderToday();
}

// exact moments today when the transiting Moon hits an aspect to a natal degree
function moonHits(info, natalLon) {
  const { t0, STEP, moon } = info.ms, out = [];
  for (let i = 0; i < moon.length - 1; i++) {
    const ta = t0 + i * STEP;
    if (ta + STEP < info.start || ta >= info.end) continue;
    for (const [ang, ai] of ASP_ANGS) {
      const f0 = wrap180(moon[i] - natalLon - ang), f1 = wrap180(moon[i + 1] - natalLon - ang);
      if (f0 < 0 && f1 >= 0 && f1 - f0 < 10) {
        const t = ta + (-f0 / (f1 - f0)) * STEP;
        if (t >= info.start && t < info.end) out.push({ t, ang, ai });
      }
    }
  }
  return out;
}

/* ---------- personal daily luck: 愛情運／事業運／財運 from today's sky against the natal chart ----------
   Score = transits (Moon to Saturn) to this person's natal points, never the sun sign. Stars rank the
   day against the same person's ±14 days, so they move with the Moon's monthly cycle. */
const LUCK_AREAS = ["love", "career", "money"];
const LUCK_ZH = { love: "愛情運", career: "事業運", money: "財運" };
// transit: [weight, nature (+ benefic / − malefic), base orb]
const LUCK_TP = { Moon: [1, 0, 5], Sun: [0.6, 0, 3], Mercury: [0.5, 0, 3], Venus: [0.8, 0.3, 3], Mars: [0.8, -0.3, 3], Jupiter: [0.9, 0.4, 2], Saturn: [0.9, -0.4, 2] };
const NATAL_NATURE = { Venus: 0.3, Jupiter: 0.4, Mars: -0.3, Saturn: -0.4 };
// natal targets per area. R<n> = ruler of house n (only with a real Ascendant); Asc and MC need a birth time
const LUCK_TGT = {
  love: { Venus: 1, Moon: 0.8, Mars: 0.5, R7: 0.5, R5: 0.4, Asc: 0.3 },
  career: { MC: 1, Sun: 0.8, R10: 0.7, Saturn: 0.4, Mercury: 0.4, R6: 0.3 },
  money: { R2: 0.9, Venus: 0.7, Jupiter: 0.5, R8: 0.4, Mercury: 0.3 },
};
const LUCK_TILT = 0.6, LUCK_FLAT = 0.15, LUCK_CLUSTER = 3, LUCK_SAT = 1.2;
const LUCK_ANGS = [0, 60, 90, 120, 180];
const ANG_G = { 0: "☌", 60: "⚹", 90: "□", 120: "△", 180: "☍" };
const SIGN_ANG = { 0: 0, 2: 60, 10: 60, 4: 120, 8: 120, 3: 90, 9: 90, 6: 180 };
const TP_ZH = { Moon: "月亮", Sun: "太陽", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星" };
const PT_ZH = { Sun: "太陽", Moon: "月亮", Mercury: "水星", Venus: "金星", Mars: "火星", Jupiter: "木星", Saturn: "土星", Asc: "上升", MC: "天頂（事業宮）" };
const RULER_ROLE_ZH = { R2: "第 2 宮主星", R5: "第 5 宮主星", R6: "第 6 宮主星", R7: "第 7 宮主星", R8: "第 8 宮主星", R10: "第 10 宮主星" };

// what the transiting planet brings (any area), five ways to say it
const LUCK_FLAV = {
  Moon: { up: ["心情比較放鬆", "感覺特別對", "情緒站在你這邊", "心裡比較踏實", "直覺特別準"], down: ["情緒比較敏感", "心裡容易起波動", "比較容易想太多", "容易被小事影響", "比較需要人陪"] },
  Sun: { up: ["存在感變強", "比較有自信", "容易被看見", "底氣比較足", "做決定比較乾脆"], down: ["容易太堅持己見", "好勝心比較強", "容易各說各話", "比較放不下面子", "特別想證明自己"] },
  Mercury: { up: ["腦袋清楚", "話題接得順", "消息比較靈通", "反應比較快", "說明講得清楚"], down: ["容易說錯或聽錯", "想法比較亂", "細節容易漏掉", "注意力容易散", "容易話趕話"] },
  Venus: { up: ["氣氛比較甜", "人緣加分", "比較好說話", "看什麼都順眼", "比較願意讓步"], down: ["想要的變多", "容易心軟又挑剔", "比較想被寵", "容易貪好看", "比較在意被冷落"] },
  Mars: { up: ["行動力上來", "衝勁夠", "比較敢開口", "做事比較果斷", "體力和幹勁都夠"], down: ["火氣比較大", "容易急", "耐性變短", "比較沒耐心等", "一句話就容易槓上"] },
  Jupiter: { up: ["機會變多", "心胸比較開", "容易遇到幫忙的人", "看事情比較樂觀", "路比較寬"], down: ["容易把話說太滿", "胃口變大", "容易高估自己", "容易答應太多", "什麼都想多一點"] },
  Saturn: { up: ["心比較定", "做事踏實", "耐性夠", "比較坐得住", "肯一步一步來"], down: ["壓力變重", "比較放不開", "容易覺得被卡住", "顧慮比較多", "容易對自己太嚴"] },
};
// what it means for the natal point that was touched, per area: text variants, do chips, avoid chips
const LUCK_FACET = {
  love: {
    Venus: { up: [["喜歡的人比較容易注意到你", "好感來得自然，桃花也在線", "相處起來甜，很適合見面", "約會的氣氛容易對上", "打扮一下很容易被稱讚"], ["約對方見面", "安排一次約會", "穿喜歡的衣服", "大方收下稱讚"], ["把心動藏起來", "等對方先開口", "假裝不在意", "臨時取消約會"]],
      down: [["容易拿對方跟理想比", "想被疼又不好意思說", "對感情的要求變高", "客氣話容易被你聽成冷淡", "付出多一點就想要回報"], ["說出你想要的", "先寵自己一下", "直接說想被陪", "找朋友吃頓好的"], ["暗自比較", "用冷淡試探", "故意已讀不回", "拿前任比較"]] },
    Moon: { up: [["對方一句話就能讓你開心", "兩個人比較有默契", "適合聊聊彼此的感受", "待在一起不說話也舒服", "一句謝謝就能讓氣氛變暖"], ["約出來吃飯", "聊聊心裡話", "一起煮頓飯", "說聲謝謝"], ["只用貼圖回覆", "把話悶著", "邊滑手機邊聊", "敷衍帶過"]],
      down: [["小事也容易覺得對方不夠在乎", "安全感比較低", "容易翻起舊帳", "對方回慢一點就開始亂想", "累的時候特別想被哄"], ["先說出感受", "早點休息", "直接說你累了", "吃點熱的"], ["用沉默試探", "深夜傳長訊息", "逼問在不在乎", "賭氣不回"]] },
    Mars: { up: [["吸引力強，適合主動一點", "想見就約，別想太久", "很適合表白或推進關係", "有話直說反而加分", "一起動一動比光聊天更升溫"], ["直接約對方", "主動開口", "約去運動", "把話挑明"], ["想太久", "等待暗示", "繞圈子暗示", "臨陣退縮"]],
      down: [["小摩擦容易變成吵架", "容易說出氣話", "兩個人容易硬碰硬", "一點小事就想爭輸贏", "語氣一急，好意也變刺耳"], ["先冷靜十分鐘", "把話放慢說", "出去走一圈", "打字前停一下"], ["在氣頭上回話", "爭誰對誰錯", "翻舊帳", "丟下一句就走"]] },
    Asc: { up: [["你看起來特別有魅力", "氣色好，第一印象加分", "笑容多，別人比較敢靠近你", "拍照好看，適合換張大頭貼", "聚會裡容易被搭話"], ["打扮一下再出門", "認識新朋友", "換張大頭貼", "主動打招呼"], ["邋遢出門", "躲在家裡", "低頭滑手機", "推掉邀約"]],
      down: [["容易覺得被挑剔", "對自己的樣子比較沒自信", "別人隨口一句容易往心裡去", "不太想被注意", "照鏡子時容易挑自己毛病"], ["穿得舒服就好", "照自己的步調", "約熟的人就好", "早點回家"], ["跟人比外表", "勉強赴約", "硬撐場面", "臨時大改造型"]] },
  },
  career: {
    MC: { up: [["表現容易被上面看見", "適合爭取新的角色或任務", "工作方向比較清楚", "主管比較聽得進你的提議", "做出來的成果容易被轉述出去"], ["主動報告進度", "爭取亮點任務", "約主管聊方向", "更新履歷"], ["把功勞讓掉", "低調躲事", "悶著頭做", "把成果藏著"]],
      down: [["跟主管的想法容易對不上", "工作方向容易被質疑", "上面的要求變多", "交出去的東西容易被退回", "臨時被加了一件事"], ["先問清楚期待", "把重點寫下來", "確認優先順序", "留下文字紀錄"], ["硬碰硬", "當場反駁", "答應太趕的期限", "私下抱怨"]] },
    Sun: { up: [["你的意見比較有分量", "適合把成果拿出來", "做起事來特別有主見", "站出來講話有人跟", "很適合替自己的案子定方向"], ["提出你的想法", "帶頭做一件事", "自願報告", "先說結論"], ["過度謙虛", "一直等指示", "把決定丟給別人", "躲在後面"]],
      down: [["想做的和被要求的對不上", "容易跟人爭主導權", "累積的疲勞容易冒出來", "好意容易被當成搶功", "不服氣的感覺容易寫在臉上"], ["先做最重要的", "留點體力", "先問對方要什麼", "午休真的休息"], ["爭誰說了算", "硬撐加班", "當眾爭對錯", "一個人全攬"]] },
    Saturn: { up: [["長期的工作推得動", "適合排計畫、把舊案收尾", "付出容易被記住", "肯花時間的事會有進展", "適合補文件、訂規則這類基本功"], ["排出長期計畫", "收尾舊案", "補齊文件", "訂好檢查點"], ["只顧救火", "臨時改方向", "抄捷徑", "一次開太多案"]],
      down: [["責任變重，進度怎麼推都慢", "容易覺得自己在做白工", "規定和限制變多", "一件事要來回改好幾次", "努力比較不容易被看見"], ["把待辦砍小", "先做一件就好", "記下已完成的事", "請人幫看一眼"], ["跟別人比進度", "什麼都說好", "悶著不求助", "熬夜硬趕"]] },
    Mercury: { up: [["寫東西和開會都順", "說明有條理，提案容易過", "學新東西上手快", "信件一次就寫得清楚", "開會時問得到重點"], ["寫提案或簡報", "把流程寫清楚", "回完積著的信", "約人對細節"], ["只用口頭交代", "拖著不回信", "會議中分心", "把話講太快"]],
      down: [["容易漏看細節或傳錯訊息", "溝通容易誤會", "文件和訊息容易出錯", "會議結論容易各自解讀", "附件和收件人容易弄錯"], ["送出前再看一遍", "重要的打電話說", "會後寄摘要", "檢查收件人"], ["同時開太多視窗", "急著回覆", "邊開會邊回訊", "口頭答應就算"]] },
  },
  money: {
    Venus: { up: [["眼光準，買到的東西比較值", "適合添購真正需要的東西", "花錢花得開心又不心疼", "挑禮物或佈置特別有眼光", "花一點小錢就很有滿足感"], ["買真正需要的", "比價後再下單", "換掉用壞的東西", "買束花回家"], ["為折扣多買", "衝動刷卡", "買一樣的囤著", "只看價格"]],
      down: [["想犒賞自己，預算容易破", "容易為了好看多花", "看到折扣就心動", "逛著逛著就多拿兩樣", "心情悶的時候特別想花錢"], ["先定好上限", "先放購物車", "列清單再出門", "隔天再結帳"], ["衝動刷卡", "為面子花錢", "邊滑邊下單", "分期買不急的"]] },
    Jupiter: { up: [["收入或回饋有變多的機會", "適合爭取獎金或加薪", "容易遇到划算的機會", "有人介紹機會，值得聽一聽", "談價錢比較談得動"], ["開口談報酬", "爭取應得的", "問有沒有優惠", "查可申請的補助"], ["錯過申請期限", "不好意思開口", "嫌麻煩不問", "聽完就算了"]],
      down: [["容易高估荷包，一次花太多", "容易被大話吸引", "花錢的胃口變大", "「這次不一樣」的念頭要小心", "請客送禮容易給過頭"], ["抓保守的預算", "大額等一天", "先算好再請客", "問自己用得到嗎"], ["加碼投機", "跟風下單", "一次買整組", "借錢湊熱鬧"]] },
    Mercury: { up: [["比價、查資料特別有效率", "帳算得清楚", "適合整理帳單和訂閱", "合約條款看得特別仔細", "問得到真正划算的方案"], ["記一筆帳", "整理訂閱", "打電話問清楚", "比較兩家方案"], ["聽小道消息", "憑印象付款", "懶得看明細", "只看廣告標題"]],
      down: [["容易看錯金額或漏掉條款", "帳容易算錯", "容易被話術帶走", "轉帳填單容易按錯一位數", "優惠的但書容易沒看到"], ["付款前核對", "條款多看一遍", "截圖留存紀錄", "慢慢填表單"], ["急著付款", "聽信小道消息", "邊忙邊轉帳", "只聽業務說"]] },
  },
};
// when a planet counts because it rules a house, the house is what it speaks for
const LUCK_RULER_FACET = {
  R2: { up: [["自己賺的錢比較順，適合談條件", "收入方面容易有好消息", "靠本事賺的錢有機會多一點", "很適合檢查自己的報價合不合理"], ["整理收支", "開口談價", "更新報價單"], ["低估自己", "隨手亂花", "不好意思收錢"]],
    down: [["自己賺的錢感覺比較緊", "收入和支出容易對不上", "該收的款項容易拖", "賺的好像趕不上花的"], ["先列必要開支", "記一筆帳", "催該收的款"], ["借錢給人", "衝動下單", "用花錢解悶"]] },
  R8: { up: [["跟別人共用的錢比較好談，像分攤、貸款、保險", "適合處理分攤或保險這類事", "合買、合資的事容易談出共識", "很適合把貸款或保單重新看過"], ["把分攤講清楚", "整理保險", "核對共同帳戶"], ["拖著不處理", "含糊帶過", "一個人默默墊"]],
    down: [["跟別人共用的錢容易起摩擦", "分攤或借貸容易卡住", "誰該出多少容易各有算法", "別人的錢事容易牽連到你"], ["把帳攤開講", "先存預備金", "寫下誰出多少"], ["隨口答應借錢", "替人作保", "口頭約定金額"]] },
  R5: { up: [["戀愛和玩樂的運氣不錯", "適合安排約會或出去玩", "臨時起意的行程反而最好玩", "玩心一開，人也跟著有魅力"], ["安排出去玩", "約會", "試一家新的店"], ["只待在家", "把自己關起來", "邊玩邊想工作"]],
    down: [["玩樂容易掃興，曖昧容易卡住", "約會容易出小狀況", "興致容易被小事打斷", "出去玩容易有人不開心"], ["行程排鬆一點", "降低期待", "準備備案"], ["期待太高", "臨時放鳥", "硬要照計畫走"]] },
  R7: { up: [["另一半或對象比較好溝通", "一對一的相處很順", "你的想法對方比較聽得進去", "彼此容易談出共識"], ["一對一深聊", "一起吃頓飯", "把想法說出來"], ["只顧自己步調", "冷處理", "自己默默決定"]],
    down: [["跟另一半容易意見不合", "對方比較難配合", "你說東對方偏偏聽成西", "兩個人的時間容易喬不攏"], ["先聽完再回應", "各退一步", "換個時間再談"], ["逼對方表態", "翻舊帳", "替對方下結論"]] },
  R10: { up: [["事業方向比較清楚，適合往前推", "工作上的機會容易冒出來", "被交付重要的事，代表有人看好你", "想轉換的方向比較看得清楚"], ["向上報告", "爭取機會", "寫下下一步"], ["低調躲事", "錯過時機", "嫌事多推掉"]],
    down: [["事業方向容易卡住或被質疑", "工作上的壓力浮上來", "計畫容易被上面的決定打亂", "對現在的位置比較容易懷疑"], ["先確認方向", "把重點寫下來", "找前輩聊聊"], ["臨時換跑道", "硬碰硬", "衝動提離職"]] },
  R6: { up: [["日常工作順，待辦清得快", "跟同事的配合比較好", "手感好，例行的事做得又快又準", "工作環境很適合整理一下"], ["清待辦清單", "整理流程", "整理桌面"], ["拖延小事", "什麼都自己扛", "把順手的事拖著"]],
    down: [["日常工作容易出小狀況", "瑣事一件接一件", "交接和排班容易有落差", "身體的疲勞容易拖慢進度"], ["排好優先順序", "一次做一件", "中午好好吃飯"], ["同時做太多", "硬撐加班", "跳過休息"]] },
};
// nothing in orb: five variants per tier, the tier comes from the stars
const LUCK_QUIET = {
  love: {
    hi: [(d) => `${d}沒有特別碰到你感情的星，比起前後幾天算是輕鬆，相處起來很自然。`, (d) => `${d}感情面沒有阻力，想見誰就去見。`, (d) => `比起這陣子，${d}的感情步調算順，適合輕鬆約個飯。`, (d) => `${d}感情上沒什麼要擔心的，想聯絡誰就傳個訊息過去。`, (d) => `${d}的相處不用特別經營，一起做件小事就很舒服。`],
    mid: [(d) => `${d}沒有特別碰到你感情的星，照平常的步調相處就好。`, (d) => `${d}感情面比較安靜，小小的關心就夠了。`, (d) => `${d}的星星沒有特別碰到你的感情，適合把注意力放在自己身上。`, (d) => `${d}感情面沒有大起伏，吃頓飯、聊聊近況就很好。`, (d) => `感情在${d}算是平常心，不必特別安排什麼。`],
    lo: [(d) => `${d}沒有明顯的星象卡你，只是比起前後幾天比較平淡，別勉強製造話題。`, (d) => `${d}感情面比較低調，先顧好自己的心情。`, (d) => `比起這陣子，${d}感情比較沒火花，早點休息也很好。`, (d) => `${d}比較沒有心思經營感情，把話說短一點也沒關係。`, (d) => `${d}感情面提不太起勁，重要的話留到有精神再說。`],
  },
  career: {
    hi: [(d) => `${d}工作沒有特別的阻力，比起前後幾天推得比較順。`, (d) => `比起這陣子，${d}工作效率算好，可以多推一件事。`, (d) => `${d}工作面沒有卡關，適合把拖著的事做完。`, (d) => `${d}工作上沒人扯後腿，適合挑一件難一點的先做。`, (d) => `${d}做事手感不錯，順手把下一步也排好。`],
    mid: [(d) => `${d}沒有特別碰到你工作的星，照計畫把事做完就好。`, (d) => `${d}工作面比較平穩，適合處理例行的事。`, (d) => `${d}的星星沒有特別碰到你的事業，按部就班就好。`, (d) => `${d}工作不快不慢，把清單上的事一件件勾掉就好。`, (d) => `工作在${d}沒有特別的風向，適合整理檔案和回信。`],
    lo: [(d) => `${d}沒有明顯的星象卡你，只是比起前後幾天進度比較慢，別給自己太多壓力。`, (d) => `比起這陣子，${d}工作比較提不起勁，先做簡單的。`, (d) => `${d}工作面比較悶，把待辦砍小一點。`, (d) => `${d}工作容易分心，先關掉通知專心做一小時。`, (d) => `${d}進度慢一點是正常的，重要的決定先放著。`],
  },
  money: {
    hi: [(d) => `${d}財運沒有阻力，比起前後幾天手頭比較寬。`, (d) => `比起這陣子，${d}花錢比較有分寸，適合買需要的東西。`, (d) => `${d}荷包面平順，可以處理拖著的帳。`, (d) => `${d}用錢比較有餘裕，該繳的、該轉的一次處理完。`, (d) => `${d}荷包沒有壓力，適合買一樣用得久的東西。`],
    mid: [(d) => `${d}沒有特別碰到你財運的星，照預算花就好。`, (d) => `${d}收支比較平穩，適合記帳。`, (d) => `${d}的星星沒有特別碰到你的荷包，維持原本的步調。`, (d) => `${d}財務上沒什麼動靜，看一眼帳戶餘額就夠了。`, (d) => `錢的事在${d}很平常，該花的花、該省的省。`],
    lo: [(d) => `${d}沒有明顯的星象卡你，只是比起前後幾天手頭比較緊，大額先緩一緩。`, (d) => `比起這陣子，${d}比較容易亂花，先放購物車。`, (d) => `${d}荷包面偏保守，照預算走就好。`, (d) => `${d}手頭的感覺比較緊，外食和飲料先省一點。`, (d) => `${d}不太適合做跟錢有關的決定，隔天再看一次。`],
  },
};
const LUCK_QUIET_CHIP = {
  love: { hi: ["輕鬆約個飯", "想太多"], mid: ["日常小關心", "翻舊帳"], lo: ["顧好自己", "硬找話題"] },
  career: { hi: ["多推一件事", "拖延回覆"], mid: ["照計畫做", "臨時改方向"], lo: ["把待辦砍小", "硬撐加班"] },
  money: { hi: ["處理拖著的帳", "跟風下單"], mid: ["記一筆帳", "衝動購物"], lo: ["先放購物車", "大額消費"] },
};
const LUCK_VERB = { conj: ["疊在", "貼著", "走到", "碰上"], conjDown: ["壓在", "貼著", "壓到", "撞上"], soft: ["順著", "照到", "呼應", "照亮", "搭上"], sq: ["卡到", "頂著", "擦撞", "槓上"], opp: ["正對著", "對沖", "對上", "拉扯著"] };
const LUCK_SPAN = { fast: ["這幾天", "這週", "近幾天"], slow: ["這陣子", "這幾週", "最近這段時間"] };
const LUCK_RETRO = {
  love: { Venus: ["金星正在倒退，舊人舊事比較容易冒出來。", "金星在倒退，適合修補關係，不急著開始新的。", "金星在倒退，適合把沒說清楚的話補上。", "金星在倒退，新對象多觀察一陣子再定。"] },
  money: { Venus: ["金星在倒退，大件的先放購物車。", "金星在倒退，想換新的東西可以再等等。", "金星在倒退，貴的東西先比較、晚點再買。", "金星在倒退，適合把買了沒用的東西整理出來。"], Mercury: ["水星在倒退，付款前多核對一次。", "水星在倒退，帳單和訂閱多看一眼。", "水星在倒退，轉帳前再對一次帳號。", "水星在倒退，合約和報價單慢慢看。"] },
  career: { Mercury: ["水星在倒退，交辦和訊息多確認一次。", "水星在倒退，舊案子容易回頭找你。", "水星在倒退，寄出前檢查附件和收件人。", "水星在倒退，適合回頭修改舊文件。"] },
};
const LUCK_SLOW_HOUSE = { Jupiter: "這方面的機會本來就多一點", Saturn: "這方面本來就要多花點耐心" };

// A natal line has more than one reading. Which one shows turns with the calendar (Taipei days),
// the house lines at half the pace of the sign lines, so the pairings keep changing too.
function natalLine(v, k, pace = 1) {
  if (!Array.isArray(v)) return v;
  return v[(Math.floor((Date.now() + 8 * H) / DAY / pace) + fnv(k)) % v.length];
}

function fnv(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}
function natalLevel() {
  const s = NATAL.sign, d = NATAL.deg;
  if (d.Asc != null && d.Sun != null) return "exact";
  if (d.Sun != null) return "window";
  if (["Moon", "Venus", "Mars", "Asc"].some((k) => s[k] != null)) return "signs";
  if (s.Sun != null) return "sun";
  return null;
}
const natalSig = () => fnv(JSON.stringify([NATAL.sign, NATAL.deg, NATAL.birth]));
function mcOf(date, lon) {
  const r = Math.PI / 180, th = norm(A.SiderealTime(date) * 15 + lon) * r, eps = 23.4393 * r;
  return norm(Math.atan2(Math.sin(th), Math.cos(th) * Math.cos(eps)) / r);
}
function birthMoment(b) {
  if (!b?.date) return null;
  const [y, m, d] = b.date.split("-").map(Number);
  const [hh, mi] = b.time ? b.time.split(":").map(Number) : [0, 0];
  return (h = hh, mm = mi) => new Date(Date.UTC(y, m - 1, d, h, mm) - (b.tz ?? 8) * H);
}

// natal side, built once per birth-data signature: points with per-area weights, merged by body,
// then grouped into clusters (bodies within 3° count as one target)
let natalPtsMemo = null;
function natalPoints() {
  const sig = natalSig();
  if (natalPtsMemo?.sig === sig) return natalPtsMemo;
  const level = natalLevel(), base = houseBase(), notes = [];
  const b = NATAL.birth, at = birthMoment(b);
  const pos = {};
  for (const k of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Asc"]) {
    if (NATAL.sign[k] == null) continue;
    pos[k] = NATAL.deg[k] != null && level !== "signs" ? { lon: NATAL.deg[k], sign: NATAL.sign[k], unc: 0 } : { lon: null, sign: NATAL.sign[k], unc: 0 };
  }
  if (level === "exact" && at && b.time) pos.MC = { lon: mcOf(at(), CITIES[b.city ?? 0][2]), unc: 0 };
  if (pos.MC) pos.MC.sign = Math.floor(pos.MC.lon / 30);
  // no exact time: the natal Moon moves ~0.55° per hour of the remembered window
  if (level === "window" && pos.Moon && pos.Moon.lon != null) {
    const win = BIRTH_SLOTS[b?.slot] || BIRTH_SLOTS.unknown;
    const unc = ((win[1] - win[0]) / 2) * 0.55;
    if (unc <= 3.5) pos.Moon.unc = unc;
    else {
      const signs = at ? new Set([at(win[0], 0), at(win[1] - 1, 59)].map((t) => Math.floor(lonOf("Moon", t) / 30))) : new Set([0]);
      if (signs.size > 1) { delete pos.Moon; notes.push("你出生那段時間月亮換了星座，先不算月亮。"); }
      else { pos.Moon.lon = null; notes.push("出生時段太長，月亮只用星座比對。"); }
    }
  }
  const pts = new Map();
  for (const area of LUCK_AREAS) {
    for (const [key, w] of Object.entries(LUCK_TGT[area])) {
      const ruler = key[0] === "R";
      if ((ruler || key === "Asc" || key === "MC") && level !== "exact") continue;
      const body = ruler ? SIGN_RULER[(base.sign + Number(key.slice(1)) - 1) % 12] : key;
      if (!pos[body]) continue;
      if (!pts.has(body)) pts.set(body, { k: body, ...pos[body], roles: {}, w: {} });
      (pts.get(body).roles[area] ||= []).push([key, w]);
    }
  }
  const list = [...pts.values()];
  for (const p of list) for (const [area, rs] of Object.entries(p.roles)) {
    rs.sort((x, y) => y[1] - x[1]);
    p.w[area] = Math.min(1.2, rs[0][1] + 0.15 * (rs.length - 1));
    p.role = p.role || {};
    p.role[area] = rs[0][0]; // the main reason this body counts for the area
  }
  const clusters = {};
  for (const area of LUCK_AREAS) {
    const ids = list.map((p, i) => i).filter((i) => list[i].w[area]);
    const deg = ids.filter((i) => list[i].lon != null).sort((x, y) => list[x].lon - list[y].lon);
    const cl = [];
    for (const i of deg) {
      const last = cl[cl.length - 1];
      if (last && Math.abs(wrap180(list[i].lon - list[last[last.length - 1]].lon)) <= LUCK_CLUSTER) last.push(i);
      else cl.push([i]);
    }
    if (cl.length > 1) { const f = cl[0], l = cl[cl.length - 1]; if (Math.abs(wrap180(list[f[0]].lon - list[l[l.length - 1]].lon)) <= LUCK_CLUSTER) cl[0] = [...cl.pop(), ...f]; }
    const bySign = new Map();
    for (const i of ids.filter((j) => list[j].lon == null)) { if (!bySign.has(list[i].sign)) bySign.set(list[i].sign, []); bySign.get(list[i].sign).push(i); }
    clusters[area] = [...cl, ...bySign.values()];
  }
  natalPtsMemo = { sig, level, base, pts: list, clusters, notes };
  return natalPtsMemo;
}

// Jupiter and Saturn barely move: sample every 4 days at Taipei noon and interpolate
const slowLonCache = new Map();
function slowLon(k, dayIdx) {
  const get = (i) => { const key = `${k}${i}`; if (!slowLonCache.has(key)) slowLonCache.set(key, lonOf(k, new Date(i * DAY + 4 * H))); return slowLonCache.get(key); };
  const a = Math.floor(dayIdx / 4) * 4, l0 = get(a);
  return norm(l0 + wrap180(get(a + 4) - l0) * ((dayIdx - a) / 4));
}
const luckDayIdx = (info) => Math.round((info.start + 8 * H) / DAY);
function aspectValue(ang, tp, natalK) {
  const tn = LUCK_TP[tp][1];
  let v;
  if (ang === 0) { const s = tn + (NATAL_NATURE[natalK] || 0); v = Math.abs(s) < 0.05 ? 0.4 : Math.max(-1, Math.min(1, s * 2.5)); }
  else v = { 60: 0.7, 120: 0.9, 90: -0.9, 180: -0.7 }[ang];
  if (tn > 0 && v < 0) v *= 0.45; // a benefic's hard aspect is "wanting too much", not a disaster
  if (tn < 0 && v > 0) v *= 0.55; // a malefic's easy aspect is steady, not lucky
  return v;
}
// one transit against one natal point: {c, ang, peak (Moon sample index), applying, stat}
function luckHit(tp, p, area, moonL, tr) {
  const [wt, , orb0] = LUCK_TP[tp], wn = p.w[area];
  const isMoon = tp === "Moon";
  if (p.lon != null) {
    const ls = isMoon ? moonL : [tr[tp].lon];
    let acc = 0, best = null;
    ls.forEach((L, i) => {
      const d = Math.abs(wrap180(L - p.lon));
      for (const ang of LUCK_ANGS) {
        const orb = (ang === 60 ? orb0 * 0.6 : orb0) + p.unc, off = Math.abs(d - ang);
        if (off >= orb) continue;
        const s = Math.cos((off / orb) * (Math.PI / 2));
        acc += aspectValue(ang, tp, p.k) * s;
        if (!best || s > best.s) best = { s, ang, i };
      }
    });
    if (!best) return null;
    let c = (wn * wt * acc) / ls.length;
    let applying = null, stat = false;
    if (!isMoon) {
      const t = tr[tp];
      const offNow = Math.abs(Math.abs(wrap180(t.lon - p.lon)) - best.ang), offNext = Math.abs(Math.abs(wrap180(t.next - p.lon)) - best.ang);
      stat = Math.abs(t.mot) < 0.05;
      applying = offNext < offNow;
      c *= stat ? 1.2 : applying ? 1.15 : 0.85;
      if ((tp === "Mercury" || tp === "Venus") && t.mot < 0 && c > 0) c *= 0.7;
      if (tp === "Mars" && t.mot < 0) c *= 0.8;
    }
    return { c, ang: best.ang, peak: best.i, applying, stat };
  }
  // sign level: whole-sign aspects only
  if (isMoon) {
    let acc = 0, best = null;
    moonL.forEach((L, i) => {
      const ang = SIGN_ANG[signDist(Math.floor(L / 30), p.sign)];
      if (ang == null) return;
      const v = aspectValue(ang, tp, p.k) * 0.6;
      acc += v;
      if (!best || Math.abs(v) > Math.abs(best.v)) best = { v, ang, i };
    });
    return best ? { c: (wn * wt * acc) / moonL.length, ang: best.ang, peak: best.i, sign: true } : null;
  }
  if (!["Venus", "Mars", "Jupiter", "Saturn"].includes(tp) || !["Sun", "Moon", "Venus"].includes(p.k)) return null;
  const ang = SIGN_ANG[signDist(Math.floor(tr[tp].lon / 30), p.sign)];
  return ang == null ? null : { c: wn * wt * aspectValue(ang, tp, p.k) * 0.35, ang, sign: true };
}
// raw score of one day for the three areas, with the parts that make it up
const luckRawCache = new Map();
function luckRaw(dayIdx, np) {
  const key = `${np.sig}|${dayIdx}`;
  if (luckRawCache.has(key)) return luckRawCache.get(key);
  const start = dayIdx * DAY - 8 * H;
  const moonL = Array.from({ length: 9 }, (_, i) => lonOf("Moon", new Date(start + i * 3 * H)));
  const tr = {};
  for (const k of ["Sun", "Mercury", "Venus", "Mars"]) {
    const lon = lonOf(k, new Date(start + 12 * H)), next = lonOf(k, new Date(start + 36 * H));
    tr[k] = { lon, next, mot: wrap180(next - lon) };
  }
  for (const k of ["Jupiter", "Saturn"]) { const lon = slowLon(k, dayIdx), next = slowLon(k, dayIdx + 1); tr[k] = { lon, next, mot: wrap180(next - lon) }; }
  const out = { tr, moonL };
  for (const area of LUCK_AREAS) {
    const parts = [];
    let total = 0;
    for (const cl of np.clusters[area]) {
      const cp = [];
      for (const tp of Object.keys(LUCK_TP)) {
        let best = null;
        for (const pi of cl) { const r = luckHit(tp, np.pts[pi], area, moonL, tr); if (r && (!best || Math.abs(r.c) > Math.abs(best.c))) best = { ...r, pi }; }
        if (best) cp.push({ ...best, tp, cl, retro: tp !== "Moon" && tr[tp].mot < 0 });
      }
      // a natal point can only be pushed so far in one day, however many planets touch it
      const sum = cp.reduce((n, x) => n + x.c, 0), f = sum ? (LUCK_SAT * Math.tanh(sum / LUCK_SAT)) / sum : 1;
      for (const x of cp) { x.c *= f; parts.push(x); }
      total += sum * f;
    }
    // background: planets walking through houses that matter for this area (only with a known Ascendant)
    if (np.base.by === "asc") {
      const hf = (lon) => HF[area][signDist(Math.floor(lon / 30), np.base.sign)];
      total += 0.35 * moonL.reduce((n, L) => n + hf(L), 0) / moonL.length;
      for (const k of ["Venus", "Jupiter"]) total += 0.25 * hf(tr[k].lon);
      for (const k of ["Mars", "Saturn"]) total -= 0.15 * Math.abs(hf(tr[k].lon));
      for (const k of ["Sun", "Mercury"]) total += 0.1 * hf(tr[k].lon);
    }
    out[area] = { total, parts };
  }
  if (luckRawCache.size > 160) luckRawCache.delete(luckRawCache.keys().next().value);
  luckRawCache.set(key, out);
  return out;
}
// stars: rank the day within the person's own ±14 days; 5★ needs a positive day, 1★ a negative one
function luckStars(dayIdx, np) {
  const raws = Array.from({ length: 29 }, (_, i) => luckRaw(dayIdx - 14 + i, np));
  const res = {};
  for (const area of LUCK_AREAS) {
    const vals = raws.map((r) => r[area].total), v = vals[14];
    const below = vals.filter((x) => x < v).length, eq = vals.filter((x) => x === v).length;
    const pct = (below + (eq - 1) / 2) / 28;
    let st = 1 + [0.12, 0.34, 0.66, 0.88].filter((q) => pct >= q).length;
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (m > LUCK_TILT && v > 0 && (st === 2 || st === 3)) st++;
    if (m < -LUCK_TILT && v < 0 && (st === 3 || st === 4)) st--;
    if (Math.max(...vals) - Math.min(...vals) < LUCK_FLAT) st = 3;
    if (st === 5 && v <= 0) st = 4;
    if (st === 1 && v >= 0) st = 2;
    res[area] = { st, v };
  }
  return res;
}

// text: lead with the part that agrees with the stars; one sentence, a second only for an opposite pull
function luckModel(info) {
  const np = natalPoints();
  const live = offsetDays === 0;
  const key = `${np.sig}|${info.key}|${live ? new Date().getHours() : ""}`;
  if (luckModelCache.has(key)) return luckModelCache.get(key);
  const t0 = performance.now();
  const dayIdx = luckDayIdx(info);
  const raw = luckRaw(dayIdx, np), stars = luckStars(dayIdx, np);
  const seed = `${info.key}|${np.sig}`;
  const pick = (arr, salt, used) => {
    const h = fnv(seed + salt);
    for (let i = 0; i < arr.length; i++) { const x = arr[(h + i) % arr.length]; if (!used || !used.has(x)) { used?.add(x); return x; } }
    return arr[h % arr.length];
  };
  const d = dayNoun(), now = Date.now();
  const usedKeys = new Map(), usedPhr = new Set(), usedChip = new Set(), usedSpan = new Set();
  let reused = false, vocSaid = false, retroSaid = false;
  const ptName = (p, cl) => cl.length > 1 ? cl.map((i) => PT_ZH[np.pts[i].k]).join("和") : PT_ZH[p.k];
  const moonHitCache = new Map();
  // when a Moon part happens: the exact moment if it falls on the day, else the part of day it peaks
  const timeOf = (x) => {
    const p = np.pts[x.pi];
    if (x.sign) {
      const segs = info.segs.filter((s) => SIGN_ANG[signDist(s.sign, p.sign)] === x.ang);
      if (segs.length === info.segs.length) return { word: `${d}一整天`, t: null };
      const s = segs[0];
      if (!s) return { word: d, t: null };
      return s.from <= info.start ? { word: `${plainTime(s.to)}以前`, t: s.from } : { word: `${plainTime(s.from)}以後`, t: s.from };
    }
    if (!moonHitCache.has(x.pi)) moonHitCache.set(x.pi, moonHits(info, p.lon));
    const hit = moonHitCache.get(x.pi).find((h) => (h.ang > 180 ? 360 - h.ang : h.ang) === x.ang);
    if (hit) return { word: `${plainTime(hit.t)}前後`, t: hit.t };
    const hr = (x.peak ?? 4) * 3;
    return { word: hr < 5 ? "一早" : hr < 11 ? "上午" : hr < 13 ? "中午" : hr < 18 ? "下午" : "晚上", t: info.start + hr * H };
  };
  const verbOf = (x, salt) => {
    const k = x.ang === 0 ? (x.c < 0 && LUCK_TP[x.tp][1] < 0 ? "conjDown" : "conj") : x.ang === 90 ? "sq" : x.ang === 180 ? "opp" : "soft";
    return pick(LUCK_VERB[k], salt);
  };
  const facetOf = (area, x, pol, salt) => {
    const p = np.pts[x.pi], role = p.role[area];
    const f = (LUCK_RULER_FACET[role] || LUCK_FACET[area][p.k])?.[pol];
    if (!f) return null;
    return { t: pick(f[0], salt + "t", usedPhr), doit: pick(f[1], salt + "d", usedChip), avoid: pick(f[2], salt + "a", usedChip) };
  };
  const who = (x, area, salt) => {
    const p = np.pts[x.pi];
    // the same planet on both sides: say which one moves today
    const tp = x.tp !== p.k ? TP_ZH[x.tp] : x.tp === "Moon" ? `${d}的月亮` : `天上的${TP_ZH[x.tp]}`;
    return `${tp}${verbOf(x, area + salt)}你的本命${ptName(p, x.cl)}`;
  };
  const whenOf = (x, area) => {
    if (x.tp === "Moon") {
      const tm = timeOf(x);
      if (live && tm.t != null && tm.t < now - 2 * H && !tm.word.endsWith("以後")) tm.word = `稍早（${tm.word}）`;
      return tm;
    }
    return { word: pick(["Jupiter", "Saturn"].includes(x.tp) ? LUCK_SPAN.slow : LUCK_SPAN.fast, area + "span", usedSpan), t: null, span: true };
  };
  const areas = {};
  const pattern = fnv(seed + "pat") % 2;
  LUCK_AREAS.forEach((area, ai) => {
    const { st, v } = stars[area];
    const tier = tierOf(st);
    const pol = st >= 4 ? "up" : st <= 2 ? "down" : null;
    const parts = raw[area].parts.filter((x) => Math.abs(x.c) >= 0.08);
    const sorted = parts.filter((x) => (pol === "up" ? x.c > 0 : pol === "down" ? x.c < 0 : true)).sort((a, b) => (pol === "down" ? a.c - b.c : pol === "up" ? b.c - a.c : Math.abs(b.c) - Math.abs(a.c)));
    const kOf = (x) => x.cl.map((i) => `${x.tp}|${np.pts[i].k}`);
    const isUsed = (x) => kOf(x).some((k) => usedKeys.has(k));
    const usedBy = (x) => usedKeys.get(kOf(x).find((k) => usedKeys.has(k)));
    const markUsed = (x) => kOf(x).forEach((k) => usedKeys.set(k, area));
    let main = sorted[0], opener = "";
    // the Moon has a time of day, so it leads when it is nearly as strong
    if (main && main.tp !== "Moon") { const m = sorted.find((x) => x.tp === "Moon" && Math.abs(x.c) >= 0.5 * Math.abs(main.c)); if (m) main = m; }
    if (main && isUsed(main)) {
      const next = sorted.find((x) => !isUsed(x));
      if (!reused && (!next || Math.abs(main.c) >= 2 * Math.abs(next.c))) { reused = true; opener = `跟${LUCK_ZH[usedBy(main)]}是同一顆星：`; }
      else main = next;
    }
    // viewing today: a Moon lead that has already passed gives way to a comparable one still ahead
    if (main && live && main.tp === "Moon") {
      const tm = timeOf(main);
      if (tm.t != null && tm.t < now - 2 * H) {
        const ahead = sorted.find((x) => x !== main && !isUsed(x) && Math.abs(x.c) >= 0.7 * Math.abs(main.c) && (x.tp !== "Moon" || (timeOf(x).t ?? 0) > now));
        if (ahead) { main = ahead; opener = ""; }
      }
    }
    const mpol = main ? (main.c > 0 ? "up" : "down") : null;
    const fc = main && facetOf(area, main, mpol, area);
    let text, doit, avoid, lead = null;
    if (main && fc) {
      markUsed(main);
      const tm = whenOf(main, area);
      let when = tm.word, tail = "";
      if (main.tp === "Moon" && mpol === "up" && !vocSaid && tm.t != null) {
        const vv = info.voc.find((x) => Math.abs(tm.t - x.full[0]) < H || (tm.t >= x.from && tm.t <= x.to));
        if (vv) { when = `${plainTime(vv.full[0])}以前`; tail = "，把要談的事趁這之前談完"; vocSaid = true; }
      }
      const flav = pick(LUCK_FLAV[main.tp][mpol], area + "f", usedPhr);
      const w = who(main, area, "v");
      const sep = tm.span ? "" : "，";
      if (opener) text = `${opener}${w}，${fc.t}${tail}。`;
      else if ((pattern + ai) % 2 === 0) text = `${when}${sep}${w}：${flav}，${fc.t}${tail}。`;
      else text = `${flav}，${fc.t}${tail}：${when}${sep}${w}。`;
      // second sentence only for a real pull the other way
      const opp = parts.filter((x) => (x.c > 0) !== (main.c > 0) && Math.abs(x.c) >= 0.5 * Math.abs(main.c) && !isUsed(x)).sort((a, b) => Math.abs(b.c) - Math.abs(a.c))[0];
      const fo = opp && facetOf(area, opp, opp.c > 0 ? "up" : "down", area + "2");
      const second = fo && `${pick(mpol === "up" ? ["只是", "不過"] : ["還好", "不過"], area + "c")}${whenOf(opp, area + "2").word}${who(opp, area, "v2")}，${fo.t}。`;
      if (second && [...text].length + [...second].length <= 82) {
        text += second;
        markUsed(opp);
      } else if (!retroSaid) {
        const rt = LUCK_RETRO[area];
        const r = Object.keys(rt).find((k) => raw.tr[k].mot < 0 && (area !== "love" || main.tp === k || np.pts[main.pi].k === k));
        if (r) { text += pick(rt[r], area + "r"); retroSaid = true; }
      }
      doit = fc.doit; avoid = fc.avoid;
      lead = main;
    } else {
      text = pick(LUCK_QUIET[area][tier], area + "q")(d);
      // with a known Ascendant, a slow planet sitting in a house that matters adds context
      if (np.base.by === "asc") {
        for (const k of ["Jupiter", "Saturn"]) {
          const h = signDist(Math.floor(raw.tr[k].lon / 30), np.base.sign);
          if (Math.abs(HF[area][h]) >= 0.7 && (k === "Jupiter") === (tier !== "lo")) { text += `這陣子${TP_ZH[k]}在你的第 ${h + 1} 宮（${AREA[h]}），${LUCK_SLOW_HOUSE[k]}。`; break; }
        }
      }
      [doit, avoid] = LUCK_QUIET_CHIP[area][tier];
    }
    // the why fold: the strongest parts, in astrologer shorthand
    const why = parts.slice().sort((a, b) => Math.abs(b.c) - Math.abs(a.c)).slice(0, 4).map((x) => {
      const p = np.pts[x.pi], role = p.role[area];
      let time = "這幾天";
      if (x.tp === "Moon") { const tm = timeOf(x); time = x.sign ? (tm.word.includes("整天") ? "全天" : tm.t != null && tm.word.endsWith("以前") ? `~${fmtT(info.segs[0].to)}` : `${fmtT(tm.t)}~`) : tm.word.includes("前後") ? fmtT(tm.t) : tm.word; }
      else if (["Jupiter", "Saturn"].includes(x.tp)) time = "這陣子";
      const pn = x.cl.length > 1 ? x.cl.map((i) => (np.pts[i].k === "MC" ? "天頂" : PT_ZH[np.pts[i].k])).join("、") : p.k === "MC" ? "天頂" : PT_ZH[p.k];
      const extra = [RULER_ROLE_ZH[role], x.retro ? "逆行" : "", x.stat ? "停滯" : x.applying === true ? "漸近" : x.applying === false ? "漸離" : ""].filter(Boolean).join("，");
      return { time, kind: x.c > 0 ? "soft" : "hard", title: `${TP_ZH[x.tp]} ${ANG_G[x.ang]} 你的本命${pn}${extra ? `（${extra}）` : ""}`, tag: x.c > 0 ? "加分" : "扣分" };
    });
    areas[area] = { st, v, text, doit, avoid, why, lead };
  });
  const model = { level: np.level, notes: np.notes, areas, ms: performance.now() - t0 };
  if (luckModelCache.size > 40) luckModelCache.delete(luckModelCache.keys().next().value);
  luckModelCache.set(key, model);
  if (DEBUG) console.log(`[luck] ${info.key} ${model.ms.toFixed(1)} ms`, LUCK_AREAS.map((a) => `${a} ${areas[a].st} ${areas[a].v.toFixed(2)}`).join(" | "));
  return model;
}
const luckModelCache = new Map();
const DEBUG = new URLSearchParams(location.search).has("debug");
// ?debug: timing in the console and a handle for the calibration script
if (DEBUG) window.__luck = { natalPoints, luckRaw, luckStars, luckModel, lonOf, ascendant, dayInfo, setNatal: (n) => { NATAL = n; natalPtsMemo = null; luckModelCache.clear(); } };
const LUCK_LEVEL = { window: "時段估算", signs: "只用星座" };
function hasNatal() {
  return ["exact", "window", "signs"].includes(natalLevel());
}
function showPersonal() {
  setView("chart");
  $("personal").scrollIntoView({ behavior: "smooth", block: "start" });
}
// Hero: two clear paths, so first-time visitors see that a personal reading exists.
function syncPaths() {
  const desc = $("pathPersonalDesc");
  if (!desc) return;
  desc.textContent = hasNatal()
    ? "已依你的星盤算好，直接看今天的愛情、事業、財運"
    : "輸入生日，依你出生那天的星盤，算今天的愛情、事業、財運";
}
$("pathPersonal").addEventListener("click", () => (hasNatal() ? showPersonal() : openBirth()));
function backToFortune() {
  setView("fortune");
  $("sec-today").scrollIntoView({ behavior: "smooth", block: "start" });
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-back-fortune]")) backToFortune();
});
$("pathSign").addEventListener("click", () => {
  $("sec-today").scrollIntoView({ behavior: "smooth", block: "start" });
});
function openBirth() {
  setView("chart");
  const box = $("birthBox");
  box.open = true;
  box.scrollIntoView({ block: "center" });
  $("bY").focus({ preventScroll: true });
}
function luckCard(info) {
  const lvl = natalLevel();
  const el = (tag, cls, text) => Object.assign(document.createElement(tag), { className: cls || "", textContent: text || "" });
  const card = el("article", "p-card p-luck");
  const head = el("div", "pl-head");
  head.append(el("p", "p-k", `依你的星盤 · 你專屬的版本`));
  if (LUCK_LEVEL[lvl]) head.append(el("span", "pl-lvl", LUCK_LEVEL[lvl]));
  card.append(head);
  if (lvl === "sun") {
    card.classList.add("p-luck-empty");
    card.append(el("p", "pl-title", `${dayWord()}的愛情、事業、財運`), el("p", "p-t", "現在只有太陽星座，算出來會跟「我的運勢」一樣。填出生日期（時間不知道也可以），就能算出你的金星、月亮在哪裡，看星星怎麼碰到你。"));
    const b = el("button", "pillbtn", "填出生日期");
    b.type = "button";
    b.addEventListener("click", openBirth);
    card.append(b);
    return card;
  }
  const m = luckModel(info);
  const tp = taipeiParts(new Date(info.start + 12 * H));
  card.append(el("p", "pl-title", `${dayWord()}的愛情、事業、財運 · ${tp.m}/${tp.d} ${info.wk.zh}`));
  const ul = el("ul", "tcats");
  LUCK_AREAS.forEach((area, i) => {
    const a = m.areas[area];
    const li = document.createElement("li");
    li.style.setProperty("--i", i);
    li.innerHTML = '<div class="tc-head"><span class="cl"></span><span class="fs"></span></div><p class="ft-main"></p><div class="dd"><div class="do"><b>適合</b><span class="chip"></span></div><div class="dont"><b>避免</b><span class="chip"></span></div></div>';
    li.querySelector(".cl").textContent = LUCK_ZH[area];
    li.querySelector(".fs").textContent = stars(a.st);
    li.querySelector(".fs").setAttribute("aria-label", `${a.st} 顆星`);
    li.querySelector(".ft-main").textContent = a.text;
    li.querySelector(".do .chip").textContent = a.doit;
    li.querySelector(".dont .chip").textContent = a.avoid;
    ul.append(li);
  });
  card.append(ul);
  const why = el("details", "why tsky pl-why");
  why.innerHTML = '<summary><span class="tsky-k">為什麼這樣說？</span><small>星象依據 · 跟你自己比</small></summary>';
  const cols = el("div", "pl-why-cols");
  for (const area of LUCK_AREAS) {
    const a = m.areas[area];
    const col = el("div", "pl-why-col");
    col.append(el("p", "pl-why-k", `${LUCK_ZH[area]} ${stars(a.st)}`));
    const list = el("ul", "p-list");
    list.append(...(a.why.length ? a.why.map((r) => {
      const li = document.createElement("li");
      li.className = r.kind;
      li.innerHTML = "<time></time><div><b></b><span></span></div>";
      li.querySelector("time").textContent = r.time;
      li.querySelector("b").textContent = r.title;
      li.querySelector("span").textContent = r.tag;
      return li;
    }) : [el("li", "none", "沒有行星和你的本命點形成相位，星數只看月亮和行星走過哪幾宮。")]));
    col.append(list);
    cols.append(col);
  }
  why.append(cols);
  const lvlNote = { exact: "用你的出生時間算出準確度數、上升和天頂。", window: `出生時間用${BIRTH_SLOTS[NATAL.birth?.slot]?.[2] || "那段時間"}的中間估算，沒有上升和天頂；事業看太陽、水星和土星。`, signs: "只有星座，用整個星座比對，抓不到準確的時間。" }[m.level] || "";
  const manualAsc = m.level !== "exact" && NATAL.sign.Asc != null ? "上升是自己選的，宮位照它排，但不拿來算分。" : "";
  why.append(el("p", "p-m", `${lvlNote}${m.notes.join("")}${manualAsc}`), el("p", "p-m", "星數是拿你自己前後兩週來比：5 顆是這個月最順的幾天之一，不是跟別人比。「我的運勢」是同星座共用的版本，兩邊星數不同是正常的。"));
  card.append(why);
  const back = el("button", "backbar", "回到星座運勢（今日／本週）");
  back.type = "button";
  back.dataset.backFortune = "";
  back.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>');
  card.append(back);
  return card;
}

/* ---------- 合盤: you × someone else. The other person's data lives in memory only (never stored or sent) ---------- */
let SYN = { host: null, partner: null };
const SYN_KEYS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const synHalf = (slot) => { const w = BIRTH_SLOTS[slot] || BIRTH_SLOTS.unknown; return slot === "exact" ? 0 : (w[1] - w[0]) / 2; };
function synBodies(deg, slot) {
  const half = synHalf(slot), out = {};
  for (const k of SYN_KEYS) if (deg[k] != null) out[k] = { lon: deg[k], unc: k === "Moon" ? half * 0.55 : 0 };
  if (out.Moon && out.Moon.unc > 3.5) delete out.Moon; // too blurry to say anything about
  return out;
}
function synCalc(host) {
  const q = (id) => host.querySelector(id);
  const y = Number(q("[data-s=y]").value), m = Number(q("[data-s=m]").value), d = Number(q("[data-s=d]").value);
  const note = q(".syn-note");
  if (!(y >= 1900 && y <= 2100 && m && d)) { note.textContent = "請先填對方的出生年（西元）、月、日。"; return; }
  let slot = q("[data-s=slot]").value;
  const tm = slot === "exact" ? q("[data-s=time]").value : "";
  if (slot === "exact" && !tm) slot = "unknown";
  const tz = Number(q("[data-s=tz]").value);
  const win = BIRTH_SLOTS[slot];
  const [hh, mi] = tm ? tm.split(":").map(Number) : [(win[0] + win[1]) / 2, 0];
  const date = new Date(Date.UTC(y, m - 1, d, hh, mi) - tz * H);
  const deg = {};
  for (const k of SYN_KEYS) deg[k] = lonOf(k, date);
  const sunCusp = !tm && new Set([win[0], win[1] - 1 / 60].map((h) => Math.floor(lonOf("Sun", new Date(Date.UTC(y, m - 1, d, h) - tz * H)) / 30))).size > 1;
  SYN.partner = { name: q("[data-s=name]").value.trim().slice(0, 12), deg, slot, sunCusp };
  renderSynResult(host);
}
function renderSynResult(host) {
  const out = host.querySelector(".syn-out");
  const P = SYN.partner;
  if (!P) { out.replaceChildren(); return; }
  const mine = NATAL.deg;
  const youB = synBodies(mine, NATAL.birth?.slot || (NATAL.birth?.time ? "exact" : "unknown")), themB = synBodies(P.deg, P.slot);
  const r = compare(youB, themB, `${NATAL.birth?.date || ""}|${Math.round(P.deg.Sun * 10)}|${Math.round(P.deg.Moon * 10)}`);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const sg = (lon) => SIGNS[Math.floor(lon / 30)];
  const nodes = [];
  const them = P.name || "對方";
  nodes.push(el("p", "syn-title", `你 × ${them}`));
  nodes.push(el("p", "syn-signs", `${TXT(sg(mine.Sun).g)} 你的太陽${sg(mine.Sun).zh}　${TXT(sg(P.deg.Sun).g)} ${them}的太陽${sg(P.deg.Sun).zh}`));
  nodes.push(el("p", "syn-over", r.overview));
  if (r.sun) { const b = el("div", "syn-base"); b.append(el("b", null, "底色"), el("span", null, r.sun)); nodes.push(b); }
  if (r.moon && youB.Moon && themB.Moon) { const b = el("div", "syn-base"); b.append(el("b", null, "情緒節奏"), el("span", null, r.moon)); nodes.push(b); }
  const METER = { strong: "很明顯", some: "有一些", quiet: "不明顯" };
  const TONE_W = { easy: "偏順", tense: "偏緊", mixed: "有順有緊" };
  const grid = el("div", "syn-faces");
  for (const f of r.faces) {
    const box = el("div", `syn-face ${f.tier} ${f.tone}`);
    const hd = el("div", "syn-fh");
    hd.append(el("b", null, f.zh), el("small", null, f.tier === "quiet" ? METER.quiet : `${METER[f.tier]}・${TONE_W[f.tone]}`));
    box.append(hd, el("p", "syn-head", f.head));
    const ul = el("ul", "syn-rows");
    for (const row of f.rows.slice(0, f.tier === "quiet" ? 1 : 3)) {
      const li = el("li", row.kind === "conj" ? (row.tense ? "hard" : "conj") : row.tense ? "hard" : "soft");
      li.append(el("b", null, `${row.approx ? "約・" : ""}你的${SYN_ZH[row.a]} ${row.glyph} ${them}的${SYN_ZH[row.b]}`), el("span", null, row.text));
      ul.append(li);
    }
    if (ul.children.length) box.append(ul);
    grid.append(box);
  }
  nodes.push(grid);
  const legend = el("div", "syn-legend");
  legend.append(el("p", "syn-lg-k", "符號說明（兩顆星之間隔的角度）"));
  const lg = el("ul", "syn-lg");
  for (const [g, name, w, cls] of [["☌", "合相 0°", "重疊，力量放大", "conj"], ["⚹", "六分 60°", "輕鬆，有機會", "soft"], ["△", "三分 120°", "最順、自然合拍", "soft"], ["□", "四分 90°", "有摩擦，需要調整", "hard"], ["☍", "對分 180°", "像照鏡子，互相吸引或拉扯", "hard"]]) {
    const li = el("li", cls);
    li.append(el("b", null, `${g} ${name}`), el("span", null, w));
    lg.append(li);
  }
  legend.append(lg, el("p", "p-m", "綠色＝順，紅色＝需要磨合，金色＝合相（要看是哪兩顆星）。"));
  nodes.push(legend);
  const notes = [...r.notes];
  if (!youB.Moon || !themB.Moon) notes.push("有一邊的出生時間太模糊，月亮的位置不確定，所以略過月亮相關的部分。");
  if (P.sunCusp) notes.push("對方剛好生在太陽換星座的那天，太陽星座要看出生時間。");
  notes.push("星象只描述相處風格，不是合不合的判決；真正的關係看兩個人怎麼相處。");
  notes.push("對方的資料只留在這個頁面，不會儲存或上傳，重新整理就消失。");
  nodes.push(el("p", "p-m syn-foot", notes.join(" ")));
  out.replaceChildren(...nodes);
}
function synHost() {
  if (SYN.host) return SYN.host;
  const host = document.createElement("details");
  host.className = "p-card syn-card";
  host.innerHTML = `<summary><span class="p-k">合盤</span><small>輸入另一個人的出生日期，看相處風格</small></summary><p class="syn-lead">填對方的出生日期，看你們相處的風格。</p>
<div class="syn-need" hidden><p></p><button type="button" class="pillbtn" data-s="need">填出生日期</button></div>
<div class="syn-form">
<label class="syn-name">稱呼（選填）<input data-s="name" type="text" maxlength="12" placeholder="對方" autocomplete="off" /></label>
<div class="bdate-row"><label><input data-s="y" type="text" inputmode="numeric" maxlength="4" placeholder="1995" aria-label="對方出生年（西元）" autocomplete="off" /><small>年</small></label><label><select data-s="m" aria-label="對方出生月"></select><small>月</small></label><label><select data-s="d" aria-label="對方出生日"></select><small>日</small></label></div>
<label>出生時段<select data-s="slot"><option value="exact">知道準確時間</option><option value="day">大概白天（6–18 點）</option><option value="eve">大概晚上（18 點後）</option><option value="night">大概半夜（0–6 點）</option><option value="unknown" selected>完全不知道</option></select></label>
<label data-s="timewrap" hidden>出生時間<input data-s="time" type="time" /></label>
<details class="syn-tz"><summary>出生在台灣以外</summary><label>時區<select data-s="tz"></select></label></details>
<div class="birth-act"><button type="button" class="pillbtn" data-s="go">計算</button><button type="button" class="linkbtn" data-s="clear">清除</button></div>
<p class="syn-note birth-note"></p></div>
<div class="syn-out" aria-live="polite"></div>`;
  const q = (k) => host.querySelector(`[data-s=${k}]`);
  q("m").replaceChildren(bOpt("", "—"), ...Array.from({ length: 12 }, (_, i) => bOpt(String(i + 1), String(i + 1))));
  q("tz").innerHTML = TZS.map((z) => `<option value="${z}"${z === 8 ? " selected" : ""}>UTC${z >= 0 ? "+" : "−"}${Math.abs(z)}</option>`).join("");
  const days = () => {
    const y = Number(q("y").value) || 2000, m = Number(q("m").value) || 1, n = new Date(Date.UTC(y, m, 0)).getUTCDate(), keep = q("d").value;
    q("d").replaceChildren(bOpt("", "—"), ...Array.from({ length: n }, (_, i) => bOpt(String(i + 1), String(i + 1))));
    if (keep && Number(keep) <= n) q("d").value = keep;
  };
  days();
  q("y").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); if (e.target.value.length === 4) days(); });
  q("m").addEventListener("change", days);
  q("slot").addEventListener("change", () => { q("timewrap").hidden = q("slot").value !== "exact"; });
  q("go").addEventListener("click", () => synCalc(host));
  q("clear").addEventListener("click", () => {
    SYN.partner = null;
    ["name", "y", "time"].forEach((k) => { q(k).value = ""; });
    q("m").value = ""; days(); q("d").value = ""; q("slot").value = "unknown"; q("timewrap").hidden = true; q("tz").value = "8";
    host.querySelector(".syn-note").textContent = "";
    renderSynResult(host);
  });
  q("need").addEventListener("click", openBirth);
  SYN.host = host;
  return host;
}
function syncSynHost() {
  const host = synHost();
  const ready = NATAL.deg.Sun != null;
  host.querySelector(".syn-need").hidden = ready;
  host.querySelector(".syn-need p").textContent = "合盤要用到你的出生日期。先填你自己的，再回來輸入對方的。";
  host.querySelector(".syn-form").hidden = !ready;
  host.querySelector(".syn-out").hidden = !ready;
  if (ready && SYN.partner) renderSynResult(host); // your chart may have changed
  return host;
}
function renderPersonal() {
  const box = $("personal");
  if (synastryReady()) { const h = syncSynHost(); if (h.parentNode !== $("synBox")) $("synBox").append(h); }
  if (!lastSky) return;
  const { info, pos } = lastSky;
  renderHouses(info);
  const sg = NATAL.sign;
  const base = houseBase().sign;
  if (base == null) {
    const b = Object.assign(document.createElement("button"), { type: "button", className: "pillbtn", textContent: "填出生資料" });
    b.addEventListener("click", openBirth);
    const p = Object.assign(document.createElement("div"), { className: "p-empty" });
    p.append(Object.assign(document.createElement("p"), { textContent: "先選你的太陽星座（就是一般說的星座），就能看今天月亮走到你的哪一宮；填上出生資料，還會依你的星盤算今天的愛情、事業、財運。" }), b);
    box.replaceChildren(p);
    return;
  }
  const frag = [luckCard(info)];
  const level = natalLevel();
  const card = (cls, html) => { const d = document.createElement("div"); d.className = `p-card ${cls}`; d.innerHTML = html; frag.push(d); return d; };
  // 1. house
  const h0 = signDist(info.segs[0].sign, base), h1 = info.segs.length > 1 ? signDist(info.segs[1].sign, base) : null;
  const method = houseBase().by === "asc" ? `依你的上升${SIGNS[base].zh}排出的宮位` : `還沒有上升，暫用太陽星座${SIGNS[base].zh}當第 1 宮，只能參考`;
  const hc = card("p-house", `<p class="p-k">月亮今天在你的</p><p class="p-big"></p><p class="p-t"></p><p class="p-m"></p>`);
  hc.querySelector(".p-big").textContent = h1 == null ? `第 ${h0 + 1} 宮 · ${HOUSES[h0][0]}` : `第 ${h0 + 1} 宮 → 第 ${h1 + 1} 宮`;
  hc.querySelector(".p-t").textContent = h1 == null ? HOUSE_TIP[h0] : `${fmtT(info.segs[1].from)} 前：${HOUSE_TIP[h0]}${fmtT(info.segs[1].from)} 後：${HOUSE_TIP[h1]}`;
  hc.querySelector(".p-m").textContent = method;

  // 2. today's Moon × your placements
  const rows = [];
  for (const [k] of NATAL_KEYS) {
    if (sg[k] == null) continue;
    if (NATAL.deg[k] != null) {
      for (const hit of moonHits(info, NATAL.deg[k])) {
        const kind = aspKind(hit.ang);
        rows.push({ t: hit.t, time: fmtT(hit.t), kind, title: `月亮${ASPECTS[hit.ai].name}你的${NATAL_ZH[k]}`, text: NATAL_TIP[k][kind] });
      }
    } else if (PERSONAL_KEYS.includes(k)) {
      info.segs.forEach((s, si) => {
        const dd = signDist(s.sign, sg[k]), kind = SIGN_ASP[dd];
        if (!kind) return;
        const time = info.segs.length === 1 ? "全天" : si === 0 ? `~${fmtT(s.to)}` : `${fmtT(s.from)}~`;
        rows.push({ t: s.from, time, kind, title: `月亮${ASP_WORD[dd]}你的${NATAL_ZH[k]}（${SIGNS[sg[k]].zh}）`, text: NATAL_TIP[k][kind] });
      });
    }
  }
  rows.sort((a, b) => a.t - b.t);
  const exact = Object.keys(NATAL.deg).length > 0;
  const mc = card("p-moon", `<p class="p-k">今天月亮和你的星盤</p><ul class="p-list"></ul><p class="p-m"></p>`);
  mc.querySelector(".p-list").replaceChildren(
    ...(rows.length
      ? rows.map((r) => {
          const li = document.createElement("li");
          li.className = r.kind;
          li.innerHTML = "<time></time><div><b></b><span></span></div>";
          li.querySelector("time").textContent = r.time;
          li.querySelector("b").textContent = r.title;
          li.querySelector("span").textContent = r.text;
          return li;
        })
      : [Object.assign(document.createElement("li"), { className: "none", textContent: "今天月亮和你填的行星沒有形成主要相位，是比較平穩、照自己步調的一天。" })]),
  );
  mc.querySelector(".p-m").textContent = exact ? "用出生資料算出的準確度數，時間是相位最準的時刻。" : "只知道星座時用「整個星座」來比對；填出生資料可以算到準確時間。";

  // 3. slow transits to Sun / Moon / Asc (and Venus / Mars when known)
  const slow = [];
  for (const [pk, pzh, orb, span] of SLOW) {
    const p = pos.find((b) => b.key === pk);
    for (const k of ["Sun", "Moon", "Asc", "Venus", "Mars", "Mercury"]) {
      if (sg[k] == null) continue;
      let kind = null, word = "";
      if (NATAL.deg[k] != null) {
        let d = Math.abs(p.lon - NATAL.deg[k]); if (d > 180) d = 360 - d;
        const hit = ASPECTS.find((a) => Math.abs(d - a.ang) <= orb);
        if (hit) { kind = hit.ang === 0 ? "conj" : hit.ang === 60 || hit.ang === 120 ? "soft" : "hard"; word = hit.name; }
      } else if (["Saturn", "Jupiter"].includes(pk) && ["Sun", "Moon", "Asc"].includes(k)) {
        const dd = signDist(p.signIndex, sg[k]);
        kind = SIGN_ASP[dd] || null; word = ASP_WORD[dd] || "";
      }
      if (kind) slow.push({ pk, text: `${pzh}${p.retro ? "（逆行）" : ""}${word}你的${NATAL_ZH[k]}`, tip: `${span}，你的${NATAL_ROLE[k]}${SLOW_TIP[pk][kind]}`, kind });
    }
  }
  if (slow.length) {
    const sc = card("p-slow", `<p class="p-k">這段時間的大行運</p><ul class="p-list"></ul>`);
    sc.querySelector(".p-list").replaceChildren(
      ...slow.slice(0, 5).map((r) => {
        const li = document.createElement("li");
        li.className = r.kind;
        li.innerHTML = "<time></time><div><b></b><span></span></div>";
        li.querySelector("time").textContent = TXT(PL_G[r.pk] || BODIES.find((b) => b.key === r.pk).g);
        li.querySelector("b").textContent = r.text;
        li.querySelector("span").textContent = r.tip;
        return li;
      }),
    );
  }
  // one hint at most: the luck card already prompts at the sun-only level
  if (level === "signs") frag.push(Object.assign(document.createElement("p"), { className: "p-hint", textContent: "填出生日期會更準：現在只能用星座比對，抓不到準確時間。" }));
  else if (level !== "sun" && sg.Moon == null && sg.Asc == null) {
    const p = Object.assign(document.createElement("p"), { className: "p-hint", textContent: "知道自己的月亮或上升星座嗎？填上去，分析會更貼近你；不知道的話，可以用下方「出生資料」自動算。" });
    frag.push(p);
  }
  box.replaceChildren(...frag);
}

function renderAlert(info) {
  const box = $("vocAlert");
  const now = Date.now();
  const cur = offsetDays === 0 ? info.voc.find((v) => now >= v.from && now < v.to) : null;
  const total = info.voc.reduce((n, v) => n + (v.to - v.from), 0);
  if (cur) box.textContent = `現在月亮空轉中，到 ${fmtT(cur.to)} 結束。例行公事照做，新的開始、簽約、大採購等空轉結束再說。`;
  else if (total >= 12 * H) box.textContent = `這天有約 ${Math.round(total / H)} 小時月亮空轉（${info.voc.map((v) => `${fmtT(v.from)}–${fmtT(v.to)}`).join("、")}）。重要的事盡量排在空轉以外的時段。`;
  else { box.hidden = true; return; }
  box.hidden = false;
}

const WK_ZH = ["日", "一", "二", "三", "四", "五", "六"];
function renderAhead(date) {
  const items = [];
  for (let k = 1; k <= 7; k++) {
    const di = dayInfo(new Date(date.getTime() + k * DAY));
    di.events.filter((e) => e.kind === "ing").forEach((e) => items.push({ t: e.t, text: `月亮進入${SIGNS[e.sign].zh}：${MOON_SIGN[e.sign].short}` }));
    di.events.filter((e) => e.kind === "asp" && e.p === "Sun").forEach((e) => {
      const ph = { 0: 0, 90: 2, 180: 4, 270: 6 }[e.ang];
      if (ph != null) items.push({ t: e.t, text: `${PHASES[ph][0]}：${PHASES[ph][1]}`, hot: e.ang === 0 || e.ang === 180 });
    });
    const tot = di.voc.reduce((n, v) => n + (v.to - v.from), 0);
    if (tot >= 12 * H) items.push({ t: di.voc[0].from, text: `月亮空轉約 ${Math.round(tot / H)} 小時，不適合開新局`, warn: true });
  }
  const end = new Date(date.getTime() + 7 * DAY);
  periodEvents(date, end).filter((e) => e.kind !== "moon" && !e.text.startsWith("月亮")).forEach((e) => items.push({ t: e.t.getTime(), text: e.text, hot: true, day: true }));
  items.sort((a, b) => a.t - b.t);
  $("foldWeek").textContent = `${items.filter((i) => i.hot).length ? items.filter((i) => i.hot).map((i) => i.text.split("：")[0]).slice(0, 2).join("、") : `${items.length} 件事`}`;
  $("ahead").replaceChildren(
    ...items.map((i) => {
      const li = document.createElement("li");
      if (i.hot) li.className = "hot";
      if (i.warn) li.className = "warn";
      const tp = taipeiParts(new Date(i.t));
      li.innerHTML = "<b></b><span></span>";
      li.querySelector("b").textContent = `${tp.m}/${tp.d} 週${WK_ZH[WK_IDX[tp.wk]]}`;
      li.querySelector("span").textContent = i.day ? i.text : `${fmtT(i.t)} ${i.text}`;
      return li;
    }),
  );
}

function renderRhythm(info, prev, pos, prevPos) {
  const pct = (t) => `${(((t - info.start) / (24 * H)) * 100).toFixed(2)}%`;
  const strip = $("dayStrip");
  strip.replaceChildren();
  info.segs.forEach((sg) => {
    const d = document.createElement("div");
    d.className = "seg";
    d.style.left = pct(sg.from);
    d.style.width = `${(((sg.to - sg.from) / (24 * H)) * 100).toFixed(2)}%`;
    d.innerHTML = `<span>${TXT(SIGNS[sg.sign].g)} 月在${SIGNS[sg.sign].zh.replace("座", "")}</span>`;
    strip.appendChild(d);
  });
  info.voc.forEach((v) => {
    const d = document.createElement("div");
    d.className = "voc";
    d.style.left = pct(v.from);
    d.style.width = `${(((v.to - v.from) / (24 * H)) * 100).toFixed(2)}%`;
    d.title = "月亮空轉";
    strip.appendChild(d);
  });
  info.events.forEach((e) => {
    const d = document.createElement("i");
    d.className = e.kind === "ing" ? "tick ing" : `tick ${evKind(e)}`;
    d.style.left = pct(e.t);
    strip.appendChild(d);
  });
  if (offsetDays === 0) {
    const d = document.createElement("b");
    d.className = "nowmark";
    d.style.left = pct(Date.now());
    strip.appendChild(d);
  }
  const rows = [
    ...info.events.map((e) => {
      if (e.kind === "ing") return { t: e.t, cls: "ing", ico: "☽", title: `月亮進入${SIGNS[e.sign].zh}`, text: MOON_SIGN[e.sign].feel };
      const x = evText(e);
      return { t: e.t, cls: evKind(e), ico: ASPECTS[e.ai].g, title: x.title, text: x.mean };
    }),
    ...info.voc.map((v) => ({ t: v.from, cls: "voc", ico: "∅", title: `月亮空轉 ${fmtT(v.from)}–${fmtT(v.to)}`, text: "到換座前不再有主要相位。例行公事、整理、休息都可以；開新案、簽約、大採購先擱到空轉結束。" })),
  ].sort((a, b) => a.t - b.t);
  const first = info.segs[0];
  rows.unshift({ t: info.start, cls: "start", ico: TXT(SIGNS[first.sign].g), title: `一早月亮在${SIGNS[first.sign].zh}`, text: MOON_SIGN[first.sign].feel });
  $("timeline").replaceChildren(
    ...rows.map((r) => {
      const li = document.createElement("li");
      li.className = `tl ${r.cls}${offsetDays === 0 && r.t < Date.now() && r.cls !== "start" ? " past" : ""}`;
      li.innerHTML = "<time></time><i></i><div><b></b><span></span></div>";
      li.querySelector("time").textContent = r.cls === "start" ? "00:00" : fmtT(r.t);
      li.querySelector("i").textContent = r.ico;
      li.querySelector("b").textContent = r.title;
      li.querySelector("span").textContent = r.text;
      return li;
    }),
  );
  const na = info.events.filter((e) => e.kind === "asp").length;
  $("foldRhythm").textContent = [`${na} 個月亮相位`, info.segs.length > 1 ? `${fmtT(info.segs[1].from)} 換座` : "", info.voc.length ? "有空轉" : ""].filter(Boolean).join(" · ");
  $("foldDiff").textContent = `${prev.wk.pl}日 → ${info.wk.pl}日`;
  $("diffTitle").textContent = offsetDays === 0 ? "和昨天哪裡不一樣" : "和前一天哪裡不一樣";
  $("diff").replaceChildren(
    ...diffLines(info, prev, pos, prevPos).map((d) => {
      const li = document.createElement("li");
      li.innerHTML = "<b></b><span></span>";
      li.querySelector("b").textContent = d.k;
      li.querySelector("span").textContent = d.t;
      return li;
    }),
  );
}

function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }

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

const go = (n, dur) => { offsetDays = clampOff(n); render({ dur }); };
$("prev").addEventListener("click", () => go(offsetDays - 1));
$("next").addEventListener("click", () => go(offsetDays + 1));
$("today").addEventListener("click", () => go(0));
$("dayBar").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-go]"); if (!b) return;
  const weekly = fortuneMode === "week" && document.documentElement.dataset.view !== "chart";
  go(b.dataset.go === "0" ? 0 : offsetDays + Number(b.dataset.go) * (weekly ? 7 : 1));
});
// relative steps, so 後一天 / 後一週 can be pressed again and again
// phones: the date controls become a footer of the dialog, so they stay reachable while reading
{
  const box = document.querySelector(".timebox"), home = box.parentElement, mq = matchMedia("(max-width: 860px)");
  const place = () => (mq.matches ? $("chartDialog").append(box) : home.append(box));
  mq.addEventListener("change", place);
  place();
}
if (matchMedia("(hover: none)").matches) $("tbHint").textContent = "按鈕可以連續按，最多前後各看半年。點行星或相位，星盤會標出位置。";
$("tbBtns").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const st = Number(b.dataset.step);
  go(st === 0 ? 0 : offsetDays + st, Math.abs(st) >= 7 ? 1200 : 700);
});
let rafId = 0;
$("tbRange").addEventListener("input", (e) => {
  const v = Number(e.target.value);
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => go(v, 500));
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
buildNatalForm();
render();

// floating dock once the hero has scrolled away
new IntersectionObserver(([e]) => {
  $("dayBar").classList.toggle("show", !e.isIntersecting);
}, { threshold: 0.05 }).observe(document.querySelector(".hero"));

document.getElementById("themeBtn").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* storage unavailable */ }
});


/* ---------- view switch: fortune (general) / chart (astrology fans) ---------- */
function applyView(v) {
  document.documentElement.dataset.view = v;
  $("viewSeg").querySelectorAll("button").forEach((b) => {
    const on = b.dataset.view === v;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", String(on));
  });
}
{
  let saved = null;
  try { saved = localStorage.getItem(VIEW_KEY); } catch { /* storage unavailable */ }
  applyView(saved === "chart" ? "chart" : "fortune");
}
function setView(v) {
  applyView(v);
  try { localStorage.setItem(VIEW_KEY, v); } catch { /* storage unavailable */ }
  observeReveals();
}
$("toFortune").addEventListener("click", () => setView("fortune"));
$("viewSeg").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) setView(b.dataset.view);
});

function buildTodayPick() {
  const bar = $("todayPick");
  SIGNS.forEach((sg, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.sign = String(i);
    b.innerHTML = `<i>${TXT(sg.g)}</i><span>${sg.zh.replace("座", "")}</span>`;
    b.setAttribute("aria-label", sg.zh);
    bar.appendChild(b);
  });
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    fortuneSign = Number(b.dataset.sign);
    try { localStorage.setItem(SIGN_KEY, String(fortuneSign)); } catch { /* storage unavailable */ }
    renderToday();
  });
}
buildTodayPick();
renderToday();


function luckyFor(tp, si) {
  const h = fnv(`${tp.y}-${tp.m}-${tp.d}-${si}`);
  return { color: LUCKY_COLORS[h % 12], num: 1 + ((h >>> 8) % 9), dir: LUCKY_DIRS[(h >>> 16) % 8] };
}

// What the shown day's sky does for one sun sign: where the Moon falls (solar houses) and the
// Moon's strongest exact aspect that day. This is the part that actually changes day to day.
function skyFor(si) {
  const info = currentDay.info;
  const rows = [];
  const hs = info.segs.map((s) => signDist(s.sign, si));
  if (hs.length > 1) {
    const t = fmtT(info.segs[1].from);
    rows.push(["月亮", `${t} 前在你的第 ${hs[0] + 1} 宮（${HOUSES[hs[0]][0]}）`, HOUSE_TIP[hs[0]]]);
    rows.push(["", `${t} 後進第 ${hs[1] + 1} 宮（${HOUSES[hs[1]][0]}）`, HOUSE_TIP[hs[1]]]);
  } else {
    rows.push(["月亮", `在你的第 ${hs[0] + 1} 宮（${HOUSES[hs[0]][0]}）`, HOUSE_TIP[hs[0]]]);
  }
  const key = [bestHard(info), bestSoft(info)].filter(Boolean).sort((a, b) => evScore(b) - evScore(a))[0];
  if (key) {
    const tx = evText(key);
    rows.push(["關鍵", `${timeAt(key)} ${tx.name}`, tx.mean]);
  }
  const v = info.voc[0];
  if (v) rows.push(["空轉", `${fmtT(v.from)}–${fmtT(v.to)} 月亮空轉`, "這段時間做的決定容易沒下文，適合收尾、休息，不適合開新局或簽約。"]);
  rows.push(["當值", `${info.wk.zh} · ${info.wk.pl}日`, info.wk.theme]);
  return rows;
}


// headline for the card and the share image: where the day's focus is, when it moves, and any dead zone
function dayQuote(si, best) {
  const info = currentDay.info;
  const h = moonHouseOf(info, si);
  const other = info.segs.length > 1 ? (info.segs[1].sign === info.dom ? info.segs[0] : info.segs[1]) : null;
  const move = !other ? ""
    : other === info.segs[0] ? `（${plainTime(info.segs[1].from)}以前還在「${AREA[signDist(other.sign, si)]}」）`
    : `（${plainTime(other.from)}以後轉到「${AREA[signDist(other.sign, si)]}」）`;
  const v = info.voc[0];
  const voc = v ? `${vocSpan(info, v)}做的決定容易沒下文，重要的事避開這段。` : "";
  return `${dayNoun()}重點在「${AREA[h]}」${move}，${CATS[best.cat]}最順，適合${HOUSE_CAT[best.cat][h][1]}。${voc}`;
}

function todayData(si) {
  const rows = Object.keys(CATS).map((cat) => ({ cat, ...currentFortune[cat][si] }));
  const avg = Math.round(rows.reduce((n, r) => n + r.stars, 0) / rows.length);
  const best = rows.slice().sort((a, b) => b.stars - a.stars || b.score - a.score)[0];
  return { sg: SIGNS[si], rows, avg, tier: tierOf(avg), line: dayQuote(si, best), lucky: luckyFor(currentDay.tp, si) };
}

// 本週 view of the same card: whole-week averages, best/worst day, and the week's sky events
function weekCard(si) {
  const sg = SIGNS[si];
  const { data, from, to } = currentWeek;
  const rows = Object.keys(CATS).map((cat) => ({ cat, ...data[cat][si] }));
  const avg = Math.round(rows.reduce((n, r) => n + r.stars, 0) / rows.length);
  const tier = tierOf(avg);
  const sameExtra = rows.every((r) => r.extra === rows[0].extra);
  const card = document.createElement("article");
  card.className = "signcard tcard";
  card.innerHTML = `
    <header>
      <span class="sg">${TXT(sg.g)}</span>
      <div><h3>${sg.zh}</h3><p>${sg.la} · ${SIGN_DATES[si]} · ${md(from)}（一）–${md(to)}（日）</p></div>
      <div class="sa"><small>本週綜合</small><span class="fs big"></span><b class="tier t-${tier}">${TIER_ZH[tier]}</b></div>
    </header>
    <p class="tquote wk-extra"></p>
    <ul class="tcats"></ul>
    <div class="tsky wk-sky"><p class="tsky-k">本週天象</p><ul class="events"></ul></div>
    <p class="lucky-note">本週分數取週一到週日每天的平均，星數是 12 個星座之間的相對高低。</p>`;
  const fs = card.querySelector(".sa .fs");
  fs.textContent = stars(avg);
  fs.setAttribute("aria-label", `${avg} 顆星`);
  const wx = card.querySelector(".wk-extra");
  if (sameExtra) wx.textContent = `${rows[0].extra}。`;
  else wx.remove();
  const ul = card.querySelector(".tcats");
  rows.forEach((r, i) => {
    const li = document.createElement("li");
    li.style.setProperty("--i", i);
    li.innerHTML = `<div class="tc-head"><span class="cl"></span><span class="fs"></span></div><p class="ft-main"></p><p class="ft-why"></p>`;
    li.querySelector(".cl").textContent = CATS[r.cat];
    li.querySelector(".fs").textContent = stars(r.stars);
    li.querySelector(".fs").setAttribute("aria-label", `${r.stars} 顆星`);
    li.querySelector(".ft-main").textContent = r.note.replace("今天", "這週");
    li.querySelector(".ft-why").textContent = sameExtra ? `${r.why}。` : `${r.extra}。${r.why}。`;
    ul.appendChild(li);
  });
  const evs = periodEvents(from, to);
  card.querySelector(".events").replaceChildren(
    ...(evs.length ? evs : [{ t: from, icon: "·", text: "本週沒有換座、逆行或新滿月", kind: "" }]).map((e) => {
      const li = document.createElement("li");
      li.className = "ev " + e.kind;
      li.innerHTML = `<i>${e.icon}</i><b>${md(e.t)}</b><span></span>`;
      li.querySelector("span").textContent = e.text;
      return li;
    }),
  );
  return card;
}

$("modeSeg").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  fortuneMode = b.dataset.mode;
  $("modeSeg").querySelectorAll("button").forEach((x) => {
    x.classList.toggle("on", x === b);
    x.setAttribute("aria-pressed", String(x === b));
  });
  render({ dur: 300 }); // also refreshes the day bar (one day vs one week per step)
});

function renderToday() {
  const pick = $("todayPick");
  if (!pick || !currentFortune || !currentDay) return;
  pick.querySelectorAll("button").forEach((b) => {
    const on = b.dataset.sign === String(fortuneSign);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", String(on));
  });
  const box = $("todayCard");
  if (fortuneSign === "all") {
    box.replaceChildren(Object.assign(document.createElement("p"), { className: "tpick-hint", textContent: "↑ 先選你的星座，看今天的大方向。" }));
    return;
  }
  const si = fortuneSign;
  if (fortuneMode === "week") { box.replaceChildren(weekCard(si)); return; }
  const d = todayData(si);
  const tp = currentDay.tp;
  const card = document.createElement("article");
  card.className = "signcard tcard";
  card.innerHTML = `
    <header>
      <span class="sg">${TXT(d.sg.g)}</span>
      <div><h3>${d.sg.zh}</h3><p>${d.sg.la} · ${SIGN_DATES[si]} · ${tp.m}/${tp.d} ${tp.wk}</p></div>
      <div class="sa"><small>${dayWord()}綜合</small><span class="fs big"></span><b class="tier t-${d.tier}">${TIER_ZH[d.tier]}</b></div>
    </header>
    <p class="tquote"></p>
    <ul class="tcats"></ul>
    <div class="lucky">
      <div><small>幸運色</small><span><i class="sw"></i><b class="lc"></b></span></div>
      <div><small>幸運數字</small><b class="ln"></b></div>
      <div><small>幸運方位</small><b class="ld"></b></div>
    </div>
    <p class="lucky-note">幸運元素是依日期與星座固定產生的小彩蛋，純屬娛樂。</p>
    <div class="tadvice"><b>行動建議</b><p></p></div>
    <p class="trust">行星位置：天文曆即時計算（台北時間）· <button type="button" class="linkbtn to-data">看數據</button></p>
    <p class="trust to-personal-line" hidden>這張是依太陽星座的通用版 · <button type="button" class="linkbtn to-personal">看依你星盤算的個人版 →</button></p>
    <details class="why tsky">
      <summary><span class="tsky-k">為什麼這樣說？看星象依據</span><small>月亮、相位、空轉</small></summary>
      <div class="summary tsky-rows"></div>
      <div class="prose why-body"></div>
      <button type="button" class="linkbtn to-chart">切換到星盤模式，看完整天象 →</button>
    </details>
    <div class="tactions"><button type="button" class="cta share-btn">產生分享圖卡 <span aria-hidden="true">✦</span></button></div>`;
  const fs = card.querySelector(".sa .fs");
  fs.textContent = stars(d.avg);
  fs.setAttribute("aria-label", `${d.avg} 顆星`);
  card.querySelector(".tquote").textContent = d.line;
  card.querySelector(".tsky-rows").replaceChildren(
    ...skyFor(si).map(([k, h, t]) => {
      const p = document.createElement("p");
      p.innerHTML = "<b></b><span><strong></strong><em></em></span>";
      p.querySelector("b").textContent = k;
      p.querySelector("strong").textContent = h;
      p.querySelector("em").textContent = t;
      return p;
    }),
  );
  const ul = card.querySelector(".tcats");
  const used = new Set();
  d.rows.forEach((r, i) => {
    const [tdos, tdonts] = DO_DONT[r.cat][tierOf(r.stars)];
    const dn = dailyNote(si, r.cat, used, r.stars);
    const dos = [dn.doit, tdos[0]], donts = [dn.avoid, tdonts[0]];
    const li = document.createElement("li");
    li.style.setProperty("--i", i);
    li.innerHTML = `<div class="tc-head"><span class="cl"></span><span class="fs"></span></div><p class="ft-main"></p><div class="dd"><div class="do"><b>適合</b></div><div class="dont"><b>避免</b></div></div>`;
    li.querySelector(".cl").textContent = CATS[r.cat];
    li.querySelector(".fs").textContent = stars(r.stars);
    li.querySelector(".fs").setAttribute("aria-label", `${r.stars} 顆星`);
    li.querySelector(".ft-main").textContent = dn.text;
    const chip = (t) => Object.assign(document.createElement("span"), { className: "chip", textContent: t });
    li.querySelector(".do").append(...dos.map(chip));
    li.querySelector(".dont").append(...donts.map(chip));
    ul.appendChild(li);
  });
  card.querySelector(".sw").style.background = d.lucky.color[1];
  card.querySelector(".lc").textContent = d.lucky.color[0];
  card.querySelector(".ln").textContent = String(d.lucky.num);
  card.querySelector(".ld").textContent = d.lucky.dir;
  card.querySelector(".tadvice p").textContent = currentDay.advice;
  card.querySelector(".why-body").replaceChildren(
    ...d.rows.map((r) => para(`${CATS[r.cat]}星數：${r.why}。`)),
    Object.assign(para("星數是 12 個星座之間的相對高低，看個大方向就好。"), { className: "muted" }),
  );
  card.querySelector(".to-chart").addEventListener("click", () => {
    setView("chart");
    $("sec-energy").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  card.querySelector(".to-data").addEventListener("click", () => $("openChart").click());
  const personalLine = card.querySelector(".to-personal-line");
  const personalBtn = card.querySelector(".to-personal");
  personalLine.hidden = false;
  if (hasNatal()) {
    personalBtn.addEventListener("click", showPersonal);
  } else {
    // no birth data yet: point to the more accurate, personal version
    personalBtn.textContent = "輸入生日，看依你星盤算的專屬版 →";
    personalBtn.addEventListener("click", openBirth);
  }
  card.querySelector(".share-btn").addEventListener("click", () => openShare(si));
  box.replaceChildren(card);
}

/* ---------- share card (canvas → PNG) ---------- */
function wrapLines(ctx, text, maxW) {
  const lines = [];
  let cur = "";
  for (const ch of text) {
    if (ctx.measureText(cur + ch).width > maxW && cur) {
      // keep closing punctuation on the same line
      if ("，。、；：！？」）".includes(ch)) { cur += ch; continue; }
      lines.push(cur);
      cur = ch;
    } else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}

async function drawShareCard(si) {
  const d = todayData(si);
  const tp = currentDay.tp;
  const W = 1080, H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  const GOLD = "#c8a45d", SOFT = "#e6d3a3", MARBLE = "#efe8d8", MUTED = "#9a9484";
  const SERIF = '"Noto Serif TC", "Cormorant Garamond", serif';
  const LATIN = '"Cinzel", "Cormorant Garamond", serif';
  const GLYPH = getComputedStyle(document.documentElement).getPropertyValue("--glyph") || "serif";
  try {
    await Promise.all([
      document.fonts.load(`600 60px ${LATIN}`, "ASTRA DIES"),
      document.fonts.load(`600 60px ${SERIF}`, d.sg.zh + d.line + "感情事業財運幸運色數字方位"),
      document.fonts.load(`400 30px ${SERIF}`, d.line),
    ]);
  } catch { /* draw with fallbacks */ }

  // background: night sky with a warm glow and a seeded starfield
  ctx.fillStyle = "#07080f";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, 380, 40, W / 2, 380, 760);
  g.addColorStop(0, "rgba(200,164,93,0.22)");
  g.addColorStop(1, "rgba(200,164,93,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  let seed = si * 977 + tp.d * 31 + tp.m;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(230,211,163,${0.15 + rnd() * 0.6})`;
    ctx.beginPath();
    ctx.arc(rnd() * W, rnd() * H, rnd() * 1.6 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(200,164,93,0.22)";
  ctx.lineWidth = 1.5;
  for (const r of [190, 230]) { ctx.beginPath(); ctx.arc(W / 2, 400, r, 0, Math.PI * 2); ctx.stroke(); }
  ctx.strokeStyle = "rgba(200,164,93,0.5)";
  ctx.strokeRect(40, 40, W - 80, H - 80);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const text = (t, x, y, font, color, ls = "0px") => {
    ctx.font = font;
    ctx.fillStyle = color;
    if ("letterSpacing" in ctx) ctx.letterSpacing = ls;
    ctx.fillText(t, x, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  };
  text("ASTRA DIES", W / 2, 140, `600 46px ${LATIN}`, SOFT, "14px");
  text(`${tp.y}.${String(tp.m).padStart(2, "0")}.${String(tp.d).padStart(2, "0")} ${tp.wk} · ${dayWord()}運勢`, W / 2, 192, `400 28px ${SERIF}`, MUTED, "4px");
  {
    // center the glyph by its ink, not its advance width: the U+FE0E selector and fallback
    // fonts add phantom advance that pushed it right of the rings
    ctx.font = `120px ${GLYPH}`;
    ctx.textAlign = "left";
    const m = ctx.measureText(TXT(d.sg.g));
    const gx = W / 2 + (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2;
    const gy = 400 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    ctx.fillStyle = SOFT;
    ctx.fillText(TXT(d.sg.g), gx, gy);
    ctx.textAlign = "center";
  }
  text(d.sg.zh, W / 2, 545, `600 64px ${SERIF}`, MARBLE, "10px");
  text(`${d.sg.la.toUpperCase()} · ${SIGN_DATES[si]}`, W / 2, 595, `400 26px ${LATIN}`, GOLD, "6px");
  text(`${stars(d.avg)}  ${TIER_ZH[d.tier]}`, W / 2, 668, `400 44px ${SERIF}`, GOLD, "4px");

  ctx.font = `500 40px ${SERIF}`;
  const lines = wrapLines(ctx, `${d.line.split("。")[0]}。`, 860); // first sentence only, so the card layout never overflows
  let y = 770;
  for (const ln of lines) { text(ln, W / 2, y, `500 40px ${SERIF}`, MARBLE, "2px"); y += 62; }

  // three categories
  y += 34;
  ctx.strokeStyle = "rgba(200,164,93,0.35)";
  ctx.beginPath(); ctx.moveTo(150, y - 46); ctx.lineTo(W - 150, y - 46); ctx.stroke();
  for (const r of d.rows) {
    ctx.textAlign = "left";
    text(CATS[r.cat], 220, y, `600 36px ${SERIF}`, SOFT, "8px");
    ctx.textAlign = "right";
    text(stars(r.stars), W - 220, y, `400 38px ${SERIF}`, GOLD, "4px");
    y += 70;
  }
  ctx.textAlign = "center";
  ctx.beginPath(); ctx.moveTo(150, y - 34); ctx.lineTo(W - 150, y - 34); ctx.stroke();

  // lucky items
  y += 30;
  const lw = d.lucky;
  text(`幸運色 ${lw.color[0]}　·　幸運數字 ${lw.num}　·　方位 ${lw.dir}`, W / 2, y, `400 30px ${SERIF}`, SOFT, "2px");
  ctx.font = `400 30px ${SERIF}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
  const tw = ctx.measureText(`幸運色 ${lw.color[0]}　·　幸運數字 ${lw.num}　·　方位 ${lw.dir}`).width;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  ctx.fillStyle = lw.color[1];
  ctx.strokeStyle = SOFT;
  ctx.beginPath(); ctx.arc(W / 2 - tw / 2 - 34, y - 10, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  text("weipo0116.github.io/my-portfolio/lab/astro", W / 2, H - 78, `400 22px ${LATIN}`, MUTED, "2px");
  return cv;
}

async function openShare(si) {
  const dlg = $("shareDialog");
  const cv = await drawShareCard(si);
  const url = cv.toDataURL("image/png");
  const tp = currentDay.tp;
  // e.g. 巨蟹座今日運勢_2026-11-04.png — readable in the photo library and Files
  const name = `${SIGNS[si].zh}${dayWord()}運勢_${tp.y}-${String(tp.m).padStart(2, "0")}-${String(tp.d).padStart(2, "0")}.png`;
  $("shareImg").src = url;
  $("shareDl").href = url;
  $("shareDl").setAttribute("download", name);
  const nativeBtn = $("shareNative");
  const dl = $("shareDl");
  const hint = $("shareHint");
  nativeBtn.hidden = true;
  dl.textContent = "下載圖片";
  dl.onclick = null;
  hint.textContent = "手機上也可以長按圖片，選「加入照片」或「儲存影像」。";
  cv.toBlob((blob) => {
    if (!blob || !navigator.canShare) return;
    const file = new File([blob], name, { type: "image/png" });
    if (!navigator.canShare({ files: [file] })) return;
    // phones: an <a download> lands in Files/Downloads, not Photos. The share sheet has
    // "儲存影像 / Save Image", which is the only web route into the photo library.
    if (matchMedia("(pointer: coarse)").matches) {
      dl.textContent = "儲存到相簿";
      dl.onclick = (e) => {
        e.preventDefault();
        navigator.share({ files: [file] }).catch(() => {});
      };
      hint.textContent = "按「儲存到相簿」後，在選單裡選「儲存影像」就會存進照片；也可以直接長按圖片儲存。";
      return;
    }
    nativeBtn.hidden = false;
    nativeBtn.onclick = () => navigator.share({ files: [file], title: "Astra Dies 今日運勢" }).catch(() => {});
  }, "image/png");
  if (!dlg.open) dlg.showModal();
}
$("closeShare").addEventListener("click", () => $("shareDialog").close());
$("shareDialog").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

// In-page links: scroll with JS so tapping the same link twice (hash already set) still works on mobile Safari.
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
  const id = a.getAttribute("href").slice(1);
  const smooth = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  if (id === "top" || id === "") { e.preventDefault(); scrollTo({ top: 0, behavior: smooth }); }
  else { const t = document.getElementById(id); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: smooth, block: "start" }); }
  history.replaceState(null, "", location.pathname + location.search);
});
