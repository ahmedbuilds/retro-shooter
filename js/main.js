const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_STATE = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_COMPLETE: 'level_complete',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
};

let gameState = GAME_STATE.MENU;
let player = null;
let lastTime = 0;

function init() {
  player = new Player(480, 300);
  levelController.startLevel(0);
}

function startGame() {
  init();
  gameState = GAME_STATE.PLAYING;
  Audio.init();
  Audio.resume();
  UI.showScreen('hud');
}

function pauseGame() {
  gameState = GAME_STATE.PAUSED;
  UI.showScreen('pause-screen');
}

function resumeGame() {
  gameState = GAME_STATE.PLAYING;
  UI.showScreen('hud');
}

function restartGame() {
  bulletManager.clear();
  enemyManager.clear();
  particleSystem.particles = [];
  init();
  gameState = GAME_STATE.PLAYING;
  UI.showScreen('hud');
}

function returnToMenu() {
  bulletManager.clear();
  enemyManager.clear();
  particleSystem.particles = [];
  gameState = GAME_STATE.MENU;
  player = null;
  UI.showScreen('menu-screen');
}

function nextLevel() {
  const nextLevelId = levelController.currentLevelId + 1;
  if (nextLevelId < LEVELS.length) {
    bulletManager.clear();
    enemyManager.clear();
    particleSystem.particles = [];
    player.health = player.maxHealth;
    player.alive = true;
    levelController.startLevel(nextLevelId);
    gameState = GAME_STATE.PLAYING;
    UI.showScreen('hud');
  } else {
    gameState = GAME_STATE.VICTORY;
    UI.showVictory(player);
    Audio.playLevelComplete();
  }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    if (gameState === GAME_STATE.PLAYING) {
      pauseGame();
    } else if (gameState === GAME_STATE.PAUSED) {
      resumeGame();
    }
  }
});

// Wire UI buttons
UI.wireButtons({
  onStart: startGame,
  onResume: resumeGame,
  onRestart: restartGame,
  onMenu: returnToMenu,
  onNextLevel: nextLevel,
});

function update(dt) {
  if (gameState !== GAME_STATE.PLAYING) return;

  // Update systems
  player.update(dt);
  levelController.update(dt);
  enemyManager.update(dt, player);
  bulletManager.update(dt);
  particleSystem.update(dt);
  camera.update(dt);

  // Bullet vs Enemy collisions
  for (let i = bulletManager.bullets.length - 1; i >= 0; i--) {
    const bullet = bulletManager.bullets[i];
    if (bullet.owner !== 'player') continue;

    for (const enemy of enemyManager.enemies) {
      if (circleCollision(bullet.x, bullet.y, bullet.radius, enemy.x, enemy.y, enemy.radius)) {
        if (enemy.alive) {
          enemy.takeDamage(bullet.damage);
          if (!enemy.alive) {
            player.score += enemy.scoreValue;
          }
        }
        bullet.dead = true;
        break;
      }
    }
  }

  // Enemy bullets vs Player
  for (let i = bulletManager.bullets.length - 1; i >= 0; i--) {
    const bullet = bulletManager.bullets[i];
    if (bullet.owner !== 'enemy') continue;

    if (circleCollision(bullet.x, bullet.y, bullet.radius, player.x, player.y, player.radius)) {
      if (player.alive) {
        player.takeDamage(bullet.damage);
      }
      bullet.dead = true;
    }
  }

  // Enemy melee contact with Player
  for (const enemy of enemyManager.enemies) {
    if (enemy.behavior === 'melee' && enemy.alive && enemy.state === 'active') {
      if (circleCollision(enemy.x, enemy.y, enemy.radius, player.x, player.y, player.radius)) {
        if (enemy.attackCooldown <= 0 && player.alive) {
          player.takeDamage(enemy.damage);
          enemy.attackCooldown = 0.5;
        }
      }
    }
  }

  // Check level complete
  if (levelController.isLevelComplete() && player.alive) {
    gameState = GAME_STATE.LEVEL_COMPLETE;
    Audio.playLevelComplete();
    UI.showLevelComplete(player);
  }

  // Check game over
  if (!player.alive) {
    gameState = GAME_STATE.GAME_OVER;
    Audio.playGameOver();
    UI.showGameOver(player);
  }
}

function render(ctx) {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Apply camera shake
  const shake = camera.getShakeOffset();
  ctx.translate(shake.x, shake.y);

  // Render game world
  if (gameState === GAME_STATE.PLAYING || gameState === GAME_STATE.PAUSED || gameState === GAME_STATE.LEVEL_COMPLETE) {
    if (player) player.render(ctx);
    enemyManager.render(ctx);
    bulletManager.render(ctx);
    particleSystem.render(ctx);
  }

  ctx.translate(-shake.x, -shake.y);

  // Update HUD
  if (gameState === GAME_STATE.PLAYING && player) {
    UI.updateHUD(player, levelController);
  }
}

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  update(dt);
  render(ctx);

  requestAnimationFrame(loop);
}

UI.showScreen('menu-screen');
requestAnimationFrame(loop);
