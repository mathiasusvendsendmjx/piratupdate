window.p5Instance = new p5((sketch) => {
  const TOTAL_IMAGES = 10;
  let loadedImages = [];
  let arrows = [];
  let rewardImages = [];
  let successfulHits = 0;
  let targetX, targetY;
  let gameOver = false;
  let gameStarted = false; // 🟢 NEW state for the start screen

  const GOOD_WINDOW = 70;

  sketch.preload = () => {
    for (let i = 0; i < TOTAL_IMAGES; i++) {
      loadedImages.push(sketch.loadImage(`assets/numberImages/image${i}.png`));
    }
  };

  sketch.setup = () => {
    const container = document.getElementById("game-container");
    const canvas = sketch.createCanvas(
      container.clientWidth,
      container.clientHeight
    );
    canvas.parent("game-container");
    sketch.colorMode(sketch.HSB, 360, 100, 100, 100);
    sketch.imageMode(sketch.CENTER);
    targetX = sketch.width / 2;
    targetY = sketch.height / 2;
  };

  sketch.draw = () => {
    sketch.background(0);

    // 🟢 START SCREEN
    if (!gameStarted) {
      drawStartScreen();
      return;
    }

    // 🕹 GAMEPLAY
    handleRewardImages();

    // End condition
    if (
      !gameOver &&
      successfulHits === TOTAL_IMAGES &&
      rewardImages.length === TOTAL_IMAGES
    ) {
      const last = rewardImages[TOTAL_IMAGES - 1];
      if (last && last.done) {
        gameOver = true;
      }
    }

    if (!gameOver) {
      drawTarget();
      handleArrows();
    }

    // 🏁 GAME OVER SCREEN
    if (gameOver) {
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.textSize(Math.min(sketch.width, sketch.height) * 0.04);
      sketch.fill(255);
      sketch.text("Click to Continue", sketch.width / 2, sketch.height - 60);
    }
  };

  // ---- 🟢 START SCREEN ----
  function drawStartScreen() {
    sketch.fill(255);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    const titleSize = Math.min(sketch.width, sketch.height) * 0.07;
    const infoSize = titleSize * 0.6;

    sketch.textSize(titleSize);
    sketch.text(
      "Click to Start Game",
      sketch.width / 2,
      sketch.height / 2 - 20
    );

    sketch.textSize(infoSize);
    sketch.text(
      "Press arrow keys when the arrows overlap the center",
      sketch.width / 2,
      sketch.height / 2 + 40
    );
  }

  // ---- Arrows ----
  function handleArrows() {
    if (arrows.length === 0 && successfulHits < TOTAL_IMAGES) spawnArrow();

    for (let i = arrows.length - 1; i >= 0; i--) {
      let a = arrows[i];

      if (a.type === "left") a.x += a.speed;
      else if (a.type === "right") a.x -= a.speed;
      else if (a.type === "up") a.y += a.speed;
      else if (a.type === "down") a.y -= a.speed;

      drawArrow(a.type, a.x, a.y, 80, sketch.color(0, 0, 100));

      let missed = false;
      if (a.type === "left" && a.x > targetX + GOOD_WINDOW) missed = true;
      if (a.type === "right" && a.x < targetX - GOOD_WINDOW) missed = true;
      if (a.type === "up" && a.y > targetY + GOOD_WINDOW) missed = true;
      if (a.type === "down" && a.y < targetY - GOOD_WINDOW) missed = true;

      if (missed) arrows.splice(i, 1);
    }
  }

  // ---- Reward Images ----
  function handleRewardImages() {
    for (let i = 0; i < rewardImages.length; i++) {
      let imgData = rewardImages[i];

      if (imgData.progress < 1) {
        let eased = 1 - Math.pow(1 - imgData.progress, 3);
        imgData.x = sketch.lerp(imgData.startX, imgData.targetX, eased);
        imgData.y = sketch.lerp(imgData.startY, imgData.targetY, eased);
        imgData.progress += 0.05;
        if (imgData.progress >= 1) {
          imgData.x = imgData.targetX;
          imgData.y = imgData.targetY;
          imgData.done = true;
        }
      } else {
        imgData.x = imgData.targetX;
        imgData.y = imgData.targetY;
        imgData.done = true;
      }

      sketch.image(
        imgData.img,
        imgData.x,
        imgData.y,
        sketch.width,
        sketch.height
      );
    }
  }

  // ---- Input ----
  sketch.keyPressed = () => {
    if (!gameStarted || gameOver) return;

    let keyDir;
    if (sketch.keyCode === sketch.LEFT_ARROW) keyDir = "left";
    else if (sketch.keyCode === sketch.DOWN_ARROW) keyDir = "down";
    else if (sketch.keyCode === sketch.UP_ARROW) keyDir = "up";
    else if (sketch.keyCode === sketch.RIGHT_ARROW) keyDir = "right";
    else return;

    if (arrows.length > 0) {
      let currentArrow = arrows[0];
      let distance = sketch.dist(
        currentArrow.x,
        currentArrow.y,
        targetX,
        targetY
      );

      if (currentArrow.type === keyDir && distance <= GOOD_WINDOW) {
        const idx = successfulHits;
        const img = loadedImages[idx];
        spawnRewardImage(currentArrow.type, img);
        successfulHits++;
        arrows.splice(0, 1);
      }
    }
  };

  sketch.mousePressed = () => {
    if (!gameStarted) {
      // 🟢 Start game on click
      gameStarted = true;
      return;
    }

    if (gameOver && typeof gameCompleted === "function") {
      gameCompleted();
    }
  };

  // ---- Helpers ----
  function drawTarget() {
    const col = sketch.color(0, 0, 100, 25);
    ["left", "right", "up", "down"].forEach((dir) =>
      drawArrow(dir, targetX, targetY, 80, col)
    );
  }

  function drawArrow(type, x, y, size, col) {
    sketch.push();
    sketch.fill(col);
    sketch.noStroke();
    sketch.translate(x, y);
    const w = size * 0.6;
    const h = size * 0.8;
    if (type === "left") sketch.triangle(0, -h / 2, 0, h / 2, -w, 0);
    else if (type === "right") sketch.triangle(0, -h / 2, 0, h / 2, w, 0);
    else if (type === "up") sketch.triangle(-w / 2, 0, w / 2, 0, 0, -h);
    else if (type === "down") sketch.triangle(-w / 2, 0, w / 2, 0, 0, h);
    sketch.pop();
  }

  function spawnRewardImage(type, img) {
    let d = {
      img,
      startX: 0,
      startY: 0,
      targetX,
      targetY,
      x: 0,
      y: 0,
      progress: 0,
      done: false,
    };

    const b = sketch.width;

    if (type === "left") {
      d.startX = -b;
      d.startY = targetY;
    }
    if (type === "right") {
      d.startX = sketch.width + b;
      d.startY = targetY;
    }
    if (type === "up") {
      d.startY = -b;
      d.startX = targetX;
    }
    if (type === "down") {
      d.startY = sketch.height + b;
      d.startX = targetX;
    }

    rewardImages.push(d);
  }

  function spawnArrow() {
    const types = ["left", "down", "up", "right"];
    const type = sketch.random(types);
    let startX = targetX;
    let startY = targetY;
    const buffer = 100;

    if (type === "left") startX = -buffer;
    else if (type === "right") startX = sketch.width + buffer;
    else if (type === "up") startY = -buffer;
    else if (type === "down") startY = sketch.height + buffer;

    arrows.push({ type, x: startX, y: startY, speed: 5 });
  }

  // --- Handle resizing (called by game manager) ---
  sketch.handleResize = () => {
    const container = document.getElementById("game-container");
    sketch.resizeCanvas(container.clientWidth, container.clientHeight);
    targetX = sketch.width / 2;
    targetY = sketch.height / 2;

    for (let imgData of rewardImages) {
      if (imgData.done) {
        imgData.targetX = targetX;
        imgData.targetY = targetY;
        imgData.x = targetX;
        imgData.y = targetY;
      }
    }
  };
});
