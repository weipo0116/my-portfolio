"""Build the site's web fonts (LINE Seed, SIL OFL 1.1, © LY Corporation).

LINE Seed TW is ~7 MB per weight, so it is subset to only the characters the
site actually uses. Re-run after adding new Chinese copy:

    pip install fonttools brotli
    python scripts/subset-fonts.py <dir with LINESeedSans_*.ttf and LINESeedTW_TTF_*.ttf>

Characters missing from the subset fall back to the system CJK font, so a
stale subset degrades gracefully rather than breaking.
"""

import pathlib
import sys

from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "fonts"
SOURCES = [
    "src/i18n.js",
    "src/data.js",
    "src/App.jsx",
    "src/links/LinksPage.jsx",
    "src/PrefsToggles.jsx",
]
# Punctuation and symbols that may appear in future copy.
EXTRA = "，。、；：？！「」『』（）《》〈〉—–…・·％＋－＝／｜～　0123456789"


def site_text() -> str:
    chars = set(EXTRA)
    for rel in SOURCES:
        chars.update((ROOT / rel).read_text(encoding="utf-8"))
    return "".join(sorted(c for c in chars if ord(c) >= 0x20))


def build(src: pathlib.Path, out_name: str, text: str | None) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.name_IDs = ["*"]  # keep copyright + OFL licence strings
    options.notdef_outline = True
    font = subset.load_font(str(src), options)
    subsetter = subset.Subsetter(options)
    if text is None:
        subsetter.populate(unicodes=font.getBestCmap().keys())
    else:
        subsetter.populate(text=text)
    subsetter.subset(font)
    target = OUT / out_name
    subset.save_font(font, str(target), options)
    print(f"{target.relative_to(ROOT)}  {target.stat().st_size // 1024} KB")


def main() -> None:
    src_dir = pathlib.Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    text = site_text()
    # Latin face: small, ship the whole thing.
    build(src_dir / "LINESeedSans_Rg.ttf", "LINESeedSans-Regular.woff2", None)
    build(src_dir / "LINESeedSans_Bd.ttf", "LINESeedSans-Bold.woff2", None)
    # CJK face: only the characters used on the site.
    build(src_dir / "LINESeedTW_TTF_Rg.ttf", "LINESeedTW-Regular.subset.woff2", text)
    build(src_dir / "LINESeedTW_TTF_Bd.ttf", "LINESeedTW-Bold.subset.woff2", text)


if __name__ == "__main__":
    main()
