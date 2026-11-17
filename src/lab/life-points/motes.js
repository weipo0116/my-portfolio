// Slow drifting specks of light, like dust in a beam inside a cave.
// One small canvas, a pre-rendered sprite, ~40 particles. Pauses when hidden.

export function createMotes(cv) {
  const ctx = cv.getContext("2d");
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const s = sprite.getContext("2d");
  const grad = s.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255,236,200,1)");
  grad.addColorStop(0.35, "rgba(255,214,150,0.45)");
  grad.addColorStop(1, "rgba(255,214,150,0)");
  s.fillStyle = grad;
  s.fillRect(0, 0, 32, 32);

  let w = 0;
  let h = 0;
  let light = 0;
  let raf = 0;
  let last = 0;
  const motes = Array.from({ length: 42 }, () => seed({}, true));

  function seed(m, anywhere) {
    m.x = Math.random();
    m.y = anywhere ? Math.random() : 1.05;
    m.r = 3 + Math.random() * 9;
    m.v = 0.004 + Math.random() * 0.012; // screen heights per second
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

  function frame(t) {
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const shown = Math.round(18 + light * 24);
    for (let i = 0; i < shown; i++) {
      const m = motes[i];
      m.y -= m.v * dt;
      m.sway += dt * 0.4;
      if (m.y < -0.05) seed(m, false);
      const x = (m.x + Math.sin(m.sway) * 0.015) * w;
      const y = m.y * h;
      // brighter toward the centre beam
      const beam = 1 - Math.min(1, Math.abs(m.x - 0.5) * 2.2);
      ctx.globalAlpha = m.a * (0.35 + beam * 0.65) * (0.55 + light * 0.45);
      ctx.drawImage(sprite, x - m.r, y - m.r, m.r * 2, m.r * 2);
    }
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
    still() {
      stop();
      ctx.clearRect(0, 0, w, h);
    },
  };
}
