let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'square', volume = 0.1) {
  try {
    const ctx = getAudioCtx();
    // Mobile browsers suspend AudioContext until resumed during a user gesture
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not available
  }
}

export function playToggle() {
  playTone(440, 0.02, 'square', 0.08);
}

export function playSolve() {
  const notes = [523, 659, 784];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'sine', 0.15), i * 100);
  });
}

export function playGold() {
  const fanfare = [523, 659, 784, 1047];
  fanfare.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.2), i * 80);
  });
}

export function playClick() {
  playTone(220, 0.05, 'square', 0.06);
}
