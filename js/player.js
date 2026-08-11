class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.speed = 220;
    this.maxHealth = 100;
    this.health = 100;
    this.angle = 0;
    this.fireRate = 0.18;
    this.fireCooldown = 0;
    this.state = 'idle'; // idle, walk, shoot, hurt, death
    this.walkCycle = 0;
    this.hurtTimer = 0;
    this.deathTimer = 0;
    this.alive = true;
    this.score = 0;
    this.vx = 0;
    this.vy = 0;
  }

  update(dt) {
    if (!this.alive) {
      this.deathTimer += dt;
      if (this.deathTimer > 0.5) {
        this.alive = false;
      }
      return;
    }

    // Movement
    const moveX = Input.isDown('ArrowRight') - Input.isDown('ArrowLeft');
    const moveY = Input.isDown('ArrowDown') - Input.isDown('ArrowUp');
    const moveLen = Math.sqrt(moveX * moveX + moveY * moveY);

    if (moveLen > 0) {
      const normalizedX = moveX / moveLen;
      const normalizedY = moveY / moveLen;
      this.vx = normalizedX * this.speed;
      this.vy = normalizedY * this.speed;
      this.state = 'walk';
      this.walkCycle += dt * 8;
    } else {
      this.vx = 0;
      this.vy = 0;
      this.state = 'idle';
      this.walkCycle = 0;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Bounds
    this.x = clamp(this.x, this.radius, 960 - this.radius);
    this.y = clamp(this.y, this.radius, 600 - this.radius);

    // Aim
    this.angle = Math.atan2(Input.mouse.y - this.y, Input.mouse.x - this.x);

    // Shooting
    this.fireCooldown -= dt;
    if (Input.mouse.down && this.fireCooldown <= 0) {
      this.shoot();
      this.fireCooldown = this.fireRate;
      this.state = 'shoot';
    }

    // Hurt timer
    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      this.state = 'hurt';
    }
  }

  shoot() {
    const gunLength = 16;
    const gunTipX = this.x + Math.cos(this.angle) * gunLength;
    const gunTipY = this.y + Math.sin(this.angle) * gunLength;

    const bulletSpeed = 500;
    const vx = Math.cos(this.angle) * bulletSpeed;
    const vy = Math.sin(this.angle) * bulletSpeed;

    bulletManager.spawn(gunTipX, gunTipY, vx, vy, 10, 'player');
    particleSystem.spawnMuzzleFlash(gunTipX, gunTipY, this.angle);
    camera.shake(2, 0.1);
    Audio.playShoot();
  }

  takeDamage(amount) {
    this.health -= amount;
    this.hurtTimer = 0.15;
    camera.shake(3, 0.15);
    particleSystem.spawnBurst(this.x, this.y, 8, '#ff0000', 150, 0.4);
    Audio.playHit();

    if (this.health <= 0) {
      this.health = 0;
      this.state = 'death';
      this.deathTimer = 0;
      this.alive = false;
      particleSystem.spawnBurst(this.x, this.y, 16, '#ff4444', 250, 0.6);
      Audio.playDeath();
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Hurt flash
    if (this.state === 'hurt') {
      ctx.fillStyle = '#ffaaaa';
    } else {
      ctx.fillStyle = '#4488ff';
    }

    // Torso
    ctx.fillRect(-10, -10, 20, 20);

    // Death animation
    if (this.state === 'death') {
      const progress = this.deathTimer / 0.5;
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.scale(1 - progress * 0.3, 1 - progress * 0.3);
    }

    // Gun
    ctx.save();
    ctx.rotate(this.angle);
    ctx.fillStyle = '#222';
    ctx.fillRect(8, -3, 12, 6);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(18, -2, 3, 4);
    ctx.restore();

    // Legs
    const legOffset = this.state === 'walk' ? Math.sin(this.walkCycle) * 3 : 0;
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(-6, 10 + legOffset, 4, 8);
    ctx.fillRect(2, 10 - legOffset, 4, 8);

    ctx.restore();
  }
}
