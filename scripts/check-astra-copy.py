"""Check the Astra copy: natal-read.json and the LUCK_* tables in main.js. Run: python3 scripts/check-astra-copy.py"""
import json, re, subprocess, sys, collections

REPO = __import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "src", "lab", "astro")
BAN = ["今天", "明天", "昨天", "今日", "明日", "一定", "相位", "合相", "保證"]
BAN_NATAL = BAN + ["宮"]
problems = []
def bad(msg): problems.append(msg)
def cn(s): return len(s)

# ---------- natal-read.json ----------
d = json.load(open(f"{REPO}/natal-read.json"))

RANGE = {"sign": (26, 44), "where": (16, 34), "tip": (14, 26), "outer": (12, 24)}
old, new = [], []   # (kind, label, text)
for k, v in d.items():
    for field in ("bySign", "byHouse"):
        if field not in v: continue
        if len(v[field]) != 12: bad(f"{k}.{field} length")
        for i, cell in enumerate(v[field]):
            if not isinstance(cell, list) or len(cell) < 2: bad(f"{k}.{field}[{i}] has no alternate"); continue
            for j, item in enumerate(cell):
                rows = [("sign" if field == "bySign" else "outer", item)] if isinstance(item, str) else [("where", item["where"]), ("tip", item["tip"])]
                for kind, text in rows:
                    (old if j == 0 else new).append((kind, f"{k}.{field}[{i}][{j}].{kind}", text))
for kind, label, text in new:
    lo, hi = RANGE[kind]
    if not lo <= cn(text) <= hi: bad(f"length {cn(text)} not in {lo}-{hi}: {label} {text}")
    if not text.endswith("。") or text.count("。") != 1: bad(f"ending: {label} {text}")
    for w in BAN_NATAL:
        if w in text: bad(f"banned {w}: {label} {text}")
texts = [t for _, _, t in old + new]
for t, n in collections.Counter(texts).items():
    if n > 1: bad(f"duplicate natal line: {t}")
first4 = collections.Counter(t[:4] for t in texts)
for kind, label, text in new:
    if first4[text[:4]] > 1: bad(f"first four repeat「{text[:4]}」: {label} {text}")

# ---------- LUCK_* tables in main.js ----------
js = open(f"{REPO}/main.js").read()
a = js.index("// what the transiting planet brings"); b = js.index("const LUCK_SLOW_HOUSE")
node = "const src=require('fs').readFileSync(0,'utf8');const f=new Function(src+';const q={};for(const a in LUCK_QUIET){q[a]={};for(const t in LUCK_QUIET[a])q[a][t]=LUCK_QUIET[a][t].map(g=>g(\"§§\"))}return {LUCK_FLAV,LUCK_FACET,LUCK_RULER_FACET,LUCK_QUIET:q,LUCK_VERB,LUCK_SPAN,LUCK_RETRO}');console.log(JSON.stringify(f()))"
T = json.loads(subprocess.run(["node", "-e", node], input=js[a:b], capture_output=True, text=True, check=True).stdout)
counts = {}
def group(name, items, lo, hi, end=None, min_n=3, first=False, label=""):
    counts[name] = counts.get(name, 0) + len(items)
    if len(items) < min_n: bad(f"{name} {label}: only {len(items)} variants")
    if len(set(items)) != len(items): bad(f"{name} {label}: duplicate inside the cell")
    for t in items:
        if not lo <= cn(t) <= hi: bad(f"{name} {label}: length {cn(t)} not in {lo}-{hi}: {t}")
        if end is True and (not t.endswith("。") or t.count("。") != 1): bad(f"{name} {label}: ending: {t}")
        if end is False and t.endswith("。"): bad(f"{name} {label}: fragment ends with 。: {t}")
        for w in BAN:
            if w in t: bad(f"{name} {label}: banned {w}: {t}")
facet_texts, chips = [], []
for pl, v in T["LUCK_FLAV"].items():
    for pol in ("up", "down"): group("LUCK_FLAV", v[pol], 3, 9, False, 4, label=f"{pl}.{pol}")
for area, pts in T["LUCK_FACET"].items():
    for pt, v in pts.items():
        for pol in ("up", "down"):
            t, do, av = v[pol]
            group("LUCK_FACET text", t, 5, 15, False, 4, label=f"{area}.{pt}.{pol}"); facet_texts += t
            group("LUCK_FACET chip", do, 2, 7, False, 4, label=f"{area}.{pt}.{pol}.do")
            group("LUCK_FACET chip", av, 2, 7, False, 4, label=f"{area}.{pt}.{pol}.avoid")
for r, v in T["LUCK_RULER_FACET"].items():
    for pol in ("up", "down"):
        t, do, av = v[pol]
        group("LUCK_RULER_FACET text", t, 5, 22, False, 4, label=f"{r}.{pol}"); facet_texts += t
        group("LUCK_RULER_FACET chip", do, 2, 7, False, 3, label=f"{r}.{pol}.do")
        group("LUCK_RULER_FACET chip", av, 2, 7, False, 3, label=f"{r}.{pol}.avoid")
quiet = []
for area, tiers in T["LUCK_QUIET"].items():
    for tier, items in tiers.items():
        group("LUCK_QUIET", [t.replace("§§", "這天") for t in items], 14, 36, True, 4, label=f"{area}.{tier}"); quiet += items
for k, items in T["LUCK_VERB"].items(): group("LUCK_VERB", items, 2, 4, False, 4, label=k)
for k, items in T["LUCK_SPAN"].items(): group("LUCK_SPAN", items, 2, 6, False, 3, label=k)
retro = []
for area, pls in T["LUCK_RETRO"].items():
    for pl, items in pls.items(): group("LUCK_RETRO", items, 12, 22, True, 4, label=f"{area}.{pl}"); retro += items
for name, items in (("facet text", facet_texts), ("quiet", quiet)):
    for t, n in collections.Counter(items).items():
        if n > 1: bad(f"duplicate {name}: {t}")
f4 = collections.Counter(t[:4] for t in facet_texts)
before = subprocess.run(["git", "-C", REPO, "show", "main:src/lab/astro/main.js"], capture_output=True, text=True, check=True).stdout
for t in facet_texts:
    if f4[t[:4]] > 1 and f'"{t}"' not in before:  # lines that were already live are left as they are
        bad(f"facet first four repeat「{t[:4]}」: {t}")

# ---------- fortune-copy.json still valid ----------
fc = json.load(open(f"{REPO}/fortune-copy.json"))
assert set(fc) == {"love", "career", "money"}

print("natal lines: existing", len(old), "new", len(new))
print("luck tables:", json.dumps(counts, ensure_ascii=False))
print("PROBLEMS", len(problems))
for m in problems: print(" -", m)
sys.exit(1 if problems else 0)
