import { useEffect, useState } from "react";

const LATIN = "ABCDEFGHKMNPRSTUVXYZ0123456789#%&*+=/<>";
const CJK = "資料設計模型向量演算視覺介面";
const KEEP = "·（）()";

const isCJK = (char) => /[⺀-鿿＀-￯]/.test(char);
const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];

// Decodes `text` left to right from random glyphs. CJK characters scramble
// with CJK glyphs so the line keeps roughly the same width while it decodes.
export function useScramble(text, { delay = 0, duration = 900 } = {}) {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOutput(text);
      return undefined;
    }

    const chars = [...text];
    const start = performance.now() + delay;
    let frame = 0;
    let lastSwap = 0;

    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      // Swap glyphs ~20 times a second so it reads as decoding, not noise.
      if (now - lastSwap > 50 || progress === 1) {
        lastSwap = now;
        const revealed = Math.floor(progress * chars.length);
        setOutput(
          chars
            .map((char, index) => {
              if (index < revealed || char.trim() === "" || KEEP.includes(char)) {
                return char;
              }
              return isCJK(char) ? pick(CJK) : pick(LATIN);
            })
            .join(""),
        );
      }
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, delay, duration]);

  return output;
}
