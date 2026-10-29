# Weekend Where: refreshing the events

The events on `lab/weekend/` come from `public/lab/weekend/events.json`.
Nothing updates it automatically: the Taipei travel open API sits behind a bot
check, so it can only be read from a normal browser session.

## Refresh

1. Open <https://www.travel.taipei/zh-tw/event-calendar> in a normal browser.
2. In the browser console, run the snippet below. It prints a JSON string.
3. Save that JSON as `scripts/data/travel-taipei-raw.json` (replace the file).
4. Run `npm run events`.
5. Check new events in `scripts/data/weekend-events.curation.json` (see below),
   re-run, then `npm run build` and deploy.

```js
const H = { headers: { Accept: "application/json" } };
const get = (u) => fetch("/open-api/zh-tw/" + u, H).then((r) => (r.status === 204 ? { data: [] } : r.json()));
const row = (x, kind) => ({
  id: x.id, kind, title: x.title.trim(),
  begin: x.begin.slice(0, 10), beginTime: x.begin.slice(11, 16),
  end: x.end.slice(0, 10), endTime: x.end.slice(11, 16),
  lat: x.nlat || "", lng: x.elong || "", url: x.url,
});
const items = [];
for (const [path, kind] of [["Events/Calendar", "calendar"], ["Events/Activity", "activity"]]) {
  for (let page = 1; page <= 5; page++) {
    const { data = [] } = await get(`${path}?page=${page}`);
    data.forEach((x) => items.push(row(x, kind)));
    if (data.length < 30) break;
  }
}
JSON.stringify({
  fetchedAt: new Date().toISOString(),
  source: "https://www.travel.taipei/open-api/zh-tw/Events/{Calendar,Activity}",
  items,
}, null, 1);
```

Do not pass `begin` / `end` / `categoryId`: they do not filter as documented
(date filters returned nothing, category filters returned the same rows).

## Curation

`scripts/data/weekend-events.curation.json`:

- `byId[<api id>]`: `s` (station id from the map), `place`, `note`, `tm`, `tag`,
  `c` (`urban` / `sport` / `both`), `k` (`ev` / `ex`), `t` (shorter title).
  Only set `s` when you are sure; without it the event is listed but not pinned.
- `skip`: API ids to leave out.
- `extra`: events that are not in the API (news, organisers). Each needs a
  `src` link.

Notes are written in our own words; do not paste text from the source pages.
New API events with no curation still appear, with defaults inferred from the title.
