class Bullet {
  constructor(x, y, vx, vy, damage = 10, owner = 'player') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 3;
    this.damage = damage;
    this.owner = owner; // 'player' or 'enemy'
    this.life = 5;
    this.maxLife = 5;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;

    if (this.life <= 0) {
      this.dead = true;
    }

    // Off-screen cleanup
    if (this.x < -10 || this.x > 970 || this.y < -10 || this.y > 610) {
      this.dead = true;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.owner === 'player' ? '#00ff00' : '#ff8800';
    ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }
}

class BulletManager {
  constructor() {
    this.bullets = [];
  }

  spawn(x, y, vx, vy, damage = 10, owner = 'player') {
    this.bullets.push(new Bullet(x, y, vx, vy, damage, owner));
  }

  update(dt) {
    for (const bullet of this.bullets) {
      bullet.update(dt);
    }
    this.bullets = this.bullets.filter(b => !b.dead);
  }

  render(ctx) {
    for (const bullet of this.bullets) {
      bullet.render(ctx);
    }
  }

  clear() {
    this.bullets = [];
  }
}

const bulletManager = new BulletManager();
