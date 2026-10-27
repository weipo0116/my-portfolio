# assets

Only web-ready files live here; everything in this folder can be imported by the site.

- `fonts/` — LINE Seed (Latin full, TW subset). Rebuild with `scripts/subset-fonts.py`.
- `images/profile/` — portraits, graduation photo, links avatar
- `images/projects/` — project thumbnails (Work page)
- `images/others/` — "Other experiences" cards
- `images/backgrounds/` — faint backdrops (home hero, Work header, First Bank card)
- `logos/` — company / school marks for the experience cards

Full-size originals go in `/source-images/` (not imported, not shipped). Export new
images to `.webp` (≈1400px long edge, quality ~80) before adding them here, and strip
location metadata from phone photos.
