// Tiny Web Audio helper: procedural sounds, no audio files needed.
const Sound = (() => {
  let ctx = null;
  let enabled = localStorage.getItem('boxySound') !== 'off';

  function isEnabled() { return enabled; }
  function setEnabled(v) {
    enabled = v;
    localStorage.setItem('boxySound', v ? 'on' : 'off');
  }

  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(type, f0, f1, dur, vol, delay) {
    if (!enabled) return;
    const ac = ensure();
    const t = ac.currentTime + (delay || 0);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  return {
    isEnabled,
    setEnabled,
    flap()  { tone('sine', 350, 800, 0.10, 0.22); },
    score() { tone('sine', 880, 880, 0.09, 0.20); tone('sine', 1318, 1318, 0.14, 0.20, 0.09); },
    crash() { tone('sawtooth', 220, 45, 0.35, 0.28); tone('square', 110, 40, 0.30, 0.16); },
  };
})();

window.BoxySound = Sound;
