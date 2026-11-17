// Life Points — one continuous scroll. No dependencies, no network calls with user input.
import tables from "./data/life-tables.json";
import { DREAMS } from "./data/dreams.js";
import { STRINGS, fmt } from "./strings.js";
import { compute, dividend, dreamDividend, dreamWindow, clampAge, clamp, DEFAULTS } from "./calc.js";
import { drawRoad, pxPerYear, walkerX, groundY } from "./road.js";
import { drawCard, cardFonts } from "./card.js";

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
const STAT_KEYS = ["eves", "birthdays", "mornings", "trips", "books", "meetups"];

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
  $("#countryList").innerHTML = tables.countries
    .filter((c) => c.code !== "WORLD")
    .map((c) => `<option value="${countryName(c)}"></option>`)
    .join("");
  if (state.countryKnown && state.country !== "WORLD") $("#country").value = countryName(byCode(state.country));
  $("#footSource").textContent = S.footSource(tables.meta);
  buildStats();
  buildChips();
}

/* ---------- scene 1: week grid ---------- */
const grid = { cell: 0, rows: 0, raf: 0 };

function layoutGrid() {
  const wrap = $("#gridWrap");
  const avail = Math.min(wrap.parentElement.clientWidth, 520);
  grid.rows = Math.ceil(data.weeksTotal / 52);
  const maxH = clamp(window.innerHeight * (window.innerWidth < 900 ? 0.45 : 0.62), 280, 640);
  grid.cell = Math.max(2, Math.min(avail / 52, maxH / grid.rows));
  const w = Math.floor(grid.cell * 52);
  const h = Math.ceil(grid.cell * grid.rows);
  return [setCanvas($("#gridBase"), w, h), setCanvas($("#gridGlow"), w, h), w, h];
}

function paintCells(ctx, from, to, color) {
  const { cell } = grid;
  const size = Math.max(1, cell * 0.72);
  const off = (cell - size) / 2;
  ctx.fillStyle = color;
  for (let i = from; i < to; i += 1) {
    ctx.fillRect((i % 52) * cell + off, Math.floor(i / 52) * cell + off, size, size);
  }
}

function drawGrid(animate) {
  cancelAnimationFrame(grid.raf);
  const [base, glow, w, h] = layoutGrid();
  const { weeksLived: lived, weeksTotal: total } = data;
  const glowEl = $("#gridGlow");
  glow.clearRect(0, 0, w, h);
  paintCells(glow, lived, total, "#f6b95b");
  const frame = (shown) => {
    base.clearRect(0, 0, w, h);
    paintCells(base, 0, shown, "#4d526d");
    paintCells(base, shown, total, "rgba(255,255,255,0.07)");
  };
  if (!animate || reduced()) {
    frame(lived);
    glowEl.classList.add("on");
    return;
  }
  glowEl.classList.remove("on");
  const t0 = performance.now();
  const dur = 1500;
  const step = (now) => {
    const t = clamp((now - t0) / dur, 0, 1);
    frame(Math.round(lived * (1 - (1 - t) ** 3)));
    if (t < 1) grid.raf = requestAnimationFrame(step);
    else glowEl.classList.add("on");
  };
  grid.raf = requestAnimationFrame(step);
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
const road = { ticking: false, lanterns: [], w: 0, h: 0, ctx: null };
const LEVELS = { plenty: "lvPlenty", soon: "lvSoon", now: "lvNow", care: "lvCare" };
const smooth = (t) => t * t * (3 - 2 * t);

function stagesFor(d) {
  return STAGES.filter((s) => s.from < d.L).map((s) => {
    const to = Math.min(s.to, Math.round(d.L));
    const status = d.a >= s.to ? "past" : d.a >= s.from ? "now" : "ahead";
    return { ...s, to, status, name: S[s.key] };
  });
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
  if (!road.lanterns.length) phr($("#roadEmpty"), S.roadEmpty);
  $("#roadNote").hidden = !road.lanterns.some((l) => l.dream);
  $("#roadTags").innerHTML = road.lanterns
    .map(({ dream, name }) => `<p class="road-tag"><b>${esc(name)}</b>${dream ? `<span class="num">${S.lanternTag(dream.latestAge)}</span>` : ""}</p>`)
    .join("");
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
  const A = 0.2;
  const B = 0.46;
  const age = p < A ? d.a * smooth(p / A) : p < B ? d.a : d.a + (d.L - d.a) * ((p - B) / (1 - B));
  const hold = clamp((p - A) / (B - A), 0, 1);
  const lit = p < A ? 0 : smooth(clamp(hold * 4, 0, 1));
  drawRoad(road.ctx, road.w, road.h, { age, a: d.a, L: d.L, lit, lanterns: road.lanterns.map((l) => l.age) });

  const panel = clamp((p - A) / 0.03, 0, 1) * clamp((B + 0.02 - p) / 0.04, 0, 1);
  $("#s5Title").style.opacity = clamp(1 - p / 0.06, 0, 1);
  const hud = $("#roadHud");
  hud.style.opacity = clamp((p - 0.05) / 0.04, 0, 1) * (1 - panel);
  const stage = STAGES.find((s) => age < s.to) ?? STAGES[STAGES.length - 1];
  $("#roadStage").textContent = S[stage.key];
  $("#roadAge").textContent = S.roadAge(Math.round(age));
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
  $$(".road-tag").forEach((el, i) => {
    const x = wx + (road.lanterns[i].age - age) * ppy;
    const edge = Math.min(x, road.w - x);
    el.style.transform = `translate3d(${x}px,${gy - 82 * clamp(road.h / 844, 0.85, 1.2)}px,0) translate(-50%,-100%)`;
    el.style.opacity = clamp(edge / 90, 0, 1) * (1 - panel) * (p > B ? 1 : 0);
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
  $("#s1Copy").textContent = S.s1Copy(d);
  $("#s1Left").textContent = S.s1Left(d);
  $("#s1Note").textContent = lang === "zh" ? S.s1Note(d, cName, sexWord ? `${sexWord}` : "") : S.s1Note(d, cName === "World" ? "the world" : THE.has(d.country.code) ? `the ${cName}` : cName, sexWord);
  $("#gridWrap").setAttribute("aria-label", S.s1Alt(d));
  drawGrid(false);
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
  seen.grid = false;
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
    requestAnimationFrame(() => moveRoad(false));
  }, { passive: true });
  let lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === lastW) return; // ignore mobile URL-bar height changes
    lastW = window.innerWidth;
    render();
  });
  reduceQuery.addEventListener("change", render);
}

/* ---------- reveal on scroll ---------- */
let io;
let io2;
function observe() {
  io?.disconnect();
  io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      if (el.id === "gridWrap" && !seen.grid) { seen.grid = true; drawGrid(true); }
      if (el.id === "stats" && !seen.stats) { seen.stats = true; countUp(); }
      if (el.id === "s6" && !seen.card) { seen.card = true; refreshCard(); }
      if (el.classList.contains("reveal")) io.unobserve(el);
    });
  }, { threshold: 0.25 });
  $$(".reveal, #s6").forEach((el) => io.observe(el));
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
applyStrings();
bind();
observe();
