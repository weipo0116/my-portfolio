// Life Points — every number on screen comes from this file.
// Source table: UN WPP 2024 remaining life expectancy e(x); see data/life-tables.json.

export const WEEKS_PER_YEAR = 52.18;
export const DAYS_PER_YEAR = 365.25;
export const TRAVEL_UNTIL = 80;
export const DEFAULTS = { trips: 1, books: 5, meetups: 12, visits: 4 };

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const clampAge = (v, lo = 1, hi = 110) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? clamp(n, lo, hi) : lo;
};

// Linear interpolation over the abridged table; ages past the last row use the last row.
export function ex(values, ages, age) {
  const last = ages.length - 1;
  if (age >= ages[last]) return values[last];
  if (age <= ages[0]) return values[0];
  for (let i = 0; i < last; i += 1) {
    if (age <= ages[i + 1]) {
      const t = (age - ages[i]) / (ages[i + 1] - ages[i]);
      return values[i] + t * (values[i + 1] - values[i]);
    }
  }
  return values[last];
}

export function findCountry(tables, code) {
  return tables.countries.find((c) => c.code === code) ?? tables.countries.find((c) => c.code === "WORLD");
}

// sex: "f" | "m" | "b" (prefer not to say → both-sexes table)
export function compute(input, tables) {
  const { ages } = tables.meta;
  const country = findCountry(tables, input.country);
  const a = clampAge(input.age);
  const R = Math.max(0.1, ex(country[input.sex] ?? country.b, ages, a));
  const L = a + R;

  const weeksLived = Math.round(a * WEEKS_PER_YEAR);
  const weeksTotal = Math.max(weeksLived + 1, Math.round(L * WEEKS_PER_YEAR));
  const travelYears = Math.min(R, Math.max(0, TRAVEL_UNTIL - a));
  const eves = Math.floor(R);

  const parents = (input.parents ?? []).map((p) => {
    const age = clampAge(p.age, 18, 110);
    const Rp = Math.max(0.1, ex(country[p.who === "mother" ? "f" : "m"], ages, age));
    const years = Math.min(R, Rp);
    return { who: p.who, age, Rp, years, visits: Math.floor(input.visits * years) };
  });

  return {
    country,
    a,
    R,
    L,
    weeksLived,
    weeksTotal,
    weeksLeft: weeksTotal - weeksLived,
    progress: clamp(Math.round((a / L) * 100), 0, 99),
    days: Math.round(R * DAYS_PER_YEAR),
    eves,
    birthdays: eves,
    travelYears,
    trips: Math.round(input.trips * travelYears),
    books: Math.round(input.books * R),
    meetups: Math.round(input.meetups * R),
    parents,
  };
}

// Memory Dividend: years you carry a memory if the dream is done at age x.
export function dividend(a, L) {
  const laterAge = a >= 70 ? a + 10 : 70;
  return {
    now: Math.max(0, Math.round(L - a)),
    laterAge,
    later: Math.max(0, Math.round(L - laterAge)),
  };
}

// Dream window: "plenty" | "soon" | "now" | "care" (never "too late").
export function dreamWindow(latestAge, a) {
  const left = latestAge - a;
  if (left >= 15) return { left, level: "plenty" };
  if (left >= 5) return { left, level: "soon" };
  if (left > 0) return { left, level: "now" };
  return { left: 0, level: "care" };
}

// Per-dream dividend: "this year" vs "at its recommended latest age".
// Falls back to the generic comparison when that age is past or beyond the expected lifespan.
export function dreamDividend(latestAge, a, L) {
  const base = dividend(a, L);
  if (latestAge <= a) return { now: base.now, laterAge: null, later: null };
  if (latestAge >= L - 2) return base;
  return { now: base.now, laterAge: latestAge, later: Math.max(0, Math.round(L - latestAge)) };
}
