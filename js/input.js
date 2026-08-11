const Input = {
  keys: {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  },
  mouse: {
    x: 0,
    y: 0,
    down: false,
  },

  isDown(key) {
    return this.keys[key] || false;
  },
};

document.addEventListener('keydown', (e) => {
  if (Input.keys.hasOwnProperty(e.key)) {
    Input.keys[e.key] = true;
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  if (Input.keys.hasOwnProperty(e.key)) {
    Input.keys[e.key] = false;
    e.preventDefault();
  }
});

const gameCanvasElement = document.getElementById('gameCanvas');

if (gameCanvasElement) {
  gameCanvasElement.addEventListener('mousemove', (e) => {
    const rect = gameCanvasElement.getBoundingClientRect();
    Input.mouse.x = e.clientX - rect.left;
    Input.mouse.y = e.clientY - rect.top;
  });

  gameCanvasElement.addEventListener('mousedown', () => {
    Input.mouse.down = true;
  });

  gameCanvasElement.addEventListener('mouseup', () => {
    Input.mouse.down = false;
  });

  gameCanvasElement.addEventListener('mouseleave', () => {
    Input.mouse.down = false;
  });
}
