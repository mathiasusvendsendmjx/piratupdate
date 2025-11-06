// 🏁 game0_introduction.js
window.p5Instance = new p5((s) => {
  let title = "UNLOCK THE LOCATION";
  let subtitle =
    "BEAT ALL GAMES TO REVEAL ADDRESS AND TIME";
  let instruction = "CLICK TO START";

  s.setup = () => {
    const container = document.getElementById("game-container");
    const canvas = s.createCanvas(
      container.clientWidth,
      container.clientHeight
    );
    canvas.parent("game-container");
    s.textAlign(s.CENTER, s.CENTER);
    s.textFont("monospace");
  };

  s.windowResized = () => {
    const container = document.getElementById("game-container");
    s.resizeCanvas(container.clientWidth, container.clientHeight);
  };

  s.draw = () => {
    s.background(0);
    s.fill(255);

    // Dynamisk tekststørrelse efter skærmbredde
    const titleSize = s.width * 0.05; // fx 5% af bredden
    const subtitleSize = s.width * 0.02;
    const instructionSize = s.width * 0.02;

    s.textSize(titleSize);
    s.text(title, s.width / 2, s.height / 2 - titleSize * 1.2);

    s.textSize(subtitleSize);
    s.text(subtitle, s.width / 2, s.height / 2);

    s.textSize(instructionSize);
    s.fill("#E933C9");
    s.text(instruction, s.width / 2, s.height / 2 + titleSize * 1.5);
  };

  s.mousePressed = () => {
    // Gå videre til næste spil
    gameCompleted();
  };
});
