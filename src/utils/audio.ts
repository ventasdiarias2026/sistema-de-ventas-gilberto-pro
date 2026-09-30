/**
 * Synthesizes a celebratory triumphant sound effect using the standard Web Audio API.
 * Autonomous, 100% offline, requires zero external audio files.
 */
export function playVictorySound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Arpeggio notes for a triumphant major chord fanfare: C5, E5, G5, C6, E6, G6
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
      { freq: 659.25, time: 0.12, dur: 0.15 }, // E5
      { freq: 783.99, time: 0.24, dur: 0.18 }, // G5
      { freq: 1046.5, time: 0.38, dur: 0.45 }, // C6
      { freq: 1318.51, time: 0.45, dur: 0.7 }, // E6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Rich, warm, brass-like tone
      osc.frequency.setValueAtTime(freq, now + time);

      // Volume envelope (attack, decay)
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.3, now + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });

    // Add a secondary celebratory sub-chime (bell-like high harmonic)
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(1567.98, now + 0.4); // G6 bell
    bellGain.gain.setValueAtTime(0.001, now + 0.4);
    bellGain.gain.exponentialRampToValueAtTime(0.18, now + 0.45);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    bellOsc.connect(bellGain);
    bellGain.connect(ctx.destination);
    bellOsc.start(now + 0.4);
    bellOsc.stop(now + 1.2);
  } catch (err) {
    console.warn('Audio playback error (browser policy or not supported):', err);
  }
}
