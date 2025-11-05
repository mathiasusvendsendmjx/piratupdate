// win-screen.js
(function () {
  // Build the final address line
  function buildAddressLine(addressParts) {
    const mask = (value, revealed) =>
      revealed ? value : "?".repeat(String(value).length);

    const street = mask(
      addressParts.street.value,
      addressParts.street.revealed
    );
    const number = mask(
      addressParts.number.value,
      addressParts.number.revealed
    );
    const zipcode = mask(
      addressParts.zipcode.value,
      addressParts.zipcode.revealed
    );
    const time = mask(addressParts.time.value, addressParts.time.revealed);

    return `${street} ${number}, ${zipcode} — ${time}`;
  }

  // Compose final mascot centered
  function renderCompositeMascot(containerEl, indices) {
    // indices: { headIdx, bodyIdx, legsIdx, feetIdx }
    const partRows = [
      { src: window.maskotState.getSrc(indices.headIdx), pos: "top" },
      { src: window.maskotState.getSrc(indices.bodyIdx), pos: "33%" },
      { src: window.maskotState.getSrc(indices.legsIdx), pos: "66%" },
      { src: window.maskotState.getSrc(indices.feetIdx), pos: "bottom" },
    ];

    // Wrapper: center mascot in full space
    const wrapper = document.createElement("div");
    wrapper.className =
      "flex flex-col items-center justify-center w-full h-full text-center gap-8";

    // Mascot frame
    const frame = document.createElement("div");
    frame.className =
      "relative border border-white w-56 md:w-72 h-[30rem] md:h-[38rem] overflow-hidden rounded";
    wrapper.appendChild(frame);

    // 4 stacked cropped image rows
    const rows = document.createElement("div");
    rows.className = "absolute inset-0 flex flex-col";
    frame.appendChild(rows);

    partRows.forEach(({ src, pos }) => {
      const row = document.createElement("div");
      row.className = "flex-1 overflow-hidden relative bg-black";
      const img = document.createElement("img");
      img.src = src;
      img.className = "absolute w-full h-full object-cover";
      img.style.objectPosition = `center ${pos}`;
      row.appendChild(img);
      rows.appendChild(row);
    });

    // Render into container
    containerEl.innerHTML = "";
    containerEl.className =
      "flex flex-col items-center justify-center w-full h-full text-center";
    containerEl.appendChild(wrapper);
  }

  // Public function to show the win page
  window.showWinningPage = function showWinningPage({ addressParts, title }) {
    try {
      // Stop maskot animations
      if (window.maskotState?.lockAll) window.maskotState.lockAll();

      // Hide right-side columns
      const rightSide = document.querySelector(".grid.grid-rows-4");
      if (rightSide) rightSide.style.display = "none";

      // Update header (top title)
      const header = document.querySelector(
        ".border.border-white.p-4.flex.items-center.justify-left.col-span-2"
      );
      if (header) {
        header.style.border = "none";
        header.className =
          "p-4 flex items-center justify-center col-span-2 text-center";
        header.innerHTML = `<h1 class="text-xl md:text-2xl font-bold tracking-widest uppercase">Piratfest 2025</h1>`;
      }

      // Update footer (final address)
      const footer = document.getElementById("game-footer");
      if (footer) {
        footer.style.border = "none";
        footer.className =
          "p-4 flex items-center justify-center text-center w-full";
        const allShown = {
          street: { value: addressParts.street.value, revealed: true },
          number: { value: addressParts.number.value, revealed: true },
          zipcode: { value: addressParts.zipcode.value, revealed: true },
          time: { value: addressParts.time.value, revealed: true },
        };
        const line = buildAddressLine(allShown);
        footer.innerHTML = `
          <div class="text-center text-white font-mono whitespace-nowrap overflow-hidden text-ellipsis w-full"
               style="font-size: clamp(12px, 2vw, 22px); letter-spacing: 2px;">
            ${line}
          </div>
        `;
      }

      // Get current frozen mascot indices
      const headIdx = window.maskotState.getIndex("head");
      const bodyIdx = window.maskotState.getIndex("body");
      const legsIdx = window.maskotState.getIndex("legs");
      const feetIdx = window.maskotState.getIndex("feet");

      // Center mascot in main area
      const container = document.getElementById("game-container");
      if (!container) return;
      renderCompositeMascot(container, { headIdx, bodyIdx, legsIdx, feetIdx });
    } catch (e) {
      console.warn("Winning page error:", e);
    }
  };
})();
