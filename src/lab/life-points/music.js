// Ambient score generated in the browser (Web Audio). No files, no network.
// Muffled and low inside the cave; brighter, with more chimes, as you walk out.

const CHORDS = [
  [45, 52, 57, 60, 64], // Am
  [41, 48, 53, 57, 64], // Fmaj7
  [48, 55, 60, 64, 67], // C
  [40, 47, 55, 59, 62], // Em7
];
const BELLS = [69, 72, 74, 76, 79, 81, 84];
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

export function createMusic() {
  let ctx = null;
  let master, filter, wet;
  let on = false;
  let bright = 0;
  let chordAt = 0;
  let timers = [];

  function impulse(sec) {
    const len = Math.round(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
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
    verb.buffer = impulse(4);
    wet = ctx.createGain();
    wet.gain.value = 0.55;
    wet.connect(verb).connect(master);
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.4;
    filter.frequency.value = 420;
    filter.connect(master);
    filter.connect(wet);
    return true;
  }

  function pad() {
    const t = ctx.currentTime + 0.05;
    const chord = CHORDS[chordAt++ % CHORDS.length];
    chord.forEach((m, i) => {
      [-5, 5].forEach((cents) => {
        const o = ctx.createOscillator();
        o.type = i === 0 ? "sine" : "triangle";
        o.frequency.value = hz(m);
        o.detune.value = cents;
        const g = ctx.createGain();
        const peak = (i === 0 ? 0.07 : 0.035) / 2;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 3.5);
        g.gain.setValueAtTime(peak, t + 7);
        g.gain.linearRampToValueAtTime(0, t + 11.5);
        o.connect(g).connect(filter);
        o.start(t);
        o.stop(t + 12);
      });
    });
  }

  function bell() {
    const t = ctx.currentTime + 0.05;
    const m = BELLS[Math.floor(Math.random() * BELLS.length)];
    [[1, 0.05], [2.01, 0.012]].forEach(([mult, peak]) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = hz(m) * mult;
      const g = ctx.createGain();
      const v = peak * (0.35 + bright * 0.65);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      o.connect(g);
      g.connect(wet);
      g.connect(master);
      o.start(t);
      o.stop(t + 3.3);
    });
  }

  function loop(fn, ms) {
    const id = setTimeout(function run() {
      if (on && ctx.state === "running") fn();
      timers[timers.indexOf(id)] = setTimeout(run, ms());
    }, ms());
    timers.push(id);
  }

  function play() {
    if (!ctx && !setup()) return;
    ctx.resume();
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0.9, t + 2.5);
    if (!timers.length) {
      pad();
      loop(pad, () => 8000);
      loop(bell, () => 5200 - bright * 3200 + Math.random() * 2500);
    }
  }

  function stop() {
    if (!ctx) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.6);
    setTimeout(() => { if (!on) ctx.suspend(); }, 700);
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
      filter.frequency.setTargetAtTime(420 + g * g * 2600, ctx.currentTime, 0.4);
    },
    pause(hidden) {
      if (!ctx || !on) return;
      if (hidden) ctx.suspend();
      else ctx.resume();
    },
  };
}
