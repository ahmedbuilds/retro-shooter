const LEVELS = [
  {
    id: 1,
    name: 'Level 1',
    waves: [
      {
        enemies: [{ type: 'chaser', count: 4 }],
        spawnInterval: 1.2,
        delay: 1.0,
      },
      {
        enemies: [
          { type: 'chaser', count: 3 },
          { type: 'swarmer', count: 3 },
        ],
        spawnInterval: 0.8,
        delay: 1.5,
      },
    ],
  },
  {
    id: 2,
    name: 'Level 2',
    waves: [
      {
        enemies: [{ type: 'chaser', count: 5 }],
        spawnInterval: 1.0,
        delay: 1.0,
      },
      {
        enemies: [
          { type: 'chaser', count: 2 },
          { type: 'shooter', count: 2 },
          { type: 'swarmer', count: 4 },
        ],
        spawnInterval: 0.7,
        delay: 1.5,
      },
    ],
  },
  {
    id: 3,
    name: 'Level 3',
    waves: [
      {
        enemies: [{ type: 'shooter', count: 3 }],
        spawnInterval: 1.0,
        delay: 1.0,
      },
      {
        enemies: [
          { type: 'chaser', count: 4 },
          { type: 'swarmer', count: 6 },
        ],
        spawnInterval: 0.6,
        delay: 1.5,
      },
      {
        enemies: [
          { type: 'chaser', count: 2 },
          { type: 'shooter', count: 3 },
          { type: 'swarmer', count: 3 },
        ],
        spawnInterval: 0.5,
        delay: 1.0,
      },
    ],
  },
  {
    id: 4,
    name: 'Level 4 - Final Wave',
    waves: [
      {
        enemies: [
          { type: 'chaser', count: 6 },
          { type: 'shooter', count: 4 },
          { type: 'swarmer', count: 8 },
        ],
        spawnInterval: 0.4,
        delay: 1.0,
      },
    ],
  },
];

class LevelController {
  constructor() {
    this.currentLevelId = 0;
    this.currentWaveIndex = 0;
    this.spawnTimer = 0;
    this.waveDelay = 0;
    this.enemyQueue = [];
    this.spawningWave = false;
  }

  startLevel(levelId) {
    this.currentLevelId = levelId;
    this.currentWaveIndex = 0;
    this.enemyQueue = [];
    this.spawningWave = false;
    this.waveDelay = 0;
    this.spawnTimer = 0;
    this.loadWave(0);
  }

  loadWave(waveIndex) {
    const level = LEVELS[this.currentLevelId];
    if (!level || waveIndex >= level.waves.length) {
      return;
    }

    const wave = level.waves[waveIndex];
    this.currentWaveIndex = waveIndex;
    this.enemyQueue = [];
    this.waveDelay = wave.delay;
    this.spawnTimer = 0;
    this.spawningWave = true;

    // Build enemy spawn queue
    for (const enemySpec of wave.enemies) {
      for (let i = 0; i < enemySpec.count; i++) {
        this.enemyQueue.push(enemySpec.type);
      }
    }

    // Randomize spawn order slightly
    for (let i = this.enemyQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.enemyQueue[i], this.enemyQueue[j]] = [this.enemyQueue[j], this.enemyQueue[i]];
    }
  }

  update(dt) {
    const level = LEVELS[this.currentLevelId];

    // Handle current wave spawning
    if (this.spawningWave && this.enemyQueue.length > 0) {
      const wave = level.waves[this.currentWaveIndex];
      const spawnInterval = wave.spawnInterval;

      this.spawnTimer += dt;
      while (this.spawnTimer >= spawnInterval && this.enemyQueue.length > 0) {
        this.spawnTimer -= spawnInterval;
        this.spawnNextEnemy();
      }
    }

    // Check if current wave is complete (all spawned + all dead)
    if (this.spawningWave && this.enemyQueue.length === 0 && enemyManager.getAliveEnemies().length === 0) {
      this.spawningWave = false;

      // Automatically advance to next wave if available
      const nextWaveIndex = this.currentWaveIndex + 1;
      if (nextWaveIndex < level.waves.length) {
        this.loadWave(nextWaveIndex);
      }
    }
  }

  spawnNextEnemy() {
    if (this.enemyQueue.length === 0) return;

    const type = this.enemyQueue.shift();
    const edge = Math.floor(Math.random() * 4); // 0=top, 1=bottom, 2=left, 3=right
    let x, y;

    switch (edge) {
      case 0: // top
        x = Math.random() * 960;
        y = -20;
        break;
      case 1: // bottom
        x = Math.random() * 960;
        y = 620;
        break;
      case 2: // left
        x = -20;
        y = Math.random() * 600;
        break;
      case 3: // right
        x = 980;
        y = Math.random() * 600;
        break;
    }

    enemyManager.spawn(x, y, type);
  }

  isLevelComplete() {
    return !this.spawningWave && enemyManager.getAliveEnemies().length === 0;
  }

  isLastLevel() {
    return this.currentLevelId === LEVELS.length - 1;
  }

  getProgressInfo() {
    const level = LEVELS[this.currentLevelId];
    const wave = this.currentWaveIndex + 1;
    const totalWaves = level.waves.length;
    const remaining = enemyManager.getAliveEnemies().length;
    return {
      level: this.currentLevelId + 1,
      wave,
      totalWaves,
      remaining,
      text: `Level ${this.currentLevelId + 1} - Wave ${wave}/${totalWaves}`,
    };
  }
}

const levelController = new LevelController();
