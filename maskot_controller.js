// 🏴‍☠️ Maskot Controller — smooth looping slide with fixed staggered starts
const maskotColumns = ["column3", "column4", "column5", "column7"];
const maskotImages = Array.from(
  { length: 9 },
  (_, i) => `assets/maskot/${i}.jpeg`
);

let currentIndexes = { head: 0, body: 0, legs: 0, feet: 0 };
let animationData = {};

// 🧭 Predefined staggered start indexes (so they don’t align)
const startOffsets = {
  head: 7,
  body: 4,
  legs: 2,
  feet: 0,
};

function initMaskots() {
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

    // --- Random delay for natural desync ---
    const minDelay = 2000;
    const maxDelay = 3000;
    const intervalDelay = Math.random() * (maxDelay - minDelay) + minDelay;

    // --- Continuous motion ---
    let isLocked = false;
    animationData[part] = {
      strip,
      timer: setInterval(() => {
        if (isLocked) return;

        index++;
        currentIndexes[part] = index % maskotImages.length;
        strip.style.transition = "transform 0.7s ease-in-out";
        strip.style.transform = `translateX(-${index * 100}%)`;

        // When reaching clone (end)
        if (index === maskotImages.length) {
          setTimeout(() => {
            strip.style.transition = "none";
            strip.style.transform = "translateX(0%)";
            index = 0;
          }, 700);
        }
      }, intervalDelay),
      lock() {
        isLocked = true;
        clearInterval(this.timer);
      },
    };
  });
}

// 🧩 Lock part when game finishes
function lockMaskotPart(gameIndex) {
  const partMap = ["feet", "legs", "body", "head"];
  const part = partMap[gameIndex];
  if (!part) return;

  const data = animationData[part];
  if (data) {
    data.lock();
    console.log(`🔒 Locked ${part} at index ${currentIndexes[part]}`);
  }
}

window.addEventListener("load", initMaskots);

// Expose current maskot state for win-screen.js
window.maskotState = {
  getIndex(part) {
    return currentIndexes?.[part] ?? 0;
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


