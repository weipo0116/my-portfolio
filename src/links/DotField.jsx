import { useEffect, useRef } from "react";

const GAP = 22;
const REACH = 150; // px around the cursor that the field reacts to
const RIPPLE_LIFE = 2400; // ms
const RIPPLE_SPEED = 0.55; // px per ms

// Interactive dot grid behind the links page. The grid is faint near the top,
// lights up and parts around the cursor, and sends out a ripple on load and on
// every tap/click. It only animates while something is happening.
export default function DotField({ originSelector }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pointer = { x: -1e4, y: -1e4, inside: false };
    let ripples = [];
    let colors = { dot: "#1d1d1f", accent: "#2456d6" };
    let width = 0;
    let height = 0;
    let frame = 0;

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

    const dot = (x, y, radius, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, width, height);
      ripples = ripples.filter((ripple) => now - ripple.start < RIPPLE_LIFE);

      const cols = Math.ceil(width / GAP) + 1;
      const rows = Math.ceil(height / GAP) + 1;
      const offsetX = (width % GAP) / 2;
      const maskHeight = Math.max(height, 640) * 0.55;
      const lit = [];

      ctx.fillStyle = colors.dot;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = offsetX + col * GAP;
          const y = 11 + row * GAP;

          // Resting grid: visible near the top centre, fading outwards.
          const mx = (x - width / 2) / (width * 0.7);
          const my = y / maskHeight;
          const base = Math.max(0, 1 - Math.hypot(mx, my) / 0.8) * 0.16;

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
              const push = (energy * 7) / (distance || 1);
              shiftX += dx * push;
              shiftY += dy * push;
            }
          }

          for (const ripple of ripples) {
            const age = now - ripple.start;
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

          const alpha = base + energy * 0.55;
          if (alpha < 0.01) continue;

          const radius = 1 + energy * 1.4;
          if (energy > 0.12) {
            lit.push([x + shiftX, y + shiftY, radius, Math.min(1, alpha + 0.2)]);
          } else {
            dot(x + shiftX, y + shiftY, radius, alpha);
          }
        }
      }

      ctx.fillStyle = colors.accent;
      for (const [x, y, radius, alpha] of lit) dot(x, y, radius, alpha);
      ctx.globalAlpha = 1;

      const busy = !reduceMotion && (pointer.inside || ripples.length > 0);
      frame = busy ? requestAnimationFrame(draw) : 0;
    };

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const toLocal = (event) => {
      const box = canvas.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };

    const addRipple = (x, y) => {
      if (reduceMotion) return;
      ripples = [...ripples.slice(-3), { x, y, start: performance.now() }];
      kick();
    };

    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      Object.assign(pointer, toLocal(event), { inside: true });
      kick();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      kick();
    };

    const onPointerDown = (event) => {
      const { x, y } = toLocal(event);
      addRipple(x, y);
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

    // Opening ripple from the avatar.
    const intro = window.setTimeout(() => {
      const origin = originSelector && document.querySelector(originSelector);
      if (!origin) return;
      const box = origin.getBoundingClientRect();
      const local = toLocal({
        clientX: box.left + box.width / 2,
        clientY: box.top + box.height / 2,
      });
      addRipple(local.x, local.y);
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
