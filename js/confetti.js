/**
 * confetti.js - Canvas ベースの紙吹雪アニメーション
 */

class ConfettiEngine {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationFrame = null;
    this.isRunning = false;
    this.colors = ['#FF477E', '#FF70A6', '#FF9770', '#FFD670', '#E9FF70', '#70D6FF', '#70FFA8'];
  }

  setup() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    this.setup();
    if (!this.canvas || !this.ctx) return;

    this.stop(); // 既存のアニメーションがあれば停止
    this.isRunning = true;
    this.particles = [];

    // 120個の紙吹雪粒子を生成
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height * 0.8,
        size: Math.random() * 8 + 6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngle: Math.random() * Math.PI,
        tiltAngleInc: Math.random() * 0.08 + 0.04,
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1
      });
    }

    const loop = () => {
      if (!this.isRunning) return;
      this.update();
      this.draw();
      this.animationFrame = requestAnimationFrame(loop);
    };

    loop();
  }

  update() {
    if (!this.canvas) return;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      p.tiltAngle += p.tiltAngleInc;
      p.tilt = Math.sin(p.tiltAngle) * 12;

      // 画面下部に到達したら上部にリサイクル
      if (p.y > this.canvas.height) {
        p.y = -20;
        p.x = Math.random() * this.canvas.width;
      }
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.beginPath();
      this.ctx.lineWidth = p.size;
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.x + p.tilt + p.size / 2, p.y);
      this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.size / 2);
      this.ctx.stroke();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

export const confetti = new ConfettiEngine('confetti-canvas');
