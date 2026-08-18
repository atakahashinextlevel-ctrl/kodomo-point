/**
 * sound.js - Web Audio API による効果音生成エンジン
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  // AudioContext の初期化（ユーザー操作時にアンロック）
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // タップ音（ピロン♪）
  playTap() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // 周波数スイープ: 523Hz(C5) -> 784Hz(G5)
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 1つ戻す（Undo）音（ポロン↓）
  playUndo() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(392.00, now + 0.12); // G4

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 達成ファンファーレ（タ・タ・タ・ターン！！）
  playFanfare() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // メロディ: C5 -> E5 -> G5 -> C6
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.12 },
      { freq: 659.25, time: 0.14, dur: 0.12 },
      { freq: 783.99, time: 0.28, dur: 0.14 },
      { freq: 1046.50, time: 0.44, dur: 0.60 }
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.35, now + n.time);
      gain.gain.exponentialRampToValueAtTime(0.01, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  // リセット音（シュッ）
  playReset() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const sound = new SoundEngine();
