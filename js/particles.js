class Particle {
  constructor(x, y, vx, vy, life, color, size = 3) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.color = color;
    this.size = size;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.vy += 100 * dt; // simple gravity
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawnBurst(x, y, count, color, speed = 200, life = 0.5) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.particles.push(new Particle(x, y, vx, vy, life, color, 2));
    }
  }

  spawnMuzzleFlash(x, y, angle) {
    const flashCount = 3;
    for (let i = 0; i < flashCount; i++) {
      const spreadAngle = angle + randRange(-0.3, 0.3);
      const speed = randRange(400, 600);
      const vx = Math.cos(spreadAngle) * speed;
      const vy = Math.sin(spreadAngle) * speed;
      this.particles.push(new Particle(x, y, vx, vy, 0.1, '#ffaa00', 4));
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }
}

class Camera {
  constructor() {
    this.shakeAmount = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
  }

  shake(magnitude, duration) {
    this.shakeAmount = magnitude;
    this.shakeDuration = duration;
    this.shakeTimer = 0;
  }

  update(dt) {
    if (this.shakeTimer < this.shakeDuration) {
      this.shakeTimer += dt;
    }
  }

  getShakeOffset() {
    if (this.shakeTimer >= this.shakeDuration) return { x: 0, y: 0 };
    const progress = this.shakeTimer / this.shakeDuration;
    const decayFactor = 1 - progress;
    return {
      x: (Math.random() - 0.5) * this.shakeAmount * 2 * decayFactor,
      y: (Math.random() - 0.5) * this.shakeAmount * 2 * decayFactor,
    };
  }
}

const particleSystem = new ParticleSystem();
const camera = new Camera();
