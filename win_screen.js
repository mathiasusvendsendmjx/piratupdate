// win_screen.js — clone real locked mascot from game phase (with double borders)
(function () {
  // 🧩 Clone the actual locked mascot columns before hiding them
  function renderMaskotInto(targetEl) {
    targetEl.innerHTML = "";

    const parts = ["head", "body", "legs", "feet"];
    const frame = document.createElement("div");
    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.display = "flex";
    frame.style.flexDirection = "column";
    frame.style.overflow = "hidden";
    frame.style.position = "relative"; // Needed for border layering

    // 🎭 Render mascot parts
    parts.forEach((part) => {
      const idx = window.maskotState?.getIndex(part) ?? 0;
      const img = document.createElement("img");
      img.src = `assets/maskot/${idx}.png`; // use .jpeg to match your asset set
      img.style.width = "100%";
      img.style.height = "25%";
      img.style.objectFit = "cover";

      if (part === "head") img.style.objectPosition = "center top";
      else if (part === "body") img.style.objectPosition = "center 33%";
      else if (part === "legs") img.style.objectPosition = "center 66%";
      else if (part === "feet") img.style.objectPosition = "center bottom";

      frame.appendChild(img);
    });

    // 🖼️ Add double borders (same as in-game layout)
    const outerBorder = document.createElement("img");
    outerBorder.src = "assets/border/b8.png";
    outerBorder.alt = "Outer maskot border";
    outerBorder.classList.add(
      "absolute",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
      "pointer-events-none",
      "z-10"
    );

    const innerBorder = document.createElement("img");
    innerBorder.src = "assets/border/b1.png";
    innerBorder.alt = "Inner maskot border";
    innerBorder.classList.add(
      "absolute",
      "top-1/2",
      "left-1/2",
      "w-full",
      "h-[110%]",
      "-translate-x-1/2",
      "-translate-y-1/2",
      "pointer-events-none",
      "z-20"
    );

    frame.appendChild(outerBorder);
    frame.appendChild(innerBorder);

    targetEl.appendChild(frame);
  }

  // 🏴‍☠️ Show win overlay — now clones before hiding
  window.showWinOverlay = function showWinOverlay(addressParts = {}) {
    try {
      const overlay = document.getElementById("win-overlay");
      const titleEl = document.getElementById("win-overlay-title");
      const maskotEl = document.getElementById("win-overlay-maskot");
      const footerEl = document.getElementById("win-overlay-footer");

      if (!overlay || !maskotEl || !footerEl) {
        console.warn("win-overlay elements not found in DOM.");
        return;
      }

      // 🧼 Remove or hide p5 canvas
      try {
        if (
          window.p5Instance &&
          typeof window.p5Instance.remove === "function"
        ) {
          window.p5Instance.remove();
          window.p5Instance = null;
        } else {
          const canv = document.querySelector("canvas");
          if (canv) canv.style.display = "none";
        }
      } catch (e) {
        console.warn("Could not remove p5 instance:", e);
      }

      // 🧩 Clone the mascot BEFORE hiding columns
      renderMaskotInto(maskotEl);

      // 🫧 Hide the right columns after cloning
      const rightCols = document.querySelectorAll(
        "#column3, #column4, #column5, #column7"
      );
      rightCols.forEach((el) => (el.style.display = "none"));

      // Title
      titleEl.textContent = "PIRATFEST 2025";

      // 🏠 Footer info (fully revealed)
      const line = `${addressParts.street?.value ?? ""} ${
        addressParts.number?.value ?? ""
      }, ${addressParts.zipcode?.value ?? ""} — ${
        addressParts.time?.value ?? ""
      }`;
      footerEl.textContent = line;

      // Show overlay
      overlay.classList.remove("hidden");
    } catch (err) {
      console.error("showWinOverlay error:", err);
    }
  };
})();
