let p5Instance;
let currentGameIndex = 0;
const gameList = ["game1_arrow", "game2_invaders", "game3_word", "game4_clock"];

// 🧑‍💻 Dev toggle — change to true while developing
const DEV_MODE = true;
const DEV_START_INDEX = 3; // 0 = game1, 1 = game2, 2 = game3, 3 = game4

// 🗺️ Address pieces (mystery reveal)
const addressParts = {
  street: { value: "UNGARNSGADE", revealed: false },
  number: { value: "68", revealed: false },
  zipcode: { value: "2300", revealed: false },
  time: { value: "22:30", revealed: false },
};

// -------------------------------
// 🟩 Start Screen
// -------------------------------
function startScreen() {
  if (p5Instance) p5Instance.remove();

  // 🚀 Auto-launch in dev mode
  if (DEV_MODE) {
    currentGameIndex = DEV_START_INDEX;
    loadGame(gameList[currentGameIndex]);
    renderFooter();
    return;
  }

  // Normal start screen
  p5Instance = new p5((s) => {
    s.setup = () => {
      const container = document.getElementById("game-container");
      const canvas = s.createCanvas(
        container.clientWidth,
        container.clientHeight
      );
      canvas.parent("game-container");
      s.textAlign(s.CENTER, s.CENTER);
      s.textSize(32);
      s.fill(255);
      s.noStroke();
    };

    s.windowResized = () => {
      const container = document.getElementById("game-container");
      s.resizeCanvas(container.clientWidth, container.clientHeight);
    };

    s.draw = () => {
      s.background(0);
      s.text("Click to Start Game 1", s.width / 2, s.height / 2);
    };

    s.mousePressed = () => {
      loadGame(gameList[currentGameIndex]);
      renderFooter();
    };
  });
}

// -------------------------------
// 🟦 Load New Game
// -------------------------------
function loadGame(fileName) {
  if (p5Instance) p5Instance.remove();
  p5Instance = null;

  const container = document.getElementById("game-container");
  container.innerHTML = "";

  const oldScript = document.getElementById("game-script");
  if (oldScript) oldScript.remove();

  const script = document.createElement("script");
  script.src = `${fileName}.js`;
  script.id = "game-script";
  script.onload = () => {
    console.log(`${fileName} loaded.`);

    if (window.p5Instance) {
      p5Instance = window.p5Instance;
      const c = document.getElementById("game-container");
      if (c && p5Instance?.resizeCanvas) {
        p5Instance.resizeCanvas(c.clientWidth, c.clientHeight);
      }
      if (typeof p5Instance.handleResize === "function") {
        p5Instance.handleResize();
      }
    } else {
      console.warn("Game loaded, but no p5 instance was assigned.");
    }
  };
  document.body.appendChild(script);
}

// -------------------------------
// 🟧 Handle Resizing (Global)
// -------------------------------
window.addEventListener("resize", () => {
  if (!p5Instance) return;

  const container = document.getElementById("game-container");
  if (!container) return;

  try {
    p5Instance.resizeCanvas(container.clientWidth, container.clientHeight);
    if (typeof p5Instance.handleResize === "function") {
      p5Instance.handleResize();
    }
  } catch (err) {
    console.warn("Resize issue:", err);
  }
});

// -------------------------------
// 🟥 Handle Game Completion
// -------------------------------
function gameCompleted() {
  lockMaskotPart(currentGameIndex);

  const currentGame = gameList[currentGameIndex];

  // Reveal the relevant part immediately
  switch (currentGame) {
    case "game1_arrow":
      addressParts.number.revealed = true;
      break;
    case "game2_invaders":
      addressParts.zipcode.revealed = true;
      break;
    case "game3_word":
      addressParts.street.revealed = true;
      break;
    case "game4_clock":
      addressParts.time.revealed = true;
      break;
  }

  renderFooter(); // update the footer right away

  // Move to next game automatically
  currentGameIndex++;
  if (currentGameIndex < gameList.length) {
    loadGame(gameList[currentGameIndex]);
  } else {
    // 🎉 All games complete — show final winning screen
    showWinningPage({
      addressParts,
      title: "PIRATFEST 2025",
    });
  }
};   // 👈 this closes your p5 instance properly

// -------------------------------
// 🧾 Render Footer Information
// -------------------------------
function renderFooter() {
  const footer = document.getElementById("game-footer");
  if (!footer) return;

  // Combine all address parts into one line
  const addressLine = `${
    addressParts.street.revealed
      ? addressParts.street.value
      : "?".repeat(addressParts.street.value.length)
  } ${
    addressParts.number.revealed
      ? addressParts.number.value
      : "?".repeat(addressParts.number.value.length)
  }, ${
    addressParts.zipcode.revealed
      ? addressParts.zipcode.value
      : "?".repeat(addressParts.zipcode.value.length)
  } — ${
    addressParts.time.revealed
      ? addressParts.time.value
      : "?".repeat(addressParts.time.value.length)
  }`;

  footer.innerHTML = `
    <div style="
      text-align: center;
      color: white;
      font-family: monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      font-size: clamp(12px, 2vw, 22px);
      letter-spacing: 2px;
    ">
      ${addressLine}
    </div>
  `;
}

// -------------------------------
// 🟪 Initialize
// -------------------------------
window.addEventListener("load", startScreen);
