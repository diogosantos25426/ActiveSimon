function preloadCalibrateGame() {
  imgSkeleton = loadImage("assets/esqueleto.png");
}

function drawCalibrateGameScreen() {
  background(20);

  push();
  translate(0, 0, -70);
  imageMode(CENTER);
  if (imgSkeleton) {
    const aspect = imgSkeleton.width / imgSkeleton.height;
    const targetHeight = min(height * 0.72, width * 0.78);
    image(imgSkeleton, 0, 10, targetHeight * aspect, targetHeight);
  }
  pop();

  push();
  noStroke();
  translate(0, 0, -45);
  fill(6, 15, 28, 118);
  rectMode(CENTER);
  rect(0, 0, width, height);
  pop();

  push();
  fill(255, 209, 102);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(width * 0.038, 30));
  text("SELECIONE A AREA DE TREINO", 0, -height * 0.43);
  fill(235, 244, 255);
  textStyle(NORMAL);
  textSize(min(width * 0.02, 16));
  text("Passa o rato sobre um ponto para veres a zona e clica para iniciar o treino.", 0, -height * 0.385);
  pop();

  const mx = mouseX - width / 2;
  const my = mouseY - height / 2;
  let hoveredPoint = null;

  for (const pt of calibrationPoints) {
    const d = dist(mx, my, pt.x, pt.y);
    const isHover = d < 25;
    if (isHover) hoveredPoint = pt;

    push();
    translate(pt.x, pt.y, 10);
    stroke(255, isHover ? 255 : 150);
    strokeWeight(isHover ? 3 : 1);
    fill(255, 0, 0, isHover ? 255 : 120);
    ellipse(0, 0, isHover ? 45 : 35, isHover ? 45 : 35);

    if (isHover) {
      textAlign(CENTER, CENTER);
      textSize(14);
      rectMode(CENTER);
      fill(0, 200);
      rect(0, 40, textWidth(pt.label) + 18, 24, 6);
      fill(255);
      noStroke();
      text(pt.label, 0, 40);
    }
    pop();
  }

  if (hoveredPoint) {
    push();
    translate(0, height * 0.29, 20);
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(7, 23, 41, 230);
    rect(0, 0, min(width * 0.72, 420), 50, 14);
    fill(255, 209, 102);
    textStyle(BOLD);
    textSize(min(width * 0.028, 20));
    text(hoveredPoint.label, 0, 1);
    pop();
  }

  drawMenuButton("VOLTAR", 0, height * 0.4, min(width * 0.34, 180));
}

window.preloadCalibrateGame = preloadCalibrateGame;
window.drawCalibrateGameScreen = drawCalibrateGameScreen;
