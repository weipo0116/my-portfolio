import { Solar } from "lunar-javascript";
import "./outfit.css";

/* ---------- five elements ---------- */
const GAN_EL = { 甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth", 己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water" };
const GEN = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" }; // 生
const CTRL = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" }; // 剋
const genBy = (e) => Object.keys(GEN).find((k) => GEN[k] === e);
const ctrlBy = (e) => Object.keys(CTRL).find((k) => CTRL[k] === e);

const EL = {
  wood: {
    zh: "木", en: "WOOD", fr: "Vert", bg: "#00a35c", ink: "#04140b", accent: "#d6ff3d",
    colors: [{ n: "Émeraude 翡翠綠", hex: "#00a35c" }, { n: "Chartreuse 螢光黃綠", hex: "#c8f400" }, { n: "Forêt 森林綠", hex: "#0d4a2f" }],
    mood: "生長、伸展、向外開展。今天適合嘗試新東西，造型可以有線條與層次。",
  },
  fire: {
    zh: "火", en: "FIRE", fr: "Rouge", bg: "#e4002b", ink: "#fff3ea", accent: "#ffd400",
    colors: [{ n: "Rosso 正紅", hex: "#e4002b" }, { n: "Fuchsia 桃紅", hex: "#ff1f8e" }, { n: "Arancia 橘", hex: "#ff5a00" }],
    mood: "熱度、表達、被看見。今天適合站到前面，一件高彩度單品就能撐起整個造型。",
  },
  earth: {
    zh: "土", en: "EARTH", fr: "Ocre", bg: "#e7a100", ink: "#1b1100", accent: "#7a1f00",
    colors: [{ n: "Senape 芥末黃", hex: "#e7a100" }, { n: "Terracotta 陶土", hex: "#c24a1a" }, { n: "Cammello 駝", hex: "#b98a55" }],
    mood: "穩定、承載、務實。今天適合把重要的事做紮實，質感與剪裁比花樣更重要。",
  },
  metal: {
    zh: "金", en: "METAL", fr: "Argent", bg: "#ece8df", ink: "#0a0a0a", accent: "#c9a227",
    colors: [{ n: "Bianco 純白", hex: "#f6f3ec" }, { n: "Argento 銀", hex: "#b9c0c9" }, { n: "Oro 金", hex: "#c9a227" }],
    mood: "俐落、精準、有秩序。今天適合乾淨線條與金屬細節，少即是多。",
  },
  water: {
    zh: "水", en: "WATER", fr: "Cobalt", bg: "#1020d8", ink: "#eef0ff", accent: "#7df9ff",
    colors: [{ n: "Cobalto 鈷藍", hex: "#1020d8" }, { n: "Nero 墨黑", hex: "#0a0a0a" }, { n: "Notte 夜藍", hex: "#0b1a4f" }],
    mood: "流動、深度、彈性。今天適合順著情境調整，深色與亮藍的對比最有張力。",
  },
};
const NEUTRAL = { n: "Crème 米白", hex: "#efe9dc" };

/* ---------- outfit tables ---------- */
const OCCASIONS = [
  { id: "work", zh: "上班通勤", en: "TRAVAIL" },
  { id: "date", zh: "約會", en: "RENDEZ-VOUS" },
  { id: "sport", zh: "運動", en: "SPORT" },
  { id: "formal", zh: "正式場合", en: "GALA" },
  { id: "casual", zh: "週末休閒", en: "WEEK-END" },
];

// temperature band by apparent temperature
const band = (t) => (t >= 30 ? 0 : t >= 25 ? 1 : t >= 20 ? 2 : t >= 15 ? 3 : 4);
const BAND_NAME = ["炎熱", "溫暖", "舒適", "偏涼", "寒冷"];

const TOPS = {
  work: ["棉麻無袖襯衫", "短袖挺版襯衫", "長袖府綢襯衫", "細針織衫", "高領羊毛衫"],
  date: ["絲質吊帶背心", "短袖針織 polo", "緞面長袖襯衫", "合身針織衫", "細羊毛高領"],
  sport: ["排汗背心", "透氣短袖 T", "輕量長袖排汗衣", "刷毛運動上衣", "發熱長袖＋刷毛"],
  formal: ["無袖絲質襯衫", "短袖西裝式上衣", "白襯衫", "針織背心＋襯衫", "高領針織＋襯衫"],
  casual: ["背心 T", "寬版短袖 T", "長袖 T", "連帽上衣", "厚磅衛衣"],
};
const BOTTOMS = {
  work: ["寬褲（輕薄）", "高腰西裝褲", "直筒西裝褲", "羊毛西裝褲", "厚羊毛直筒褲"],
  date: ["迷你短裙", "半身長裙", "高腰直筒褲", "皮革長裙", "針織長裙"],
  sport: ["運動短褲", "運動短褲", "七分運動褲", "運動長褲", "發熱運動長褲"],
  formal: ["高腰寬褲", "高腰寬褲", "西裝褲", "西裝褲", "羊毛西裝褲"],
  casual: ["牛仔短褲", "寬版短褲", "寬版牛仔褲", "工裝褲", "燈芯絨長褲"],
};
const OUTER = [null, null, "輕薄襯衫外套", "西裝外套", "羊毛大衣"];
const SHOES = { work: "樂福鞋", date: "細帶高跟／尖頭平底", sport: "跑鞋", formal: "牛津鞋／高跟鞋", casual: "德訓鞋" };
const SHOES_RAIN = { work: "防水皮鞋", date: "防水短靴", sport: "防水跑鞋", formal: "防水短靴", casual: "防水球鞋" };

/* looks: each piece tagged with a colour slot */
function buildLooks(occ, feel, rainy, uv, c) {
  const b = band(feel);
  const top = TOPS[occ][b], bot = BOTTOMS[occ][b], outer = OUTER[b];
  const shoe = rainy ? SHOES_RAIN[occ] : SHOES[occ];
  const extra = [];
  if (rainy) extra.push({ part: "雨具", item: "折疊傘／防潑水外層", slot: "accent" });
  if (uv >= 8) extra.push({ part: "防曬", item: "寬簷帽或墨鏡", slot: "neutral" });

  const mk = (id, name, note, slots) => ({
    id, name, note,
    pieces: [
      { part: "上身", item: top, slot: slots.top },
      { part: "下身", item: bot, slot: slots.bot },
      ...(outer ? [{ part: "外層", item: outer, slot: slots.outer }] : []),
      { part: "鞋", item: shoe, slot: slots.shoe },
      ...extra,
    ],
  });
  return [
    mk("01", "MONOCHROME 同色系", "整身以今日主色為核心，用明暗做層次，最有時裝週的氣勢。", { top: "main", bot: "main", outer: "main", shoe: "dark" }),
    mk("02", "CONTRASTE 撞色", "主色與輔色大膽對撞，一件主角單品配一件反差。", { top: "support", bot: "main", outer: "support", shoe: "neutral" }),
    mk("03", "SILENCE 沉靜", "中性底色，只用主色做一個重點（外套、包或鞋）。", { top: "neutral", bot: "dark", outer: "main", shoe: "main" }),
  ].map((l) => ({ ...l, colors: c }));
}

/* ---------- state ---------- */
const TAIPEI = { lat: 25.033, lon: 121.5654 };
let state = { occ: "work", el: null, weather: null };

function taipeiToday() {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date());
  const o = Object.fromEntries(f.map((p) => [p.type, p.value]));
  return { y: +o.year, m: +o.month, d: +o.day, wk: o.weekday };
}

function dayElement() {
  const t = taipeiToday();
  const lunar = Solar.fromYmd(t.y, t.m, t.d).getLunar();
  const gan = lunar.getDayGan();
  return { t, gz: lunar.getDayInGanZhi(), gan, el: GAN_EL[gan] };
}

/* ---------- weather ---------- */
const WCODE = (c) => (c === 0 ? "晴" : c <= 3 ? "多雲" : c <= 48 ? "霧" : c <= 57 ? "毛毛雨" : c <= 67 ? "雨" : c <= 77 ? "雪" : c <= 82 ? "陣雨" : c <= 99 ? "雷雨" : "—");

async function getWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${TAIPEI.lat}&longitude=${TAIPEI.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=Asia%2FTaipei&forecast_days=1`;
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 7000);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(to);
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    return {
      ok: true,
      temp: j.current.temperature_2m,
      feel: j.current.apparent_temperature,
      hum: j.current.relative_humidity_2m,
      code: j.current.weather_code,
      max: j.daily.temperature_2m_max[0],
      min: j.daily.temperature_2m_min[0],
      rain: j.daily.precipitation_probability_max[0] ?? 0,
      uv: j.daily.uv_index_max[0] ?? 0,
    };
  } catch {
    // seasonal fallback so the page still works offline
    const m = taipeiToday().m;
    const base = [16, 17, 19, 23, 26, 29, 31, 31, 29, 26, 22, 18][m - 1];
    return { ok: false, temp: base, feel: base, hum: 75, code: 3, max: base + 3, min: base - 4, rain: 40, uv: 6 };
  }
}

/* ---------- render ---------- */
const $ = (id) => document.getElementById(id);
const h = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

function splitChars(node, text) {
  node.textContent = "";
  [...text].forEach((ch, i) => {
    const s = h("span", "ch");
    s.style.setProperty("--i", i);
    s.textContent = ch;
    node.appendChild(s);
  });
}

function paletteFor(elKey) {
  const main = EL[elKey];
  const sup = EL[genBy(elKey)];
  const dark = { n: "Nero 墨黑", hex: "#0a0a0a" };
  return { main: main.colors[0], mainAlt: main.colors[1], deep: main.colors[2], support: sup.colors[0], neutral: NEUTRAL, dark, accent: { n: main.accent, hex: main.accent } };
}

function renderHero() {
  const { t, gz, el } = state.day;
  const E = EL[el];
  document.documentElement.style.setProperty("--bg", E.bg);
  document.documentElement.style.setProperty("--ink", E.ink);
  document.documentElement.style.setProperty("--accent", E.accent);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", E.bg);
  $("dateLine").textContent = `${t.y}.${String(t.m).padStart(2, "0")}.${String(t.d).padStart(2, "0")} ${t.wk.toUpperCase()} · ${gz}日`;
  $("elZh").textContent = E.zh;
  splitChars($("elEn"), E.en);
  $("sub").textContent = E.mood;

  const pal = state.pal;
  const chips = $("chips");
  chips.replaceChildren(
    ...[
      ["主色 PRINCIPAL", pal.main],
      ["輔色 SOUTIEN", pal.support],
      ["中性 NEUTRE", pal.neutral],
    ].map(([label, c], i) => {
      const d = h("div", "chip", `<i style="background:${c.hex}"></i><span>${label}</span><b>${c.n}</b>`);
      d.style.setProperty("--i", i);
      return d;
    }),
  );

  const word = `${E.fr.toUpperCase()} · ${E.en} · ${E.zh} · `;
  $("marquee").replaceChildren(...Array.from({ length: 2 }, () => h("span", null, word.repeat(10))));

  // wipe
  const w = $("wipe");
  w.style.background = E.ink;
  w.classList.remove("go");
  void w.offsetWidth;
  w.classList.add("go");
}

function renderWeather() {
  const w = state.weather;
  const g = $("wgrid");
  const cells = [
    ["體感", `${Math.round(w.feel)}°`, `${BAND_NAME[band(w.feel)]} · 現在 ${Math.round(w.temp)}°`],
    ["今日高低", `${Math.round(w.min)}–${Math.round(w.max)}°`, WCODE(w.code)],
    ["降雨機率", `${Math.round(w.rain)}%`, w.rain >= 50 ? "帶傘、換防水鞋" : "出門可不帶傘"],
    ["紫外線", String(Math.round(w.uv)), w.uv >= 8 ? "高：帽子與墨鏡" : "一般"],
  ];
  g.replaceChildren(
    ...cells.map(([k, v, s], i) => {
      const d = h("div", "wcell", `<small>${k}</small><strong>${v}</strong><span>${s}</span>`);
      d.style.setProperty("--i", i);
      return d;
    }),
  );
  if (!w.ok) g.appendChild(h("p", "wnote", "即時天氣暫時讀不到，以下以季節平均值估算。"));
}

function renderTabs() {
  const tabs = $("tabs");
  tabs.replaceChildren(
    ...OCCASIONS.map((o) => {
      const b = h("button", "tab" + (o.id === state.occ ? " on" : ""), `<b>${o.zh}</b><small>${o.en}</small>`);
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", o.id === state.occ);
      b.addEventListener("click", () => { state.occ = o.id; renderTabs(); renderLooks(true); });
      return b;
    }),
  );
}

function slotColor(slot, pal) {
  return slot === "main" ? pal.main : slot === "support" ? pal.support : slot === "neutral" ? pal.neutral : slot === "dark" ? pal.dark : pal.accent;
}

function renderLooks(animate) {
  const w = state.weather;
  const looks = buildLooks(state.occ, w.feel, w.rain >= 50, w.uv, state.pal);
  const grid = $("lookGrid");
  grid.replaceChildren(
    ...looks.map((l, i) => {
      const card = h("article", "look");
      card.style.setProperty("--i", i);
      if (animate) card.classList.add("swap");
      const bars = l.pieces.map((p) => `<i style="background:${slotColor(p.slot, state.pal).hex}"></i>`).join("");
      const rows = l.pieces
        .map((p) => {
          const c = slotColor(p.slot, state.pal);
          return `<li><span class="dot" style="background:${c.hex}"></span><em>${p.part}</em><b>${p.item}</b><small>${p.slot === "accent" ? "點綴" : c.n}</small></li>`;
        })
        .join("");
      card.innerHTML = `<div class="look-no">${l.id}</div><div class="swatches">${bars}</div><h3>${l.name}</h3><p>${l.note}</p><ul>${rows}</ul>`;
      return card;
    }),
  );
}

function renderRules() {
  const el = state.day.el;
  const main = EL[el], sup = EL[genBy(el)], bad = EL[ctrlBy(el)];
  const rows = [
    ["主色", `${main.zh}（${main.en}）`, "今天的日柱天干五行，直接穿在最顯眼的單品。", main.bg],
    ["輔色", `${sup.zh}（${sup.en}）`, `${sup.zh}生${main.zh}，用來托住主色、做配角。`, sup.bg],
    ["避開", `${bad.zh}（${bad.en}）`, `${bad.zh}剋${main.zh}，大面積使用會壓過主色；小配件可以。`, bad.bg],
  ];
  $("rules").replaceChildren(
    ...rows.map(([k, v, t, c], i) => {
      const d = h("div", "rule", `<i style="background:${c}"></i><small>${k}</small><strong>${v}</strong><p>${t}</p>`);
      d.style.setProperty("--i", i);
      return d;
    }),
  );
}

let io;
function observe() {
  io?.disconnect();
  io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".reveal, .look-grid, .rule-grid").forEach((n) => io.observe(n));
}

async function init() {
  state.day = dayElement();
  state.pal = paletteFor(state.day.el);
  renderHero();
  renderRules();
  state.weather = await getWeather();
  renderWeather();
  renderTabs();
  renderLooks(false);
  observe();
}

init();
