import { useEffect, useRef } from "react";

const GAP = 22;
const REACH = 150; // px around the cursor that the field reacts to
const RIPPLE_LIFE = 2400; // ms
const RIPPLE_SPEED = 0.55; // px per ms
const SIGIL_LIFE = 1600; // ms
const SPARK_LIFE = 900; // ms
const SPARK_STEP = 14; // px of cursor travel per spark
const TAU = Math.PI * 2;

const randomBetween = (min, max) => min + Math.random() * (max - min);

// Background for the links page: a resting grid of motes that the cursor
// pulls into a glowing field, a spark trail behind the cursor, drifting
// fireflies, and a magic circle + ripple on load and on every tap/click.
export default function ArcaneField({ originSelector }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pointer = { x: -1e4, y: -1e4, inside: false, lastX: 0, lastY: 0 };
    let ripples = [];
    let sparks = [];
    let motes = [];
    let colors = { ink: "#1e1a14", gold: "#9a7330", dark: false };
    let width = 0;
    let height = 0;
    let frame = 0;

    const readColors = () => {
      const styles = getComputedStyle(canvas);
      colors = {
        ink: styles.getPropertyValue("--text").trim() || colors.ink,
        gold: styles.getPropertyValue("--primary").trim() || colors.gold,
        dark: document.documentElement.getAttribute("data-theme") === "dark",
      };
    };

    const spawnMote = (anywhere) => ({
      x: randomBetween(0, width),
      y: anywhere ? randomBetween(0, height) : height + 10,
      size: randomBetween(0.8, 2),
      rise: randomBetween(0.008, 0.022),
      sway: randomBetween(8, 22),
      phase: randomBetween(0, TAU),
      twinkle: randomBetween(0.0008, 0.002),
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(28, (width * height) / 36000));
      motes = Array.from({ length: count }, () => spawnMote(true));
    };

    const dot = (x, y, radius, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fill();
    };

    // Four-point star
    const star = (x, y, size, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.quadraticCurveTo(x, y, x + size, y);
      ctx.quadraticCurveTo(x, y, x, y + size);
      ctx.quadraticCurveTo(x, y, x - size, y);
      ctx.quadraticCurveTo(x, y, x, y - size);
      ctx.fill();
    };

    const drawGrid = (now) => {
      const cols = Math.ceil(width / GAP) + 1;
      const rows = Math.ceil(height / GAP) + 1;
      const offsetX = (width % GAP) / 2;
      const maskHeight = Math.max(height, 640) * 0.55;
      const lit = [];

      ctx.fillStyle = colors.ink;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = offsetX + col * GAP;
          const y = 11 + row * GAP;

          const mx = (x - width / 2) / (width * 0.7);
          const my = y / maskHeight;
          const base = Math.max(0, 1 - Math.hypot(mx, my) / 0.8) * 0.14;

          let energy = 0;
          let shiftX = 0;
          let shiftY = 0;

          if (pointer.inside) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance < REACH) {
              const falloff = 1 - distance / REACH;
              energy = falloff * falloff;
              // Swirl around the cursor instead of only pushing out.
              const push = (energy * 7) / (distance || 1);
              shiftX += dx * push - dy * push * 0.6;
              shiftY += dy * push + dx * push * 0.6;
            }
          }

          for (const ripple of ripples) {
            const age = now - ripple.start;
            if (age < 0) continue;
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const distance = Math.hypot(dx, dy);
            const band =
              Math.exp(-(((distance - age * RIPPLE_SPEED) / 26) ** 2)) *
              (1 - age / RIPPLE_LIFE);
            if (band > 0.01) {
              energy = Math.max(energy, band);
              const push = (band * 5) / (distance || 1);
              shiftX += dx * push;
              shiftY += dy * push;
            }
          }

          const alpha = base + energy * 0.6;
          if (alpha < 0.01) continue;

          const radius = 0.9 + energy * 1.5;
          if (energy > 0.12) {
            lit.push([x + shiftX, y + shiftY, radius, Math.min(1, alpha + 0.25)]);
          } else {
            dot(x + shiftX, y + shiftY, radius, alpha);
          }
        }
      }

      ctx.fillStyle = colors.gold;
      for (const [x, y, radius, alpha] of lit) dot(x, y, radius, alpha);
    };

    // A thin magic circle that blooms and turns where the ripple starts.
    const drawSigil = (ripple, now) => {
      const age = now - ripple.start;
      if (age < 0 || age > SIGIL_LIFE) return;
      const t = age / SIGIL_LIFE;
      const grow = 1 - (1 - Math.min(1, t * 1.6)) ** 3;
      const fade = t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5;
      const outer = 34 + grow * 30;
      const turn = t * 1.2;

      ctx.save();
      ctx.translate(ripple.x, ripple.y);
      ctx.strokeStyle = colors.gold;
      ctx.globalAlpha = 0.55 * fade;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(0, 0, outer, 0, TAU * grow);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, outer * 0.78, 0, TAU);
      ctx.setLineDash([2, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Eight-point star inscribed in the inner ring
      ctx.rotate(turn);
      ctx.beginPath();
      for (let i = 0; i <= 8; i += 1) {
        const angle = (i * 3 * TAU) / 8;
        const px = Math.cos(angle) * outer * 0.78;
        const py = Math.sin(angle) * outer * 0.78;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.globalAlpha = 0.28 * fade;
      ctx.stroke();

      // Tick marks on the outer ring
      ctx.rotate(-turn * 2);
      ctx.globalAlpha = 0.5 * fade;
      for (let i = 0; i < 24; i += 1) {
        const angle = (i * TAU) / 24;
        const inner = outer + (i % 3 === 0 ? 4 : 2);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.lineTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.stroke();
      }
      ctx.restore();
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height);
      ripples = ripples.filter((ripple) => now - ripple.start < RIPPLE_LIFE);
      sparks = sparks.filter((spark) => now - spark.start < SPARK_LIFE);

      drawGrid(now);

      ctx.fillStyle = colors.gold;
      for (const mote of motes) {
        if (!reduceMotion) {
          mote.y -= mote.rise * 16;
          if (mote.y < -10) Object.assign(mote, spawnMote(false));
        }
        const glow = 0.35 + 0.35 * Math.sin(now * mote.twinkle + mote.phase);
        const x = mote.x + Math.sin(now * 0.0006 + mote.phase) * mote.sway;
        if (colors.dark) {
          dot(x, mote.y, mote.size * 2.6, glow * 0.12);
        }
        dot(x, mote.y, mote.size, glow * (colors.dark ? 0.9 : 0.55));
      }

      for (const spark of sparks) {
        const t = (now - spark.start) / SPARK_LIFE;
        spark.x += spark.vx;
        spark.y += spark.vy;
        star(spark.x, spark.y, spark.size * (1 - t * 0.6), (1 - t) * 0.85);
      }

      for (const ripple of ripples) drawSigil(ripple, now);
      ctx.globalAlpha = 1;

      frame = reduceMotion ? 0 : requestAnimationFrame(draw);
    };

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const toLocal = (event) => {
      const box = canvas.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };

    const cast = (x, y) => {
      if (reduceMotion) return;
      ripples = [...ripples.slice(-3), { x, y, start: performance.now() }];
      kick();
    };

    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      const { x, y } = toLocal(event);
      if (!pointer.inside) {
        pointer.lastX = x;
        pointer.lastY = y;
      }
      Object.assign(pointer, { x, y, inside: true });

      const travelled = Math.hypot(x - pointer.lastX, y - pointer.lastY);
      if (!reduceMotion && travelled > SPARK_STEP) {
        pointer.lastX = x;
        pointer.lastY = y;
        sparks = [
          ...sparks.slice(-60),
          {
            x: x + randomBetween(-4, 4),
            y: y + randomBetween(-4, 4),
            vx: randomBetween(-0.25, 0.25),
            vy: randomBetween(-0.6, -0.15),
            size: randomBetween(2.5, 4.5),
            start: performance.now(),
          },
        ];
      }
      kick();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      kick();
    };

    const onPointerDown = (event) => {
      const { x, y } = toLocal(event);
      cast(x, y);
    };

    readColors();
    resize();
    kick();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      kick();
    });
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readColors();
      kick();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Opening spell from the avatar.
    const intro = window.setTimeout(() => {
      const origin = originSelector && document.querySelector(originSelector);
      if (!origin) return;
      const box = origin.getBoundingClientRect();
      const local = toLocal({
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
      });
      cast(local.x, local.y);
    }, 350);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      window.clearTimeout(intro);
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, [originSelector]);

  return <canvas ref={canvasRef} className="links-dots" aria-hidden="true" />;
}
