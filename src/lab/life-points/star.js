// A star's life as a mirror of a human one, drawn in the corner of the road.
// f = age / expected lifespan:
//   f < 0      nebula (not yet born)
//   0–0.08     protostar, condensing
//   0.08–0.72  main sequence, steady and bright
//   0.72–0.93  red giant, swelling and dimming
//   0.93–1     planetary nebula, shells drifting off
//   > 1        white dwarf, a faint ember in a fading ring
// Like the road, nothing animates on its own: each frame is a function of age.

const TAU = Math.PI * 2;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const mix = (a, b, t) => a + (b - a) * t;
const rgb = (c1, c2, t) => c1.map((v, i) => Math.round(mix(v, c2[i], t)));

export function stage(f) {
  if (f < 0) return 0;
  if (f < 0.08) return 1;
  if (f < 0.72) return 2;
  if (f < 0.93) return 3;
  if (f <= 1) return 4;
  return 5;
}

export function energy(f) {
  if (f < 0) return 0;
  if (f < 0.08) return mix(0.15, 0.7, f / 0.08);
  if (f < 0.35) return mix(0.7, 1, (f - 0.08) / 0.27);
  if (f < 0.72) return mix(1, 0.86, (f - 0.35) / 0.37);
  if (f < 0.93) return mix(0.86, 0.5, (f - 0.72) / 0.21);
  if (f <= 1) return mix(0.5, 0.12, (f - 0.93) / 0.07);
  return Math.max(0.03, 0.12 - (f - 1) * 0.6);
}

function glow(ctx, x, y, r, color, a) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${a})`);
  g.addColorStop(0.35, `rgba(${color},${a * 0.35})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

// one star at (x, y), base size R, life fraction f; seed varies the wisps
function drawStar(ctx, x, y, R, f, seed, t) {
  const st = stage(f);
  ctx.globalCompositeOperation = "lighter";
  if (st === 0 || st === 1) {
    // the cloud it is born from; it thins as the core lights up
    const cloud = st === 0 ? 0.32 : 0.32 * (1 - f / 0.08);
    for (let i = 0; i < 5; i += 1) {
      const a = seed * 3.1 + i * 1.3 + t * 0.05;
      glow(ctx, x + Math.cos(a) * R * 1.3, y + Math.sin(a * 1.4) * R * 0.9, R * (1.4 + (i % 3) * 0.4), i % 2 ? "150,130,220" : "220,140,170", cloud * 0.45);
    }
    if (st === 0) return;
    const k = f / 0.08;
    glow(ctx, x, y, R * (1.2 + k * 1.6), "255,150,90", 0.4 + 0.4 * k);
    glow(ctx, x, y, R * 0.45 * (0.5 + k * 0.5), "255,210,170", 0.9);
    return;
  }
  if (st === 2) {
    const e = energy(f);
    glow(ctx, x, y, R * (2.6 + e * 1.4), "255,214,150", 0.22 + e * 0.18);
    glow(ctx, x, y, R * 1.2, "255,236,200", 0.75);
    glow(ctx, x, y, R * 0.55, "255,255,245", 1);
    // faint diffraction spikes
    ctx.globalAlpha = 0.28 + 0.2 * e;
    ctx.strokeStyle = "rgba(255,240,215,0.9)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    const L = R * (2.4 + e * 1.6);
    ctx.moveTo(x - L, y); ctx.lineTo(x + L, y);
    ctx.moveTo(x, y - L); ctx.lineTo(x, y + L);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  if (st === 3) {
    const k = (f - 0.72) / 0.21;
    const c = rgb([255, 190, 110], [255, 110, 70], k).join(",");
    const r = R * (1 + k * 0.9) * (1 + Math.sin(t * 1.2 + seed) * 0.03);
    glow(ctx, x, y, r * 3, c, 0.28);
    glow(ctx, x, y, r * 1.25, c, 0.7);
    glow(ctx, x, y, r * 0.7, "255,200,150", 0.6);
    return;
  }
  // shells drifting away, a small hot core left behind
  const k = st === 4 ? (f - 0.93) / 0.07 : 1;
  const late = st === 5 ? clamp01((f - 1) * 4) : 0;
  const ringA = (st === 4 ? 0.55 : 0.55 * (1 - late)) ;
  [0, 0.35].forEach((off, i) => {
    const rr = R * (1.2 + (k + off) * 2.2 + late * 1.5);
    ctx.globalAlpha = ringA * (1 - off);
    ctx.strokeStyle = i ? "rgba(255,150,180,0.8)" : "rgba(130,220,230,0.8)";
    ctx.lineWidth = R * 0.32 * (1 - off * 0.5);
    ctx.beginPath();
    ctx.ellipse(x, y, rr, rr * 0.86, seed, 0, TAU);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  glow(ctx, x, y, R * 1.6, "190,215,255", 0.25 * (1 - late * 0.6));
  glow(ctx, x, y, R * 0.3, "235,245,255", 0.95 - late * 0.4);
}

/**
 * stars: [{ f, label, main }]
 * opts: { stageNames, energyLabel, t, font }
 */
export function drawStars(ctx, w, h, stars, opts) {
  ctx.clearRect(0, 0, w, h);
  const main = stars.find((s) => s.main);
  const others = stars.filter((s) => !s.main);
  const R = Math.min(w, h) * 0.075;
  const mx = w * 0.56;
  const my = h * 0.4;
  if (main) drawStar(ctx, mx, my, R, main.f, 0.3, opts.t);
  // companions on a loose arc around the main star
  const spots = [[0.14, 0.13], [0.16, 0.64], [0.92, 0.12], [0.93, 0.66], [0.5, 0.06]];
  others.forEach((s, i) => {
    const [px, py] = spots[i % spots.length];
    drawStar(ctx, w * px, h * py, R * 0.42, s.f, 1 + i, opts.t);
  });

  ctx.globalCompositeOperation = "source-over";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  others.forEach((s, i) => {
    const [px, py] = spots[i % spots.length];
    ctx.font = `400 ${Math.round(R * 0.9)}px ${opts.font}`;
    ctx.fillStyle = `rgba(232,228,240,${s.f < 0 ? 0.35 : 0.62})`;
    ctx.fillText(s.label, w * px, h * py + R * 0.95);
  });
  if (main) {
    ctx.font = `500 ${Math.round(R * 1.05)}px ${opts.font}`;
    ctx.fillStyle = "rgba(246,240,230,0.9)";
    ctx.fillText(opts.stageNames[stage(main.f)], mx, h * 0.76);
    ctx.font = `400 ${Math.round(R * 0.85)}px ${opts.font}`;
    ctx.fillStyle = "rgba(246,185,91,0.85)";
    ctx.fillText(`${opts.energyLabel} ${Math.round(energy(main.f) * 100)}%`, mx, h * 0.76 + R * 1.5);
  }
}
