// sounds.js — tiny Web Audio–based UI sound effects (no external audio files needed)
window.SoundManager = (() => {
  let ctx = null;
  let muted = false;
  try {
    muted = localStorage.getItem('yslanotes-muted') === 'true';
  } catch (e) {}

  function getCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ freq, duration = 0.15, type = 'sine', delay = 0, gain = 0.12 }) {
    if (muted) return;
    try {
      const audioCtx = getCtx();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const startTime = audioCtx.currentTime + delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.03);
    } catch (e) {}
  }

  // A plain oscillator sweep just sounds like a tonal "boing" — real barks get their
  // gruff, percussive texture from a burst of noise, not a pure tone. This layers
  // filtered noise (the "yip" texture) under a quick pitched sweep (the body/pitch),
  // tuned higher for a small dog like Hoshi rather than a deep woof.
  function noiseBuffer(audioCtx, duration) {
    const size = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
    const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function yip(delay) {
    if (muted) return;
    try {
      const audioCtx = getCtx();
      if (!audioCtx) return;
      const startTime = audioCtx.currentTime + delay;

      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer(audioCtx, 0.12);
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.Q.value = 2.2;
      noiseFilter.frequency.setValueAtTime(1600, startTime);
      noiseFilter.frequency.exponentialRampToValueAtTime(550, startTime + 0.1);
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0, startTime);
      noiseGain.gain.linearRampToValueAtTime(0.4, startTime + 0.006);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.11);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noiseSource.start(startTime);
      noiseSource.stop(startTime + 0.13);

      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(950, startTime);
      osc.frequency.exponentialRampToValueAtTime(420, startTime + 0.09);
      const oscGain = audioCtx.createGain();
      oscGain.gain.setValueAtTime(0, startTime);
      oscGain.gain.linearRampToValueAtTime(0.1, startTime + 0.006);
      oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.12);
    } catch (e) {}
  }

  return {
    isMuted: () => muted,
    setMuted(value) {
      muted = value;
      try { localStorage.setItem('yslanotes-muted', String(value)); } catch (e) {}
    },
    click() { tone({ freq: 720, duration: 0.07, type: 'sine', gain: 0.07 }); },
    bark() { yip(0); yip(0.15); },
    flip() { tone({ freq: 480, duration: 0.12, type: 'triangle', gain: 0.08 }); },
    correct() {
      tone({ freq: 660, duration: 0.12, type: 'sine', gain: 0.12 });
      tone({ freq: 880, duration: 0.18, type: 'sine', delay: 0.1, gain: 0.12 });
    },
    incorrect() {
      tone({ freq: 300, duration: 0.18, type: 'sawtooth', gain: 0.07 });
      tone({ freq: 220, duration: 0.22, type: 'sawtooth', delay: 0.1, gain: 0.07 });
    },
    complete() {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        tone({ freq, duration: 0.25, type: 'sine', delay: i * 0.12, gain: 0.12 });
      });
    }
  };
})();

// Wires up: any element with data-sound="click" plays a soft click, and every
// .mute-toggle button on the page (there may be a desktop AND a mobile copy)
// toggles sound in sync, each showing/hiding its own #mute-icon-on/#mute-icon-off pair.
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-sound="click"]');
    if (el) window.SoundManager.click();
  }, true);

  const muteBtns = document.querySelectorAll('.mute-toggle');
  if (muteBtns.length === 0) return;

  function syncIcons() {
    const isMuted = window.SoundManager.isMuted();
    muteBtns.forEach(btn => {
      const iconOn = btn.querySelector('[id^="mute-icon-on"]');
      const iconOff = btn.querySelector('[id^="mute-icon-off"]');
      if (iconOn) iconOn.classList.toggle('hidden', isMuted);
      if (iconOff) iconOff.classList.toggle('hidden', !isMuted);
    });
  }

  syncIcons();
  muteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.SoundManager.setMuted(!window.SoundManager.isMuted());
      syncIcons();
    });
  });
});
