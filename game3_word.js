function drawCenteredText(s, title, subtitle, instruction) {
  const titleSize = s.width * 0.05; // 5% of width
  const subtitleSize = s.width * 0.02;
  const instructionSize = s.width * 0.02;

  s.textAlign(s.CENTER, s.CENTER);
  s.fill(255);

  // Title
  s.textSize(titleSize);
  s.text(title, s.width / 2, s.height / 2 - titleSize * 1.2);

  // Subtitle
  s.textSize(subtitleSize);
  s.text(subtitle, s.width / 2, s.height / 2);

  // Instruction (highlighted)
  s.textSize(instructionSize);
  s.text(instruction, s.width / 2, s.height / 2 + titleSize * 1);
}

window.p5Instance = new p5((s) => {
  // --- Game Configuration ---
  const GRID_SIZE = 11;
  const TARGET_WORD = "UNGARNSGADE";

  // --- Game State Variables ---
  let grid;
  let cellSize;
  let gameState = "start"; // 'start', 'playing', 'won'

  // --- Selection Variables ---
  let isDragging = false;
  let startCell = null;
  let currentCell = null;

  // --- Setup ---
  s.setup = () => {
    const container = document.getElementById("game-container");
    const canvas = s.createCanvas(
      container.clientWidth,
      container.clientHeight
    );
    canvas.parent("game-container");
    s.colorMode(s.HSB, 360, 100, 100, 100);
    s.textAlign(s.CENTER, s.CENTER);
    s.textFont("monospace");
    initializeGame();
  };

  function initializeGame() {
    isDragging = false;
    startCell = null;
    currentCell = null;

    // 🧩 Easy scaling controls:
    const widthScale = 0.95; // make grid fill more horizontally
    const heightScale = 0.8; // make grid slightly smaller vertically

    // 🧮 Calculate separate dimensions
    const gridWidth = s.width * widthScale;
    const gridHeight = s.height * heightScale;

    // Use smaller dimension to determine square cell size
    cellSize = Math.min(gridWidth / GRID_SIZE, gridHeight / GRID_SIZE);

    s.textSize(cellSize * 0.7);

    grid = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++) {
      grid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        grid[r][c] = alphabet.charAt(Math.floor(s.random(alphabet.length)));
      }
    }

    // Place target word horizontally in a random row
    const row = Math.floor(s.random(GRID_SIZE));
    const col = Math.floor(s.random(GRID_SIZE - TARGET_WORD.length + 1));
    for (let i = 0; i < TARGET_WORD.length; i++) {
      grid[row][col + i] = TARGET_WORD.charAt(i);
    }
  }

  // --- Draw Loop ---
  s.draw = () => {
    s.background(0);

    if (gameState === "start") {
      drawCenteredText(
        s,
        "GAME 3 — WORD HUNT",
        "Find the hidden word by dragging across the letters.",
        "Click to start."
      );
      return;
    }

    if (gameState === "playing") {
      drawGrid();
      drawSelection();
    } else if (gameState === "won") {
      drawWinScreen();
    }
  };

  // --- Start Screen (replaced by shared helper) ---
  function drawStartScreen() {
    /* Not used anymore — replaced by drawCenteredText */
  }

  // --- Grid ---
  function drawGrid() {
    const offsetX = (s.width - GRID_SIZE * cellSize) / 2;
    const offsetY = (s.height - GRID_SIZE * cellSize) / 2;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const x = offsetX + c * cellSize + cellSize / 2;
        const y = offsetY + r * cellSize + cellSize / 2;
        s.noStroke();
        s.fill(255);
        s.text(grid[r][c], x, y);
      }
    }
  }

  // --- Selection Highlight ---
  function drawSelection() {
    if (!isDragging || !startCell || !currentCell) return;
    if (startCell.row !== currentCell.row) return;

    const offsetX = (s.width - GRID_SIZE * cellSize) / 2;
    const offsetY = (s.height - GRID_SIZE * cellSize) / 2;

    const startCol = Math.min(startCell.col, currentCell.col);
    const endCol = Math.max(startCell.col, currentCell.col);

    const x = offsetX + startCol * cellSize;
    const y = offsetY + startCell.row * cellSize;
    const w = (endCol - startCol + 1) * cellSize;
    const h = cellSize;

    s.noFill();
    s.strokeWeight(cellSize * 0.02);
    s.stroke(255);
    s.rect(x, y, w, h, cellSize * 0.2);

    s.strokeWeight(1);
    s.stroke(255);
    s.rect(x, y, w, h, cellSize * 0.2);
  }

  // --- Win Screen ---
  function drawWinScreen() {
    s.background(0);
    s.noStroke(); // 🧼 removes any outlines
    s.fill(255);
    s.textSize(s.width / 20);
    s.text(TARGET_WORD, s.width / 2, s.height / 2 - 10);
    s.textSize(s.width / 40);
    s.text("Click to Continue", s.width / 2, s.height / 2 + 50);
  }

  // --- Input Handling ---
  s.mousePressed = () => {
    if (gameState === "start") {
      gameState = "playing";
      return;
    }

    if (gameState === "won") {
      if (typeof gameCompleted === "function") gameCompleted();
      return;
    }

    isDragging = true;
    startCell = getCellFromMousePos();
    currentCell = startCell;
  };

  s.mouseDragged = () => {
    if (isDragging) currentCell = getCellFromMousePos();
  };

  s.mouseReleased = () => {
    if (isDragging) {
      checkWinCondition();
      isDragging = false;
      startCell = null;
      currentCell = null;
    }
  };

  function checkWinCondition() {
    if (!startCell || !currentCell || startCell.row !== currentCell.row) return;

    let selectedWord = "";
    const row = startCell.row;
    const startCol = Math.min(startCell.col, currentCell.col);
    const endCol = Math.max(startCell.col, currentCell.col);

    for (let c = startCol; c <= endCol; c++) {
      selectedWord += grid[row][c];
    }

    if (selectedWord === TARGET_WORD) gameState = "won";
  }

  function getCellFromMousePos() {
    const offsetX = (s.width - GRID_SIZE * cellSize) / 2;
    const offsetY = (s.height - GRID_SIZE * cellSize) / 2;
    let col = Math.floor((s.mouseX - offsetX) / cellSize);
    let row = Math.floor((s.mouseY - offsetY) / cellSize);
    col = s.constrain(col, 0, GRID_SIZE - 1);
    row = s.constrain(row, 0, GRID_SIZE - 1);
    return { row, col };
  }

  // --- Resize Handler ---
  s.handleResize = () => {
    const container = document.getElementById("game-container");
    s.resizeCanvas(container.clientWidth, container.clientHeight);
    initializeGame();
  };
});
