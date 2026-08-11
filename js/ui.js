const UI = {
  currentScreen: 'menu-screen',

  showScreen(screenId) {
    const allScreens = [
      'menu-screen',
      'pause-screen',
      'level-complete-screen',
      'game-over-screen',
      'victory-screen',
      'hud',
    ];

    for (const screen of allScreens) {
      const el = document.getElementById(screen);
      if (el) {
        el.classList.add('hidden');
      }
    }

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
    }

    this.currentScreen = screenId;
  },

  updateHUD(player, levelController) {
    const healthEl = document.getElementById('health-value');
    const scoreEl = document.getElementById('score-value');
    const levelEl = document.getElementById('level-info');

    if (healthEl) healthEl.textContent = Math.max(0, Math.floor(player.health));
    if (scoreEl) scoreEl.textContent = player.score;
    if (levelEl) {
      const info = levelController.getProgressInfo();
      levelEl.textContent = info.text;
    }
  },

  showLevelComplete(player) {
    const scoreEl = document.getElementById('level-complete-score');
    if (scoreEl) scoreEl.textContent = player.score;
    this.showScreen('level-complete-screen');
  },

  showGameOver(player) {
    const scoreEl = document.getElementById('game-over-score');
    if (scoreEl) scoreEl.textContent = player.score;
    this.showScreen('game-over-screen');
  },

  showVictory(player) {
    const scoreEl = document.getElementById('victory-score');
    if (scoreEl) scoreEl.textContent = player.score;
    this.showScreen('victory-screen');
  },

  wireButtons(callbacks) {
    const buttons = {
      'start-button': callbacks.onStart,
      'resume-button': callbacks.onResume,
      'restart-button': callbacks.onRestart,
      'menu-button': callbacks.onMenu,
      'next-level-button': callbacks.onNextLevel,
      'restart-game-button': callbacks.onRestart,
      'menu-game-button': callbacks.onMenu,
      'restart-victory-button': callbacks.onRestart,
      'menu-victory-button': callbacks.onMenu,
    };

    for (const [buttonId, callback] of Object.entries(buttons)) {
      const btn = document.getElementById(buttonId);
      if (btn && callback) {
        btn.addEventListener('click', callback);
      }
    }
  },
};
