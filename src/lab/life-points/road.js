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

function glow(ctx, x, y, r, alpha, rgb = "246,185,91") {
  if (alpha <= 0.005 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
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

  // trees drifting by at mid distance
  const tp = 0.62;
  const spacing = 230;
  const tShift = world * tp;
  for (let n = Math.floor(tShift / spacing) - 1; n * spacing - tShift < w + 60; n += 1) {
    const r = Math.abs(Math.sin(n * 12.9898) * 43758.5453) % 1;
    if (r < 0.28) continue;
    const x = n * spacing - tShift + r * 90;
    const th = (34 + r * 46) * k;
    ctx.fillStyle = "rgba(9,10,18,0.98)";
    ctx.fillRect(x - 1.5 * k, gy - th * 0.55, 3 * k, th * 0.55);
    if (r > 0.62) {
      ctx.beginPath(); // pine
      ctx.moveTo(x, gy - th);
      ctx.lineTo(x + th * 0.24, gy - th * 0.3);
      ctx.lineTo(x - th * 0.24, gy - th * 0.3);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath(); // round crown
      ctx.arc(x, gy - th * 0.68, th * 0.3, 0, Math.PI * 2);
      ctx.arc(x + th * 0.16, gy - th * 0.56, th * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // birds in daylight, a shooting star at each end of the night
  if (day > 0.35) {
    ctx.strokeStyle = `rgba(241,238,231,${(day - 0.35) * 0.9})`;
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i += 1) {
      const bx = ((w * (0.2 + i * 0.23) + world * 0.22 + i * 57) % (w + 120)) - 60;
      const by = gy * (0.34 + 0.05 * i) + Math.sin(world / 60 + i * 2) * 8;
      const flap = 3 + Math.sin(world / 9 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(bx - 7 * k, by - flap);
      ctx.quadraticCurveTo(bx - 3 * k, by - flap - 2, bx, by);
      ctx.quadraticCurveTo(bx + 3 * k, by - flap - 2, bx + 7 * k, by - flap);
      ctx.stroke();
    }
  }
  [[0.03, 0.09], [0.9, 0.97]].forEach(([from, to], i) => {
    const q = (t - from) / (to - from);
    if (q <= 0 || q >= 1) return;
    const x0 = w * (i ? 0.25 : 0.85);
    const dir = i ? 1 : -1;
    const hx = x0 + dir * q * w * 0.5;
    const hy = gy * (0.12 + q * 0.26);
    const tail = ctx.createLinearGradient(hx, hy, hx - dir * 90, hy - 46);
    tail.addColorStop(0, `rgba(255,255,255,${Math.sin(Math.PI * q) * 0.9})`);
    tail.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = tail;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx - dir * 90, hy - 46);
    ctx.stroke();
  });

  // the cave: every lived year is inside it, memories glow on its wall, and "now" is its mouth
  const mouth = sx(s.a);
  if (mouth > -140 * k) {
    const lip = (y) => mouth + 76 * k * (1 - y / gy) ** 2 + Math.sin(y * 0.07) * 7 * k + Math.sin(y * 0.19 + 2) * 4 * k;
    const edge = () => {
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(lip(0), -10);
      for (let y = 0; y <= gy; y += 8) ctx.lineTo(lip(y), y);
      ctx.lineTo(mouth, gy);
      ctx.lineTo(-10, gy);
      ctx.closePath();
    };
    edge();
    const wall = ctx.createLinearGradient(mouth - w * 0.9, 0, mouth + 60, 0);
    wall.addColorStop(0, "#0b0d17");
    wall.addColorStop(1, "#1c2034");
    ctx.fillStyle = wall;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.075)"; // rock strata
    ctx.lineWidth = 1;
    for (let i = 1; i < 6; i += 1) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 24) {
        const yy = (gy * i) / 6 + Math.sin((x + world) * 0.011 + i * 1.7) * 10;
        if (x) ctx.lineTo(x, yy);
        else ctx.moveTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "#05060b"; // stalactites and stalagmites
    const sp = 74;
    for (let n = Math.floor(world / sp) - 1; n * sp - world < w + 40; n += 1) {
      const r = Math.abs(Math.sin(n * 91.17) * 43758.5453) % 1;
      const x = n * sp - world + wx + r * 44;
      const len = (22 + r * 96) * k;
      ctx.beginPath();
      ctx.moveTo(x - (7 + r * 7) * k, 0);
      ctx.lineTo(x + (7 + r * 7) * k, 0);
      ctx.lineTo(x + 2 * k, len);
      ctx.closePath();
      ctx.fill();
      if (r > 0.45) {
        ctx.beginPath();
        ctx.moveTo(x + 30 * k, gy);
        ctx.lineTo(x + 46 * k, gy);
        ctx.lineTo(x + 37 * k, gy - (10 + r * 30) * k);
        ctx.closePath();
        ctx.fill();
      }
    }
    glow(ctx, mouth + 30 * k, gy * 0.62, 340 * k, 0.26, "255,222,176"); // daylight spilling in
    (s.memories ?? []).forEach((age) => {
      const x = sx(age);
      if (x < -80 || x > w + 80) return;
      const near = 1 - clamp01(Math.abs(x - wx) / (w * 0.5));
      glow(ctx, x, gy - 66 * k, (44 + 46 * near) * k, 0.16 + 0.34 * near, "143,211,255");
      ctx.fillStyle = `rgba(190,232,255,${0.5 + 0.5 * near})`;
      [[0, -70, 10], [-13, -57, 6.5], [12, -55, 5.5]].forEach(([dx, dy, r]) => {
        ctx.beginPath();
        ctx.moveTo(x + dx * k, gy + (dy - r * 1.5) * k);
        ctx.lineTo(x + (dx + r * 0.7) * k, gy + dy * k);
        ctx.lineTo(x + dx * k, gy + (dy + r * 1.5) * k);
        ctx.lineTo(x + (dx - r * 0.7) * k, gy + dy * k);
        ctx.closePath();
        ctx.fill();
      });
    });
    ctx.restore();
    ctx.strokeStyle = "rgba(255,222,176,0.4)"; // light catching the edge of the mouth
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let y = 0; y <= gy; y += 8) {
      if (y) ctx.lineTo(lip(y), y);
      else ctx.moveTo(lip(y), y);
    }
    ctx.stroke();
  }

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

  // stage milestones: a pennant where each life stage begins
  (s.gates ?? []).forEach((age) => {
    const x = sx(age);
    if (x < -20 || x > w + 20 || age <= 0) return;
    const passed = age <= s.age;
    ctx.strokeStyle = passed ? "rgba(255,255,255,0.22)" : "rgba(246,185,91,0.55)";
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x, gy - 34 * k);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, gy - 34 * k);
    ctx.lineTo(x + 12 * k, gy - 29 * k);
    ctx.lineTo(x, gy - 24 * k);
    ctx.closePath();
    ctx.fill();
  });

  // dream lanterns along the road: dim until you reach them, then they stay lit
  s.lanterns.forEach((age) => {
    const x = sx(age);
    if (x < -80 || x > w + 80) return;
    const near = x <= wx ? 1 : 1 - clamp01((x - wx) / (w * 0.45));
    const burst = x <= wx ? clamp01(1 - (wx - x) / (120 * k)) : 0;
    glow(ctx, x, gy - 50 * k, (30 + 50 * near + 40 * burst) * k, 0.12 + 0.6 * near);
    ctx.globalAlpha = 0.45 + 0.55 * near;
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
    ctx.globalAlpha = 1;
  });

  // the walker: grows from a child, picks up the lantern at "now", stoops a little late in life
  const grow = s.age < 18 ? 0.46 + 0.54 * clamp01(s.age / 18) ** 0.8 : 1;
  const g = k * grow;
  const old = clamp01((s.age - 66) / 22);
  const lamp = s.lamp ?? 1;
  const phase = world / (15 * g);
  const bob = Math.abs(Math.sin(phase)) * 1.8 * g;
  const hipY = gy - 30 * g - bob;
  const rim = lamp > 0.5 ? `rgba(246,185,91,${0.22 + 0.55 * s.lit})` : "rgba(176,220,255,0.5)";
  if (lamp > 0) {
    glow(ctx, wx + 22 * g, gy - 40 * g - bob, (34 + 96 * s.lit) * k, (0.14 + 0.5 * s.lit) * lamp);
    ctx.save();
    ctx.translate(wx + 70 * k, gy);
    ctx.scale(1, 0.16);
    glow(ctx, 0, 0, (60 + 150 * s.lit) * k, (0.1 + 0.45 * s.lit) * lamp);
    ctx.restore();
    // fireflies drawn to the light
    ctx.fillStyle = "#ffd89a";
    for (let i = 0; i < 5; i += 1) {
      const fa = world / 38 + i * 1.7;
      ctx.globalAlpha = (0.35 + 0.35 * Math.sin(fa * 2.3 + i)) * s.lit * lamp;
      ctx.beginPath();
      ctx.arc(wx + (26 + 34 * Math.cos(fa + i)) * k, gy - (46 + 26 * Math.sin(fa * 1.3 + i * 2)) * k, 1.4 * k, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#07080e";
  ctx.lineWidth = 5 * g;
  const stride = 0.48 - 0.16 * old;
  [1, -1].forEach((dir) => {
    const ang = Math.sin(phase) * stride * dir;
    ctx.beginPath();
    ctx.moveTo(wx, hipY);
    ctx.lineTo(wx + Math.sin(ang) * 30 * g, gy - (1 - Math.cos(ang)) * 6 * g);
    ctx.stroke();
  });
  ctx.save();
  ctx.translate(wx, hipY);
  ctx.rotate(old * 0.2);
  ctx.fillStyle = "#07080e";
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2;
  ctx.beginPath(); // coat
  ctx.moveTo(-8 * g, 3 * g);
  ctx.quadraticCurveTo(-9 * g, -22 * g, -1 * g, -34 * g);
  ctx.quadraticCurveTo(9 * g, -30 * g, 9 * g, 3 * g);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath(); // head (children have proportionally larger heads)
  ctx.arc(2 * g, -42 * g, (7.5 + 2.5 * (1 - grow)) * g, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#07080e";
  ctx.lineWidth = 3.5 * g;
  ctx.beginPath(); // arm: swings before "now", then holds the lantern out
  const swing = Math.sin(phase + Math.PI) * 9 * g * (1 - lamp);
  const handX = lerp(4 * g + swing, 21 * g, lamp);
  const handY = lerp(-8 * g, -21 * g, lamp);
  ctx.moveTo(3 * g, -27 * g);
  ctx.lineTo(handX, handY);
  ctx.stroke();
  if (lamp > 0) {
    ctx.globalAlpha = lamp;
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(handX + 1 * g, handY + 7 * g);
    ctx.stroke();
    ctx.fillStyle = `rgba(246,185,91,${0.35 + 0.65 * s.lit})`;
    ctx.beginPath();
    ctx.roundRect?.(handX - 3.5 * g, handY + 7 * g, 9 * g, 12 * g, 2.5 * g);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if (old > 0.05) { // a walking stick
    ctx.strokeStyle = "#07080e";
    ctx.lineWidth = 2.5 * g;
    ctx.beginPath();
    ctx.moveTo(wx - 6 * g, hipY - 14 * g);
    ctx.lineTo(wx - 13 * g - Math.sin(phase) * 5 * g, gy);
    ctx.stroke();
  }

  // grass in the foreground moves fastest
  ctx.strokeStyle = "rgba(4,5,9,0.95)";
  ctx.lineWidth = 2;
  const gs = 46;
  const gShift = world * 1.35;
  for (let n = Math.floor(gShift / gs) - 1; n * gs - gShift < w + 20; n += 1) {
    const r = Math.abs(Math.sin(n * 78.233) * 43758.5453) % 1;
    const x = n * gs - gShift + r * 30;
    const y = gy + (h - gy) * (0.5 + r * 0.4);
    for (let b = -1; b <= 1; b += 1) {
      ctx.beginPath();
      ctx.moveTo(x + b * 3, y);
      ctx.quadraticCurveTo(x + b * 5, y - 10 * k, x + b * 9, y - (14 + r * 10) * k);
      ctx.stroke();
    }
  }
}
