import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const TRAIL = 3;
const FLY_MS = 520;

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// A small original light-sprite: a glowing core with two translucent wings
// and a short spark trail. It drifts around the page on its own; flyTo()
// sends it to a point (the word being cast) and resolves when it arrives.
const Sprite = forwardRef(function Sprite(_props, ref) {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const trailRefs = useRef([]);
  const api = useRef({ flyTo: () => Promise.resolve(), release: () => {} });

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = { x: 0, y: 0 };
    const trail = Array.from({ length: TRAIL }, () => ({ x: 0, y: 0 }));
    let mode = "idle"; // idle | flying | perched | returning
    let flight = null;
    let frame = 0;
    let started = performance.now();

    const bounds = () => root.getBoundingClientRect();

    // Idle path: a lazy figure-eight around the upper and middle page.
    const idlePoint = (now) => {
      const { width, height } = bounds();
      const t = (now - started) / 1000;
      return {
        x: width * (0.5 + 0.36 * Math.sin(t * 0.21)),
        y: Math.min(height, 900) * (0.34 + 0.2 * Math.sin(t * 0.42 + 0.6)) + 6 * Math.sin(t * 2.1),
      };
    };

    const place = () => {
      body.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      trail.forEach((point, index) => {
        const el = trailRefs.current[index];
        if (el) el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
      });
    };

    const tick = (now) => {
      if (mode === "idle") {
        Object.assign(pos, idlePoint(now));
      } else if (mode === "flying" || mode === "returning") {
        const t = Math.min(1, (now - flight.start) / FLY_MS);
        const k = easeInOut(t);
        const to = mode === "returning" ? idlePoint(now) : flight.to;
        pos.x = flight.from.x + (to.x - flight.from.x) * k;
        pos.y = flight.from.y + (to.y - flight.from.y) * k - Math.sin(Math.PI * t) * 26;
        if (t === 1) {
          if (mode === "flying") {
            mode = "perched";
            flight.resolve();
          } else {
            mode = "idle";
          }
        }
      } else if (mode === "perched") {
        pos.x = flight.to.x;
        pos.y = flight.to.y + 3 * Math.sin(now / 160);
      }

      trail.forEach((point, index) => {
        const leader = index === 0 ? pos : trail[index - 1];
        point.x += (leader.x - point.x) * 0.28;
        point.y += (leader.y - point.y) * 0.28;
      });
      place();
      frame = requestAnimationFrame(tick);
    };

    api.current = {
      flyTo: (clientX, clientY) =>
        new Promise((resolve) => {
          if (reduceMotion) {
            resolve();
            return;
          }
          const box = bounds();
          flight = {
            from: { ...pos },
            to: { x: clientX - box.left, y: clientY - box.top },
            start: performance.now(),
            resolve,
          };
          mode = "flying";
        }),
      release: () => {
        if (reduceMotion || mode === "idle") return;
        flight = { ...flight, from: { ...pos }, start: performance.now() };
        mode = "returning";
      },
    };

    if (reduceMotion) {
      const { width } = bounds();
      Object.assign(pos, { x: width / 2 + 104, y: 128 });
      trail.forEach((point) => Object.assign(point, pos));
      place();
      return undefined;
    }

    Object.assign(pos, idlePoint(started));
    trail.forEach((point) => Object.assign(point, pos));
    frame = requestAnimationFrame(tick);

    // Coming back via the browser's back button: start a fresh idle loop.
    const onPageShow = (event) => {
      if (!event.persisted) return;
      mode = "idle";
      started = performance.now();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    flyTo: (x, y) => api.current.flyTo(x, y),
    release: () => api.current.release(),
  }));

  return (
    <div ref={rootRef} className="links-sprite-layer" aria-hidden="true">
      {Array.from({ length: TRAIL }, (_, index) => (
        <span
          key={index}
          ref={(el) => {
            trailRefs.current[index] = el;
          }}
          className={`links-sprite-trail is-${index + 1}`}
        />
      ))}
      <span ref={bodyRef} className="links-sprite">
        <svg viewBox="0 0 34 30">
          <ellipse className="links-sprite-wing is-left" cx="10" cy="12" rx="8" ry="5" transform="rotate(-25 10 12)" />
          <ellipse className="links-sprite-wing is-right" cx="24" cy="12" rx="8" ry="5" transform="rotate(25 24 12)" />
          <circle className="links-sprite-halo" cx="17" cy="17" r="9" />
          <circle className="links-sprite-core" cx="17" cy="17" r="4" />
        </svg>
      </span>
    </div>
  );
});

export default Sprite;
