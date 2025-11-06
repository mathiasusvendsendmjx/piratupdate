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

window.p5Instance = new p5((sketch) => {
  // 🎚️ Nemme tweaks øverst
  const HERO_SIZE = 90; // pixel størrelse på hero (ændr frit)
  const MONSTER_SIZE = 60; // grundstørrelse på monstre
  const MONSTER_SCALE = [1, 1.2, 1.5]; // skalering pr. runde (1 = normal, 1.5 = større)

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

  // 🧩 Billeder
  let monsterImgs = [];
  let heroImg;

  sketch.preload = () => {
    monsterImgs[1] = sketch.loadImage("assets/invaders/monster1.png");
    monsterImgs[2] = sketch.loadImage("assets/invaders/monster2.png");
    monsterImgs[3] = sketch.loadImage("assets/invaders/monster3.png");
    heroImg = sketch.loadImage("assets/invaders/hero.png");
  };

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

  if (gameState === "START") {
    drawCenteredText(
      sketch,
      "GAME 2 — INVADERS",
      "Move with ← → | Shoot with SPACE",
      "Click to start."
    );
    return;
  }

  if (gameState === "PLAYING") runGame();
  else if (gameState === "GAME_OVER") showGameOverScreen();
  else if (gameState === "WIN") showWinScreen();
};


  // 🧨 Kollision
  function invaderHitsPlayer(inv) {
    return (
      inv.x - inv.w / 2 < player.x + player.w / 2 &&
      inv.x + inv.w / 2 > player.x - player.w / 2 &&
      inv.y - inv.h / 2 < player.y + player.h / 2 &&
      inv.y + inv.h / 2 > player.y - player.h / 2
    );
  }

  // 🎮 Hovedloop
  function runGame() {
    player.draw();
    player.move();

    for (let i = lasers.length - 1; i >= 0; i--) {
      lasers[i].update();
      lasers[i].draw();
      if (lasers[i].isOffscreen()) lasers.splice(i, 1);
    }

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
      if (inv.type !== 3 && invaderHitsPlayer(inv)) gameState = "GAME_OVER";
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

  // 👾 Runder
  function setupRound(round) {
    invaders = [];
    lasers = [];
    invaderDirection = 1;

    let rows, cols, points;
    const size = MONSTER_SIZE * MONSTER_SCALE[round - 1];

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
      invaderSpeed = 1.3;
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

  // 🧍‍♂️ HERO
  class Player {
    constructor() {
      this.w = HERO_SIZE;
      this.h = HERO_SIZE * 0.6;
      this.x = sketch.width / 2;
      this.y = sketch.height - HERO_SIZE;
      this.speed = 8;
    }

    draw() {
      if (heroImg) {
        sketch.imageMode(sketch.CENTER);
        sketch.image(heroImg, this.x, this.y, this.w, this.h);
      } else {
        drawPlayer(this.x, this.y, this.w, this.h);
      }
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

  // 🔫 Laser
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

  // 👾 Invader
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
      if (this.type === 1) this.x += invaderDirection * spd;
      else if (this.type === 2) {
        this.x += invaderDirection * spd;
        this.y =
          this.originalY +
          Math.sin(sketch.frameCount * 0.05 + this.x * 0.02) * 20;
      } else {
        if (this.isDiving) {
          this.x = sketch.lerp(this.x, player.x, 0.03);
          this.y += this.diveSpeed;
          if (
            this.y + this.h / 2 > player.y - player.h / 2 &&
            Math.abs(this.x - player.x) < (player.w + this.w) / 2
          )
            gameState = "GAME_OVER";
          if (this.y > sketch.height + this.h) {
            this.y = -this.h;
            this.x = sketch.random(sketch.width * 0.2, sketch.width * 0.8);
            this.isDiving = false;
          }
        } else {
          this.x += invaderDirection * spd;
          if (sketch.random(1) < this.diveChance) this.isDiving = true;
        }
      }
    }

    draw() {
      if (monsterImgs[this.type]) {
        sketch.imageMode(sketch.CENTER);
        sketch.image(monsterImgs[this.type], this.x, this.y, this.w, this.h);
      } else {
        drawInvader(this.x, this.y, this.w);
      }
    }
  }

  // 🎨 Tegn hjælper
  function drawPlayer(x, y, w, h) {
    sketch.fill(255);
    sketch.triangle(x, y - h / 2, x - w / 2, y + h / 2, x + w / 2, y + h / 2);
  }

  function drawLaser(x, y, w, h) {
    sketch.fill("#E933C9");
    sketch.rectMode(sketch.CENTER);
    sketch.rect(x, y, w, h);
  }

  function drawInvader(x, y, s) {
    sketch.noStroke();
    sketch.fill(255);
    sketch.rectMode(sketch.CENTER);
    sketch.rect(x, y, s, s * 0.7);
  }

  // 🎮 Input
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
    if (gameState === "PLAYING" && sketch.key === " ") player.shoot();
  };

  function drawUI() {
    sketch.fill(255);
    sketch.textSize(20);
    sketch.text("Score: " + score, sketch.width / 2, 80);
  }

  function showStartScreen() {
    sketch.fill(255);
    sketch.textSize(32);
    sketch.text(
      "Click to Start Game",
      sketch.width / 2,
      sketch.height / 2 - 20
    );
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
      player.y = sketch.height - HERO_SIZE;
    }
  };
});
