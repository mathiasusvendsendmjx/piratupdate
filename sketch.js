window.startGameBorderOverlay = window.startGameBorderOverlay || function () {};
window.stopGameBorderOverlay = window.stopGameBorderOverlay || function () {};

let p5Instance;
let borderOverlayP5 = null;
let currentGameIndex = 0;

const gameList = [
  "game0_introduction",
  "game1_arrow",
  "game2_invaders",
  "game3_word",
  "game4_clock",
];

// 🧑‍💻 Dev toggle — change to true while developing
const DEV_MODE = true;
const DEV_START_INDEX = 0; // 0 = introduction, 1 = arrow, 2 = invaders, 3 = word, 4 = clock

// 🗺️ Address pieces (mystery reveal)
const addressParts = {
  street: { value: "UNGARNSGADE", revealed: false },
  number: { value: "68", revealed: false },
  zipcode: { value: "2300", revealed: false },
  time: { value: "22:30", revealed: false },
};

// -------------------------------
// 🔲 Border Overlay (p5)
// -------------------------------
// function startGameBorderOverlay() {
//   if (borderOverlayP5) return; // already running

//   borderOverlayP5 = new p5((b) => {
//     let borderImg;

//     b.preload = () => {
//       borderImg = b.loadImage("assets/border/b1.png");
//     };

//     b.setup = () => {
//       const container = document.getElementById("game-container");
//       const cnv = b.createCanvas(container.clientWidth, container.clientHeight);
//       cnv.parent("game-container");

//       cnv.elt.dataset.border = "true";

//       // make overlay float over the game canvas but not block mouse
//       cnv.elt.style.position = "absolute";
//       cnv.elt.style.inset = "0";
//       cnv.elt.style.pointerEvents = "none";
//       cnv.elt.style.zIndex = "50";

//       b.clear();
//       b.noLoop();
//       if (borderImg) b.image(borderImg, 0, 0, b.width, b.height);
//     };

//     b.draw = () => {
//       b.clear();
//       if (borderImg) b.image(borderImg, 0, 0, b.width, b.height);
//     };

//     b.windowResized = () => {
//       const container = document.getElementById("game-container");
//       b.resizeCanvas(container.clientWidth, container.clientHeight);
//       b.redraw();
//     };
//   });
// }

// function stopGameBorderOverlay() {
//   if (borderOverlayP5) {
//     try {
//       borderOverlayP5.remove();
//     } catch (_) {}
//     borderOverlayP5 = null;
//   }
// }

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

  // 🛠️ Only remove the game canvas — not the overlay border
  const existingCanvas = container.querySelector(
    "canvas:not([data-border='true'])"
  );
  if (existingCanvas) existingCanvas.remove();

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

      // ✅ Ensure border overlay exists — if not, create it
      if (!borderOverlayP5) startGameBorderOverlay();
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
  const currentGame = gameList[currentGameIndex];

  // 🧭 Skip locking for intro — just move on
  if (currentGame === "game0_introduction") {
    currentGameIndex++;
    loadGame(gameList[currentGameIndex]);
    renderFooter();
    return;
  }

  // ✅ Lock mascot part based on completed game
  lockMaskotPart(currentGameIndex);

  // ✅ Reveal corresponding address part
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

  renderFooter(); // update the footer immediately

  // 🧭 Move to next game afterward
  currentGameIndex++;

  if (currentGameIndex < gameList.length - 1) {
    // ✅ Still has another playable game left
    loadGame(gameList[currentGameIndex]);
  } else if (currentGameIndex === gameList.length - 1) {
    // ✅ Load the final game (game4_clock)
    loadGame(gameList[currentGameIndex]);
  } else {
    // 🎉 All games complete — show overlay win screen
    stopGameBorderOverlay();
    if (typeof showWinOverlay === "function") {
      showWinOverlay(addressParts, window.maskotState);
    } else {
      alert("All done! (no overlay available)");
      window.location.reload();
    }
  }
}

// -------------------------------
// 🧾 Render Footer Information
// -------------------------------
function renderFooter() {
  const footer = document.getElementById("game-footer");
  if (!footer) return;

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

  // Keep existing elements (like the <img> border) and just update text
  let textDiv = footer.querySelector(".footer-text");
  if (!textDiv) {
    textDiv = document.createElement("div");
    textDiv.className = "footer-text";
    textDiv.style.textAlign = "center";
    textDiv.style.color = "white";
    textDiv.style.fontFamily = "monospace";
    textDiv.style.whiteSpace = "nowrap";
    textDiv.style.overflow = "hidden";
    textDiv.style.textOverflow = "ellipsis";
    textDiv.style.width = "100%";
    textDiv.style.fontSize = "clamp(12px, 2vw, 18px)";
    textDiv.style.letterSpacing = "2px";
    footer.appendChild(textDiv);
  }
  textDiv.textContent = addressLine;
}

// -------------------------------
// 🟪 Initialize
// -------------------------------
window.addEventListener("load", startScreen);
