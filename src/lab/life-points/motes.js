// The light layer: slow drifting dust, and a few hair-thin threads of
// starlight that lead the eye to each scene's focal point. At the Life Card
// the threads come apart and drift away as dust.
// One canvas, a pre-rendered sprite. Pauses when the tab is hidden.

const THREADS = [
  // start (fraction of width, above the top), bend, speed of the travelling spark
  { sx: -0.15, sy: -0.1, bend: 0.22, spd: 0.07, ph: 0.1 },
  { sx: 0.18, sy: -0.25, bend: -0.12, spd: 0.055, ph: 0.55 },
  { sx: 0.82, sy: -0.22, bend: 0.14, spd: 0.065, ph: 0.3 },
  { sx: 1.15, sy: -0.05, bend: -0.2, spd: 0.05, ph: 0.8 },
];
const DUST_PER_THREAD = 70;

export function createMotes(cv) {
  const ctx = cv.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const s = sprite.getContext("2d");
  const grad = s.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255,240,215,1)");
  grad.addColorStop(0.3, "rgba(230,225,255,0.45)");
  grad.addColorStop(1, "rgba(230,225,255,0)");
  s.fillStyle = grad;
  s.fillRect(0, 0, 32, 32);

  let w = 0;
  let h = 0;
  let light = 0;
  let raf = 0;
  let last = 0;
  let time = 0;
  const motes = Array.from({ length: 42 }, () => seed({}, true));
  // guide state, eased every frame
  const want = { x: 0, y: 0, w: 300, show: 0, end: false };
  const cur = { x: 0, y: 0, w: 300, show: 0, dust: 0 };
  let endSince = 0;
  // fixed scatter for each dust grain so the dissolve is stable frame to frame
  const grains = THREADS.map(() =>
    Array.from({ length: DUST_PER_THREAD }, () => ({
      dx: (Math.random() - 0.5) * 2,
      dy: -0.4 - Math.random() * 1.2,
      r: 1 + Math.random() * 2.4,
      lag: Math.random() * 0.5,
      a: 0.4 + Math.random() * 0.6,
    })),
  );

  function seed(m, anywhere) {
    m.x = Math.random();
    m.y = anywhere ? Math.random() : 1.05;
    m.r = 3 + Math.random() * 9;
    m.v = 0.004 + Math.random() * 0.012;
    m.sway = Math.random() * Math.PI * 2;
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

  // cubic bezier from the sky to a point just above the focal element
  function curve(th, i) {
    const spread = (i - (THREADS.length - 1) / 2) / ((THREADS.length - 1) / 2); // -1..1
    const p0 = { x: th.sx * w, y: th.sy * h };
    const p3 = { x: cur.x + spread * cur.w * 0.18, y: cur.y };
    const wob = Math.sin(time * 0.25 + th.ph * 6.28) * 0.04;
    const p1 = { x: p0.x + (p3.x - p0.x) * 0.3 + (th.bend + wob) * w, y: p0.y + (p3.y - p0.y) * 0.35 };
    const p2 = { x: p3.x + (th.bend - wob) * w * 0.4, y: p3.y - (p3.y - p0.y) * 0.3 };
    return (t) => {
      const u = 1 - t;
      return {
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
      };
    };
  }

  function drawThreads(dt, now) {
    // ease toward the wanted target; snap position when first appearing
    const k = 1 - Math.exp(-dt * 2.2);
    if (cur.show < 0.02 && want.show) { cur.x = want.x; cur.y = want.y; cur.w = want.w; }
    cur.x += (want.x - cur.x) * k;
    cur.y += (want.y - cur.y) * k;
    cur.w += (want.w - cur.w) * k;
    cur.show += (want.show - cur.show) * (1 - Math.exp(-dt * 1.5));
    // dissolve once the threads have rested on the card for a moment
    const dustWant = want.end && now - endSince > 1600 ? 1 : 0;
    cur.dust += (dustWant - cur.dust) * (1 - Math.exp(-dt * (dustWant ? 0.55 : 2)));
    if (cur.show < 0.01) return;

    THREADS.forEach((th, i) => {
      const at = curve(th, i);
      const line = cur.show * (1 - cur.dust);
      if (line > 0.01) {
        const a = at(0);
        const b = at(1);
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, "rgba(200,210,255,0)");
        g.addColorStop(0.45, `rgba(210,220,255,${0.16 * line})`);
        g.addColorStop(1, `rgba(255,232,196,${0.5 * line})`);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        for (let n = 1; n <= 40; n++) {
          const p = at(n / 40);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        // a spark of light slowly travelling down the thread
        const t = (time * th.spd + th.ph) % 1;
        const p = at(t);
        ctx.globalAlpha = line * Math.sin(t * Math.PI) * 0.9;
        ctx.drawImage(sprite, p.x - 4, p.y - 4, 8, 8);
      }
      if (cur.dust > 0.01) {
        grains[i].forEach((gr, n) => {
          const t = (n + 0.5) / DUST_PER_THREAD;
          const p = at(t);
          const d = Math.max(0, Math.min(1, (cur.dust - gr.lag * (1 - t)) / (1 - gr.lag * (1 - t))));
          if (d <= 0) return;
          const x = p.x + gr.dx * d * 50;
          const y = p.y + gr.dy * d * 90;
          ctx.globalAlpha = cur.show * gr.a * Math.sin(Math.min(1, d * 1.6) * Math.PI) * (0.3 + 0.7 * t);
          ctx.drawImage(sprite, x - gr.r, y - gr.r, gr.r * 2, gr.r * 2);
        });
      }
    });
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    time += dt;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const shown = Math.round(18 + light * 24 + cur.dust * 10);
    for (let i = 0; i < Math.min(shown, motes.length); i++) {
      const m = motes[i];
      m.y -= m.v * dt;
      m.sway += dt * 0.4;
      if (m.y < -0.05) seed(m, false);
      const x = (m.x + Math.sin(m.sway) * 0.015) * w;
      const y = m.y * h;
      const beam = 1 - Math.min(1, Math.abs(m.x - 0.5) * 2.2);
      ctx.globalAlpha = m.a * (0.35 + beam * 0.65) * (0.55 + light * 0.45);
      ctx.drawImage(sprite, x - m.r, y - m.r, m.r * 2, m.r * 2);
    }
    drawThreads(dt, now);
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
    guide(target) {
      if (!target) { want.show = 0; want.end = false; return; }
      if (target.end && !want.end) endSince = performance.now();
      Object.assign(want, target, { show: 1 });
    },
    still() {
      stop();
      ctx.clearRect(0, 0, w, h);
    },
  };
}
