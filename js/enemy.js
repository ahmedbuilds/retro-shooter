const ENEMY_TYPES = {
  chaser: {
    radius: 14,
    speed: 90,
    health: 20,
    damage: 10,
    color: '#ff4444',
    shape: 'triangle',
    scoreValue: 10,
    behavior: 'melee',
  },
  shooter: {
    radius: 12,
    speed: 50,
    health: 15,
    damage: 8,
    color: '#ffaa00',
    shape: 'diamond',
    scoreValue: 20,
    behavior: 'ranged',
    fireRate: 1.5,
    bulletSpeed: 200,
    preferredRange: 250,
  },
  swarmer: {
    radius: 8,
    speed: 160,
    health: 8,
    damage: 5,
    color: '#ff66ff',
    shape: 'small-triangle',
    scoreValue: 5,
    behavior: 'melee',
  },
};

class Enemy {
  constructor(x, y, type) {
    const typeData = ENEMY_TYPES[type];
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = typeData.radius;
    this.speed = typeData.speed;
    this.maxHealth = typeData.health;
    this.health = typeData.health;
    this.damage = typeData.damage;
    this.color = typeData.color;
    this.shape = typeData.shape;
    this.scoreValue = typeData.scoreValue;
    this.behavior = typeData.behavior;
    this.state = 'spawn'; // spawn, active, hurt, death
    this.spawnTimer = 0.2;
    this.hurtTimer = 0;
    this.deathTimer = 0;
    this.alive = true;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.attackCooldown = 0;

    // For ranged types
    if (typeData.behavior === 'ranged') {
      this.fireRate = typeData.fireRate;
      this.fireCooldown = 0;
      this.bulletSpeed = typeData.bulletSpeed;
      this.preferredRange = typeData.preferredRange;
    }
  }

  update(dt, player) {
    if (!this.alive) {
      this.deathTimer += dt;
      if (this.deathTimer > 0.5) {
        this.alive = false;
      }
      return;
    }

    // Spawn animation
    if (this.state === 'spawn') {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.state = 'active';
      }
      return;
    }

    // Hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      this.state = 'hurt';
    } else if (this.state === 'hurt') {
      this.state = 'active';
    }

    // AI behavior
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distToPlayer = dist(this.x, this.y, player.x, player.y);
    this.angle = Math.atan2(dy, dx);

    if (this.behavior === 'melee') {
      // Chase player
      if (distToPlayer > 5) {
        const moveX = (dx / distToPlayer) * this.speed;
        const moveY = (dy / distToPlayer) * this.speed;
        this.vx = moveX;
        this.vy = moveY;
      } else {
        this.vx = 0;
        this.vy = 0;
      }
    } else if (this.behavior === 'ranged') {
      // Maintain range and shoot
      if (distToPlayer > this.preferredRange) {
        const moveX = (dx / distToPlayer) * this.speed;
        const moveY = (dy / distToPlayer) * this.speed;
        this.vx = moveX;
        this.vy = moveY;
      } else if (distToPlayer < this.preferredRange - 50) {
        const moveX = (dx / distToPlayer) * -this.speed;
        const moveY = (dy / distToPlayer) * -this.speed;
        this.vx = moveX;
        this.vy = moveY;
      } else {
        this.vx *= 0.8;
        this.vy *= 0.8;
      }

      // Shoot
      this.fireCooldown -= dt;
      if (this.fireCooldown <= 0 && distToPlayer < this.preferredRange + 100) {
        this.shoot(player);
        this.fireCooldown = this.fireRate;
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Screen bounds
    this.x = clamp(this.x, this.radius, 960 - this.radius);
    this.y = clamp(this.y, this.radius, 600 - this.radius);

    // Attack cooldown (melee contact damage)
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }
  }

  shoot(player) {
    const bulletSpawnDist = 12;
    const bulletX = this.x + Math.cos(this.angle) * bulletSpawnDist;
    const bulletY = this.y + Math.sin(this.angle) * bulletSpawnDist;
    const vx = Math.cos(this.angle) * this.bulletSpeed;
    const vy = Math.sin(this.angle) * this.bulletSpeed;
    bulletManager.spawn(bulletX, bulletY, vx, vy, this.damage, 'enemy');
  }

  takeDamage(amount) {
    this.health -= amount;
    this.hurtTimer = 0.15;
    particleSystem.spawnBurst(this.x, this.y, 6, '#ff8800', 120, 0.3);
    Audio.playHit();

    if (this.health <= 0) {
      this.state = 'death';
      this.deathTimer = 0;
      this.alive = false;
      particleSystem.spawnBurst(this.x, this.y, 12, this.color, 200, 0.5);
      Audio.playDeath();
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Spawn fade-in
    if (this.state === 'spawn') {
      ctx.globalAlpha = 1 - this.spawnTimer / 0.2;
    }

    // Hurt flash
    if (this.state === 'hurt') {
      ctx.fillStyle = '#ffaaaa';
    } else {
      ctx.fillStyle = this.color;
    }

    // Death animation
    if (this.state === 'death') {
      const progress = this.deathTimer / 0.5;
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.scale(1 - progress * 0.2, 1 - progress * 0.2);
    }

    // Draw shape
    if (this.shape === 'triangle') {
      this.drawTriangle(ctx, this.radius);
    } else if (this.shape === 'diamond') {
      this.drawDiamond(ctx, this.radius);
    } else if (this.shape === 'small-triangle') {
      this.drawTriangle(ctx, this.radius);
    }

    ctx.restore();
  }

  drawTriangle(ctx, r) {
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, r);
    ctx.lineTo(-r, r);
    ctx.closePath();
    ctx.fill();
  }

  drawDiamond(ctx, r) {
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r, 0);
    ctx.closePath();
    ctx.fill();
  }
}

class EnemyManager {
  constructor() {
    this.enemies = [];
  }

  spawn(x, y, type) {
    this.enemies.push(new Enemy(x, y, type));
  }

  update(dt, player) {
    for (const enemy of this.enemies) {
      enemy.update(dt, player);
    }
    this.enemies = this.enemies.filter(e => e.alive || e.state !== 'death' || e.deathTimer < 0.5);
  }

  render(ctx) {
    for (const enemy of this.enemies) {
      enemy.render(ctx);
    }
  }

  clear() {
    this.enemies = [];
  }

  getAliveEnemies() {
    return this.enemies.filter(e => e.state !== 'spawn' && e.state !== 'death' && e.alive);
  }

  getDeadCount() {
    return this.enemies.filter(e => !e.alive).length;
  }
}

const enemyManager = new EnemyManager();
