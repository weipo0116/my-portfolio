// Life Card — 1080×1920 PNG (Instagram Story), drawn on a canvas.
const W = 1080;
const H = 1920;
const M = 96;
const SERIF = '"Noto Serif TC", "Songti TC", Georgia, serif';
const SANS = 'Inter, "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif';
const INK = "#f1eee7";
const INK2 = "#b9b6ad";
const INK3 = "#918f89";
const WARM = "#f6b95b";

// Google Fonts splits CJK into unicode-range subsets: ask for the exact text we will draw.
export async function cardFonts(m) {
  if (!document.fonts?.load) return;
  const { S } = m;
  const text = [S.subtitle.replace("|", ""), S.cProgress, S.cDays, S.cTrips, m.people.label, m.people.value, S.cDream, S.cMove, S.quote, S.quoteBy, S.cEstimate, S.about, S.cDaysUnit, S.cTimesUnit, S.apLabel, m.dream, m.move, "0123456789%,·"].join("");
  const jobs = [
    document.fonts.load(`700 64px "Noto Serif TC"`, text),
    document.fonts.load(`500 40px "Noto Serif TC"`, text),
    document.fonts.load(`400 34px "Noto Sans TC"`, text),
    document.fonts.load(`500 34px "Noto Sans TC"`, text),
    document.fonts.load(`600 34px Inter`, "LIFE POINTS AP"),
    document.fonts.load(`400 34px Inter`, text),
  ];
  await Promise.race([Promise.allSettled(jobs), new Promise((r) => setTimeout(r, 5000))]);
}

function wrap(ctx, text, maxW, maxLines) {
  const tokens = text.match(/[⺀-鿿＀-￯「」《》，。、？！]|[^\s⺀-鿿＀-￯]+|\s+/g) ?? [];
  const lines = [];
  let line = "";
  for (const tok of tokens) {
    if (ctx.measureText(line + tok).width > maxW && line.trim()) {
      lines.push(line.trim());
      line = tok.trim() ? tok : "";
    } else line += tok;
  }
  if (line.trim()) lines.push(line.trim());
  if (lines.length > maxLines) {
    lines.length = maxLines;
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

function fit(ctx, text, maxW, weight, size, family) {
  let s = size;
  do {
    ctx.font = `${weight} ${s}px ${family}`;
    s -= 2;
  } while (ctx.measureText(text).width > maxW && s > 20);
}

function spaced(ctx, text, x, y, gap) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + gap;
  }
}

export function drawCard(cv, m) {
  const { S } = m;
  const ctx = cv.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.textBaseline = "alphabetic";

  // night sky
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#05060b");
  bg.addColorStop(0.62, "#0b0d19");
  bg.addColorStop(1, "#17121a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H + 260, 80, W / 2, H + 260, 1100);
  glow.addColorStop(0, "rgba(246,185,91,0.34)");
  glow.addColorStop(1, "rgba(246,185,91,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  let seed = 20261117;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  for (let i = 0; i < 150; i += 1) {
    ctx.globalAlpha = 0.15 + rnd() * 0.5;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(rnd() * W, rnd() * H * 0.86, 0.6 + rnd() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // header
  ctx.textAlign = "left";
  ctx.fillStyle = WARM;
  ctx.font = `600 32px ${SANS}`;
  spaced(ctx, "LIFE POINTS", M, 168, 9);
  ctx.fillStyle = INK2;
  ctx.font = `400 34px ${SANS}`;
  wrap(ctx, S.subtitle.replace("|", ""), W - M * 2, 2).forEach((l, i) => ctx.fillText(l, M, 236 + i * 50));

  // progress
  ctx.fillStyle = INK3;
  ctx.font = `500 32px ${SANS}`;
  ctx.fillText(S.cProgress, M, 420);
  ctx.fillStyle = INK;
  ctx.font = `700 250px ${SERIF}`;
  ctx.fillText(`${m.progress}%`, M - 10, 650);

  // AP bar: 20 segments, remaining ones lit
  const left = 100 - m.progress;
  const segs = 20;
  const gap = 8;
  const sw = (W - M * 2 - gap * (segs - 1)) / segs;
  const lit = Math.round(left / 5);
  for (let i = 0; i < segs; i += 1) {
    const on = i < lit;
    ctx.fillStyle = on ? WARM : "rgba(255,255,255,0.12)";
    ctx.shadowColor = on ? "rgba(246,185,91,0.7)" : "transparent";
    ctx.shadowBlur = on ? 18 : 0;
    ctx.fillRect(M + i * (sw + gap), 716, sw, 22);
  }
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.fillStyle = WARM;
  ctx.font = `500 30px ${SANS}`;
  ctx.fillText(`${S.apLabel} ${left}%`, M, 792);

  // stat rows
  const rows = [
    [S.cDays, `${S.about} ${m.days} ${S.cDaysUnit}`],
    [S.cTrips, `${S.about} ${m.trips} ${S.cTimesUnit}`],
    [m.people.label, `${S.about} ${m.people.value} ${S.cTimesUnit}`],
  ];
  let y = 900;
  rows.forEach(([label, value]) => {
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(M, y - 78, W - M * 2, 2);
    ctx.textAlign = "left";
    ctx.fillStyle = INK2;
    ctx.font = `400 34px ${SANS}`;
    ctx.fillText(label, M, y);
    const labelW = ctx.measureText(label).width;
    ctx.textAlign = "right";
    ctx.fillStyle = INK;
    fit(ctx, value.trim(), W - M * 2 - labelW - 40, 700, 56, SERIF);
    ctx.fillText(value.trim(), W - M, y + 4);
    y += 124;
  });
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(M, y - 78, W - M * 2, 2);

  // dream + first move
  ctx.textAlign = "left";
  y += 10;
  const block = (label, text, lines) => {
    if (!text) return;
    ctx.fillStyle = INK3;
    ctx.font = `500 30px ${SANS}`;
    ctx.fillText(label, M, y);
    ctx.fillStyle = INK;
    ctx.font = `500 46px ${SERIF}`;
    const ls = wrap(ctx, text, W - M * 2, lines);
    ls.forEach((l, i) => ctx.fillText(l, M, y + 64 + i * 62));
    y += 64 + ls.length * 62 + 40;
  };
  block(S.cDream, m.dream, 1);
  block(S.cMove, m.move, 2);

  // quote, anchored to the bottom
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = `500 38px ${SERIF}`;
  const q = wrap(ctx, S.quote, W - M * 2 - 40, 3);
  const qTop = Math.max(y + 30, 1716 - q.length * 58);
  q.forEach((l, i) => ctx.fillText(l, W / 2, qTop + i * 58));
  ctx.fillStyle = INK3;
  ctx.font = `400 28px ${SANS}`;
  ctx.fillText(S.quoteBy, W / 2, qTop + q.length * 58 + 4);
  ctx.fillStyle = INK3;
  ctx.font = `400 24px ${SANS}`;
  ctx.fillText(`${S.cEstimate} · weipo0116.github.io/my-portfolio/lab/life-points`, W / 2, 1850);
}
