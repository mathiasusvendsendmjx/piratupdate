window.p5Instance = new p5((sketch) => {
  let player,
    invaders = [],
    lasers = [];
  let score = 0,
    currentRound = 1;
  let gameState = "START";
  let invaderDirection = 1,
    invaderSpeed = 1,
    invaderDrop = 20;
  const WINNING_SCORE = 2300;

  sketch.setup = () => {
    const container = document.getElementById("game-container");
    const canvas = sketch.createCanvas(
      container.clientWidth,
      container.clientHeight
    );
    canvas.parent("game-container");
    sketch.rectMode(sketch.CENTER);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    player = new Player();
  };

  sketch.draw = () => {
    sketch.background(0);
    if (gameState === "START") showStartScreen();
    else if (gameState === "PLAYING") runGame();
    else if (gameState === "GAME_OVER") showGameOverScreen();
    else if (gameState === "WIN") showWinScreen();
  };

  function invaderHitsPlayer(inv) {
    return (
      inv.x - inv.w / 2 < player.x + player.w / 2 &&
      inv.x + inv.w / 2 > player.x - player.w / 2 &&
      inv.y - inv.h / 2 < player.y + player.h / 2 &&
      inv.y + inv.h / 2 > player.y - player.h / 2
    );
  }


  function runGame() {
    player.draw();
    player.move();

    // Lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
      lasers[i].update();
      lasers[i].draw();
      if (lasers[i].isOffscreen()) lasers.splice(i, 1);
    }

    // Invaders
    let edge = false;
    for (const inv of invaders) {
      inv.update();
      inv.draw();
      if (
        !inv.isDiving &&
        (inv.x + inv.w / 2 > sketch.width || inv.x - inv.w / 2 < 0)
      )
        edge = true;
    }

    if (edge) {
      invaderDirection *= -1;
      for (const inv of invaders) {
        inv.y += invaderDrop;
        inv.originalY += invaderDrop;
      }
    }

    for (const inv of invaders) {
      if (gameState !== "PLAYING") break;
      if (inv.type !== 3 && invaderHitsPlayer(inv)) {
        gameState = "GAME_OVER";
      }
    }

    checkCollisions();
    drawUI();

    if (invaders.length === 0 && gameState === "PLAYING") {
      if (currentRound < 3) {
        currentRound++;
        setupRound(currentRound);
      } else if (score >= WINNING_SCORE) gameState = "WIN";
    }
  }

  function checkCollisions() {
    for (let i = lasers.length - 1; i >= 0; i--) {
      for (let j = invaders.length - 1; j >= 0; j--) {
        if (lasers[i] && invaders[j] && lasers[i].hits(invaders[j])) {
          score += invaders[j].points;
          invaders.splice(j, 1);
          lasers.splice(i, 1);
          if (
            invaders.length === 0 &&
            currentRound === 3 &&
            score >= WINNING_SCORE
          )
            gameState = "WIN";
          break;
        }
      }
    }
  }

  function setupRound(round) {
    invaders = [];
    lasers = [];
    invaderDirection = 1;
    let rows, cols, points;
    const size = 40;

    if (round === 1) {
      rows = 3;
      cols = 6;
      points = 25;
      invaderSpeed = 1;
    } else if (round === 2) {
      rows = 3;
      cols = 7;
      points = 50;
      invaderSpeed = 1.3;
    } else {
      rows = 2;
      cols = 4;
      points = 100;
      invaderSpeed = 1.6;
    }

    const spacing = Math.min(size * 1.5, (sketch.width * 0.85) / cols);
    const startY = 100,
      ySpacing = size * 1.2,
      offset = (cols - 1) / 2.0;

    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++) {
        const x = sketch.width / 2 + (j - offset) * spacing;
        const y = startY + i * ySpacing;
        invaders.push(new Invader(x, y, size, points, round));
      }
  }

  class Player {
    constructor() {
      this.w = 50;
      this.h = 20;
      this.x = sketch.width / 2;
      this.y = sketch.height - 40;
      this.speed = 8;
    }
    draw() {
      drawPlayer(this.x, this.y, this.w, this.h);
    }
    move() {
      if (sketch.keyIsDown(sketch.LEFT_ARROW) && this.x > this.w / 2)
        this.x -= this.speed;
      if (
        sketch.keyIsDown(sketch.RIGHT_ARROW) &&
        this.x < sketch.width - this.w / 2
      )
        this.x += this.speed;
    }
    shoot() {
      lasers.push(new Laser(this.x, this.y - this.h));
    }
  }

  class Laser {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.w = 4;
      this.h = 15;
      this.speed = 10;
    }
    draw() {
      drawLaser(this.x, this.y, this.w, this.h);
    }
    update() {
      this.y -= this.speed;
    }
    isOffscreen() {
      return this.y < 0;
    }
    hits(inv) {
      return (
        this.x - this.w / 2 < inv.x + inv.w / 2 &&
        this.x + this.w / 2 > inv.x - inv.w / 2 &&
        this.y - this.h / 2 < inv.y + inv.h / 2 &&
        this.y + this.h / 2 > inv.y - inv.h / 2
      );
    }
  }

  class Invader {
    constructor(x, y, size, points, type) {
      this.x = x;
      this.y = y;
      this.w = size;
      this.h = size * 0.7;
      this.points = points;
      this.type = type;
      this.originalY = y;
      this.isDiving = false;
      this.diveSpeed = 6;
      this.diveChance = type === 3 ? 0.005 : 0;
    }

    update() {
      const spd =
        invaderSpeed +
        (1 - invaders.length / (invaders.length + 10)) * invaderSpeed;

      if (this.type === 1) {
        this.x += invaderDirection * spd;
      } else if (this.type === 2) {
        this.x += invaderDirection * spd;
        this.y =
          this.originalY +
          Math.sin(sketch.frameCount * 0.05 + this.x * 0.02) * 20;
      } else {
        // --- Type 3 (Diving round) ---
        if (this.isDiving) {
          // Homing dive toward player
          this.x = sketch.lerp(this.x, player.x, 0.03);
          this.y += this.diveSpeed;

          // Check for player collision
          if (
            this.y + this.h / 2 > player.y - player.h / 2 &&
            Math.abs(this.x - player.x) < (player.w + this.w) / 2
          ) {
            gameState = "GAME_OVER";
          }

          // Reset to top if missed
          if (this.y > sketch.height + this.h) {
            this.y = -this.h;
            this.x = sketch.random(sketch.width * 0.2, sketch.width * 0.8);
            this.isDiving = false;
          }
        } else {
          // Normal horizontal motion
          this.x += invaderDirection * spd;

          // Random chance to dive
          if (sketch.random(1) < this.diveChance) {
            this.isDiving = true;
          }
        }
      }
    }

    draw() {
      drawInvader(this.x, this.y, this.w, this.type);
    }
  }

  function drawPlayer(x, y, w, h) {
    sketch.fill(255);
    sketch.triangle(x, y - h / 2, x - w / 2, y + h / 2, x + w / 2, y + h / 2);
  }
  function drawLaser(x, y, w, h) {
    sketch.fill(255);
    sketch.rectMode(sketch.CENTER);
    sketch.rect(x, y, w, h);
  }
  function drawInvader(x, y, s, t) {
    sketch.noStroke();
    sketch.fill(255);
    sketch.rectMode(sketch.CENTER);
    sketch.rect(x, y, s, s * 0.7);
    sketch.rect(x - s / 3, y + s * 0.2, s * 0.2, s * 0.4);
    sketch.rect(x + s / 3, y + s * 0.2, s * 0.2, s * 0.4);
  }

  sketch.mousePressed = () => {
    if (gameState === "START" || gameState === "GAME_OVER") {
      score = 0;
      currentRound = 1;
      setupRound(1);
      gameState = "PLAYING";
    } else if (gameState === "WIN" && typeof gameCompleted === "function") {
      gameCompleted();
    }
  };

  sketch.keyPressed = () => {
    if (gameState === "PLAYING" && sketch.key === " ") {
      player.shoot();
    }
  };

  function drawUI() {
    sketch.fill(255);
    sketch.textSize(32);
    sketch.text(score, sketch.width / 2, 20);
  }

  function showStartScreen() {
    sketch.fill(255);
    sketch.textSize(32);
    sketch.text("Click to Start Game", sketch.width / 2, sketch.height / 2 - 20);
    sketch.textSize(20);
    sketch.text(
      "Move: ← → | Shoot: SPACE",
      sketch.width / 2,
      sketch.height / 2 + 40
    );
  }

  function showGameOverScreen() {
    sketch.textSize(64);
    sketch.text("GAME OVER", sketch.width / 2, sketch.height / 2 - 40);
    sketch.fill(255);
    sketch.textSize(24);
    sketch.text("Click to Restart", sketch.width / 2, sketch.height / 2 + 60);
  }

  function showWinScreen() {
    sketch.textSize(80);
    sketch.text(WINNING_SCORE, sketch.width / 2, sketch.height / 2 - 30);
    sketch.fill(255);
    sketch.textSize(24);
    sketch.text("Click to Continue", sketch.width / 2, sketch.height / 2 + 50);
  }

  sketch.handleResize = () => {
    const container = document.getElementById("game-container");
    sketch.resizeCanvas(container.clientWidth, container.clientHeight);
    if (player) {
      player.x = sketch.width / 2;
      player.y = sketch.height - 40;
    }
  };
});
