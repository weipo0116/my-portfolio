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

/* ---------- wardrobe ----------
   Each item: "name|fit|styles|occasions|bands".
   fit: w 女 / m 男 / u 中性（兩者都適合）
   styles: m 簡約 · s 街頭 · j 日系 · k 韓系 · v 復古 · * 不限
   occasions: w 上班 · d 約會 · c 休閒 · f 正式 · p 運動
   bands (feels-like): 0 ≥30° · 1 26–29° · 2 20–25° · 3 14–19° · 4 <14° · * 全部 */
const STYLES = [["any", "不限"], ["m", "簡約"], ["s", "街頭"], ["j", "日系"], ["k", "韓系"], ["v", "復古"]];
const FITS = [["w", "女生"], ["m", "男生"], ["u", "中性"]];
const RAW = {
  top: `白色短袖 T 恤|u|mjk|c|012
寬版落肩 T 恤|u|sk|c|012
印花 oversized T|u|s|c|01
條紋短袖 T|u|jv|c|012
無袖背心|u|ms|c|0
細肩帶背心|w|mk|cd|0
亞麻短袖襯衫|u|mjv|cwd|01
古巴領短袖襯衫|m|sv|cd|01
夏威夷印花襯衫|u|sv|c|01
短版短袖上衣|w|sk|cd|01
泡泡袖上衣|w|kj|dc|012
方領短袖上衣|w|kv|d|01
針織短袖 polo|u|kmv|wdc|012
挺版短袖襯衫|u|m|w|01
涼感 polo 衫|m|m|w|0
緞面短袖襯衫|w|mk|dw|01
絲質無袖上衣|w|m|wf|01
素色 T 恤（扎進褲頭）|u|m|w|01
白色府綢襯衫|u|mjk|wf|23
藍色牛津襯衫|u|jvm|wc|23
條紋長袖襯衫|u|jvk|wc|23
寬版長袖襯衫|u|kj|c|23
法蘭絨格紋襯衫|u|vs|c|34
丹寧襯衫|u|vsj|c|23
長袖素 T|u|mj|c|23
薄針織衫|u|mk|wd|23
圓領針織衫|u|mjk|wdc|34
針織背心＋襯衫|u|kjv|wc|3
緞面長袖襯衫|w|mk|df|23
絲質襯衫|w|m|wf|23
露肩長袖上衣|w|k|d|2
蕾絲上衣|w|kv|d|12
羅紋高領上衣|w|mk|wd|34
高領毛衣|u|mjv|wdc|4
粗針織毛衣|u|jvk|c|4
麻花毛衣|u|vj|c|34
大學 T|u|svk|c|34
連帽上衣|u|sk|c|34
厚磅衛衣|u|s|c|4
羊毛混紡襯衫|m|m|wf|34
合身襯衫＋領帶|m|m|f|1234
立領襯衫|u|jm|wf|23
短袖府綢襯衫|u|mk|wf|01
亞麻立領襯衫|u|jm|wfd|01
涼感針織短袖|u|mk|wdf|01
高領針織＋襯衫|u|m|wf|4
細針織高領衫|u|mk|fd|34`,
  bottom: `牛仔短褲|u|sv|c|01
亞麻短褲|u|mj|cd|01
寬版短褲|u|sk|c|01
卡其短褲|m|vm|c|01
百褶短裙|w|kj|cd|01
迷你短裙|w|ks|d|01
碎花長裙|w|jv|dc|012
半身長裙|w|mjk|dwc|0123
緞面長裙|w|mk|df|123
百褶長裙|w|kj|dw|123
A 字裙|w|vk|wd|123
及膝鉛筆裙|w|m|wf|123
針織長裙|w|kj|d|34
皮革長裙|w|sv|d|34
羊毛格紋裙|w|v|dc|34
亞麻寬褲|u|mj|cw|01
高腰寬褲|w|mk|wdf|0123
西裝寬褲|u|mk|wf|123
直筒西裝褲|u|m|wf|1234
錐形西裝褲|m|m|w|1234
九分西裝褲|u|mk|w|12
羊毛西裝褲|u|m|wf|34
直筒牛仔褲|u|mv|cd|1234
寬版牛仔褲|u|sk|c|1234
喇叭牛仔褲|w|v|cd|234
黑色窄管褲|u|ms|cd|234
工裝褲|u|s|c|234
傘兵褲|u|s|c|234
棉質休閒褲|u|jm|cwd|0123
束口棉褲|u|sj|c|234
燈芯絨長褲|u|vj|c|34
卡其褲|u|vm|wc|1234
亞麻西裝褲|u|mj|wfd|01
涼感九分西裝褲|u|m|wf|01`,
  dress: `細肩帶洋裝|w|mk|dc|0
碎花洋裝|w|jv|dc|01
亞麻連身裙|w|mj|c|01
襯衫洋裝|w|mj|wc|12
針織洋裝|w|mk|wd|234
小黑裙|w|m|fd|123
緞面洋裝|w|k|fd|12
背心裙＋T 恤|w|j|c|12
毛衣洋裝|w|kj|dc|34
西裝洋裝|w|m|wf|23`,
  outer: `防曬薄外套|u|ms|c|1
薄襯衫外搭|u|jm|cwd|12
針織開襟外套|u|kj|wdcf|12
亞麻西裝外套|u|m|wdf|12
西裝外套|u|mk|wf|23
丹寧外套|u|sv|c|23
教練外套|u|s|c|23
飛行夾克|u|sv|c|3
皮衣外套|u|sv|dc|3
風衣|u|mkv|wdc|23
工作外套|u|sj|c|23
短版毛呢外套|w|k|d|34
羊毛大衣|u|mk|wdf|4
長版大衣|u|mk|wdf|34
羽絨外套|u|s|c|4
鋪棉夾克|u|js|c|34
雙排扣西裝外套|u|mv|f|23
開襟毛衣外套|u|jv|c|3`,
  shoe: `白色帆布鞋|u|mjk|c|0123
德訓鞋|u|mk|cd|0123
老爹鞋|u|sk|c|*
高筒籃球鞋|u|s|c|1234
涼鞋|u|mj|c|01
勃肯拖鞋|u|j|c|01
樂福鞋|u|mvj|wd|*
德比鞋|u|mv|wf|*
牛津鞋|u|m|f|*
瑪莉珍鞋|w|kj|dw|123
尖頭平底鞋|w|mk|wd|0123
細帶涼跟鞋|w|mk|d|01
尖頭高跟鞋|w|m|fd|0123
短靴|u|ms|cd|34
切爾西靴|u|mv|wcd|34
馬汀靴|u|sv|c|34
長靴|w|k|d|4
帆船鞋|m|vj|c|01
麂皮樂福鞋|u|mv|wdf|01
皮革涼鞋|u|m|wd|01
雕花皮鞋|u|v|wf|*`,
  acc: `托特包|u|mj|wc|*
帆布包|u|j|c|*
通勤後背包|u|ms|w|*
斜背小包|u|ks|cd|*
手拿包|w|m|f|*
小肩背包|w|k|d|*
絲巾|w|v|wd|*
細項鍊|u|mk|d|*
珍珠耳環|w|k|df|*
銀戒指|u|s|cd|*
皮革手錶|u|m|wf|*
棒球帽|u|s|c|012
漁夫帽|u|j|c|012
毛帽|u|sj|c|34
圍巾|u|mk|wc|4
領帶|m|m|f|*
皮帶|m|m|w|*
髮夾|w|k|d|*
圓框眼鏡|u|jv|wc|*
同色系長襪|u|sj|c|234
胸針|u|vm|f|*
袖扣|m|m|f|*
公事包|u|m|wf|*`,
  sportTop: `排汗背心|u|*|p|01
速乾短袖 T|u|*|p|012
運動內衣＋背心|w|*|p|01
短版運動上衣|w|*|p|01
長袖排汗衣|u|*|p|23
刷毛運動上衣|u|*|p|34
發熱衣＋背心|u|*|p|4
半拉鍊長袖上衣|u|*|p|23
無縫長袖運動衣|w|*|p|23
網眼短袖上衣|m|*|p|01`,
  sportBottom: `運動短褲|u|*|p|012
五分運動褲|m|*|p|01
瑜珈褲|w|*|p|1234
束口運動褲|u|*|p|234
緊身褲＋短褲|m|*|p|34
慢跑長褲|u|*|p|234
運動緊身褲|w|*|p|234`,
  sportOuter: `輕量風衣|u|*|p|2
防風外套|u|*|p|23
刷毛外套|u|*|p|3
保暖羽絨外套|u|*|p|4`,
  sportShoe: `跑鞋|u|*|p|*
訓練鞋|u|*|p|*
輕量慢跑鞋|u|*|p|*`,
  sportAcc: `髮帶|u|*|p|*
運動襪|u|*|p|*
腰包|u|*|p|*
運動手錶|u|*|p|*
毛巾|u|*|p|01`,
};
const W = Object.fromEntries(
  Object.entries(RAW).map(([k, txt]) => [k, txt.trim().split("\n").map((ln) => {
    const [n, fit, st, occ, bands] = ln.split("|");
    return { n, fit, st, occ, bands };
  })]),
);
const OCC_CODE = { work: "w", date: "d", casual: "c", formal: "f", sport: "p" };

// small seeded RNG so a given day + settings always shows the same looks until you hit 換一套
function rng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
function pickItem(pool, { occ, b, fit, style }, rand, used) {
  const okFit = (x) => x.fit === "u" || (fit !== "u" && x.fit === fit);
  const okBand = (x) => x.bands === "*" || x.bands.includes(String(b));
  let c = pool.filter((x) => okFit(x) && okBand(x) && x.occ.includes(occ));
  if (!c.length) c = pool.filter((x) => okFit(x) && okBand(x));
  if (!c.length) return null;
  // order of preference: matching style and not used yet → not used yet → matching style → anything
  const styled = (arr) => (style === "any" ? arr : arr.filter((x) => x.st === "*" || x.st.includes(style)));
  const fresh = c.filter((x) => !used.has(x.n));
  const list = [styled(fresh), fresh, styled(c), c].find((a) => a.length);
  const it = list[Math.floor(rand() * list.length)];
  used.add(it.n);
  return it.n;
}

const SHOES_RAIN = { work: "防水皮鞋", date: "防水短靴", sport: "防水跑鞋", formal: "防水短靴", casual: "防水球鞋" };

/* looks: each piece tagged with a colour slot (g1 power, g2 boost, g3 steady) */
const TIER = { g1: "旺色", g2: "助色", g3: "穩色" };
const TIER_EN = { g1: "POWER", g2: "BOOST", g3: "STEADY" };
const WEIGHT = { g1: 3, g2: 2, g3: 1 };
function buildLooks(occ, feel, rainy, uv, c, prefs, rolls, seedKey, keep = null, only = null) {
  const b = band(feel);
  const sport = occ === "sport";
  const ctx = { occ: OCC_CODE[occ], b, fit: prefs.fit, style: sport ? "any" : prefs.style };
  const extra = [];
  if (rainy) extra.push({ part: "雨具", item: "折疊傘／防潑水外層", slot: "accent" });
  if (uv >= 8) extra.push({ part: "防曬", item: "寬簷帽或墨鏡", slot: "neutral" });
  const used = new Set();
  // rerolling one card keeps the other two exactly as they were, and avoids repeating their pieces
  if (keep && only != null) keep.forEach((l) => l.pieces.forEach((p) => used.add(p.item.replace(/（.*?）/g, "")))); // includes the card's own old pieces, so 換一套 really changes

  const mk = (v, id, name, note, slots) => {
    if (keep && only != null && v !== only) return keep[v];
    const rand = rng(`${seedKey}|${v}|${rolls[v] || 0}`);
    const core = [];
    const canDress = !sport && prefs.fit === "w" && b <= 3 && (v === 1 || rand() < 0.25);
    const dress = canDress ? pickItem(W.dress, ctx, rand, used) : null;
    if (dress) core.push({ part: "連身", item: dress, slot: slots.top });
    else {
      core.push({ part: "上身", item: pickItem(sport ? W.sportTop : W.top, ctx, rand, used), slot: slots.top });
      core.push({ part: "下身", item: pickItem(sport ? W.sportBottom : W.bottom, ctx, rand, used), slot: slots.bot });
    }
    const needOuter = sport ? b >= 2 : b >= 2 || (b === 1 && (occ === "work" || occ === "formal" || occ === "date"));
    if (needOuter) {
      const o = pickItem(sport ? W.sportOuter : W.outer, ctx, rand, used);
      if (o) core.push({ part: "外層", item: b === 1 ? `${o}（備著應付冷氣）` : o, slot: slots.outer });
    }
    const shoe = rainy ? SHOES_RAIN[occ] : pickItem(sport ? W.sportShoe : W.shoe, ctx, rand, used);
    const acc = pickItem(sport ? W.sportAcc : W.acc, ctx, rand, used);
    const pieces = [...core, { part: "鞋", item: shoe, slot: slots.shoe }, { part: "配件", item: acc, slot: slots.acc }, ...extra];
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
const readPref = (k, ok, d) => { try { const v = localStorage.getItem(k); if (v && ok.some(([x]) => x === v)) return v; } catch { /* storage unavailable */ } return d; };
let state = { occ: "work", city: readCity(), off: 0, day: null, pal: null, weather: null, raw: null, prefs: { fit: readPref("cinq-fit", FITS, "u"), style: readPref("cinq-style", STYLES, "any") }, rolls: [0, 0, 0], rollKey: "" };

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

function renderPrefs() {
  const box = $("prefs");
  const group = (key, list, label) => {
    const g = h("div", "pref", `<span class="pref-k">${label}</span>`);
    g.setAttribute("role", "group");
    g.setAttribute("aria-label", label);
    list.forEach(([v, zh]) => {
      const b = h("button", "chip" + (state.prefs[key] === v ? " on" : ""), zh);
      b.type = "button";
      b.dataset.k = key;
      b.dataset.v = v;
      b.setAttribute("aria-pressed", state.prefs[key] === v);
      g.appendChild(b);
    });
    return g;
  };
  box.replaceChildren(group("fit", FITS, "版型"), group("style", STYLES, "風格"));
}
document.addEventListener("click", (e) => {
  const chip = e.target.closest("#prefs .chip");
  if (chip) {
    const { k, v } = chip.dataset;
    if (state.prefs[k] === v) return;
    state.prefs[k] = v;
    try { localStorage.setItem(k === "fit" ? "cinq-fit" : "cinq-style", v); } catch { /* storage unavailable */ }
    chip.parentElement.querySelectorAll(".chip").forEach((x) => { const on = x === chip; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
    renderLooks(true);
    return;
  }
  const rr = e.target.closest(".reroll");
  if (rr) {
    const v = Number(rr.dataset.v);
    state.rolls[v] = (state.rolls[v] || 0) + 1;
    renderLooks(true, v);
    $("lookGrid").querySelectorAll(".reroll")[v]?.focus({ preventScroll: true });
  }
});

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
  dress: "M38 8 L44 8 Q50 18 56 8 L62 8 L64 34 L86 92 H14 L36 34Z",
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
  [/傘/, "umbrella"], [/帽/, "hat"], [/墨鏡|眼鏡/, "shades"], [/包/, "bag"], [/絲巾|圍巾|領帶|毛巾/, "scarf"], [/耳環|胸針|髮帶|襪|項鍊|戒指|手錶|皮帶|髮夾/, "gem"],
  [/襯衫|針織|長袖|衛衣|連帽|刷毛|發熱|高領/, "long"],
];
const iconFor = (piece) => {
  const it = piece.item, p = piece.part;
  if (p === "上身") return /無袖|背心(?!＋)|細肩/.test(it) && !/針織背心/.test(it) ? "tank" : /短袖|T 恤|polo|oversized|T$|短版/.test(it) && !/長袖/.test(it) ? "tee" : "long";
  if (p === "連身") return "dress";
  if (p === "外層") return "coat";
  if (p === "下身") return /短褲|運動短褲/.test(it) ? "shorts" : /裙/.test(it) ? "skirt" : /寬/.test(it) ? "wide" : "trousers";
  if (p === "鞋") return /高跟|涼跟|靴|瑪莉珍/.test(it) ? "heel" : /帆布|德訓|老爹|籃球|跑鞋|訓練|慢跑|球鞋/.test(it) ? "sneaker" : "flat";
  return (ICON_RULES.find(([re]) => re.test(it)) || [0, "gem"])[1];
};

function stickerHTML(piece, hex, i) {
  const id = iconFor(piece);
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
    `<p><span class="tag tag-interp">五行 · 詮釋</span>${dayName(state.off).zh}是${E.zh}日：旺色 ${pal.g1.n} 放大面積，助色 ${pal.g2.n} 放下身或配件，穩色 ${pal.g3.n} 收尾；墨黑、米白為中性色，只用來打底。</p>` +
    `<p><span class="tag tag-calc">單品</span>${FITS.find(([v]) => v === state.prefs.fit)[1]}版型 · ${state.prefs.style === "any" ? "不限風格" : STYLES.find(([v]) => v === state.prefs.style)[1] + "風"}；每天會換組合，不喜歡就按卡片下方「換一套」。</p>`;
}

function renderLooks(animate, only = null) {
  const w = state.weather;
  const t = state.day.t;
  const seedKey = `${t.y}-${t.m}-${t.d}|${state.city}|${state.occ}|${state.prefs.fit}|${state.prefs.style}|${band(w.feel)}`;
  if (seedKey !== state.rollKey) { state.rollKey = seedKey; state.rolls = [0, 0, 0]; }
  const { looks, band: b } = buildLooks(state.occ, w.feel, w.rain >= RAIN_AT, w.uv, state.pal, state.prefs, state.rolls, seedKey, only != null ? state.lastLooks : null, only);
  state.lastLooks = looks;
  renderAnswer(looks[0]);
  renderWhy(b);
  const grid = $("lookGrid");
  grid.replaceChildren(
    ...looks.map((l, i) => {
      const card = h("article", "look");
      card.style.setProperty("--i", i);
      if (animate && (only == null || only === i)) card.classList.add("swap");
      else if (only != null) card.classList.add("shown");
      const bars = l.pieces.map((p) => `<i style="background:${slotColor(p.slot, state.pal).hex}"></i>`).join("");
      const rows = l.pieces
        .map((p) => {
          const c = slotColor(p.slot, state.pal);
          return `<li><span class="dot" style="background:${c.hex}"></span><em>${p.part}</em><b>${p.item}</b><small>${TIER[p.slot] ? `${TIER[p.slot]} · ${c.n}` : p.slot === "accent" ? "點綴" : `中性色 · ${c.n}`}</small></li>`;
        })
        .join("");
      const board = l.pieces.map((p, k) => stickerHTML(p, slotColor(p.slot, state.pal).hex, k)).join("");
      card.innerHTML = `<div class="look-no">${l.id}</div><div class="score" title="依旺／助／穩色的佔比估算"><b>${l.score}</b>/10<small>ENERGY</small></div><div class="board">${board}</div><div class="swatches">${bars}</div><h3>${l.name}</h3><p>${l.note}</p><ul>${rows}</ul><button type="button" class="reroll" data-v="${i}"><span aria-hidden="true">↻</span> 換一套</button>`;
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
  renderPrefs();
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
