import { Solar } from "lunar-javascript";
import "./outfit.css";

/* ---------- five elements ---------- */
const GAN_EL = { 甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth", 己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water" };
const CTRL = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" }; // 剋
const ctrlBy = (e) => Object.keys(CTRL).find((k) => CTRL[k] === e);

const EL = {
  wood: {
    zh: "木", en: "WOOD", fr: "Green", bg: "#00a35c", ink: "#04140b", accent: "#d6ff3d",
    colors: [{ n: "Emerald 翡翠綠", hex: "#00a35c" }, { n: "Chartreuse 螢光黃綠", hex: "#c8f400" }, { n: "Forest 森林綠", hex: "#0d4a2f" }],
    mood: "生長、伸展、向外開展。今天適合嘗試新東西，造型可以有線條與層次。",
  },
  fire: {
    zh: "火", en: "FIRE", fr: "Red", bg: "#e4002b", ink: "#fff3ea", accent: "#ffd400",
    colors: [{ n: "Scarlet 正紅", hex: "#e4002b" }, { n: "Fuchsia 桃紅", hex: "#ff1f8e" }, { n: "Orange 亮橘", hex: "#ff5a00" }],
    mood: "熱度、表達、被看見。今天適合站到前面，一件高彩度單品就能撐起整個造型。",
  },
  earth: {
    zh: "土", en: "EARTH", fr: "Ochre", bg: "#e7a100", ink: "#1b1100", accent: "#7a1f00",
    colors: [{ n: "Mustard 芥末黃", hex: "#e7a100" }, { n: "Terracotta 陶土", hex: "#c24a1a" }, { n: "Camel 駝色", hex: "#b98a55" }],
    mood: "穩定、承載、務實。今天適合把重要的事做紮實，質感與剪裁比花樣更重要。",
  },
  metal: {
    zh: "金", en: "METAL", fr: "Silver", bg: "#ece8df", ink: "#0a0a0a", accent: "#c9a227",
    colors: [{ n: "White 純白", hex: "#f6f3ec" }, { n: "Silver 銀", hex: "#b9c0c9" }, { n: "Gold 金", hex: "#c9a227" }],
    mood: "俐落、精準、有秩序。今天適合乾淨線條與金屬細節，少即是多。",
  },
  water: {
    zh: "水", en: "WATER", fr: "Cobalt", bg: "#1020d8", ink: "#eef0ff", accent: "#7df9ff",
    colors: [{ n: "Cobalt 鈷藍", hex: "#1020d8" }, { n: "Black 墨黑", hex: "#0a0a0a" }, { n: "Midnight 夜藍", hex: "#0b1a4f" }],
    mood: "流動、深度、彈性。今天適合順著情境調整，深色與亮藍的對比最有張力。",
  },
};
const NEUTRAL = { n: "Cream 米白", hex: "#efe9dc" };

/* ---------- outfit tables ---------- */
const OCCASIONS = [
  { id: "work", zh: "上班通勤", en: "WORK", verb: "上班" },
  { id: "date", zh: "約會", en: "DATE", verb: "約會" },
  { id: "sport", zh: "運動", en: "SPORT", verb: "運動" },
  { id: "formal", zh: "正式場合", en: "FORMAL", verb: "正式場合" },
  { id: "casual", zh: "週末休閒", en: "WEEKEND", verb: "週末休閒" },
];

// Garment bands by feels-like temperature: ≥30 / 26–29 / 20–25 / 14–19 / <14 (°C).
// Each band lists three variants, one per look, so the pieces differ between looks.
const band = (t) => (t >= 30 ? 0 : t >= 26 ? 1 : t >= 20 ? 2 : t >= 14 ? 3 : 4);
const BAND_NAME = ["炎熱", "溫暖", "舒適", "偏涼", "寒冷"];
const BAND_WHY = ["選無袖或短袖，不加外層", "短袖為主，備一件薄外套應付冷氣", "長袖或一層輕薄外套就夠", "針織加一件外套", "保暖內層加大衣"];
const RAIN_AT = 40; // rain probability (%) from which umbrella and water-resistant shoes are suggested

const TOPS = {
  work: [["棉麻無袖襯衫", "透氣短袖襯衫", "涼感 polo 衫"], ["短袖挺版襯衫", "短袖針織 polo", "七分袖襯衫"], ["長袖府綢襯衫", "薄針織衫", "亞麻長袖襯衫"], ["細針織衫", "羊毛混紡襯衫", "針織背心＋襯衫"], ["高領羊毛衫", "厚針織衫", "發熱衣＋襯衫"]],
  date: [["絲質吊帶背心", "無袖針織上衣", "短袖綁帶上衣"], ["短袖針織 polo", "緞面短袖襯衫", "方領短袖上衣"], ["緞面長袖襯衫", "薄針織開襟衫", "露肩長袖上衣"], ["合身針織衫", "絲質長袖襯衫", "針織背心＋襯衫"], ["細羊毛高領", "厚針織衫", "發熱衣＋羊毛衫"]],
  sport: [["排汗背心", "透氣短袖 T", "運動內衣＋背心"], ["透氣短袖 T", "速乾短袖 T", "排汗背心"], ["輕量長袖排汗衣", "透氣短袖 T", "速乾長袖 T"], ["刷毛運動上衣", "長袖排汗衣", "輕量連帽上衣"], ["發熱長袖＋刷毛", "發熱長袖", "厚刷毛連帽上衣"]],
  formal: [["無袖絲質襯衫", "短袖西裝式上衣", "薄棉短袖襯衫"], ["短袖西裝式上衣", "白色短袖襯衫", "絲質短袖襯衫"], ["白襯衫", "絲質長袖襯衫", "針織背心＋襯衫"], ["針織背心＋襯衫", "羊毛襯衫", "細針織衫"], ["高領針織＋襯衫", "羊毛襯衫＋背心", "厚針織衫"]],
  casual: [["背心 T", "寬版短袖 T", "亞麻短袖襯衫"], ["寬版短袖 T", "短袖襯衫", "polo 衫"], ["長袖 T", "薄連帽上衣", "牛津布襯衫"], ["連帽上衣", "針織衫", "法蘭絨襯衫"], ["厚磅衛衣", "厚針織衫", "刷毛上衣"]],
};
// bottoms: [main, alternative]; the second look uses the alternative
const BOTTOMS = {
  work: [["寬褲（輕薄）", "亞麻直筒褲"], ["高腰西裝褲", "九分西裝褲"], ["直筒西裝褲", "錐形西裝褲"], ["羊毛混紡西裝褲", "厚織錐形褲"], ["厚羊毛直筒褲", "刷毛內裡西裝褲"]],
  date: [["迷你短裙", "亞麻短褲"], ["半身長裙", "高腰寬褲"], ["高腰直筒褲", "緞面長裙"], ["皮革長裙", "高腰牛仔褲"], ["針織長裙", "羊毛直筒褲"]],
  sport: [["運動短褲", "三分運動褲"], ["運動短褲", "五分運動褲"], ["七分運動褲", "輕量運動長褲"], ["運動長褲", "束口運動褲"], ["發熱運動長褲", "刷毛運動長褲"]],
  formal: [["高腰寬褲", "薄西裝褲"], ["高腰寬褲", "九分西裝褲"], ["西裝褲", "及膝鉛筆裙"], ["西裝褲", "羊毛 A 字裙"], ["羊毛西裝褲", "羊毛長裙"]],
  casual: [["牛仔短褲", "亞麻短褲"], ["寬版短褲", "輕薄寬褲"], ["寬版牛仔褲", "棉質直筒褲"], ["工裝褲", "直筒牛仔褲"], ["燈芯絨長褲", "厚磅牛仔褲"]],
};
const OUTER = {
  base: [null, ["薄外套（備著應付冷氣）", "輕薄防曬外套", "棉麻薄外套"], ["輕薄襯衫外套", "針織開襟外套", "薄風衣外套"], ["西裝外套", "短版夾克", "風衣外套"], ["羊毛大衣", "長版羽絨外套", "厚呢大衣"]],
  sport: [null, null, ["輕量風衣外套", "薄款運動外套", "防潑水外套"], ["防風運動外套", "刷毛運動外套", "防風外套"], ["保暖羽絨外套", "防風保暖外套", "刷毛防風外套"]],
};
const ACCESSORY = { work: ["通勤包", "絲巾", "托特包"], date: ["耳環", "小包", "絲巾"], sport: ["髮帶", "運動襪", "腰包"], formal: ["胸針", "手拿包", "絲巾"], casual: ["帽子", "托特包", "帆布包"] };
const SHOES = {
  work: ["樂福鞋", "德比鞋", "簡約皮革便鞋"],
  date: ["細帶高跟／尖頭平底", "瑪莉珍鞋", "尖頭平底鞋"],
  sport: ["跑鞋", "訓練鞋", "輕量慢跑鞋"],
  formal: ["牛津鞋／高跟鞋", "尖頭高跟鞋", "德比鞋"],
  casual: ["德訓鞋", "帆布鞋", "老爹鞋"],
};
const SHOES_RAIN = { work: "防水皮鞋", date: "防水短靴", sport: "防水跑鞋", formal: "防水短靴", casual: "防水球鞋" };

/* looks: each piece tagged with a colour slot (g1 power, g2 boost, g3 steady) */
const TIER = { g1: "旺色", g2: "助色", g3: "穩色" };
const TIER_EN = { g1: "POWER", g2: "BOOST", g3: "STEADY" };
const WEIGHT = { g1: 3, g2: 2, g3: 1 };
function buildLooks(occ, feel, rainy, uv, c) {
  const b = band(feel);
  const outers = (occ === "sport" ? OUTER.sport : OUTER.base)[b];
  const extra = [];
  if (rainy) extra.push({ part: "雨具", item: "折疊傘／防潑水外層", slot: "accent" });
  if (uv >= 8) extra.push({ part: "防曬", item: "寬簷帽或墨鏡", slot: "neutral" });

  // v = variant index (0..2): picks a different garment from each band list per look
  const mk = (v, id, name, note, slots) => {
    const outer = outers?.[v];
    const core = [
      { part: "上身", item: TOPS[occ][b][v], slot: slots.top },
      { part: "下身", item: BOTTOMS[occ][b][v === 1 ? 1 : 0], slot: slots.bot },
      ...(outer ? [{ part: "外層", item: outer, slot: slots.outer }] : []),
    ];
    const shoe = rainy ? SHOES_RAIN[occ] : SHOES[occ][v];
    const pieces = [...core, { part: "鞋", item: shoe, slot: slots.shoe }, { part: "配件", item: ACCESSORY[occ][v], slot: slots.acc }, ...extra];
    // energy score: weighted share of power / boost / steady across the visible pieces
    const scored = [...core, pieces[core.length], pieces[core.length + 1]];
    const pts = scored.reduce((n, p) => n + (WEIGHT[p.slot] ?? 0), 0);
    const score = Math.round((pts / (scored.length * 3)) * 10);
    return { id, name, note, pieces, score };
  };
  const looks = [
    mk(0, "01", "POWER UP 旺色滿格", "今日最旺的旺色佔大面積，助色做點綴，能量最集中。", { top: "g1", bot: "g1", outer: "g1", shoe: "dark", acc: "g2" }),
    mk(1, "02", "DUO 旺色＋助色", "旺色與助色對撞，一件主角單品配一件反差，時裝感最強。", { top: "g1", bot: "g2", outer: "g1", shoe: "neutral", acc: "g1" }),
    mk(2, "03", "TRIO 三色運勢", "用穩色打底、旺色壓軸、助色收尾，層次豐富但不搶戲。", { top: "g3", bot: "dark", outer: "g1", shoe: "g2", acc: "g1" }),
  ].map((l) => ({ ...l, colors: c }));
  return { looks, band: b };
}

/* ---------- state ---------- */
const CITIES = {
  taipei: { zh: "台北", en: "TAIPEI", lat: 25.033, lon: 121.5654, tz: "Asia/Taipei" },
  tokyo: { zh: "東京", en: "TOKYO", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  seoul: { zh: "首爾", en: "SEOUL", lat: 37.5665, lon: 126.978, tz: "Asia/Seoul" },
  newyork: { zh: "紐約", en: "NEW YORK", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
};
const readCity = () => {
  try { const c = localStorage.getItem("cinq-city"); if (c && CITIES[c]) return c; } catch { /* storage unavailable */ }
  return "taipei";
};
let state = { occ: "work", city: readCity(), off: 0, day: null, pal: null, weather: null, raw: null };

function todayIn(tz) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).formatToParts(new Date());
  const o = Object.fromEntries(f.map((p) => [p.type, p.value]));
  return { y: +o.year, m: +o.month, d: +o.day, wk: o.weekday };
}

const WK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WK_ZH = ["日", "一", "二", "三", "四", "五", "六"];
function shiftDay(t, off) {
  const u = new Date(Date.UTC(t.y, t.m - 1, t.d + off));
  return { y: u.getUTCFullYear(), m: u.getUTCMonth() + 1, d: u.getUTCDate(), wk: WK[u.getUTCDay()], wd: u.getUTCDay() };
}

function dayElement(tz, off = 0) {
  const t = shiftDay(todayIn(tz), off);
  const lunar = Solar.fromYmd(t.y, t.m, t.d).getLunar();
  const gan = lunar.getDayGan();
  return { t, gz: lunar.getDayInGanZhi(), gan, el: GAN_EL[gan] };
}

/* ---------- weather ---------- */
const WCODE = (c) => (c === 0 ? "晴" : c <= 3 ? "多雲" : c <= 48 ? "霧" : c <= 57 ? "毛毛雨" : c <= 67 ? "雨" : c <= 77 ? "雪" : c <= 82 ? "陣雨" : c <= 99 ? "雷雨" : "—");

const DAY_OFFSETS = [-1, 0, 1, 2, 3, 4, 5, 6];
const PAST_DAYS = 2, FUTURE_DAYS = 16; // forecast window requested from Open-Meteo

// One request per city covers yesterday through +5 days; sliceWeather() picks a day.
async function getWeather(city) {
  const c = CITIES[city];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,weather_code&timezone=${encodeURIComponent(c.tz)}&past_days=${PAST_DAYS}&forecast_days=${FUTURE_DAYS}`;
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 7000);
    const r = await fetch(url, { signal: ctl.signal });
    clearTimeout(to);
    if (!r.ok) throw new Error(r.status);
    return { ok: true, j: await r.json() };
  } catch {
    return { ok: false, j: null };
  }
}

function sliceWeather(raw, city, off) {
  const c = CITIES[city];
  if (raw?.ok && off >= -PAST_DAYS && off < FUTURE_DAYS) {
    const j = raw.j;
    const di = off + PAST_DAYS; // daily[0] is the earliest past day
    const date = j.daily.time[di];
    const mk = (k) => ({
      label: j.hourly.time[k].slice(11, 16),
      temp: j.hourly.temperature_2m[k],
      feel: j.hourly.apparent_temperature[k],
      rain: j.hourly.precipitation_probability[k] ?? 0,
      code: j.hourly.weather_code[k],
    });
    const common = { ok: true, max: j.daily.temperature_2m_max[di], min: j.daily.temperature_2m_min[di], uv: j.daily.uv_index_max[di] ?? 0, dcode: j.daily.weather_code[di] };
    if (off === 0) {
      const nowHour = j.current.time.slice(0, 13);
      let start = j.hourly.time.findIndex((t) => t.slice(0, 13) >= nowHour);
      if (start < 0) start = 0;
      const hours = [];
      for (let k = start; k < Math.min(start + 13, j.hourly.time.length); k++) hours.push(mk(k));
      return { ...common, mode: "now", temp: j.current.temperature_2m, feel: j.current.apparent_temperature, hum: j.current.relative_humidity_2m, code: j.current.weather_code, rain: Math.max(...hours.map((x) => x.rain), 0), hours };
    }
    const first = j.hourly.time.findIndex((t) => t.startsWith(date) && t.slice(11, 13) === "08");
    const hours = [];
    for (let k = Math.max(first, 0); k < Math.min(Math.max(first, 0) + 13, j.hourly.time.length); k++) hours.push(mk(k));
    const noon = hours[4] || hours[0];
    return { ...common, mode: "day", temp: noon.temp, feel: noon.feel, hum: null, code: j.daily.weather_code[di], rain: Math.max(...hours.map((x) => x.rain), 0), hours };
  }
  // seasonal fallback so the page still works offline (rough estimates, flagged in the UI)
  const tt = shiftDay(todayIn(c.tz), off);
  const base = ({ taipei: [16, 17, 19, 23, 26, 29, 31, 31, 29, 26, 22, 18], tokyo: [6, 7, 11, 16, 21, 24, 28, 30, 26, 20, 14, 9], seoul: [-1, 2, 8, 15, 20, 24, 27, 28, 23, 16, 8, 1], newyork: [1, 3, 7, 13, 19, 24, 27, 26, 22, 16, 10, 4] })[city][tt.m - 1];
  const hour0 = off === 0 ? Number(new Intl.DateTimeFormat("en-GB", { timeZone: c.tz, hour: "2-digit", hour12: false }).format(new Date())) : 8;
  const hours = Array.from({ length: 13 }, (_, k) => {
    const hh = (hour0 + k) % 24;
    const t = base + 3 * Math.sin(((hh - 9) / 24) * Math.PI * 2);
    return { label: `${String(hh).padStart(2, "0")}:00`, temp: t, feel: t, rain: 30, code: 3 };
  });
  const mid = off === 0 ? hours[0] : hours[4];
  return { ok: false, loading: !raw, est: !!raw?.ok, mode: off === 0 ? "now" : "day", temp: mid.temp, feel: mid.feel, hum: null, code: 3, max: base + 3, min: base - 4, rain: 30, uv: 6, hours };
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

// Colour ranking for the day, by relation to the day's element:
//   剋我 → power, 我剋 → boost, 同我 → steady. 生我 / 我生 are not ranked (kept neutral).
function paletteFor(elKey) {
  const tier = (k) => ({ key: k, el: EL[k], ...EL[k].colors[0] });
  const dark = { n: "Black 墨黑", hex: "#0a0a0a" };
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
  $("dateLine").textContent = `${t.y}.${String(t.m).padStart(2, "0")}.${String(t.d).padStart(2, "0")} ${t.wk} · ${gz}日 · ${city.en}`;
  $("kicker").textContent = state.off === 0 ? "TODAY'S LOOK · 今日主色" : `${dayName(state.off).en} · ${dayName(state.off).zh}主色`;
  $("elZh").textContent = E.zh;
  splitChars($("elEn"), E.en);
  $("heroStatus").textContent = `${dayName(state.off).zh}主色：${E.zh}（${E.en}）`;
  $("sub").textContent = state.off === 0 ? E.mood : E.mood.replaceAll("今天", dayName(state.off).zh);

  const pal = state.pal;
  const chips = $("chips");
  chips.replaceChildren(
    ...[
      [`${TIER.g1} ${TIER_EN.g1}`, pal.g1],
      [`${TIER.g2} ${TIER_EN.g2}`, pal.g2],
      [`${TIER.g3} ${TIER_EN.g3}`, pal.g3],
      ["中性色 NEUTRAL", pal.neutral],
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
  keepFocus(box, () =>
    box.replaceChildren(
      ...Object.entries(CITIES).map(([id, c]) => {
        const b = h("button", "tab city" + (id === state.city ? " on" : ""), `<b>${c.zh}</b><small>${c.en}</small>`);
        b.type = "button";
        b.setAttribute("aria-pressed", id === state.city);
        b.addEventListener("click", () => { if (id !== state.city) switchCity(id); });
        return b;
      }),
    ),
  );
  $("wCity").textContent = `${CITIES[state.city].zh} · ${state.off === 0 ? "現在與未來 12 小時" : "當日 08:00–20:00"}`;
}

function renderWeather() {
  const w = state.weather;
  const g = $("wgrid");
  const est = w.ok ? "" : " · 估計";
  const cells = [
    [(w.mode === "now" ? "現在體感" : "中午體感") + est, `${Math.round(w.feel)}°`, `${tempBand(w.feel)} · 氣溫 ${Math.round(w.temp)}°`],
    [(w.mode === "now" ? "今日高低" : "當日高低") + est, `${Math.round(w.min)}–${Math.round(w.max)}°`, WCODE(w.code)],
    [(w.mode === "now" ? "未來 12 小時降雨" : "日間降雨") + est, `${Math.round(w.rain)}%`, w.rain >= RAIN_AT ? "帶傘、換防水鞋" : "出門可不帶傘"],
    ["紫外線" + est, String(Math.round(w.uv)), w.uv >= 8 ? "高：帽子與墨鏡" : "一般"],
  ];
  g.replaceChildren(
    ...cells.map(([k, v, s], i) => {
      const d = h("div", "wcell", `<small>${k}</small><strong>${v}</strong><span>${s}</span>`);
      d.style.setProperty("--i", i);
      return d;
    }),
  );
  if (!w.ok) g.appendChild(h("p", "wnote", w.loading ? "天氣載入中，先以季節平均估算；載入完成會自動更新。" : w.est ? "這天超出天氣預報範圍（約未來 16 天內），以下為季節平均的估算值。" : "即時天氣暫時讀不到，以下為季節平均的估算值。"));

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
        "div", "hour" + (i === 0 && w.mode === "now" ? " now" : ""),
        `<small>${i === 0 && w.mode === "now" ? "NOW" : x.label}</small>` +
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

function dayName(off) {
  const t = shiftDay(todayIn(CITIES[state.city].tz), off);
  const base = off === -1 ? ["YESTERDAY", "昨天"] : off === 0 ? ["TODAY", "今天"] : off === 1 ? ["TOMORROW", "明天"] : [t.wk, Math.abs(off) <= 6 ? `週${WK_ZH[t.wd]}` : `${t.m}/${t.d}`];
  return { en: base[0], zh: base[1], md: `${t.m}/${t.d}` };
}

const ymd = (t) => `${t.y}-${String(t.m).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`;

// Re-render a button group without dropping keyboard focus.
function keepFocus(box, rebuild) {
  const idx = [...box.children].indexOf(document.activeElement);
  rebuild();
  if (idx >= 0) box.children[idx]?.focus({ preventScroll: true });
}

// Day buttons work straight away (the lunar day needs no network); weather fills in when it arrives.
function renderDayTabs() {
  const ready = !!state.raw;
  const box = $("dayTabs");
  box.setAttribute("aria-busy", String(!ready));
  keepFocus(box, () =>
    box.replaceChildren(
      ...DAY_OFFSETS.map((o) => {
        const n = dayName(o);
        const b = h("button", "tab day" + (o === state.off ? " on" : ""), `<b>${n.zh}</b><small>${n.md}</small>`);
        b.type = "button";
        b.setAttribute("aria-pressed", o === state.off);
        b.addEventListener("click", () => { if (o !== state.off) switchDay(o); });
        return b;
      }),
    ),
  );
  if (state.day) $("dayPickVal").textContent = `${state.day.t.m}/${state.day.t.d}`;
  if (!ready) $("dayState").textContent = "天氣載入中，先以季節平均估算";
  else if ($("dayState").textContent.startsWith("天氣載入")) $("dayState").textContent = "";
}

function offsetFor(value) {
  const [y, m, d] = value.split("-").map(Number);
  const t = todayIn(CITIES[state.city].tz);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(t.y, t.m - 1, t.d)) / 864e5);
}

// quiet: refresh weather-dependent parts only (no hero wipe), used when the forecast arrives
function applyDay(quiet = false) {
  const tz = CITIES[state.city].tz;
  const day = dayElement(tz, state.off);
  const pal = paletteFor(day.el);
  const weather = sliceWeather(state.raw, state.city, state.off);
  state.day = day;
  state.pal = pal;
  state.weather = weather;
  try {
    if (!quiet) { renderHero(); renderRules(); }
    renderDayTabs();
    renderCityTabs();
    renderWeather();
    renderLooks(!quiet);
    if (quiet) return;
    $("dayState").textContent = `已切換：${day.t.m}/${day.t.d} 週${WK_ZH[day.t.wd]} · ${day.gz}日 · ${EL[day.el].zh}`;
  } catch (err) {
    console.error(err);
    $("dayState").textContent = `切換失敗（${err.message}），請重新整理`;
  }
}

function switchDay(off) {
  state.off = off;
  applyDay();
  closeCal();
}

/* ---------- calendar popover ---------- */
const cal = { y: 0, m: 0 };
function closeCal() {
  $("cal").hidden = true;
  $("dayPickBtn").setAttribute("aria-expanded", "false");
}
function renderCal() {
  const t = todayIn(CITIES[state.city].tz);
  const sel = state.day.t;
  $("calTitle").textContent = `${cal.y} · ${String(cal.m).padStart(2, "0")}`;
  const first = new Date(Date.UTC(cal.y, cal.m - 1, 1)).getUTCDay();
  const dim = new Date(Date.UTC(cal.y, cal.m, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const day = i - first + 1;
    const dt = shiftDay({ y: cal.y, m: cal.m, d: 1 }, day - 1);
    const inMonth = day >= 1 && day <= dim;
    const b = h("button", "cd" + (inMonth ? "" : " out") + (dt.wd === 0 || dt.wd === 6 ? " we" : "") + (dt.y === t.y && dt.m === t.m && dt.d === t.d ? " today" : "") + (dt.y === sel.y && dt.m === sel.m && dt.d === sel.d ? " sel" : ""), String(dt.d));
    b.type = "button";
    b.setAttribute("aria-label", `${dt.y}年${dt.m}月${dt.d}日`);
    if (dt.y === sel.y && dt.m === sel.m && dt.d === sel.d) b.setAttribute("aria-current", "date");
    b.addEventListener("click", () => {
      const off = offsetFor(ymd(dt));
      if (off !== state.off) switchDay(off); else closeCal();
    });
    cells.push(b);
  }
  $("calGrid").replaceChildren(...cells);
}
function openCal() {
  cal.y = state.day.t.y;
  cal.m = state.day.t.m;
  renderCal();
  $("cal").hidden = false;
  $("dayPickBtn").setAttribute("aria-expanded", "true");
}
const moveMonth = (dm) => {
  const u = new Date(Date.UTC(cal.y, cal.m - 1 + dm, 1));
  cal.y = u.getUTCFullYear();
  cal.m = u.getUTCMonth() + 1;
  renderCal();
};
$("dayPickBtn").addEventListener("click", () => ($("cal").hidden ? openCal() : closeCal()));
$("calPrev").addEventListener("click", () => moveMonth(-1));
$("calNext").addEventListener("click", () => moveMonth(1));
$("calPrevY").addEventListener("click", () => moveMonth(-12));
$("calNextY").addEventListener("click", () => moveMonth(12));
$("calToday").addEventListener("click", () => { if (state.off !== 0) switchDay(0); else closeCal(); });
document.addEventListener("click", (e) => { if (!$("cal").hidden && !$("datepick").contains(e.target)) closeCal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("cal").hidden) { closeCal(); $("dayPickBtn").focus(); } });

async function switchCity(id) {
  state.city = id;
  try { localStorage.setItem("cinq-city", id); } catch { /* storage unavailable */ }
  renderCityTabs();
  $("hourly").classList.add("loading");
  const raw = await getWeather(id);
  if (state.city !== id) return; // user switched again while loading
  state.raw = raw;
  $("hourly").classList.remove("loading");
  applyDay();
}

function renderTabs() {
  const tabs = $("tabs");
  tabs.replaceChildren(
    ...OCCASIONS.map((o) => {
      const b = h("button", "tab" + (o.id === state.occ ? " on" : ""), `<b>${o.zh}</b><small>${o.en}</small>`);
      b.type = "button";
      b.dataset.occ = o.id;
      b.setAttribute("aria-pressed", o.id === state.occ);
      b.addEventListener("click", () => {
        if (o.id === state.occ) return;
        state.occ = o.id;
        // update in place so keyboard focus stays on the pressed button
        tabs.querySelectorAll("button").forEach((x) => {
          const on = x.dataset.occ === state.occ;
          x.classList.toggle("on", on);
          x.setAttribute("aria-pressed", on);
        });
        renderLooks(true);
      });
      return b;
    }),
  );
}

/* ---------- stickers: simple garment icons so each look reads at a glance ---------- */
const ICONS = {
  tank: "M32 12 L38 12 Q50 34 62 12 L68 12 L74 40 L70 88 H30 L26 40Z",
  tee: "M30 16 L10 30 L21 46 L30 40 V86 H70 V40 L79 46 L90 30 L70 16 Q50 30 30 16Z",
  long: "M32 14 L8 34 L15 84 L28 82 L30 52 V88 H70 V52 L72 82 L85 84 L92 34 L68 14 Q50 28 32 14Z",
  coat: "M34 10 L50 42 L66 10 L90 24 L86 92 H54 V50 L50 44 L46 50 V92 H14 L10 24Z",
  trousers: "M30 10 H70 L75 90 H54 L50 40 L46 90 H25Z",
  wide: "M28 10 H72 L88 90 H54 L50 36 L46 90 H12Z",
  skirt: "M34 12 H66 L88 86 H12Z",
  shorts: "M26 18 H74 L82 64 H55 L50 44 L45 64 H18Z",
  flat: "M8 62 Q8 44 28 42 L48 42 Q60 58 88 58 Q94 60 94 70 V76 H8Z",
  sneaker: "M8 58 Q8 40 30 40 L46 40 L52 52 Q70 52 90 60 Q96 64 96 72 V78 H8Z",
  heel: "M16 24 H38 L42 56 Q62 60 86 70 V78 H66 L52 68 H40 L34 92 H24Z",
  bag: "M24 40 H76 L84 88 H16Z",
  scarf: "M26 18 Q50 40 74 18 L80 30 Q50 58 20 30Z M44 46 L38 90 H54 L58 50Z",
  gem: "M28 38 L40 20 H60 L72 38 L50 84Z",
  hat: "M10 66 H90 Q90 60 80 58 Q76 26 50 26 Q24 26 20 58 Q10 60 10 66Z",
  shades: "M10 38 H44 V58 Q44 72 28 72 Q10 72 10 58Z M56 38 H90 V58 Q90 72 72 72 Q56 72 56 58Z",
  umbrella: "M8 52 Q50 -2 92 52 Q81 44 71 52 Q61 44 50 52 Q39 44 29 52 Q19 44 8 52Z",
};
const ICON_LINES = {
  bag: "M36 42 Q36 16 50 16 Q64 16 64 42",
  umbrella: "M50 52 V80 Q50 92 38 88",
  flat: "M8 70 H94",
  sneaker: "M8 70 H96",
};
const ICON_RULES = [
  [/外套|大衣/, "coat"], [/無袖|吊帶|背心(?! T)/, "tank"], [/短袖|polo|背心 T/, "tee"], [/短褲/, "shorts"], [/裙/, "skirt"],
  [/寬褲|寬版牛仔褲/, "wide"], [/褲/, "trousers"], [/高跟|短靴/, "heel"], [/跑鞋|球鞋|德訓|訓練鞋|老爹鞋|帆布鞋/, "sneaker"], [/鞋/, "flat"],
  [/傘/, "umbrella"], [/帽/, "hat"], [/墨鏡/, "shades"], [/包/, "bag"], [/絲巾/, "scarf"], [/耳環|胸針|髮帶|襪/, "gem"],
  [/襯衫|針織|長袖|衛衣|連帽|刷毛|發熱|高領/, "long"],
];
const iconFor = (item) => (ICON_RULES.find(([re]) => re.test(item)) || [0, "long"])[1];

function stickerHTML(piece, hex, i) {
  const id = iconFor(piece.item);
  const d = ICONS[id];
  const line = ICON_LINES[id] ? `<path d="${ICON_LINES[id]}" class="stk-l"/>` : "";
  const rot = [-6, 4, -3, 6, -4, 3, -5][i % 7];
  return `<figure class="stk" style="--r:${rot}deg"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="${d}" class="stk-o"/><path d="${d}" class="stk-f" style="fill:${hex}"/>${line}</svg><figcaption>${piece.part}</figcaption></figure>`;
}

function slotColor(slot, pal) {
  return slot === "g1" ? pal.g1 : slot === "g2" ? pal.g2 : slot === "g3" ? pal.g3 : slot === "neutral" ? pal.neutral : slot === "dark" ? pal.dark : pal.accent;
}

// Answer-first line under the hero word: built from the same weather + look state as the cards below.
const stripNote = (item) => item.replace(/（.*?）/g, "");
function renderAnswer(look) {
  const w = state.weather;
  const occ = OCCASIONS.find((o) => o.id === state.occ);
  const wear = ["上身", "外層", "下身"].map((part) => look.pieces.find((p) => p.part === part)?.item).filter(Boolean).map(stripNote).join("＋");
  const umbrella = w.rain >= RAIN_AT ? "記得帶傘" : "不用帶傘";
  const tail = w.loading ? " · 天氣載入中，先以季節平均估算" : w.ok ? "" : " · 季節平均估算";
  $("answerText").textContent = `${dayName(state.off).zh}${occ.verb}：${wear} · 體感 ${Math.round(w.feel)}° ${WCODE(w.code)} · 降雨 ${Math.round(w.rain)}%，${umbrella}${tail}`;
}

// One "why" sentence per source, tagged so computed weather and interpretive five-elements advice stay distinguishable.
function renderWhy(b) {
  const w = state.weather;
  const pal = state.pal;
  const E = EL[state.day.el];
  const rainTxt = w.rain >= RAIN_AT ? `降雨機率 ${Math.round(w.rain)}%，帶傘並穿防水鞋` : `降雨機率 ${Math.round(w.rain)}%，不用帶傘`;
  const uvTxt = w.uv >= 8 ? "；紫外線偏高，加帽子或墨鏡" : "";
  const est = w.ok ? "" : `<span class="tag tag-est">估計</span>`;
  const estNote = w.ok ? "" : "（季節平均估算，僅供參考）";
  $("why").innerHTML =
    `<p><span class="tag tag-calc">天氣 · 計算</span>${est}體感 ${Math.round(w.feel)}°（${BAND_NAME[b]}），${BAND_WHY[b]}；${rainTxt}${uvTxt}。${estNote}</p>` +
    `<p><span class="tag tag-interp">五行 · 詮釋</span>${dayName(state.off).zh}是${E.zh}日：旺色 ${pal.g1.n} 放大面積，助色 ${pal.g2.n} 放下身或配件，穩色 ${pal.g3.n} 收尾；墨黑、米白為中性色，只用來打底。</p>`;
}

function renderLooks(animate) {
  const w = state.weather;
  const { looks, band: b } = buildLooks(state.occ, w.feel, w.rain >= RAIN_AT, w.uv, state.pal);
  renderAnswer(looks[0]);
  renderWhy(b);
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
          return `<li><span class="dot" style="background:${c.hex}"></span><em>${p.part}</em><b>${p.item}</b><small>${TIER[p.slot] ? `${TIER[p.slot]} · ${c.n}` : p.slot === "accent" ? "點綴" : `中性色 · ${c.n}`}</small></li>`;
        })
        .join("");
      const board = l.pieces.map((p, k) => stickerHTML(p, slotColor(p.slot, state.pal).hex, k)).join("");
      card.innerHTML = `<div class="look-no">${l.id}</div><div class="score" title="依旺／助／穩色的佔比估算"><b>${l.score}</b>/10<small>ENERGY</small></div><div class="board">${board}</div><div class="swatches">${bars}</div><h3>${l.name}</h3><p>${l.note}</p><ul>${rows}</ul>`;
      return card;
    }),
  );
}

function renderRules() {
  const el = state.day.el;
  const rows = [
    ["g1", ctrlBy(el), `${EL[ctrlBy(el)].zh}剋${EL[el].zh}（剋我者）。今天最有助力的顏色，優先放在上身、外套等大面積。`],
    ["g2", CTRL[el], `${EL[el].zh}剋${EL[CTRL[el]].zh}（我剋者）。第二順位，適合下身、鞋或配件，補上第二層能量。`],
    ["g3", el, `與今天同為${EL[el].zh}（同我者）。不加分也不扣分，當作底色或點綴就好。`],
  ];
  $("rules").replaceChildren(
    ...rows.map(([slot, e, t], i) => {
      const E = EL[e];
      const d = h("div", "rule", `<i style="background:${E.colors[0].hex}"></i><small>${TIER[slot]} · ${TIER_EN[slot]}</small><strong>${E.zh}（${E.en}）</strong><b class="rc">${E.colors[0].n}</b><p>${t}</p>`);
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
  // first paint uses the offline seasonal estimate (flagged in the UI); the forecast replaces it when it arrives
  state.weather = sliceWeather(null, state.city, state.off);
  renderHero();
  renderRules();
  renderCityTabs();
  renderDayTabs();
  renderWeather();
  renderTabs();
  renderLooks(false);
  $("hourly").classList.add("loading");
  observe();
  const city = state.city;
  const raw = await getWeather(city);
  if (state.city !== city || state.raw) return; // the user switched city meanwhile; switchCity handles it
  state.raw = raw;
  $("hourly").classList.remove("loading");
  applyDay(true);
}

// floating dock: appears once the hero has scrolled out of view
const heroEl = document.querySelector(".hero");
new IntersectionObserver(([e]) => $("dock").classList.toggle("show", !e.isIntersecting), { threshold: 0.05 }).observe(heroEl);

init();
