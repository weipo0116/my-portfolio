// Builds public/lab/weekend/events.json for the Weekend Where page.
//
//   node scripts/build-weekend-events.mjs
//
// Inputs (see scripts/weekend-events.md for how to refresh them):
//   scripts/data/travel-taipei-raw.json          raw rows from the Taipei travel open API
//   scripts/data/weekend-events.curation.json    hand-written station / place / note per event id
// Output:
//   public/lab/weekend/events.json               what the page loads at runtime
//
// The API sits behind a bot check, so this script never calls it. Rows are saved from a
// normal browser session (steps in the doc) and only processed here.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(resolve(root, p), "utf8"));

const raw = read("scripts/data/travel-taipei-raw.json");
const curation = read("scripts/data/weekend-events.curation.json");
const skip = new Set(curation.skip ?? []);

const SPORT = /馬拉松|路跑|單車|登山|健行|龍舟|運動|賽/;
const EXHIBIT = /展|個展/;
const TAGS = [
  [/夜市/, "夜市"],
  [/音樂|演唱|爵士/, "音樂"],
  [/耶誕|聖誕|跨年|新年/, "節慶"],
  [/遶境|廟|宮/, "廟會"],
  [/菊展|花展|花季|玫瑰|杜鵑/, "花展"],
  [/講座|研討/, "講座"],
];

const pickTag = (title, kind, c) => {
  if (c === "sport") return "運動賽事";
  if (kind === "ex") return "展覽";
  return TAGS.find(([re]) => re.test(title))?.[1] ?? "活動";
};

const defaultTime = (row) => {
  if (row.kind !== "calendar") return "";
  const parts = [];
  if (row.beginTime !== "00:00") parts.push(`${row.beginTime} 起`);
  if (row.endTime !== "23:59" && row.endTime !== "00:00") parts.push(`到 ${row.endTime}`);
  return parts.join("，");
};

const fromApi = (row) => {
  const cur = curation.byId?.[String(row.id)] ?? {};
  const title = (cur.t ?? row.title).trim();
  const k = cur.k ?? (row.kind === "activity" && EXHIBIT.test(row.title) ? "ex" : "ev");
  const c = cur.c ?? (SPORT.test(row.title) ? "sport" : "urban");
  return {
    id: String(row.id),
    t: title,
    tag: cur.tag ?? pickTag(row.title, k, c),
    k,
    c,
    s: cur.s ?? null,
    slots: cur.slots ?? (k === "ex" ? "ap" : row.beginTime >= "14:00" ? "pn" : "apn"),
    from: row.begin,
    to: row.end,
    tm: cur.tm ?? defaultTime(row),
    place: cur.place ?? "",
    note: cur.note ?? "",
    src: row.url,
    srcn: "臺北旅遊網",
  };
};

const fromExtra = (e) => ({
  id: e.id,
  t: e.t,
  tag: e.tag,
  k: e.k ?? "ev",
  c: e.c ?? "urban",
  s: e.s ?? null,
  slots: e.slots ?? "apn",
  from: e.from,
  to: e.to,
  tm: e.tm ?? "",
  place: e.place ?? "",
  note: e.note ?? "",
  src: e.src,
  srcn: e.srcn,
});

const items = [
  ...raw.items.filter((row) => !skip.has(row.id)).map(fromApi),
  ...(curation.extra ?? []).map(fromExtra),
];

const byId = new Map();
for (const item of items) byId.set(item.id, item);

const out = {
  asOf: raw.fetchedAt.slice(0, 10),
  source: raw.source,
  items: [...byId.values()].sort((a, b) => a.from.localeCompare(b.from) || a.t.localeCompare(b.t)),
};

const target = resolve(root, "public/lab/weekend/events.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(out, null, 1)}\n`);

const unpinned = out.items.filter((e) => !e.s).length;
console.log(`events.json: ${out.items.length} events (asOf ${out.asOf}), ${unpinned} without a map pin`);
