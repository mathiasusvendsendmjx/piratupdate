// 🏴‍☠️ Maskot Controller — smooth looping slide with fixed staggered starts
const maskotColumns = ["column3", "column4", "column5", "column7"];
const maskotImages = Array.from(
  { length: 9 },
  (_, i) => `assets/maskot/${i}.png`
);

let currentIndexes = { head: 0, body: 0, legs: 0, feet: 0 };
let lockedIndexes = { head: null, body: null, legs: null, feet: null };
let animationData = {};

// 🧭 Predefined staggered start indexes (so they don’t align)
const startOffsets = {
  head: 7,
  body: 4,
  legs: 2,
  feet: 0,
};

// 🧩 Correct mapping (accounts for intro = 0)
const partMap = {
  1: "feet", // after game1_arrow
  2: "legs", // after game2_invaders
  3: "body", // after game3_word
  4: "head", // after game4_clock
};

function initMaskots() {
  // Prevent multiple setups
  if (Object.keys(animationData).length > 0) return;

  maskotColumns.forEach((colId) => {
    const column = document.getElementById(colId);
    if (!column) return;
    const part = column.getAttribute("data-part");

    // --- Create sliding strip ---
    const strip = document.createElement("div");
    strip.classList.add(
      "absolute",
      "flex",
      "h-full",
      "transition-transform",
      "duration-700",
      "ease-in-out"
    );
    strip.style.left = "0";
    strip.style.top = "0";
    strip.style.willChange = "transform";

    // --- Load all mascot images + duplicate first for smooth loop ---
    maskotImages.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.classList.add("h-full", "object-cover");
      img.style.width = "100%";
      img.style.flexShrink = "0";

      // Crop based on section
      if (part === "head") img.style.objectPosition = "center top";
      else if (part === "body") img.style.objectPosition = "center 33%";
      else if (part === "legs") img.style.objectPosition = "center 66%";
      else if (part === "feet") img.style.objectPosition = "center bottom";

      strip.appendChild(img);
    });

    // Duplicate first image for seamless looping
    const clone = strip.firstElementChild.cloneNode(true);
    strip.appendChild(clone);
    column.appendChild(strip);

    // --- Start each part at its own offset ---
    let index =
      startOffsets[part] ?? Math.floor(Math.random() * maskotImages.length);
    currentIndexes[part] = index;
    strip.style.transform = `translateX(-${index * 100}%)`;

    // --- Continuous motion ---
    const minDelay = 2000;
    const maxDelay = 3000;
    const intervalDelay = Math.random() * (maxDelay - minDelay) + minDelay;

    let isLocked = false;
    const timer = setInterval(() => {
      if (isLocked) return;

      index++;
      currentIndexes[part] = index % maskotImages.length;
      strip.style.transition = "transform 0.7s ease-in-out";
      strip.style.transform = `translateX(-${index * 100}%)`;

      // Wraparound
      if (index === maskotImages.length) {
        setTimeout(() => {
          strip.style.transition = "none";
          strip.style.transform = "translateX(0%)";
          index = 0;
        }, 700);
      }
    }, intervalDelay);

    animationData[part] = {
      strip,
      timer,
      lock() {
        isLocked = true;
        clearInterval(timer);
      },
    };
  });
}

function addOuterMaskotBorder() {
  const container = document.querySelector(
    "#column3, #column4, #column5, #column7"
  )?.parentElement;
  if (!container) return;

  const overlay = document.createElement("img");
  overlay.src = "assets/border/b0.png";
  overlay.classList.add(
    "absolute",
    "top-0",
    "left-0",
    "w-full",
    "h-full",
    "pointer-events-none",
    "z-50"
  );
  container.appendChild(overlay);
}

function lockMaskotPart(gameIndex) {
  const part = partMap[gameIndex];
  if (!part) {
    console.warn(`No mascot part mapped for game index ${gameIndex}`);
    return;
  }

  const data = animationData[part];
  if (!data) {
    console.warn(`No animation data for part: ${part}`);
    return;
  }

  // 🧱 Stop animation loop
  data.lock();

  // 🧩 Save locked index
  lockedIndexes[part] = currentIndexes[part];

  // 🧠 Force stop all CSS transitions before applying transform
  data.strip.style.transition = "none";

  // 🔧 Apply the exact transform for the frozen frame
  const offset = currentIndexes[part] * 100;
  data.strip.style.transform = `translateX(-${offset}%)`;

  // 🕑 Force browser to repaint the new style
  data.strip.offsetHeight; // triggers reflow — ensures instant visual update

  // ✅ Restore a 'frozen' appearance (no animation)
  data.strip.style.willChange = "auto";
  data.strip.style.transition = "none";

  console.log(`🔒 Locked ${part} visually at index ${currentIndexes[part]}`);
}


window.addEventListener("load", () => {
  initMaskots();
  //addOuterMaskotBorder();
});

// Expose mascot state
window.maskotState = {
  getIndex(part) {
    return lockedIndexes?.[part] ?? currentIndexes?.[part] ?? 0;
  },
  getSrc(i) {
    return maskotImages[i];
  },
  lockAll() {
    ["feet", "legs", "body", "head"].forEach((p) => {
      const data = animationData?.[p];
      if (data && data.timer) clearInterval(data.timer);
    });
  },
};
