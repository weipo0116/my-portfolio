import {
  createContext,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "./magic.css";

// Lets anything on the page ask the sprite to fly somewhere.
export const SpriteContext = createContext(null);

const TRAIL = 3;
const FLY_MS = 520;
const HOP_MS = 3400; // one short flight around its perch
const HOP_GAP = [20000, 30000]; // rests this long between flights
const SLEEP_KEY = "webber.sprite";

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const randomGap = () => HOP_GAP[0] + Math.random() * (HOP_GAP[1] - HOP_GAP[0]);
const readAsleep = () => {
  try {
    return localStorage.getItem(SLEEP_KEY) === "sleep";
  } catch {
    return false;
  }
};

// A small original light-sprite. It rests on a perch (beside the avatar, or
// in the bottom-right corner on scrolling pages), takes a short flight every
// 20–30 s, and flies to whatever is being cast. Tapping it sends it to sleep
// on its perch; tapping again wakes it. The choice is remembered.
const Sprite = forwardRef(function Sprite({ fixed = false, perchSelector }, ref) {
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const trailRefs = useRef([]);
  const asleepRef = useRef(readAsleep());
  const [asleep, setAsleep] = useState(asleepRef.current);
  const api = useRef({ flyTo: () => Promise.resolve(), release: () => {} });

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    if (!root || !body) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = { x: 0, y: 0 };
    const trail = Array.from({ length: TRAIL }, () => ({ x: 0, y: 0 }));
    let mode = "perched"; // perched | hopping | flying | casting | returning
    let flight = null;
    let hop = null;
    let nextHop = performance.now() + 6000; // a first flight soon after arriving
    let frame = 0;

    // Where it rests, in the layer's coordinates.
    const perch = () => {
      const box = root.getBoundingClientRect();
      const anchor = perchSelector && document.querySelector(perchSelector);
      if (anchor) {
        const a = anchor.getBoundingClientRect();
        return { x: a.right - box.left - 18, y: a.top - box.top + 26 };
      }
      return { x: box.width - 34, y: box.height - 110 };
    };

    const place = () => {
      body.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      trail.forEach((point, index) => {
        const el = trailRefs.current[index];
        if (el) el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
      });
    };

    const tick = (now) => {
      const home = perch();

      if (mode === "perched") {
        pos.x = home.x;
        pos.y = home.y + (asleepRef.current ? 0 : 2 * Math.sin(now / 420));
        if (!asleepRef.current && now >= nextHop) {
          hop = { start: now, dir: Math.random() < 0.5 ? -1 : 1 };
          mode = "hopping";
        }
      } else if (mode === "hopping") {
        const t = Math.min(1, (now - hop.start) / HOP_MS);
        const env = Math.sin(Math.PI * t); // leaves and lands on the perch
        const a = 2 * Math.PI * t;
        pos.x = home.x + hop.dir * env * (-70 + 34 * Math.cos(a * 1.5));
        pos.y = home.y + env * (-46 * Math.sin(a) + 18 * Math.sin(a * 2));
        if (t === 1) {
          mode = "perched";
          nextHop = now + randomGap();
        }
      } else if (mode === "flying" || mode === "returning") {
        const t = Math.min(1, (now - flight.start) / FLY_MS);
        const k = easeInOut(t);
        const to = mode === "returning" ? home : flight.to;
        pos.x = flight.from.x + (to.x - flight.from.x) * k;
        pos.y = flight.from.y + (to.y - flight.from.y) * k - Math.sin(Math.PI * t) * 26;
        if (t === 1) {
          if (mode === "flying") {
            mode = "casting";
            flight.resolve();
          } else {
            mode = "perched";
            nextHop = now + randomGap();
          }
        }
      } else if (mode === "casting") {
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
          // Asleep or reduced motion: the spell goes ahead without it.
          if (reduceMotion || asleepRef.current) {
            resolve();
            return;
          }
          const box = root.getBoundingClientRect();
          flight = {
            from: { ...pos },
            to: { x: clientX - box.left, y: clientY - box.top },
            start: performance.now(),
            resolve,
          };
          mode = "flying";
        }),
      release: () => {
        if (mode !== "casting" && mode !== "flying") return;
        flight = { ...flight, from: { ...pos }, start: performance.now() };
        mode = "returning";
      },
      sleep: () => {
        if (mode === "hopping") {
          flight = { from: { ...pos }, start: performance.now() };
          mode = "returning";
        }
      },
    };

    const settle = () => {
      Object.assign(pos, perch());
      trail.forEach((point) => Object.assign(point, pos));
      place();
    };

    if (reduceMotion) {
      settle();
      const onResize = () => settle();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    settle();
    frame = requestAnimationFrame(tick);

    // Coming back via the browser's back button: back on the perch.
    const onPageShow = (event) => {
      if (!event.persisted) return;
      mode = "perched";
      nextHop = performance.now() + randomGap();
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [perchSelector]);

  useImperativeHandle(ref, () => ({
    flyTo: (x, y) => api.current.flyTo(x, y),
    release: () => api.current.release(),
  }));

  const toggleSleep = () => {
    const next = !asleepRef.current;
    asleepRef.current = next;
    setAsleep(next);
    if (next) api.current.sleep?.();
    try {
      localStorage.setItem(SLEEP_KEY, next ? "sleep" : "awake");
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div ref={rootRef} className={`links-sprite-layer${fixed ? " is-fixed" : ""}`}>
      {Array.from({ length: TRAIL }, (_, index) => (
        <span
          key={index}
          ref={(el) => {
            trailRefs.current[index] = el;
          }}
          className={`links-sprite-trail is-${index + 1}`}
          aria-hidden="true"
        />
      ))}
      <button
        ref={bodyRef}
        type="button"
        className={`links-sprite${asleep ? " is-asleep" : ""}`}
        onClick={toggleSleep}
        aria-pressed={asleep}
        aria-label={asleep ? "Wake the sprite" : "Let the sprite rest"}
        title={asleep ? "叫醒小精靈" : "讓小精靈休息"}
      >
        <svg viewBox="0 0 34 30" aria-hidden="true">
          <ellipse className="links-sprite-wing is-left" cx="10" cy="12" rx="8" ry="5" transform="rotate(-25 10 12)" />
          <ellipse className="links-sprite-wing is-right" cx="24" cy="12" rx="8" ry="5" transform="rotate(25 24 12)" />
          <circle className="links-sprite-halo" cx="17" cy="17" r="9" />
          <circle className="links-sprite-core" cx="17" cy="17" r="4" />
          <text className="links-sprite-z" x="27" y="4">z</text>
        </svg>
      </button>
    </div>
  );
});

export default Sprite;
