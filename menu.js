function drawMenu() {
  push();
  translate(0, 0, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(50);
  text("SIMÃO ATIVO", 0, -120);

  drawMenuButton("JOGAR", 0, -30, 200);
  drawMenuButton("MANUAL", 0, 30, 200);
  drawMenuButton("DEFINIÇÕES", 0, 90, 200);
  pop();
}

function drawMenuButton(label, x, y, w) {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  let h = 40;
  let isHover = (mx > x - w/2 && mx < x + w/2 && my > y - h/2 && my < y + h/2);

  stroke(255);
  fill(isHover ? 100 : 40, 100, 250);
  rect(x - w/2, y - h/2, w, h, 10);
  
  noStroke();
  fill(255);
  textSize(20);
  text(label, x, y);
}

function drawSettingsScreen() {
  push();
  translate(0, 0, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(35);
  text("DEFINIÇÕES", 0, -120);

  // Controlo de Som
  textSize(20);
  text("SOM: " + nfc(gameVolume * 100, 0) + "%", 0, -40);
  drawMenuButton("-", -70, -40, 40);
  drawMenuButton("+", 70, -40, 40);

  // Controlo de Dificuldade
  let diffLabel = gameDifficulty === 1 ? "FÁCIL" : gameDifficulty === 2 ? "MÉDIO" : "DIFÍCIL";
  text("DIFICULDADE: " + diffLabel, 0, 40);
  drawMenuButton("-", -110, 40, 40);
  drawMenuButton("+", 110, 40, 40);

  drawMenuButton("VOLTAR", 0, 120, 150);
  pop();
}

function handleClicks() {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  if (state === "MENU") {
    if (abs(mx) < 100) {
      if (my > -50 && my < -10) startNewGame();
      if (my > 10 && my < 50) state = "MANUAL";
      if (my > 70 && my < 110) state = "SETTINGS";
    }
  } 
  else if (state === "SETTINGS") {
    // Cliques Som
    if (my > -60 && my < -20) {
      if (mx > -90 && mx < -50) gameVolume = max(gameVolume - 0.1, 0);
      if (mx > 50 && mx < 90) gameVolume = min(gameVolume + 0.1, 1);
    }
    // Cliques Dificuldade
    if (my > 20 && my < 60) {
      if (mx > -130 && mx < -90) gameDifficulty = max(gameDifficulty - 1, 1);
      if (mx > 90 && mx < 130) gameDifficulty = min(gameDifficulty + 1, 3);
    }
    // Voltar
    if (abs(mx) < 75 && my > 100 && my < 140) state = "MENU";
  }
}

function drawManualScreen() {
  push();
  translate(0, 0, 10);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30); text("COMO JOGAR", 0, -100);
  textSize(16);
  text("1. Memoriza a sequência de cores.\n2. Estica os braços para tocar nos cubos.\n3. Treina o corpo e a mente!", 0, 0);
  drawMenuButton("VOLTAR", 0, 120, 150);
  pop();
}