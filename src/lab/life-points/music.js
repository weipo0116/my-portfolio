// Ambient score generated in the browser (Web Audio). No files, no network.
// A slow drone, singing-bowl tones and water drips in the cave; as you walk
// out toward the light the drone opens up and a high, airy shimmer joins in.

const DRONES = [
  [33, 45, 52], // A
  [29, 41, 48], // F
  [36, 48, 55], // C
  [31, 43, 50], // G
];
const BOWLS = [57, 60, 62, 64, 67, 69, 72]; // A minor pentatonic, mid register
const AIR = [76, 79, 81, 84, 86, 88];
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

export function createMusic() {
  let ctx = null;
  let master, filter, wet, air;
  let on = false;
  let bright = 0;
  let droneAt = 0;
  const timers = [];

  function impulse(sec) {
    const len = Math.round(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3.2;
    }
    return buf;
  }

  function setup() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const verb = ctx.createConvolver();
    verb.buffer = impulse(7);
    wet = ctx.createGain();
    wet.gain.value = 0.8;
    wet.connect(verb).connect(master);
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.3;
    filter.frequency.value = 380;
    filter.connect(master);
    filter.connect(wet);
    air = ctx.createGain();
    air.gain.value = 0;
    air.connect(wet);
    return true;
  }

  function voice(freq, type, peak, attack, hold, release, dest, t0 = 0) {
    const t = ctx.currentTime + 0.05 + t0;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + attack + hold);
    g.gain.linearRampToValueAtTime(0, t + attack + hold + release);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + attack + hold + release + 0.1);
    return o;
  }

  // long breathing drone, a new root every ~16s with wide overlap
  function drone() {
    const notes = DRONES[droneAt++ % DRONES.length];
    notes.forEach((m, i) => {
      const peak = [0.07, 0.08, 0.04][i];
      [-3, 3].forEach((c) => {
        const o = voice(hz(m), "sine", peak / 2, 6, 8, 9, filter);
        o.detune.value = c;
      });
    });
  }

  // singing bowl: inharmonic partials with slow beating and a long tail
  function bowl() {
    const t = ctx.currentTime + 0.05;
    const f = hz(BOWLS[Math.floor(Math.random() * BOWLS.length)]);
    [[1, 0.045], [2.71, 0.018], [5.13, 0.007]].forEach(([mult, peak]) => {
      [0, 1.6].forEach((beat) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f * mult + beat;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 9 / mult + 2);
        o.connect(g);
        g.connect(wet);
        g.connect(filter);
        o.start(t);
        o.stop(t + 11.5);
      });
    });
  }

  // a single water drop echoing in the cave (fades out as you leave it)
  function drip() {
    if (bright > 0.7) return;
    const t = ctx.currentTime + 0.05;
    const o = ctx.createOscillator();
    o.type = "sine";
    const f = 900 + Math.random() * 700;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 2.2, t + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.03 * (1 - bright), t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(wet);
    o.start(t);
    o.stop(t + 0.15);
  }

  // high, airy shimmer once the sky opens
  function shimmer() {
    if (bright < 0.35) return;
    const m = AIR[Math.floor(Math.random() * AIR.length)];
    voice(hz(m), "sine", 0.012, 2.5, 1.5, 5, air);
  }

  function loop(fn, ms) {
    const slot = timers.length;
    const run = () => {
      if (on && ctx.state === "running") fn();
      timers[slot] = setTimeout(run, ms());
    };
    timers[slot] = setTimeout(run, ms());
  }

  function play() {
    if (!ctx && !setup()) return;
    ctx.resume();
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.85, t + 4);
    if (!timers.length) {
      drone();
      setTimeout(() => on && bowl(), 2500);
      loop(drone, () => 16000);
      loop(bowl, () => 9000 + Math.random() * 7000);
      loop(drip, () => 1800 + Math.random() * 4200);
      loop(shimmer, () => 2500 + Math.random() * 3000);
    }
  }

  function stop() {
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.8);
    setTimeout(() => { if (!on) ctx.suspend(); }, 900);
  }

  return {
    get on() { return on; },
    set(next) {
      on = next;
      if (on) play();
      else stop();
    },
    // 0 = deep in the cave, 1 = under the open sky
    light(g) {
      bright = g;
      if (!ctx) return;
      filter.frequency.setTargetAtTime(380 + g * g * 1800, ctx.currentTime, 0.6);
      air.gain.setTargetAtTime(clamp01((g - 0.3) / 0.5), ctx.currentTime, 0.8);
    },
    pause(hidden) {
      if (!ctx || !on) return;
      if (hidden) ctx.suspend();
      else ctx.resume();
    },
  };
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
