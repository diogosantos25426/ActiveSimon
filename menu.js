let bgMenu;
let state = "MENU";

function preloadMenu() {
  // Certifica-te que a extensão está correta (.jpg ou .png)
  bgMenu = loadImage('assets/bgMenu.jpg');
}

function drawMenuBackground() {
  push();
  noStroke();
  translate(0, 0, -100); 
  imageMode(CENTER);
  if (bgMenu) {
    let scale = max(width / bgMenu.width, height / bgMenu.height);
    image(bgMenu, 0, 0, bgMenu.width * scale, bgMenu.height * scale);
  }
  pop();
}

function drawMenu() {
  drawMenuBackground();
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(height * 0.07);
  text("SIMÃO ATIVO", 0, -height * 0.3);

  let btnWidth = min(width * 0.5, 300);
  drawMenuButton("JOGAR", 0, -50, btnWidth);
  drawMenuButton("MANUAL", 0, 30, btnWidth);
  drawMenuButton("DEFINIÇÕES", 0, 110, btnWidth);
  pop();
}

function drawSettingsScreen() {
  drawMenuBackground();
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("DEFINIÇÕES", 0, -height * 0.3);
  textSize(20);
  text("SOM: " + nfc(gameVolume * 100, 0) + "%", 0, -20);
  drawMenuButton("-", -80, -20, 50);
  drawMenuButton("+", 80, -20, 50);
  let diffLabel = gameDifficulty === 1 ? "FÁCIL" : gameDifficulty === 2 ? "MÉDIO" : "DIFÍCIL";
  text("DIFICULDADE: " + diffLabel, 0, 70);
  drawMenuButton("-", -120, 70, 50);
  drawMenuButton("+", 120, 70, 50);
  drawMenuButton("VOLTAR", 0, 180, 180);
  pop();
}

function drawManualScreen() {
  drawMenuBackground();
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(35);
  text("COMO JOGAR", 0, -100);
  textSize(20);
  text("1. Memoriza a sequência de cubos que piscam.\n2. Agarra cada cubo com a mão direita.\n3. Coloca‑o no cesto na ordem certa.", 0, 20);
  drawMenuButton("VOLTAR", 0, 180, 180);
  pop();
}

function drawMenuButton(label, x, y, w) {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  let h = 50; 
  let isHover = (mx > x - w/2 && mx < x + w/2 && my > y - h/2 && my < y + h/2);

  push();
  translate(x, y, 5); 
  rectMode(CENTER);
  stroke(255);
  strokeWeight(2);
  fill(isHover ? color(100, 100, 250) : color(40, 100, 250));
  rect(0, 0, w, h, 10);
  translate(0, 0, 2); 
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  text(label, 0, 0);
  pop();
}

// Renomeado para evitar conflito com o mousePressed principal
function menuMousePressed() {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  let btnH = 50;
  let btnW = min(width * 0.5, 300);

  if (state === "MENU") {
    if (abs(mx) < btnW/2 && abs(my - (-50)) < btnH/2) startNewGame();
    if (abs(mx) < btnW/2 && abs(my - 30) < btnH/2) state = "MANUAL";
    if (abs(mx) < btnW/2 && abs(my - 110) < btnH/2) state = "SETTINGS";
  } 
  else if (state === "SETTINGS") {
    if (abs(my - (-20)) < btnH/2) {
      if (mx > -105 && mx < -55) gameVolume = max(gameVolume - 0.1, 0);
      if (mx > 55 && mx < 105) gameVolume = min(gameVolume + 0.1, 1);
    }
    if (abs(my - 70) < btnH/2) {
      if (mx > -145 && mx < -95) gameDifficulty = max(gameDifficulty - 1, 1);
      if (mx > 95 && mx < 145) gameDifficulty = min(gameDifficulty + 1, 3);
    }
    if (abs(mx) < 90 && abs(my - 180) < btnH/2) state = "MENU";
  }
  else if (state === "MANUAL") {
    if (abs(mx) < 90 && abs(my - 180) < btnH/2) state = "MENU";
  }
}