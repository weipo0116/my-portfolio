// The road ahead — a 2D night road drawn on one canvas, driven by scroll.
// Nothing animates on its own: every frame is a pure function of the walker's age.

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

// Sky keyframes over a life: night → pre-dawn → dawn → golden dusk → night.
const SKY = [
  [0, [5, 6, 11], [13, 16, 32]],
  [0.25, [9, 13, 32], [52, 38, 62]],
  [0.48, [14, 22, 48], [112, 70, 58]],
  [0.74, [11, 15, 36], [98, 56, 44]],
  [1, [5, 6, 11], [26, 20, 30]],
];

function sky(t) {
  let i = 0;
  while (i < SKY.length - 2 && t > SKY[i + 1][0]) i += 1;
  const [t0, top0, bot0] = SKY[i];
  const [t1, top1, bot1] = SKY[i + 1];
  const k = clamp01((t - t0) / (t1 - t0));
  const mix = (a, b) => `rgb(${a.map((v, j) => Math.round(lerp(v, b[j], k))).join(",")})`;
  return [mix(top0, top1), mix(bot0, bot1)];
}

const STARS = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: 90 }, () => [rnd(), rnd() * 0.62, 0.5 + rnd() * 1.1, 0.25 + rnd() * 0.6]);
})();

export const pxPerYear = (w) => Math.min(84, Math.max(42, w * 0.062));
export const walkerX = (w) => Math.round(w * (w < 700 ? 0.3 : 0.34));
export const groundY = (h, w = 1000) => Math.round(h * (w < 700 ? 0.82 : 0.74));

function hills(ctx, w, gy, shift, amp, freq, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, gy);
  for (let x = 0; x <= w + 16; x += 16) {
    const wx = x + shift;
    const y = gy - amp * (0.55 + 0.3 * Math.sin(wx * freq) + 0.15 * Math.sin(wx * freq * 2.7 + 1.3));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, gy);
  ctx.closePath();
  ctx.fill();
}

function glow(ctx, x, y, r, alpha) {
  if (alpha <= 0.005 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(246,185,91,${alpha})`);
  g.addColorStop(1, "rgba(246,185,91,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// s: { age, a, L, lit (0..1), lanterns: [age] }
export function drawRoad(ctx, w, h, s) {
  const gy = groundY(h, w);
  const ppy = pxPerYear(w);
  const wx = walkerX(w);
  const k = Math.min(1.2, Math.max(0.85, h / 844));
  const t = clamp01(s.age / s.L);
  const u = clamp01((t - 0.12) / 0.76);
  const day = Math.sin(Math.PI * u);
  const sx = (age) => wx + (age - s.age) * ppy;
  const world = s.age * ppy;

  // sky
  const [top, bottom] = sky(t);
  const bg = ctx.createLinearGradient(0, 0, 0, gy);
  bg.addColorStop(0, top);
  bg.addColorStop(1, bottom);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, gy);
  ctx.fillStyle = "#fff";
  STARS.forEach(([x, y, r, a]) => {
    ctx.globalAlpha = a * (1 - day * 0.85);
    ctx.beginPath();
    ctx.arc(((x * w * 1.4 - world * 0.03) % (w * 1.4) + w * 1.4) % (w * 1.4), y * gy, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // low sun crossing the horizon over a lifetime
  const sunX = w * (0.08 + 0.84 * u);
  const sunY = gy - Math.sin(Math.PI * u) * h * 0.3 + 12;
  glow(ctx, sunX, sunY, h * 0.42, 0.05 + 0.2 * day);
  glow(ctx, sunX, sunY, 16 * k, 0.55 * day);

  hills(ctx, w, gy, world * 0.12, h * 0.13, 0.0031, "rgba(14,16,30,0.9)");
  hills(ctx, w, gy, world * 0.3 + 400, h * 0.07, 0.0052, "rgba(8,9,17,0.96)");

  // ground
  const gg = ctx.createLinearGradient(0, gy, 0, h);
  gg.addColorStop(0, "#0a0b13");
  gg.addColorStop(1, "#06070c");
  ctx.fillStyle = gg;
  ctx.fillRect(0, gy, w, h - gy);

  // road: lived = dim, ahead = lit by the lantern
  const nowX = sx(s.a);
  const endX = sx(s.L);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.beginPath();
  ctx.moveTo(Math.max(0, sx(0)), gy);
  ctx.lineTo(Math.min(w, nowX), gy);
  ctx.stroke();
  if (endX > 0 && nowX < w) {
    const from = Math.max(0, nowX);
    const to = Math.min(w, endX);
    const rg = ctx.createLinearGradient(from, 0, Math.max(to, from + 1), 0);
    rg.addColorStop(0, `rgba(246,185,91,${0.3 + 0.6 * s.lit})`);
    rg.addColorStop(1, `rgba(246,185,91,${0.16 + 0.2 * s.lit})`);
    ctx.strokeStyle = rg;
    ctx.beginPath();
    ctx.moveTo(from, gy);
    ctx.lineTo(to, gy);
    ctx.stroke();
  }

  // age posts every 5 years, numbers every 10
  ctx.font = `400 ${Math.round(12 * k)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  const first = Math.max(0, Math.floor((s.age - wx / ppy) / 5) * 5);
  for (let age = first; age <= s.L && sx(age) < w + 20; age += 5) {
    const x = sx(age);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(x, gy + 8, 1, age % 10 === 0 ? 10 : 5);
    if (age % 10 === 0 && age > 0) {
      ctx.fillStyle = "rgba(185,182,173,0.9)";
      ctx.fillText(String(age), x, gy + 36 * k);
    }
  }

  // save point (now) and the end of the road
  glow(ctx, nowX, gy, 26 * k, 0.5);
  ctx.fillStyle = "#f6b95b";
  ctx.beginPath();
  ctx.arc(nowX, gy, 4 * k, 0, Math.PI * 2);
  ctx.fill();
  if (endX < w + 200) glow(ctx, endX, gy - 20 * k, 150 * k, 0.28);

  // dream lanterns along the road
  s.lanterns.forEach((age) => {
    const x = sx(age);
    if (x < -80 || x > w + 80) return;
    const near = 1 - clamp01(Math.abs(x - wx) / (w * 0.5));
    glow(ctx, x, gy - 50 * k, (46 + 34 * near) * k, 0.32 + 0.4 * near);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x, gy - 58 * k);
    ctx.lineTo(x + 9 * k, gy - 58 * k);
    ctx.stroke();
    ctx.fillStyle = "#f6b95b";
    ctx.beginPath();
    ctx.roundRect?.(x + 4.5 * k, gy - 57 * k, 9 * k, 12 * k, 2.5 * k);
    ctx.fill();
  });

  // the walker: a small silhouette carrying a lantern
  const phase = world / (15 * k);
  const bob = Math.abs(Math.sin(phase)) * 1.8 * k;
  const hipY = gy - 30 * k - bob;
  const rim = `rgba(246,185,91,${0.22 + 0.55 * s.lit})`;
  glow(ctx, wx + 22 * k, gy - 40 * k - bob, (34 + 96 * s.lit) * k, 0.14 + 0.5 * s.lit);
  ctx.save();
  ctx.translate(wx + 70 * k, gy);
  ctx.scale(1, 0.16);
  glow(ctx, 0, 0, (60 + 150 * s.lit) * k, 0.1 + 0.45 * s.lit);
  ctx.restore();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#07080e";
  ctx.lineWidth = 5 * k;
  [1, -1].forEach((dir) => {
    const ang = Math.sin(phase) * 0.48 * dir;
    ctx.beginPath();
    ctx.moveTo(wx, hipY);
    ctx.lineTo(wx + Math.sin(ang) * 30 * k, gy - (1 - Math.cos(ang)) * 6 * k);
    ctx.stroke();
  });
  ctx.fillStyle = "#07080e";
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2;
  ctx.beginPath(); // coat
  ctx.moveTo(wx - 8 * k, hipY + 3 * k);
  ctx.quadraticCurveTo(wx - 9 * k, hipY - 22 * k, wx - 1 * k, hipY - 34 * k);
  ctx.quadraticCurveTo(wx + 9 * k, hipY - 30 * k, wx + 9 * k, hipY + 3 * k);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath(); // head
  ctx.arc(wx + 2 * k, hipY - 42 * k, 7.5 * k, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#07080e"; // arm + lantern
  ctx.lineWidth = 3.5 * k;
  ctx.beginPath();
  ctx.moveTo(wx + 3 * k, hipY - 27 * k);
  ctx.lineTo(wx + 21 * k, hipY - 21 * k);
  ctx.stroke();
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(wx + 21 * k, hipY - 21 * k);
  ctx.lineTo(wx + 22 * k, hipY - 14 * k);
  ctx.stroke();
  ctx.fillStyle = `rgba(246,185,91,${0.35 + 0.65 * s.lit})`;
  ctx.beginPath();
  ctx.roundRect?.(wx + 17.5 * k, hipY - 14 * k, 9 * k, 12 * k, 2.5 * k);
  ctx.fill();
}
