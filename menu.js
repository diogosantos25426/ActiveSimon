let bgMenu;
let imgSkeleton;
let state = "MENU";

// Pontos de calibração baseados na anatomia do esqueleto.png
let calibrationPoints = [
  { x: 0,    y: -300, label: "Cabeça" },
  { x: -70,  y: -200,  label: "Ombro Esq" },
  { x: 70,   y: -200,  label: "Ombro Dir" },
  { x: -110, y: -80,   label: "Cotovelo Esq" },
  { x: 110,  y: -80,   label: "Cotovelo Dir" },
  { x: -55, y: 155,  label: "Joelho Esq" },
  { x: 55,  y: 155,  label: "Joelho Dir" },
  { x: 0,    y: -40,  label: "Cintura" }
];

function preloadMenu() {
  bgMenu = loadImage('assets/bgMenu.jpg');
  imgSkeleton = loadImage('assets/esqueleto.png');
}

function drawMenuBackground() {
  push();
  noStroke();
  translate(0, 0, -100); 
  imageMode(CENTER);
  if (bgMenu) {
    let s = max(width / bgMenu.width, height / bgMenu.height);
    image(bgMenu, 0, 0, bgMenu.width * s, bgMenu.height * s);
  }
  pop();
}

function drawMenu() {
  drawMenuBackground();
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(height * 0.07);
  text("SIMON DIZ", 0, -height * 0.3);

  let btnWidth = min(width * 0.5, 300);
  drawMenuButton("JOGAR", 0, -50, btnWidth);
  drawMenuButton("MANUAL", 0, 30, btnWidth);
  drawMenuButton("CALIBRAÇÃO", 0, 110, btnWidth);
  pop();
}

// --- NOVA TELA DE CALIBRAÇÃO (Substitui as definições antigas) ---
function drawCalibrateScreen() {
  background(20);
  
  // 1. Imagem do Esqueleto
  push();
  translate(0, 0, -50);
  imageMode(CENTER);
  if (imgSkeleton) {
    let aspect = imgSkeleton.width / imgSkeleton.height;
    image(imgSkeleton, 0, 0, height * aspect * 0.7, height * 0.7);
  }
  pop();

  // 2. Título
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("CALIBRAÇÃO", 0, -height * 0.4);
  pop();

  // 3. Círculos de Calibração
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  for (let pt of calibrationPoints) {
    let d = dist(mx, my, pt.x, pt.y);
    let isHover = d < 25;

    push();
    translate(pt.x, pt.y, 10);
    // Vermelho transparente por defeito, Sólido no hover
    fill(255, 0, 0, isHover ? 255 : 100); 
    stroke(255, isHover ? 255 : 0);
    ellipse(0, 0, 40, 40);
    
    if (isHover) {
      fill(255);
      noStroke();
      textSize(14);
      text(pt.label, 0, 35);
    }
    pop();
  }

  // 4. Botão Voltar
  drawMenuButton("VOLTAR", 0, height * 0.35, 180);
}

function drawManualScreen() {
  drawMenuBackground();
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(35);
  text("COMO JOGAR", 0, -100);
  textSize(20);
  text("1. Memoriza a sequência de cubos.\n2. Toca no cubo certo com a mão direita.\n3. Segue o rasto branco para te guiares.", 0, 20);
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

function menuMousePressed() {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  let btnH = 50;
  let btnW = min(width * 0.5, 300);

  if (state === "MENU") {
    if (abs(mx) < btnW/2 && abs(my - (-50)) < btnH/2) startNewGame();
    if (abs(mx) < btnW/2 && abs(my - 30) < btnH/2) state = "MANUAL";
    // Agora o botão DEFINIÇÕES (y=110) leva à calibração
    if (abs(mx) < btnW/2 && abs(my - 110) < btnH/2) state = "CALIBRATE"; 
  } 
  else if (state === "CALIBRATE") {
    // Botão VOLTAR na tela de calibração
    if (abs(mx) < 90 && abs(my - (height * 0.35)) < btnH/2) state = "MENU";
  }
  else if (state === "MANUAL") {
    if (abs(mx) < 90 && abs(my - 180) < btnH/2) state = "MENU";
  }
}