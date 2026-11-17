// Life Points — one continuous scroll. No dependencies, no network calls with user input.
import tables from "./data/life-tables.json";
import { DREAMS } from "./data/dreams.js";
import { STRINGS, fmt } from "./strings.js";
import { compute, dividend, dreamDividend, dreamWindow, clampAge, clamp, DEFAULTS } from "./calc.js";
import { drawRoad, pxPerYear, walkerX, groundY } from "./road.js";
import { drawCard, cardFonts } from "./card.js";
import { createMusic } from "./music.js";

const music = createMusic();
const musicPref = () => { try { return localStorage.getItem("lp-music") !== "off"; } catch { return true; } };
function setMusic(next, remember) {
  music.set(next);
  if (remember) try { localStorage.setItem("lp-music", next ? "on" : "off"); } catch { /* storage unavailable */ }
  syncMusicBtn();
}
function syncMusicBtn() {
  const b = document.getElementById("musicBtn");
  b.setAttribute("aria-pressed", String(music.on));
  b.setAttribute("aria-label", S[music.on ? "musicOn" : "musicOff"]);
  b.title = b.getAttribute("aria-label");
}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceQuery = matchMedia("(prefers-reduced-motion: reduce)");
const reduced = () => reduceQuery.matches;

const VISIT_STEPS = [1, 2, 3, 4, 6, 8, 10, 12, 18, 24, 36, 52, 104, 208, 365];
const STAGES = [
  { key: "stChild", from: 0, to: 13 },
  { key: "stTeens", from: 13, to: 20 },
  { key: "st20", from: 20, to: 30 },
  { key: "st30", from: 30, to: 40 },
  { key: "stMid", from: 40, to: 65 },
  { key: "stLater", from: 65, to: Infinity },
];
const CATS = [
  ["travel", "catTravel"],
  ["physical", "catPhysical"],
  ["creative", "catCreative"],
  ["personal", "catPersonal"],
];
const THE = new Set(["US", "GB", "NL", "PH", "AE"]);
const STAT_KEYS = ["eves", "birthdays", "mornings", "weekends", "moons", "trips", "books", "meetups"];

const fresh = () => ({
  started: false,
  age: "",
  country: "WORLD",
  countryKnown: true,
  sex: "b",
  ...DEFAULTS,
  touched: {},
  parentsMode: "both",
  which: "mother",
  motherAge: "",
  fatherAge: "",
  dreams: [], // curated id strings or { custom: "text" }
  move: "",
});

let lang = (navigator.language || "zh").toLowerCase().startsWith("zh") ? "zh" : "en";
let state = fresh();
let S = STRINGS[lang];
let data = null;
const seen = { grid: false, stats: false, card: false, climax: false };

/* ---------- helpers ---------- */
const countryName = (c) => (lang === "zh" ? c.zh : c.en);
const byCode = (code) => tables.countries.find((c) => c.code === code);
const norm = (v) => v.trim().toLowerCase();
const smooth = (t) => t * t * (3 - 2 * t);
// "|" in a string marks phrase boundaries: each phrase stays on one line where it fits.
function phr(el, text) {
  if (!text.includes("|")) { el.textContent = text; return; }
  el.textContent = "";
  text.split("|").forEach((part) => {
    const span = document.createElement("span");
    span.className = "ph";
    span.textContent = part;
    el.append(span);
  });
}

function resolveCountry(text) {
  const q = norm(text);
  if (!q) return { code: "WORLD", known: true };
  const hit = tables.countries.find((c) => norm(c.zh) === q || norm(c.en) === q || c.code.toLowerCase() === q);
  return hit ? { code: hit.code, known: true } : { code: "WORLD", known: false };
}

function inputForCalc() {
  const parents = [];
  if (state.parentsMode !== "none") {
    const who = state.parentsMode === "both" ? ["mother", "father"] : [state.which];
    who.forEach((w) => parents.push({ who: w, age: state[`${w}Age`] }));
  }
  return { ...state, parents };
}

function setCanvas(cv, w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  cv.style.width = `${w}px`;
  cv.style.height = `${h}px`;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
  }
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ---------- i18n ---------- */
function applyStrings() {
  S = STRINGS[lang];
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.title = S.docTitle;
  $$("[data-i18n]").forEach((el) => phr(el, S[el.dataset.i18n]));
  $$("[data-i18n-ph]").forEach((el) => { el.placeholder = S[el.dataset.i18nPh]; });
  $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", S[el.dataset.i18nAria]));
  syncMusicBtn();
  $("#countryList").innerHTML = tables.countries
    .filter((c) => c.code !== "WORLD")
    .map((c) => `<option value="${countryName(c)}"></option>`)
    .join("");
  if (state.countryKnown && state.country !== "WORLD") $("#country").value = countryName(byCode(state.country));
  $("#footSource").textContent = S.footSource(tables.meta);
  buildStats();
  buildChips();
}

/* ---------- scene 1: week grid (pinned, scrubbed by scroll) ---------- */
const grid = { cell: 0, rows: 0, ctx: null, w: 0, h: 0, cats: null, key: "", ticking: false };
const WK_STARTS = [0, 0.14, 0.34, 0.5, 0.64, 0.78, 0.9];
const C_FAINT = [38, 40, 52];
const C_LIVED = [84, 90, 120];
const C_WARM = [246, 185, 91];
const C_SLEEP = [44, 52, 104];
const C_WORK = [104, 84, 70];
const C_CHORE = [70, 62, 58];
const C_FREE = [255, 214, 140];
const mixc = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;

// Spread sleep / work / chores evenly across the remaining weeks (exact counts, fixed seed).
function buildCats(d) {
  const key = `${d.weeksLived}-${d.weeksTotal}-${d.sleepW}-${d.workW}-${d.choreW}`;
  if (grid.key === key) return;
  grid.key = key;
  const idx = [];
  for (let i = d.weeksLived; i < d.weeksTotal; i += 1) idx.push(i);
  let seed = 4200;
  for (let i = idx.length - 1; i > 0; i -= 1) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const j = Math.floor((seed / 4294967296) * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const sleep = idx.slice(0, d.sleepW);
  const rest = idx.slice(d.sleepW);
  const workEnd = Math.round(65 * 52.18);
  const work = [];
  const others = [];
  rest.forEach((i) => (work.length < d.workW && i < workEnd ? work : others).push(i));
  grid.cats = { sleep, work, chore: others.slice(0, d.choreW), free: others.slice(d.choreW) };
}

function layoutGrid() {
  const wrap = $("#gridWrap");
  const desktop = window.innerWidth >= 900;
  const availW = Math.min(wrap.parentElement.clientWidth, desktop ? 520 : 460);
  const availH = reduced() ? window.innerHeight * 0.6 : desktop ? window.innerHeight - 220 : window.innerHeight - $("#s1 .copy").offsetHeight - 170;
  grid.rows = Math.ceil(data.weeksTotal / 52);
  grid.cell = Math.max(2, Math.min(availW / 52, Math.max(200, availH) / grid.rows));
  grid.w = Math.floor(grid.cell * 52);
  grid.h = Math.ceil(grid.cell * grid.rows);
  grid.ctx = setCanvas($("#gridBase"), grid.w, grid.h);
}

function paintCells(ctx, list, color) {
  const { cell } = grid;
  const size = Math.max(1, cell * 0.72);
  const off = (cell - size) / 2;
  ctx.fillStyle = color;
  for (let k = 0; k < list.length; k += 1) {
    const i = list[k];
    ctx.fillRect((i % 52) * cell + off, Math.floor(i / 52) * cell + off, size, size);
  }
}

function paintRange(ctx, from, to, color) {
  const { cell } = grid;
  const size = Math.max(1, cell * 0.72);
  const off = (cell - size) / 2;
  ctx.fillStyle = color;
  for (let i = from; i < to; i += 1) ctx.fillRect((i % 52) * cell + off, Math.floor(i / 52) * cell + off, size, size);
}

function moveWeeks(force) {
  if (!data || !grid.ctx) return;
  const still = reduced();
  const rect = $("#s1").getBoundingClientRect();
  if (!force && !still && (rect.bottom < -50 || rect.top > window.innerHeight + 50)) return;
  const p = still ? 1 : clamp(-rect.top / Math.max(1, rect.height - window.innerHeight), 0, 1);
  const seg = (a, len) => smooth(clamp((p - a) / len, 0, 1));
  const livedT = seg(0.14, 0.17);
  const glowT = seg(0.34, 0.1);
  const d = data;
  const { ctx, cats } = grid;
  const shown = Math.round(d.weeksLived * livedT);
  ctx.clearRect(0, 0, grid.w, grid.h);
  ctx.globalAlpha = still ? 1 : 0.35 + 0.65 * seg(0, 0.08);
  paintRange(ctx, 0, shown, mixc(C_FAINT, C_LIVED, 1));
  paintRange(ctx, shown, d.weeksLived, mixc(C_FAINT, C_LIVED, 0));
  const warm = (to, t) => mixc(C_FAINT, [0, 1, 2].map((i) => C_WARM[i] + (to[i] - C_WARM[i]) * t), glowT);
  paintCells(ctx, cats.sleep, warm(C_SLEEP, seg(0.5, 0.1)));
  paintCells(ctx, cats.work, warm(C_WORK, seg(0.64, 0.1)));
  paintCells(ctx, cats.chore, warm(C_CHORE, seg(0.78, 0.08)));
  paintCells(ctx, cats.free, warm(C_FREE, seg(0.9, 0.08)));
  ctx.globalAlpha = 1;
  if (still) return;
  $("#wk1").textContent = S.wk1(shown);
  $$(".wk-step").forEach((el, i) => {
    const from = WK_STARTS[i];
    const to = WK_STARTS[i + 1] ?? 2;
    const o = clamp((p - from + 0.012) / 0.03, 0, 1) * clamp((to - 0.012 - p) / 0.03, 0, 1);
    el.style.opacity = i === 0 ? clamp((to - 0.012 - p) / 0.03, 0, 1) : o;
    el.style.transform = `translateY(${(1 - o) * (p < from + 0.02 ? 14 : -14)}px)`;
  });
  $$("#wkLegend li").forEach((el, i) => { el.style.opacity = seg(WK_STARTS[i + 3] + 0.02, 0.05); });
  $("#wkHint").style.opacity = clamp(1 - p / 0.05, 0, 1);
}

function renderWeeks() {
  const d = data;
  buildCats(d);
  layoutGrid();
  $("#wk0").textContent = S.wk0Sub(d);
  $("#wk1").textContent = S.wk1(d.weeksLived);
  $("#wk1Sub").textContent = S.wk1Sub(d);
  phr($("#wk3"), S.wk3(d));
  phr($("#wk4"), S.wk4(d));
  phr($("#wk5"), S.wk5(d));
  phr($("#wk6"), S.wk6(d));
  $("#wkLegend").innerHTML = [["sleep", S.lgSleep, d.sleepW], ["work", S.lgWork, d.workW], ["chore", S.lgChores, d.choreW], ["free", S.lgFree, d.freeW]]
    .map(([k, label, v]) => `<li class="lg-${k}"><i></i>${label} <span class="num">${S.lgWeeks(v)}</span></li>`)
    .join("");
  moveWeeks(true);
}

/* ---------- scene 2: stats ---------- */
function buildStats() {
  $("#stats").innerHTML = STAT_KEYS.map(
    (k) => `<article class="stat" data-k="${k}">
      <h3 class="stat-label"></h3>
      <p class="stat-val"><span class="about"></span><span class="stat-num num"></span><span class="unit"></span></p>
      <span class="tag" hidden></span>
      <button class="how" type="button" aria-expanded="false" aria-controls="f-${k}"><span aria-hidden="true">?</span></button>
      <p class="formula" id="f-${k}" hidden></p>
    </article>`,
  ).join("");
  $("#apBar").innerHTML = "<i></i>".repeat(20);
}

function statModel() {
  const d = data;
  return {
    eves: [S.cardEves, d.eves, S.unitTimes, S.fEves(d)],
    birthdays: [S.cardBirthdays, d.birthdays, S.unitTimes, S.fBirthdays(d)],
    mornings: [S.cardMornings, d.days, S.unitCount, S.fMornings(d)],
    weekends: [S.cardWeekends, d.weekends, S.unitCount, S.fWeekends(d)],
    moons: [S.cardMoons, d.moons, S.unitTimes, S.fMoons(d)],
    trips: [S.cardTrips, d.trips, S.unitTimes, S.fTrips(d, state.trips), "trips"],
    books: [S.cardBooks, d.books, S.unitBooks, S.fBooks(d, state.books), "books"],
    meetups: [S.cardMeetups, d.meetups, S.unitTimes, S.fMeetups(d, state.meetups), "meetups"],
  };
}

const counters = new Map();
function renderStats() {
  const model = statModel();
  $$(".stat").forEach((el) => {
    const [label, value, unit, formula, tuneKey] = model[el.dataset.k];
    $(".stat-label", el).textContent = label;
    $(".about", el).textContent = S.about;
    $(".unit", el).textContent = unit;
    $(".formula", el).textContent = formula;
    $(".how", el).setAttribute("aria-label", `${label}: ${S.how}`);
    const tag = $(".tag", el);
    tag.textContent = S.defaultTag;
    tag.hidden = !tuneKey || Boolean(state.touched[tuneKey]);
    cancelAnimationFrame(counters.get(el));
    $(".stat-num", el).textContent = fmt(value);
    el.dataset.value = value;
  });
  const left = 100 - data.progress;
  $("#apPct").textContent = `${left}%`;
  $("#apSr").textContent = `${S.apLabel} ${left}%`;
  $$("#apBar i").forEach((seg, i) => seg.classList.toggle("on", i < Math.round(left / 5)));
}

function countUp() {
  if (reduced()) return;
  $$(".stat").forEach((el, i) => {
    const target = Number(el.dataset.value);
    const out = $(".stat-num", el);
    const t0 = performance.now() + i * 90;
    const step = (now) => {
      const t = clamp((now - t0) / 1100, 0, 1);
      out.textContent = fmt(target * (1 - (1 - t) ** 4));
      if (t < 1) counters.set(el, requestAnimationFrame(step));
    };
    out.textContent = "0";
    counters.set(el, requestAnimationFrame(step));
  });
}

/* ---------- scene 3: tail end ---------- */
function drawBoxes(cv, count) {
  const prev = cv.dataset.n === undefined ? 0 : Number(cv.dataset.n);
  cv.dataset.n = count;
  cancelAnimationFrame(cv.raf);
  const w = cv.clientWidth || cv.parentElement.clientWidth;
  const h = cv.clientHeight || 132;
  const ctx = setCanvas(cv, w, h);
  cv.style.width = "";
  let c = 16;
  while (c > 1.5 && Math.floor(w / c) * Math.floor(h / c) < count) c -= 0.25;
  const cols = Math.max(1, Math.floor(w / c));
  const size = Math.max(1, c * 0.74);
  const kept = reduced() ? count : Math.min(prev, count);
  const t0 = performance.now();
  const paint = (now) => {
    const t = clamp((now - t0) / 320, 0, 1);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f6b95b";
    for (let i = 0; i < count; i += 1) {
      const fresh_ = i >= kept;
      ctx.globalAlpha = fresh_ ? t : 1;
      const s = fresh_ ? size * (0.5 + 0.5 * t) : size;
      const x = (i % cols) * c + (c - s) / 2;
      const y = Math.floor(i / cols) * c + (c - s) / 2;
      if (c >= 7 && ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, s, s, s * 0.22);
        ctx.fill();
      } else ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;
    if (t < 1 && kept < count) cv.raf = requestAnimationFrame(paint);
  };
  paint(kept < count ? t0 : t0 + 320);
}

function renderTail() {
  const mode = state.parentsMode;
  const none = mode === "none";
  phr($("#s3Title"), none ? S.s3TitleNone : S.s3Title);
  $("#whichField").hidden = mode !== "one";
  $("#agesRow").hidden = none;
  $("#noneBlock").hidden = !none;
  $("#visitsSlider").hidden = none;
  $("#friendsSlider").hidden = !none;
  $("#rowFriends").hidden = !none;
  const active = new Map(data.parents.map((p) => [p.who, p]));
  [["mother", "Mother"], ["father", "Father"]].forEach(([who, id]) => {
    const p = active.get(who);
    $(`#row${id}`).hidden = !p;
    $(`#${who}Field`).hidden = !p;
    if (!p) return;
    const name = S[who];
    phr($(`#line${id}`), S.visitsLine(name, p.visits));
    $(`#f${id}`).textContent = S.fVisits(state.visits, p);
    $(`#used${id}`).style.width = `${p.usedPct}%`;
    phr($(`#usedLine${id}`), S.usedLine(p.usedPct));
    const cv = $(`#box${id}`);
    cv.setAttribute("aria-label", S.visitsAlt(name, p.visits));
    drawBoxes(cv, p.visits);
  });
  if (none) {
    phr($("#lineFriends"), S.friendsLine(data.meetups));
    $("#fFriends").textContent = S.fMeetups(data, state.meetups);
    const cv = $("#boxFriends");
    cv.setAttribute("aria-label", S.friendsAlt(data.meetups));
    drawBoxes(cv, data.meetups);
  }
  $("#visitsOut").textContent = S.perYearTimes(state.visits);
  $("#visitsTag").hidden = Boolean(state.touched.visits);
  $("#meetups2Out").textContent = S.perYearTimes(state.meetups);
  $("#meetups2Tag").hidden = Boolean(state.touched.meetups);
}

/* ---------- scene 4: dreams ---------- */
const icon = (inner) => `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
const STAR = '<path d="M12 3l2.4 5.6 6.1.6-4.6 4 1.4 6-5.3-3.2-5.3 3.2 1.4-6-4.6-4 6.1-.6z"/>';
const esc = (v) => v.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
const dreamName = (d) => (lang === "zh" ? d.zh : d.en);

function buildChips() {
  $("#chips").innerHTML = CATS.map(
    ([cat, key]) => `<div class="chip-group"><h3>${S[key]}</h3><div class="chip-list">${DREAMS.filter((d) => d.cat === cat)
      .map((d) => `<button class="chip" type="button" data-id="${d.id}" aria-pressed="false">${icon(d.icon)}<span>${dreamName(d)}</span></button>`)
      .join("")}</div></div>`,
  ).join("");
}

function renderDreams() {
  const full = state.dreams.length >= 3;
  $$(".chip").forEach((el) => {
    const on = state.dreams.includes(el.dataset.id);
    el.setAttribute("aria-pressed", on);
    el.setAttribute("aria-disabled", full && !on);
  });
  $("#maxNote").hidden = !full;
  $("#customChips").innerHTML = state.dreams
    .map((entry, i) => (typeof entry === "string" ? "" : `<button class="chip" type="button" data-i="${i}" aria-pressed="true" aria-label="${S.remove}: ${esc(entry.custom)}">${icon(STAR)}<span>${esc(entry.custom)}</span><span aria-hidden="true">×</span></button>`))
    .join("");
}

/* ---------- scene 5: the road ahead ---------- */
const road = { ticking: false, lanterns: [], memories: [], tags: [], line: "", w: 0, h: 0, ctx: null };
const LEVELS = { plenty: "lvPlenty", soon: "lvSoon", now: "lvNow", care: "lvCare" };

function stagesFor(d) {
  return STAGES.filter((s) => s.from < d.L).map((s) => {
    const to = Math.min(s.to, Math.round(d.L));
    const status = d.a >= s.to ? "past" : d.a >= s.from ? "now" : "ahead";
    return { ...s, to, status, name: S[s.key] };
  });
}

/* Spread lantern positions so late "latest ages" don't pile up on one spot. */
function spreadLanterns(list, lo, hi) {
  const order = [...list].sort((x, y) => x.age - y.age);
  const gap = Math.min(4, order.length > 1 ? (hi - lo) / (order.length - 1) : 0);
  order.forEach((l, i) => { if (i) l.age = Math.max(l.age, order[i - 1].age + gap); });
  for (let i = order.length - 1; i >= 0; i--) {
    const cap = i === order.length - 1 ? hi : order[i + 1].age - gap;
    order[i].age = Math.min(order[i].age, cap);
  }
}

function renderRoad() {
  const d = data;
  road.lanterns = state.dreams.map((entry) => {
    const dream = typeof entry === "string" ? DREAMS.find((x) => x.id === entry) : null;
    const name = dream ? dreamName(dream) : entry.custom;
    const div = dream ? dreamDividend(dream.latestAge, d.a, d.L) : dividend(d.a, d.L);
    const age = clamp(dream ? dream.latestAge : d.a + 1, d.a + 1, Math.max(d.a + 1, d.L - 1));
    const level = dream ? S[LEVELS[dreamWindow(dream.latestAge, d.a).level]] : S.customTag;
    return { dream, name, div, age, level };
  });
  phr($("#roadHere"), S.here(d.a));
  $("#roadRows").innerHTML = road.lanterns.length
    ? road.lanterns
        .map(({ dream, name, div, level }) => {
          const later = div.laterAge === null
            ? `<p class="beam-label">${S.lvCare}</p>`
            : `<div class="beam later" style="--w:${div.now ? Math.max(0.02, div.later / div.now) : 0}"><i></i></div><p class="beam-label num">${S.beamLater(div.laterAge, div.later)}</p>`;
          return `<article class="beam-row">
            <div class="beam-head">${icon(dream ? dream.icon : STAR)}<h3>${esc(name)}</h3><span class="tag">${level}</span></div>
            <div class="beam now" style="--w:1"><i></i></div><p class="beam-label num warm-text">${S.beamNow(div.now)}</p>
            ${later}</article>`;
        })
        .join("")
    : `<p class="gentle" id="roadEmpty"></p>`;
  spreadLanterns(road.lanterns, d.a + 1, Math.max(d.a + 1, d.L - 1));
  if (!road.lanterns.length) phr($("#roadEmpty"), S.roadEmpty);
  $("#roadNote").hidden = !road.lanterns.some((l) => l.dream);
  road.memories = STAGES.filter((st) => st.from < d.a && Math.min(st.to, d.a) - st.from >= 1).map((st) => ({
    age: (st.from + Math.min(st.to, d.a)) / 2,
    text: S.mem[st.key],
  }));
  road.tagEls = null;
  road.measureKey = "";
  road.tags = [
    ...road.lanterns.map((l) => ({ age: l.age, kind: "lantern" })),
    ...road.memories.map((m) => ({ age: m.age, kind: "memory" })),
  ];
  $("#roadTags").innerHTML =
    road.lanterns
      .map(({ dream, name }) => {
        const step = dream && (lang === "zh" ? dream.stepZh : dream.stepEn);
        return `<p class="road-tag"><b>${esc(name)}</b>${dream ? `<span class="num">${S.lanternTag(dream.latestAge)}</span>` : ""}${step ? `<em>${S.firstStep(step)}</em>` : ""}</p>`;
      })
      .join("") + road.memories.map(() => `<p class="road-tag memory"><b></b></p>`).join("");
  $$(".road-tag.memory b").forEach((el, i) => phr(el, road.memories[i].text));
  road.line = "";
  const label = { past: S.stWalked, now: S.stNow, ahead: S.stAhead };
  $("#walkStatic").innerHTML = stagesFor(d)
    .map((s) => `<li class="${s.status}"><div><b>${s.name}</b> <span class="num">${S.stRange(s.from, s.to)}</span></div><em>${label[s.status]}</em></li>`)
    .join("");
  const sticky = $(".road-sticky");
  road.w = sticky.clientWidth;
  road.h = sticky.clientHeight;
  road.ctx = reduced() ? null : setCanvas($("#roadCanvas"), road.w, road.h);
  $("#roadCanvas").style.width = "";
  $("#roadCanvas").style.height = "";
  moveRoad(true);
}

// Scroll progress → walker age: walk the lived years, pause at "now", then walk ahead.
function moveRoad(force) {
  road.ticking = false;
  if (!data) return;
  const rows = $$(".beam-row");
  if (reduced() || !road.ctx) {
    rows.forEach((el) => { el.style.setProperty("--h", 1); el.style.opacity = 1; });
    return;
  }
  const rect = $("#s5").getBoundingClientRect();
  const span = rect.height - window.innerHeight;
  if (!force && (rect.bottom < -50 || rect.top > window.innerHeight + 50)) return;
  const p = clamp(-rect.top / Math.max(1, span), 0, 1);
  const d = data;
  /* walk at one steady pace: scroll share per year is the same before and after "now" */
  const HOLD = 0.22;
  const walk = 1 - HOLD - 0.04;
  const A = 0.02 + clamp(walk * (d.a / d.L), 0.12, walk - 0.12);
  const B = A + HOLD;
  const age = p < 0.02 ? 0 : p < A ? d.a * ((p - 0.02) / (A - 0.02)) : p < B ? d.a : d.a + (d.L - d.a) * clamp((p - B) / (1 - 0.02 - B), 0, 1);
  const hold = clamp((p - A) / (B - A), 0, 1);
  const lit = p < A ? 0 : smooth(clamp(hold * 4, 0, 1));
  const lamp = p < A ? 0 : smooth(clamp(hold * 6, 0, 1));
  drawRoad(road.ctx, road.w, road.h, { age, a: d.a, L: d.L, lit, lamp, lanterns: road.lanterns.map((l) => l.age), memories: road.memories.map((m) => m.age), gates: STAGES.map((st) => st.from).filter((v) => v < d.L) });

  const panel = clamp((p - A) / 0.03, 0, 1) * clamp((B + 0.02 - p) / 0.04, 0, 1);
  $("#s5Title").style.opacity = clamp(1 - p / 0.06, 0, 1);
  const hud = $("#roadHud");
  hud.style.opacity = clamp((p - 0.05) / 0.04, 0, 1) * (1 - panel);
  const stage = STAGES.find((s) => age < s.to) ?? STAGES[STAGES.length - 1];
  $("#roadStage").textContent = S[stage.key];
  $("#roadAge").textContent = S.roadAge(Math.round(age));
  const line = p > B ? S.ahead[stage.key] : "";
  if (line !== road.line) {
    road.line = line;
    phr($("#roadLine"), line);
  }
  const now = $("#roadNow");
  now.style.opacity = panel;
  now.style.visibility = panel > 0.01 ? "visible" : "hidden";
  rows.forEach((el, i) => {
    const h = smooth(clamp(hold * 2.6 - 0.35 - i * 0.35, 0, 1));
    el.style.setProperty("--h", h);
    el.style.opacity = h;
  });
  const empty = $("#roadEmpty");
  if (empty) empty.style.opacity = smooth(clamp(hold * 2.6 - 0.35, 0, 1));
  const ppy = pxPerYear(road.w);
  const wx = walkerX(road.w);
  const gy = groundY(road.h, road.w);
  const kk = clamp(road.h / 844, 0.85, 1.2);
  const els = road.tagEls || (road.tagEls = $$(".road-tag"));
  if (road.measureKey !== `${road.w}${lang}`) {
    road.measureKey = `${road.w}${lang}`;
    road.tags.forEach((tag, i) => { tag.bw = els[i].offsetWidth; tag.bh = els[i].offsetHeight; });
  }
  const pos = road.tags.map((tag, i) => {
    const el = els[i];
    const x = wx + (tag.age - age) * ppy;
    const half = tag.bw / 2 + 12;
    return { el, tag, x, half, cx: clamp(x, half, road.w - half), memory: tag.kind === "memory", lift: 0 };
  });
  /* stack overlapping lantern tags onto separate rows (uses the clamped on-screen x) */
  const rowEnds = [];
  const rowH = [];
  pos.filter((q) => !q.memory).sort((u, v) => u.cx - v.cx).forEach((q) => {
    let k = rowEnds.findIndex((end) => end <= q.cx - q.half);
    if (k < 0) { k = rowEnds.length; rowEnds.push(-Infinity); rowH.push(0); }
    rowEnds[k] = q.cx + q.half;
    rowH[k] = Math.max(rowH[k], q.tag.bh + 8);
    q.row = k;
  });
  pos.forEach((q) => {
    if (q.memory) return;
    q.lift = rowH.slice(0, q.row).reduce((sum, v) => sum + v, 0);
  });
  pos.forEach(({ el, x, cx, memory, lift }) => {
    const near = 1 - clamp(Math.abs(x - wx) / (road.w * 0.55), 0, 1);
    el.style.transform = `translate3d(${cx}px,${gy - (memory ? 112 : 84) * kk - lift}px,0) translate(-50%,-100%)`;
    el.style.opacity = (memory ? smooth(near) * (p < A ? 1 : 0) : clamp(Math.min(x, road.w - x) / 90, 0, 1) * (p > B ? 1 : 0)) * (1 - panel);
  });
}

/* ---------- scene 6: card ---------- */
let cardJob = 0;
function cardModel() {
  const d = data;
  const first = state.dreams[0];
  const dream = first ? (typeof first === "string" ? dreamName(DREAMS.find((x) => x.id === first)) : first.custom) : "";
  const people = d.parents.length
    ? { label: S.cParents, value: d.parents.length === 2 ? d.parents.map((p) => `${S[p.who]} ${fmt(p.visits)}`).join(" · ") : fmt(d.parents[0].visits) }
    : { label: S.cFriends, value: fmt(d.meetups) };
  return {
    lang,
    S,
    progress: d.progress,
    days: fmt(d.days),
    trips: fmt(d.trips),
    people,
    dream,
    move: state.move.trim(),
  };
}

async function refreshCard() {
  if (!data) return;
  const job = ++cardJob;
  const model = cardModel();
  await cardFonts(model);
  if (job === cardJob) drawCard($("#card"), model);
}

const cardBlob = async () => {
  await refreshCard();
  return new Promise((resolve) => $("#card").toBlob(resolve, "image/png"));
};

function download(blob) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: "life-points.png" });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------- render ---------- */
function render() {
  if (!state.started) return;
  data = compute(inputForCalc(), tables);
  const d = data;
  const sexWord = S[{ f: "sexWordF", m: "sexWordM", b: "sexWordB" }[state.sex]];
  const cName = countryName(d.country);
  $("#s1Left").textContent = S.s1Left(d);
  $("#s1Note").textContent = lang === "zh" ? S.s1Note(d, cName, sexWord ? `${sexWord}` : "") : S.s1Note(d, cName === "World" ? "the world" : THE.has(d.country.code) ? `the ${cName}` : cName, sexWord);
  $("#gridWrap").setAttribute("aria-label", S.s1Alt(d));
  renderWeeks();
  renderStats();
  renderTail();
  renderDreams();
  renderRoad();
  phr($("#climax1"), S.climax1(d));
  ["trips", "books", "meetups"].forEach((k) => {
    $(`#${k}`).value = state[k];
    $(`#${k}Out`).textContent = (k === "books" ? S.perYearBooks : S.perYearTimes)(state[k]);
  });
  $("#meetups2").value = state.meetups;
  $("#visits").value = VISIT_STEPS.indexOf(state.visits);
  if (seen.card) refreshCard();
}

/* ---------- events ---------- */
function start(e) {
  e.preventDefault();
  const ageEl = $("#age");
  if (ageEl.value.trim() === "" || !Number.isFinite(Number(ageEl.value))) {
    ageEl.setAttribute("aria-invalid", "true");
    ageEl.focus();
    return;
  }
  if (musicPref() && !music.on) setMusic(true, false);
  ageEl.removeAttribute("aria-invalid");
  state.age = clampAge(ageEl.value);
  ageEl.value = state.age;
  if (state.motherAge === "") state.motherAge = clampAge(state.age + 28, 18, 110);
  if (state.fatherAge === "") state.fatherAge = clampAge(state.age + 30, 18, 110);
  $("#motherAge").value = state.motherAge;
  $("#fatherAge").value = state.fatherAge;
  state.started = true;
  $("#journey").hidden = false;
  render();
  $("#s1").scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
}

function bind() {
  $("#startForm").addEventListener("submit", start);
  $("#age").addEventListener("input", (e) => {
    if (!state.started || e.target.value === "") return;
    state.age = clampAge(e.target.value);
    render();
  });
  $("#age").addEventListener("blur", (e) => { if (e.target.value !== "") e.target.value = clampAge(e.target.value); });
  $("#country").addEventListener("input", (e) => {
    const r = resolveCountry(e.target.value);
    state.country = r.code;
    state.countryKnown = r.known;
    $("#countryNote").hidden = r.known;
    render();
  });
  $("#sexSeg").addEventListener("change", (e) => { state.sex = e.target.value; render(); });
  $("#musicBtn").addEventListener("click", () => setMusic(!music.on, true));
  document.addEventListener("visibilitychange", () => music.pause(document.hidden));
  $("#langBtn").addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    applyStrings();
    render();
  });

  $("#stats").addEventListener("click", (e) => {
    const btn = e.target.closest(".how");
    if (!btn) return;
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", open);
    $(`#${btn.getAttribute("aria-controls")}`).hidden = !open;
  });
  const sheet = $("#tune");
  $("#tuneBtn").addEventListener("click", () => sheet.showModal());
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
  ["trips", "books", "meetups"].forEach((k) => {
    $(`#${k}`).addEventListener("input", (e) => {
      state[k] = Number(e.target.value);
      state.touched[k] = true;
      render();
    });
  });
  $("#meetups2").addEventListener("input", (e) => {
    state.meetups = Number(e.target.value);
    state.touched.meetups = true;
    render();
  });
  $("#visits").addEventListener("input", (e) => {
    state.visits = VISIT_STEPS[Number(e.target.value)];
    state.touched.visits = true;
    render();
  });
  $("#parentsSeg").addEventListener("change", (e) => { state.parentsMode = e.target.value; render(); });
  $("#whichSeg").addEventListener("change", (e) => { state.which = e.target.value; render(); });
  ["mother", "father"].forEach((w) => {
    const el = $(`#${w}Age`);
    el.addEventListener("input", () => {
      if (el.value === "") return;
      state[`${w}Age`] = clampAge(el.value, 18, 110);
      render();
    });
    el.addEventListener("blur", () => { el.value = state[`${w}Age`]; });
  });

  $("#chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const { id } = chip.dataset;
    if (state.dreams.includes(id)) state.dreams = state.dreams.filter((x) => x !== id);
    else if (state.dreams.length < 3) state.dreams = [...state.dreams, id];
    render();
  });
  $("#customChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.dreams = state.dreams.filter((_, i) => i !== Number(chip.dataset.i));
    render();
  });
  $("#customForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("#customDream").value.trim();
    if (!text || state.dreams.length >= 3) return;
    state.dreams = [...state.dreams, { custom: text }];
    $("#customDream").value = "";
    render();
  });

  $("#move").addEventListener("input", (e) => {
    state.move = e.target.value;
    if (seen.card) refreshCard();
  });
  $("#saveBtn").addEventListener("click", async () => download(await cardBlob()));
  $("#shareBtn").addEventListener("click", async () => {
    const blob = await cardBlob();
    const file = new File([blob], "life-points.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Life Points", text: S.shareText });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
    download(blob);
    $("#shareNote").hidden = false;
  });
  $("#restartBtn").addEventListener("click", () => {
    state = fresh();
    data = null;
    Object.keys(seen).forEach((k) => { seen[k] = false; });
    $("#startForm").reset();
    $("#move").value = "";
    $("#countryNote").hidden = true;
    $("#shareNote").hidden = true;
    $("#parentsSeg input[value=both]").checked = true;
    $("#whichSeg input[value=mother]").checked = true;
    $$(".cl").forEach((el) => el.classList.remove("on"));
    $$("#journey .reveal").forEach((el) => el.classList.remove("in"));
    $$(".boxes").forEach((cv) => delete cv.dataset.n);
    $("#journey").hidden = true;
    prefillCountry();
    window.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
    observe();
  });

  window.addEventListener("scroll", () => {
    if (road.ticking) return;
    road.ticking = true;
    requestAnimationFrame(() => {
      moveRoad(false);
      moveWeeks(false);
      moveCave();
    });
  }, { passive: true });
  let lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastW) return; // ignore mobile URL-bar height changes
    lastW = window.innerWidth;
    render();
    moveCave();
  });
  reduceQuery.addEventListener("change", render);
}

/* ---------- the cave: the whole page walks out of it ---------- */
const CAVE = [[13, 15, 1.02, 11], [27, 30, 1.25, 23], [43, 46, 1.6, 37]]; // [rx, ry, speed, seed], far → near

function buildCave() {
  $$(".cave-rock path").forEach((el, i) => {
    const [rx, ry, , seed0] = CAVE[i];
    let seed = seed0;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
    const pts = Array.from({ length: 30 }, (_, n) => {
      const ang = (n / 30) * Math.PI * 2;
      const r = 0.82 + rnd() * 0.36;
      return `${(50 + Math.cos(ang) * rx * r).toFixed(2)} ${(50 + Math.sin(ang) * ry * r).toFixed(2)}`;
    });
    el.setAttribute("d", `M-900-900H1000V1000H-900Z M${pts.join("L")}Z`);
  });
}

let caveKey = "";
function moveCave() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const g = state.started && max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
  const key = `${g.toFixed(4)}${reduced()}`;
  if (key === caveKey) return;
  caveKey = key;
  $("#progressBar").style.transform = `scaleX(${g})`;
  const still = reduced();
  $$(".cave-rock").forEach((el, i) => {
    const scale = Math.min(10, 1 / Math.max(0.04, 1 - g * CAVE[i][2]));
    const op = still ? clamp(1 - g * CAVE[i][2], 0, 1) : clamp((10 - scale) / 5, 0, 1);
    el.style.visibility = op < 0.01 ? "hidden" : "visible";
    if (op < 0.01) return;
    el.style.transform = still ? "none" : `translate3d(0,0,0) scale(${scale})`;
    el.style.opacity = op;
  });
  $("#caveSky").style.opacity = clamp(g * g * 0.8, 0, 0.8);
  music.light(g);
  $("#caveLight").style.opacity = 1 - g * 0.5;
}

/* ---------- reveal on scroll ---------- */
let io;
let io2;
let io3;
function observe() {
  io?.disconnect();
  io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      if (el.id === "stats" && !seen.stats) { seen.stats = true; countUp(); }
      if (el.classList.contains("reveal")) io.unobserve(el);
    });
  }, { threshold: 0.25 });
  $$(".reveal").forEach((el) => io.observe(el));
  io3?.disconnect();
  io3 = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting || seen.card) return;
    seen.card = true;
    (window.requestIdleCallback || ((f) => setTimeout(f, 200)))(() => refreshCard());
  }, { rootMargin: "0px 0px 1800px 0px" });
  io3.observe($("#s6"));
  io2?.disconnect();
  io2 = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting || seen.climax) return;
    seen.climax = true;
    const [a, b, c] = $$(".cl");
    a.classList.add("on");
    setTimeout(() => b.classList.add("on"), 2200);
    setTimeout(() => c.classList.add("on"), 3600);
  }, { threshold: 0.6 });
  io2.observe($("#climax"));
}

function prefillCountry() {
  const region = (navigator.language || "").split("-")[1]?.toUpperCase();
  const hit = region && byCode(region);
  if (hit) {
    state.country = hit.code;
    $("#country").value = countryName(hit);
  }
}

prefillCountry();
buildCave();
applyStrings();
bind();
observe();
