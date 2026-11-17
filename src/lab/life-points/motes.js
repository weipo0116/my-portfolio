// The light layer. Slow drifting dust everywhere, plus one small piece of
// light-art per chapter, anchored to that chapter so it scrolls with it:
//   start   – starlight threads falling onto the title
//   weeks   – a quiet constellation at the edges
//   points  – thin orbits with travelling lights
//   tail    – two threads that weave around each other
//   dreams  – the odd shooting star
//   climax  – a single drop of light falling onto the words
//   card    – threads settle on the card, then come apart as dust
// One canvas, a pre-rendered sprite. Pauses when the tab is hidden.

const TAU = Math.PI * 2;

export function createMotes(cv) {
  const ctx = cv.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const sprite = makeSprite();
  let w = 0;
  let h = 0;
  let light = 0;
  let raf = 0;
  let last = 0;
  let time = 0;
  let scenes = [];
  const motes = Array.from({ length: 42 }, () => seed({}, true));

  function makeSprite() {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const s = c.getContext("2d");
    const g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,240,215,1)");
    g.addColorStop(0.3, "rgba(230,225,255,0.45)");
    g.addColorStop(1, "rgba(230,225,255,0)");
    s.fillStyle = g;
    s.fillRect(0, 0, 32, 32);
    return c;
  }

  function seed(m, anywhere) {
    m.x = Math.random();
    m.y = anywhere ? Math.random() : 1.05;
    m.r = 3 + Math.random() * 9;
    m.v = 0.004 + Math.random() * 0.012;
    m.sway = Math.random() * TAU;
    m.a = 0.15 + Math.random() * 0.5;
    return m;
  }

  function size() {
    w = cv.clientWidth;
    h = cv.clientHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const dot = (x, y, r, a) => {
    if (a <= 0.005) return;
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
  };
  const stroke = (pts, a, warm = 0) => {
    ctx.globalAlpha = 1;
    ctx.strokeStyle = `rgba(${210 + 45 * warm},${220 + 12 * warm},${255 - 60 * warm},${a})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  };
  const bez = (p0, p1, p2, p3) => (t) => {
    const u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    };
  };
  const sample = (f, n = 40) => Array.from({ length: n + 1 }, (_, i) => f(i / n));

  // threads from the sky converging just above a point
  function threads(tx, ty, spanW, top, a, dust = 0, grains = null) {
    const starts = [-0.12, 0.2, 0.8, 1.12];
    const bends = [0.2, -0.1, 0.12, -0.18];
    starts.forEach((sx, i) => {
      const spread = (i - 1.5) / 1.5;
      const wob = Math.sin(time * 0.25 + i * 1.7) * 0.03;
      const p0 = { x: sx * w, y: top };
      const p3 = { x: tx + spread * spanW * 0.18, y: ty };
      const f = bez(
        p0,
        { x: p0.x + (p3.x - p0.x) * 0.3 + (bends[i] + wob) * w, y: p0.y + (p3.y - p0.y) * 0.35 },
        { x: p3.x + (bends[i] - wob) * w * 0.4, y: p3.y - (p3.y - p0.y) * 0.3 },
        p3,
      );
      const line = a * (1 - dust);
      if (line > 0.01) {
        const pts = sample(f);
        const g = ctx.createLinearGradient(p0.x, p0.y, p3.x, p3.y);
        g.addColorStop(0, "rgba(200,210,255,0)");
        g.addColorStop(0.45, `rgba(210,220,255,${0.16 * line})`);
        g.addColorStop(1, `rgba(255,232,196,${0.5 * line})`);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        pts.forEach((p, n) => (n ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
        const t = (time * (0.05 + i * 0.006) + i * 0.27) % 1;
        const p = f(t);
        dot(p.x, p.y, 4, line * Math.sin(t * Math.PI) * 0.9);
      }
      if (dust > 0.01 && grains) {
        grains[i].forEach((gr, n) => {
          const t = (n + 0.5) / grains[i].length;
          const p = f(t);
          const lag = gr.lag * (1 - t);
          const d = Math.max(0, Math.min(1, (dust - lag) / (1 - lag)));
          if (d <= 0) return;
          dot(p.x + gr.dx * d * 50, p.y + gr.dy * d * 90, gr.r, a * gr.a * Math.sin(Math.min(1, d * 1.6) * Math.PI) * (0.3 + 0.7 * t));
        });
      }
    });
  }

  /* ---------- per-chapter art ---------- */
  const ART = {
    start(r, a) {
      threads(r.left + r.width / 2, r.top - 14, Math.min(r.width, 520), r.top - h * 0.5, a);
    },

    weeks: (() => {
      // fixed constellation hugging the left and right edges of the viewport
      const stars = [
        [0.05, 0.18], [0.11, 0.27], [0.07, 0.4], [0.13, 0.52], [0.06, 0.66], [0.1, 0.8],
        [0.94, 0.16], [0.89, 0.3], [0.95, 0.44], [0.9, 0.58], [0.95, 0.72], [0.88, 0.84],
      ];
      const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [1, 3], [7, 9]];
      return (r, a) => {
        const P = stars.map(([x, y]) => ({ x: x * w, y: y * h }));
        links.forEach(([i, j], n) => {
          const draw = Math.min(1, Math.max(0, a * 1.4 - n * 0.04));
          if (draw <= 0) return;
          const p = P[i];
          const q = P[j];
          stroke([p, { x: p.x + (q.x - p.x) * draw, y: p.y + (q.y - p.y) * draw }], 0.14 * a);
        });
        P.forEach((p, i) => dot(p.x, p.y, 3.5, a * (0.45 + 0.4 * Math.sin(time * 0.9 + i * 1.3))));
      };
    })(),

    orbits(r, a) {
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.5;
      const base = Math.min(w, 560) * 0.5;
      [0.62, 0.86, 1.1].forEach((k, i) => {
        const rx = base * k;
        const ry = rx * 0.26;
        const tilt = -0.18 + i * 0.05;
        const pts = sample((t) => {
          const ang = t * TAU;
          const x = Math.cos(ang) * rx;
          const y = Math.sin(ang) * ry;
          return { x: cx + x * Math.cos(tilt) - y * Math.sin(tilt), y: cy + x * Math.sin(tilt) + y * Math.cos(tilt) };
        }, 72);
        stroke(pts, 0.11 * a, 0.3);
        const ang = time * (0.22 - i * 0.05) + i * 2.1;
        const x = Math.cos(ang) * rx;
        const y = Math.sin(ang) * ry;
        const front = Math.sin(ang) > 0 ? 1 : 0.45;
        dot(cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt), 4.5, a * front);
      });
    },

    weave(r, a) {
      // two threads, one cool and one warm, braiding across under the title
      const y0 = r.bottom + 18;
      [0, Math.PI].forEach((ph, i) => {
        const pts = sample((t) => ({
          x: -20 + t * (w + 40),
          y: y0 + Math.sin(t * TAU * 1.5 + ph + time * 0.35) * 10 * Math.sin(t * Math.PI),
        }), 80);
        stroke(pts, (i ? 0.32 : 0.22) * a, i);
        const t = (time * 0.04 + i * 0.5) % 1;
        dot(pts[Math.round(t * 80)].x, pts[Math.round(t * 80)].y, 4, a * Math.sin(t * Math.PI));
      });
    },

    wishes: (() => {
      const streaks = [];
      let next = 0;
      return (r, a) => {
        if (time > next) {
          next = time + 2.2 + Math.random() * 3.5;
          streaks.push({ x: r.left + Math.random() * r.width * 0.9, y: Math.max(0, r.top) + Math.random() * h * 0.45, t: 0, len: 70 + Math.random() * 90 });
        }
        for (let i = streaks.length - 1; i >= 0; i--) {
          const s = streaks[i];
          s.t += 1 / 60 / 1.4;
          if (s.t >= 1) { streaks.splice(i, 1); continue; }
          const hx = s.x + s.t * s.len * 1.6;
          const hy = s.y + s.t * s.len * 0.7;
          const fade = Math.sin(s.t * Math.PI);
          const g = ctx.createLinearGradient(hx - s.len * 0.8, hy - s.len * 0.35, hx, hy);
          g.addColorStop(0, "rgba(220,225,255,0)");
          g.addColorStop(1, `rgba(255,236,205,${0.55 * fade * a})`);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(hx - s.len * 0.8, hy - s.len * 0.35);
          ctx.lineTo(hx, hy);
          ctx.stroke();
          dot(hx, hy, 3.5, fade * a);
        }
      };
    })(),

    drop(r, a) {
      // one vertical thread; a drop of light slides down and ripples on the words
      const x = r.left + r.width / 2;
      const top = r.top - h * 0.42;
      const end = r.top - 16;
      const g = ctx.createLinearGradient(x, top, x, end);
      g.addColorStop(0, "rgba(220,225,255,0)");
      g.addColorStop(1, `rgba(255,232,196,${0.45 * a})`);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, end);
      ctx.stroke();
      const cyc = (time / 4.5) % 1;
      if (cyc < 0.6) {
        const t = cyc / 0.6;
        dot(x, top + (end - top) * t * t, 4.5, a * Math.min(1, t * 3));
      } else {
        const t = (cyc - 0.6) / 0.4;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(255,232,196,${0.4 * (1 - t) * a})`;
        ctx.beginPath();
        ctx.ellipse(x, end, 6 + t * 70, (6 + t * 70) * 0.22, 0, 0, TAU);
        ctx.stroke();
      }
    },

    card: (() => {
      const grains = Array.from({ length: 4 }, () =>
        Array.from({ length: 70 }, () => ({
          dx: (Math.random() - 0.5) * 2,
          dy: -0.4 - Math.random() * 1.2,
          r: 1 + Math.random() * 2.4,
          lag: Math.random() * 0.5,
          a: 0.4 + Math.random() * 0.6,
        })),
      );
      let since = -1;
      let dust = 0;
      return (r, a, dt) => {
        const centred = r.top < h * 0.55 && r.bottom > h * 0.45;
        if (centred && since < 0) since = time;
        if (!centred && a < 0.2) since = -1;
        const want = since >= 0 && time - since > 1.6 ? 1 : 0;
        dust += (want - dust) * (1 - Math.exp(-dt * (want ? 0.55 : 2)));
        threads(r.left + r.width / 2, r.top - 10, r.width, r.top - h * 0.6, a, dust, grains);
      };
    })(),
  };

  function frame(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    time += dt;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const shown = Math.round(18 + light * 24);
    for (let i = 0; i < shown; i++) {
      const m = motes[i];
      m.y -= m.v * dt;
      m.sway += dt * 0.4;
      if (m.y < -0.05) seed(m, false);
      const beam = 1 - Math.min(1, Math.abs(m.x - 0.5) * 2.2);
      dot((m.x + Math.sin(m.sway) * 0.015) * w, m.y * h, m.r, m.a * (0.35 + beam * 0.65) * (0.55 + light * 0.45));
    }
    scenes.forEach((sc) => {
      const sr = sc.section.getBoundingClientRect();
      if (!sr.height || sr.bottom < 0 || sr.top > h) return;
      // fade with how much of the chapter is on screen
      const vis = Math.max(0, Math.min(sr.bottom, h) - Math.max(sr.top, 0)) / Math.min(h, sr.height);
      const a = Math.min(1, Math.max(0, (vis - 0.15) / 0.5));
      if (a <= 0.01) return;
      ART[sc.art](sc.anchor.getBoundingClientRect(), a, dt);
    });
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  size();
  window.addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  return {
    start,
    stop,
    light(g) { light = g; },
    // [{ section, anchor, art }]
    scenes(list) { scenes = list.filter((s) => s.section && s.anchor); },
    still() {
      stop();
      ctx.clearRect(0, 0, w, h);
    },
  };
}
