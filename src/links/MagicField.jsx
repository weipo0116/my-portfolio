import { useEffect, useRef } from "react";
import "./magic.css";

const GAP = 22;
const REACH = 150; // px around the cursor / wanderer that the field reacts to
const RIPPLE_LIFE = 2400; // ms
const RIPPLE_SPEED = 0.55; // px per ms
const IDLE_FRAME = 1000 / 30; // the idle wanderer only needs ~30fps

export const RIPPLE_EVENT = "links:ripple";

// Ask the field to send a ripple out from a point in viewport coordinates.
export const castRipple = (clientX, clientY) => {
  window.dispatchEvent(new CustomEvent(RIPPLE_EVENT, { detail: { clientX, clientY } }));
};

// Background dot grid. Faint near the top; a soft light wanders across it on
// its own, the cursor pulls dots into a glowing field, and taps or casts send
// a ripple through it.
export default function MagicField({ fixed = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -1e4, y: -1e4, inside: false };
    let ripples = [];
    let colors = { dot: "#1d1d1f", accent: "#2456d6" };
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastDraw = 0;

    const readColors = () => {
      const styles = getComputedStyle(document.documentElement);
      colors = {
        dot: styles.getPropertyValue("--text").trim() || colors.dot,
        accent: styles.getPropertyValue("--primary").trim() || colors.accent,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // The wanderer drifts on a slow Lissajous loop over the whole page.
    const wanderer = (now) => ({
      x: width * (0.5 + 0.42 * Math.sin(now * 0.00011)),
      y: height * (0.42 + 0.36 * Math.sin(now * 0.00007 + 1.3)),
    });

    const fieldAt = (x, y, source, strength, out) => {
      const dx = x - source.x;
      const dy = y - source.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= REACH) return;
      const falloff = 1 - distance / REACH;
      const energy = falloff * falloff * strength;
      out.energy = Math.max(out.energy, energy);
      const push = (energy * 7) / (distance || 1);
      out.x += dx * push;
      out.y += dy * push;
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height);
      ripples = ripples.filter((ripple) => now - ripple.start < RIPPLE_LIFE);

      const cols = Math.ceil(width / GAP) + 1;
      const rows = Math.ceil(height / GAP) + 1;
      const offsetX = (width % GAP) / 2;
      const maskHeight = Math.max(height, 640) * 0.55;
      const idle = reduceMotion ? null : wanderer(now);
      const lit = [];
      const shift = { x: 0, y: 0, energy: 0 };

      ctx.fillStyle = colors.dot;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = offsetX + col * GAP;
          const y = 11 + row * GAP;

          const mx = (x - width / 2) / (width * 0.7);
          const my = y / maskHeight;
          const base = Math.max(0, 1 - Math.hypot(mx, my) / 0.8) * 0.16;

          shift.x = 0;
          shift.y = 0;
          shift.energy = 0;
          if (idle) fieldAt(x, y, idle, 0.55, shift);
          if (pointer.inside) fieldAt(x, y, pointer, 1, shift);

          for (const ripple of ripples) {
            const age = now - ripple.start;
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const distance = Math.hypot(dx, dy);
            const band =
              Math.exp(-(((distance - age * RIPPLE_SPEED) / 26) ** 2)) * (1 - age / RIPPLE_LIFE);
            if (band > 0.01) {
              shift.energy = Math.max(shift.energy, band);
              const push = (band * 5) / (distance || 1);
              shift.x += dx * push;
              shift.y += dy * push;
            }
          }

          const alpha = base + shift.energy * 0.55;
          if (alpha < 0.01) continue;
          const radius = 1 + shift.energy * 1.4;
          if (shift.energy > 0.12) {
            lit.push(x + shift.x, y + shift.y, radius, Math.min(1, alpha + 0.2));
            continue;
          }
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x + shift.x, y + shift.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = colors.accent;
      for (let i = 0; i < lit.length; i += 4) {
        ctx.globalAlpha = lit[i + 3];
        ctx.beginPath();
        ctx.arc(lit[i], lit[i + 1], lit[i + 2], 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now) => {
      const busy = pointer.inside || ripples.length > 0;
      if (busy || now - lastDraw >= IDLE_FRAME) {
        lastDraw = now;
        draw(now);
      }
      frame = requestAnimationFrame(loop);
    };

    const redrawStatic = () => {
      if (reduceMotion) draw(performance.now());
    };

    const toLocal = (clientX, clientY) => {
      const box = canvas.getBoundingClientRect();
      return { x: clientX - box.left, y: clientY - box.top };
    };

    const addRipple = (clientX, clientY) => {
      if (reduceMotion) return;
      const { x, y } = toLocal(clientX, clientY);
      ripples = [...ripples.slice(-3), { x, y, start: performance.now() }];
    };

    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      Object.assign(pointer, toLocal(event.clientX, event.clientY), { inside: true });
    };
    const onPointerLeave = () => {
      pointer.inside = false;
    };
    const onPointerDown = (event) => addRipple(event.clientX, event.clientY);
    const onRipple = (event) => addRipple(event.detail.clientX, event.detail.clientY);

    readColors();
    resize();
    if (reduceMotion) redrawStatic();
    else frame = requestAnimationFrame(loop);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      redrawStatic();
    });
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readColors();
      redrawStatic();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener(RIPPLE_EVENT, onRipple);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener(RIPPLE_EVENT, onRipple);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`links-field${fixed ? " is-fixed" : ""}`}
      aria-hidden="true"
    />
  );
}

// Two slow, soft lights drifting behind everything.
export function Ambient({ fixed = false }) {
  return (
    <div className={`links-ambient-layer${fixed ? " is-fixed" : ""}`} aria-hidden="true">
      <div className="links-ambient is-a" />
      <div className="links-ambient is-b" />
    </div>
  );
}
