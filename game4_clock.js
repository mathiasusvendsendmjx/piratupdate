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
  const TARGET_HOUR = 1;
  const TARGET_MINUTE = 45;
  const ROTATION_SPEED = 0.08;
  const LOCK_TOLERANCE = 0.2;

  let currentHourValue = 3;
  let currentMinuteValue = 0;

  let gameState = "start";
  let isHourLocked = false;
  let isMinuteLocked = false;
  let isSolved = false;

  let centerX, centerY, clockRadius;

  s.setup = () => {
    const container = document.getElementById("game-container");
    const canvas = s.createCanvas(
      container.clientWidth,
      container.clientHeight
    );
    canvas.parent("game-container");
    s.colorMode(s.HSB, 360, 100, 100);
    s.textFont("monospace");
    s.textAlign(s.CENTER, s.CENTER);
  };

  s.draw = () => {
    s.background(0);

    if (gameState === "start") {
      drawCenteredText(
        s,
        "PARTY CLOCK",
        "Set the clock to the right time using arrow keys.",
        "Click to start."
      );
      return;
    }

    if (gameState === "playing") {
      drawGame();
    } else if (gameState === "won") {
      drawWinScreen();
    }
  };

  function drawGame() {
    s.background(0);
    handleInput();
    updateLockStates();

    // 🧩 Check for solved condition
    if (isSolved) {
      gameState = "won";
      return; // exit so next frame draws win screen
    }

    centerX = s.width / 2;
    centerY = s.height / 2;
    clockRadius = Math.min(s.width, s.height) * 0.35;

    drawClockFace(centerX, centerY, clockRadius);
    drawHands(centerX, centerY, clockRadius);
  }

  function drawStartScreen() {
    s.background(0);
    s.fill(255);
    s.noStroke();

    const baseTextSize = Math.min(s.width, s.height) * 0.03;
    const titleSize = baseTextSize * 2;
  }

  function drawWinScreen() {
    s.background(0);
    s.fill(255);
    s.noStroke();

    const mainTextSize = Math.min(s.width, s.height) * 0.1;
    const subTextSize = mainTextSize * 0.25;

    s.textSize(mainTextSize);
    s.text("22:30", s.width / 2, s.height / 2 - mainTextSize * 0.5);

    s.textSize(subTextSize);
    s.fill(255);
    s.text("Click to continue", s.width / 2, s.height / 2 + mainTextSize * 0.5);
  }

  function handleInput() {
    if (!isMinuteLocked) {
      if (s.keyIsDown(s.UP_ARROW))
        currentMinuteValue = (currentMinuteValue + ROTATION_SPEED) % 60;
      if (s.keyIsDown(s.DOWN_ARROW))
        currentMinuteValue = (currentMinuteValue - ROTATION_SPEED + 60) % 60;
    }
    if (!isHourLocked) {
      if (s.keyIsDown(s.RIGHT_ARROW))
        currentHourValue = (currentHourValue + ROTATION_SPEED) % 12;
      if (s.keyIsDown(s.LEFT_ARROW))
        currentHourValue = (currentHourValue - ROTATION_SPEED + 12) % 12;
    }
  }

  function updateLockStates() {
    if (
      !isHourLocked &&
      Math.abs(currentHourValue - TARGET_HOUR) < LOCK_TOLERANCE
    ) {
      isHourLocked = true;
      currentHourValue = TARGET_HOUR;
    }
    if (
      !isMinuteLocked &&
      Math.abs(currentMinuteValue - TARGET_MINUTE) < LOCK_TOLERANCE
    ) {
      isMinuteLocked = true;
      currentMinuteValue = TARGET_MINUTE;
    }
    if (isHourLocked && isMinuteLocked) isSolved = true;
  }

  function drawClockFace(cx, cy, r) {
    s.stroke(0, 0, 100);
    s.strokeWeight(r * 0.015);
    s.noFill();
    s.ellipse(cx, cy, r * 2);

    for (let i = 1; i <= 12; i++) {
      let angle = s.map(i, 0, 12, 0, s.TWO_PI) - s.HALF_PI;
      let x1 = cx + s.cos(angle) * r;
      let y1 = cy + s.sin(angle) * r;
      let x2 = cx + s.cos(angle) * r * 0.9;
      let y2 = cy + s.sin(angle) * r * 0.9;

      // 🩶 Skip drawing the top tick (where number 1 sits)
      if (i !== 1) {
        s.strokeWeight(r * 0.015);
        s.line(x1, y1, x2, y2);
      }

      const numX = cx + s.cos(angle) * r * 0.78;
      const numY = cy + s.sin(angle) * r * 0.78;
      s.noStroke();
      s.fill(0, 0, 100);
      s.textSize(r * 0.15);
      s.text(i, numX, numY);
    }
  }

  function drawHands(cx, cy, r) {
    const hourAngle = s.map(currentHourValue, 0, 12, 0, s.TWO_PI) - s.HALF_PI;
    const minuteAngle =
      s.map(currentMinuteValue, 0, 60, 0, s.TWO_PI) - s.HALF_PI;

    const hourHandColor = isHourLocked
      ? s.color("#E933C9")
      : s.color(0, 0, 100);
    const minuteHandColor = isMinuteLocked
      ? s.color("#E933C9")
      : s.color(0, 0, 100);
    const centerDotColor =
      isHourLocked || isMinuteLocked ? s.color("#E933C9") : s.color(0, 0, 100);

    s.push();
    s.translate(cx, cy);
    s.rotate(hourAngle);
    s.strokeWeight(r * 0.05);
    s.stroke(hourHandColor);
    s.line(0, 0, 0, -r * 0.5);
    s.pop();

    s.push();
    s.translate(cx, cy);
    s.rotate(minuteAngle);
    s.strokeWeight(r * 0.03);
    s.stroke(minuteHandColor);
    s.line(0, 0, 0, -r * 0.8);
    s.pop();

    s.fill(centerDotColor);
    s.noStroke();
    s.ellipse(cx, cy, r * 0.05, r * 0.05);
  }

  function resetGame() {
    isSolved = false;
    isHourLocked = false;
    isMinuteLocked = false;
    currentHourValue = 10;
    currentMinuteValue = 2;
  }

  s.mousePressed = () => {
    if (gameState === "start") gameState = "playing";
    else if (gameState === "won") {
      resetGame();
      gameState = "start";
      if (typeof gameCompleted === "function") gameCompleted();
    }
  };

  s.handleResize = () => {
    const container = document.getElementById("game-container");
    s.resizeCanvas(container.clientWidth, container.clientHeight);
  };
});
