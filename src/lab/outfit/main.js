import { Solar } from "lunar-javascript";
import "./outfit.css";

/* ---------- five elements ---------- */
const GAN_EL = { 甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth", 己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water" };
const CTRL = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" }; // 剋
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
const ACCESSORY = { work: "包款或絲巾", date: "耳環／小包", sport: "髮帶或襪子", formal: "胸針／手拿包", casual: "帽子或托特包" };
const SHOES = { work: "樂福鞋", date: "細帶高跟／尖頭平底", sport: "跑鞋", formal: "牛津鞋／高跟鞋", casual: "德訓鞋" };
const SHOES_RAIN = { work: "防水皮鞋", date: "防水短靴", sport: "防水跑鞋", formal: "防水短靴", casual: "防水球鞋" };

/* looks: each piece tagged with a colour slot (g1 吉, g2 次吉, g3 平) */
const TIER = { g1: "吉", g2: "次吉", g3: "平" };
const WEIGHT = { g1: 3, g2: 2, g3: 1 };
function buildLooks(occ, feel, rainy, uv, c) {
  const b = band(feel);
  const top = TOPS[occ][b], bot = BOTTOMS[occ][b], outer = OUTER[b];
  const shoe = rainy ? SHOES_RAIN[occ] : SHOES[occ];
  const extra = [];
  if (rainy) extra.push({ part: "雨具", item: "折疊傘／防潑水外層", slot: "accent" });
  if (uv >= 8) extra.push({ part: "防曬", item: "寬簷帽或墨鏡", slot: "neutral" });

  const mk = (id, name, note, slots) => {
    const core = [
      { part: "上身", item: top, slot: slots.top },
      { part: "下身", item: bot, slot: slots.bot },
      ...(outer ? [{ part: "外層", item: outer, slot: slots.outer }] : []),
    ];
    const pieces = [...core, { part: "鞋", item: shoe, slot: slots.shoe }, { part: "配件", item: ACCESSORY[occ], slot: slots.acc }, ...extra];
    // energy score: weighted share of 吉 / 次吉 / 平 across the visible pieces
    const scored = [...core, pieces[core.length], pieces[core.length + 1]];
    const pts = scored.reduce((n, p) => n + (WEIGHT[p.slot] ?? 0), 0);
    const score = Math.round((pts / (scored.length * 3)) * 10);
    return { id, name, note, pieces, score };
  };
  return [
    mk("01", "ÉNERGIE MAX 吉色滿格", "今日最旺的吉色佔大面積，次吉色做點綴，能量最集中。", { top: "g1", bot: "g1", outer: "g1", shoe: "dark", acc: "g2" }),
    mk("02", "DUO 吉＋次吉", "吉色與次吉色對撞，一件主角單品配一件反差，時裝感最強。", { top: "g1", bot: "g2", outer: "g1", shoe: "neutral", acc: "g1" }),
    mk("03", "TRIO 三色運勢", "用平色打底、吉色壓軸、次吉色收尾，層次豐富但不搶戲。", { top: "g3", bot: "dark", outer: "g1", shoe: "g2", acc: "g1" }),
  ].map((l) => ({ ...l, colors: c }));
}

/* ---------- state ---------- */
const CITIES = {
  taipei: { zh: "台北", en: "TAIPEI", lat: 25.033, lon: 121.5654, tz: "Asia/Taipei" },
  tokyo: { zh: "東京", en: "TOKYO", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  seoul: { zh: "首爾", en: "SEOUL", lat: 37.5665, lon: 126.978, tz: "Asia/Seoul" },
};
const readCity = () => {
  try { const c = localStorage.getItem("cinq-city"); if (c && CITIES[c]) return c; } catch { /* storage unavailable */ }
  return "taipei";
};
let state = { occ: "work", city: readCity(), day: null, pal: null, weather: null };

function todayIn(tz) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date());
  const o = Object.fromEntries(f.map((p) => [p.type, p.value]));
  return { y: +o.year, m: +o.month, d: +o.day, wk: o.weekday };
}

function dayElement(tz) {
  const t = todayIn(tz);
  const lunar = Solar.fromYmd(t.y, t.m, t.d).getLunar();
  const gan = lunar.getDayGan();
  return { t, gz: lunar.getDayInGanZhi(), gan, el: GAN_EL[gan] };
}

/* ---------- weather ---------- */
const WCODE = (c) => (c === 0 ? "晴" : c <= 3 ? "多雲" : c <= 48 ? "霧" : c <= 57 ? "毛毛雨" : c <= 67 ? "雨" : c <= 77 ? "雪" : c <= 82 ? "陣雨" : c <= 99 ? "雷雨" : "—");

async function getWeather(city) {
  const c = CITIES[city];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=${encodeURIComponent(c.tz)}&forecast_days=2`;
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 7000);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(to);
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    // first hourly slot at or after the current local hour
    const nowHour = j.current.time.slice(0, 13);
    let start = j.hourly.time.findIndex((t) => t.slice(0, 13) >= nowHour);
    if (start < 0) start = 0;
    const hours = [];
    for (let k = start; k < Math.min(start + 13, j.hourly.time.length); k++) {
      hours.push({
        label: j.hourly.time[k].slice(11, 16),
        temp: j.hourly.temperature_2m[k],
        feel: j.hourly.apparent_temperature[k],
        rain: j.hourly.precipitation_probability[k] ?? 0,
        code: j.hourly.weather_code[k],
      });
    }
    return {
      ok: true,
      temp: j.current.temperature_2m,
      feel: j.current.apparent_temperature,
      hum: j.current.relative_humidity_2m,
      code: j.current.weather_code,
      max: j.daily.temperature_2m_max[0],
      min: j.daily.temperature_2m_min[0],
      rain: Math.max(...hours.map((x) => x.rain), 0),
      uv: j.daily.uv_index_max[0] ?? 0,
      hours,
    };
  } catch {
    // seasonal fallback so the page still works offline (rough estimates, flagged in the UI)
    const m = todayIn(c.tz).m;
    const base = ({ taipei: [16, 17, 19, 23, 26, 29, 31, 31, 29, 26, 22, 18], tokyo: [6, 7, 11, 16, 21, 24, 28, 30, 26, 20, 14, 9], seoul: [-1, 2, 8, 15, 20, 24, 27, 28, 23, 16, 8, 1] })[city][m - 1];
    const hour0 = Number(new Intl.DateTimeFormat("en-GB", { timeZone: c.tz, hour: "2-digit", hour12: false }).format(new Date()));
    const hours = Array.from({ length: 13 }, (_, k) => {
      const hh = (hour0 + k) % 24;
      const t = base + 3 * Math.sin(((hh - 9) / 24) * Math.PI * 2);
      return { label: `${String(hh).padStart(2, "0")}:00`, temp: t, feel: t, rain: 30, code: 3 };
    });
    return { ok: false, temp: hours[0].temp, feel: hours[0].feel, hum: 70, code: 3, max: base + 3, min: base - 4, rain: 30, uv: 6, hours };
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

// Colour fortune for the day, by relation to the day's element:
//   剋我 → 吉 (best), 我剋 → 次吉, 同我 → 平. 生我 / 我生 are not ranked (kept neutral).
function paletteFor(elKey) {
  const tier = (k) => ({ key: k, el: EL[k], ...EL[k].colors[0] });
  const dark = { n: "Nero 墨黑", hex: "#0a0a0a" };
  return {
    g1: tier(ctrlBy(elKey)),
    g2: tier(CTRL[elKey]),
    g3: tier(elKey),
    neutral: NEUTRAL,
    dark,
    accent: { n: EL[elKey].accent, hex: EL[elKey].accent },
  };
}

function renderHero() {
  const { t, gz, el } = state.day;
  const E = EL[el];
  const city = CITIES[state.city];
  document.documentElement.style.setProperty("--bg", E.bg);
  document.documentElement.style.setProperty("--ink", E.ink);
  document.documentElement.style.setProperty("--accent", E.accent);
  document.querySelector('meta[name="theme-color"]').setAttribute("content", E.bg);
  $("dateLine").textContent = `${t.y}.${String(t.m).padStart(2, "0")}.${String(t.d).padStart(2, "0")} ${t.wk.toUpperCase()} · ${gz}日 · ${city.en}`;
  $("elZh").textContent = E.zh;
  splitChars($("elEn"), E.en);
  $("sub").textContent = E.mood;

  const pal = state.pal;
  const chips = $("chips");
  chips.replaceChildren(
    ...[
      ["吉 FAVORABLE", pal.g1],
      ["次吉 BIEN", pal.g2],
      ["平 NEUTRE", pal.g3],
      ["中性底色 BASE", pal.neutral],
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

function tempBand(t) { return BAND_NAME[band(t)]; }

function renderCityTabs() {
  const box = $("cityTabs");
  box.replaceChildren(
    ...Object.entries(CITIES).map(([id, c]) => {
      const b = h("button", "tab city" + (id === state.city ? " on" : ""), `<b>${c.zh}</b><small>${c.en}</small>`);
      b.type = "button";
      b.setAttribute("aria-pressed", id === state.city);
      b.addEventListener("click", () => { if (id !== state.city) switchCity(id); });
      return b;
    }),
  );
  $("wCity").textContent = `${CITIES[state.city].zh} · 現在與未來 12 小時`;
}

function renderWeather() {
  const w = state.weather;
  const g = $("wgrid");
  const cells = [
    ["現在體感", `${Math.round(w.feel)}°`, `${tempBand(w.feel)} · 氣溫 ${Math.round(w.temp)}°`],
    ["今日高低", `${Math.round(w.min)}–${Math.round(w.max)}°`, WCODE(w.code)],
    ["未來 12 小時降雨", `${Math.round(w.rain)}%`, w.rain >= 50 ? "帶傘、換防水鞋" : "出門可不帶傘"],
    ["紫外線", String(Math.round(w.uv)), w.uv >= 8 ? "高：帽子與墨鏡" : "一般"],
  ];
  g.replaceChildren(
    ...cells.map(([k, v, s], i) => {
      const d = h("div", "wcell", `<small>${k}</small><strong>${v}</strong><span>${s}</span>`);
      d.style.setProperty("--i", i);
      return d;
    }),
  );
  if (!w.ok) g.appendChild(h("p", "wnote", "即時天氣暫時讀不到，以下為季節平均的估算值。"));

  // hourly strip: temperature line + rain bars
  const hrs = w.hours;
  const temps = hrs.map((x) => x.temp);
  const lo = Math.min(...temps), hi = Math.max(...temps);
  const span = Math.max(hi - lo, 4);
  const strip = $("hourly");
  strip.replaceChildren(
    ...hrs.map((x, i) => {
      const y = 1 - (x.temp - lo) / span; // 0 top .. 1 bottom
      const d = h(
        "div", "hour" + (i === 0 ? " now" : ""),
        `<small>${i === 0 ? "NOW" : x.label}</small>` +
          `<span class="dotwrap"><i class="dot" style="--y:${y.toFixed(3)}"></i></span>` +
          `<strong>${Math.round(x.temp)}°</strong>` +
          `<span class="rainbar"><i style="--p:${Math.round(x.rain)}%"></i></span>` +
          `<em>${Math.round(x.rain)}%</em>`,
      );
      d.style.setProperty("--i", i);
      return d;
    }),
  );
}

async function switchCity(id) {
  state.city = id;
  try { localStorage.setItem("cinq-city", id); } catch { /* storage unavailable */ }
  renderCityTabs();
  $("hourly").classList.add("loading");
  const prevEl = state.day?.el;
  state.day = dayElement(CITIES[id].tz);
  state.pal = paletteFor(state.day.el);
  state.weather = await getWeather(id);
  if (state.city !== id) return; // user switched again while loading
  $("hourly").classList.remove("loading");
  if (state.day.el !== prevEl) renderHero();
  else $("dateLine").textContent = $("dateLine").textContent.replace(/·\s[A-Z]+$/, `· ${CITIES[id].en}`);
  renderRules();
  renderWeather();
  renderLooks(true);
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
  return slot === "g1" ? pal.g1 : slot === "g2" ? pal.g2 : slot === "g3" ? pal.g3 : slot === "neutral" ? pal.neutral : slot === "dark" ? pal.dark : pal.accent;
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
          return `<li><span class="dot" style="background:${c.hex}"></span><em>${p.part}</em><b>${p.item}</b><small>${TIER[p.slot] ? `${TIER[p.slot]} · ${c.n}` : p.slot === "accent" ? "點綴" : c.n}</small></li>`;
        })
        .join("");
      card.innerHTML = `<div class="look-no">${l.id}</div><div class="score" title="依吉／次吉／平色的佔比估算"><b>${l.score}</b>/10<small>ÉNERGIE</small></div><div class="swatches">${bars}</div><h3>${l.name}</h3><p>${l.note}</p><ul>${rows}</ul>`;
      return card;
    }),
  );
}

function renderRules() {
  const el = state.day.el;
  const rows = [
    ["吉", "FAVORABLE", ctrlBy(el), `${EL[ctrlBy(el)].zh}剋${EL[el].zh}（剋我者）。今天最有助力的顏色，優先放在上身、外套等大面積。`],
    ["次吉", "BIEN", CTRL[el], `${EL[el].zh}剋${EL[CTRL[el]].zh}（我剋者）。第二順位，適合下身、鞋或配件，補上第二層能量。`],
    ["平", "NEUTRE", el, `與今天同為${EL[el].zh}（同我者）。不加分也不扣分，當作底色或點綴就好。`],
  ];
  $("rules").replaceChildren(
    ...rows.map(([k, en, e, t], i) => {
      const E = EL[e];
      const d = h("div", "rule", `<i style="background:${E.colors[0].hex}"></i><small>${k} · ${en}</small><strong>${E.zh}（${E.en}）· ${E.colors[0].n}</strong><p>${t}</p>`);
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
  const tz = CITIES[state.city].tz;
  state.day = dayElement(tz);
  state.pal = paletteFor(state.day.el);
  renderHero();
  renderRules();
  renderCityTabs();
  state.weather = await getWeather(state.city);
  renderWeather();
  renderTabs();
  renderLooks(false);
  observe();
}

init();
