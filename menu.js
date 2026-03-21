let bgMenu;
let imgSkeleton;
let state = "MENU";

let calibrationPoints = [
  // Superiores
  { x: -70, y: -180, label: "Ombro Esquerdo",   state: "GAME_OMBRO_ESQ" },
  { x: 70,  y: -180, label: "Ombro Direito",    state: "GAME_OMBRO_DIR" },
  { x: 0,   y: -210, label: "Ombros (Geral)",   state: "GAME_OMBROS" },
  { x: -140,y: -100, label: "M. Sup. Esquerda", state: "GAME_SUP_ESQ" },
  { x: 140, y: -100, label: "M. Sup. Direita",  state: "GAME_SUP_DIR" },
  { x: 0,   y: -120, label: "M. Superiores",    state: "GAME_SUP_GERAL" },

  // Tronco/Cintura
  { x: 0,   y: -20,  label: "Cintura",          state: "GAME_CINTURA" },

  // Inferiores
  { x: -60, y: 180,  label: "M. Inf. Esquerda", state: "GAME_INF_ESQ" },
  { x: 60,  y: 180,  label: "M. Inf. Direita",  state: "GAME_INF_DIR" },
  { x: 0,   y: 250,  label: "M. Inf. Geral",    state: "GAME_INF_GERAL" }
];

function preloadMenu() {
  bgMenu = loadImage('assets/bgMenu.jpg');
  imgSkeleton = loadImage('assets/esqueleto.png');
  if (window.preloadCalibrateGame) {
    window.preloadCalibrateGame();
  }
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

  const player = window.getCurrentPlayer ? window.getCurrentPlayer() : null;
  const trainingSummary = window.getTrainingSummary ? window.getTrainingSummary() : null;
  const btnWidth = min(width * 0.6, 360);
  const titleSize = min(width * 0.09, height * 0.11, 84);
  const subtitleSize = min(width * 0.024, 18);

  push();
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  fill(115, 217, 255, 70);
  textSize(titleSize * 1.04);
  text("SIMON DIZ", 0, -height * 0.302);
  fill(255, 209, 102);
  textSize(titleSize);
  text("SIMON DIZ", 0, -height * 0.3);

  drawPlayerPanel(player, trainingSummary);

  fill(220, 238, 255);
  textStyle(NORMAL);
  textSize(subtitleSize);
  if (player) {
    text("Pronto para treinar memoria, coordenacao e foco.", 0, -height * 0.145);
  } else {
    text("Entra com reconhecimento facial para desbloquear a sessao de jogo.", 0, -height * 0.145);
  }

  drawMenuButton("JOGAR", 0, -42, btnWidth, {
    base: color(18, 190, 144, 210),
    glow: color(119, 242, 197, 95)
  });
  drawMenuButton("MANUAL", 0, 38, btnWidth, {
    base: color(44, 115, 255, 210),
    glow: color(115, 217, 255, 90)
  });
  drawMenuButton("CALIBRACAO", 0, 118, btnWidth, {
    base: color(255, 168, 76, 210),
    glow: color(255, 209, 102, 90)
  });
  drawAuthActionButton();
  pop();
}

function drawPlayerPanel(player, trainingSummary) {
  const panelWidth = min(width * 0.78, 560);
  const panelHeight = width < 720 ? 118 : 104;
  const titleSize = width < 720 ? 16 : 18;
  const metaSize = width < 720 ? 13 : 15;
  const planSize = width < 720 ? 12 : 13;

  push();
  translate(0, -height * 0.21, 3);
  rectMode(CENTER);
  noStroke();
  fill(5, 14, 28, 170);
  rect(0, 0, panelWidth, panelHeight, 24);
  stroke(115, 217, 255, 60);
  strokeWeight(1.5);
  noFill();
  rect(0, 0, panelWidth, panelHeight, 24);

  textAlign(CENTER, CENTER);
  if (player) {
    fill(244, 251, 255);
    textStyle(BOLD);
    textSize(titleSize);
    text(`Jogador: ${player.full_name}`, 0, -22);
    fill(119, 242, 197);
    textStyle(NORMAL);
    textSize(metaSize);
    text(`Supervisor: ${player.supervisor_name || 'Nao associado'}`, 0, 2);
    fill(255, 209, 102);
    textSize(planSize);
    if (trainingSummary) {
      const summaryLine = trainingSummary.totalAssignments === 1
        ? `Jogo ativo: ${trainingSummary.gameName}`
        : `Jogos ativos: ${trainingSummary.totalAssignments}`;
      text(summaryLine, 0, 24);
    } else {
      text("Jogos: sem jogos ativos atribuidos", 0, 24);
    }
  } else {
    fill(244, 251, 255);
    textStyle(BOLD);
    textSize(titleSize);
    text("Sessao de jogador inativa", 0, -18);
    fill(255, 209, 102);
    textStyle(NORMAL);
    textSize(metaSize);
    text("Faz login facial para entrares no circuito de treino.", 0, 6);
    textSize(planSize);
    fill(115, 217, 255);
    text("O plano do supervisor sera carregado aqui quando existir.", 0, 28);
  }
  pop();
}

function getTrainingSelectorBounds(panelWidth = min(width * 0.68, 520)) {
  return {
    left: { x: -panelWidth / 2 + 26, y: 24, w: 26, h: 26 },
    right: { x: panelWidth / 2 - 26, y: 24, w: 26, h: 26 }
  };
}

function drawTrainingSelector(panelWidth) {
  const bounds = getTrainingSelectorBounds(panelWidth);
  drawSelectorButton(bounds.left, "<");
  drawSelectorButton(bounds.right, ">");
}

function drawSelectorButton(bounds, label) {
  push();
  translate(bounds.x, bounds.y, 4);
  rectMode(CENTER);
  noStroke();
  fill(8, 22, 38, 220);
  rect(0, 0, bounds.w, bounds.h, 999);
  stroke(115, 217, 255, 120);
  strokeWeight(1.2);
  noFill();
  rect(0, 0, bounds.w, bounds.h, 999);
  noStroke();
  fill(244, 251, 255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(15);
  text(label, 0, -1);
  pop();
}

function drawAuthActionButton() {
  const bounds = getAuthActionBounds();
  const label = window.isAuthenticated && window.isAuthenticated() ? "SAIR" : "ENTRAR";

  push();
  translate(bounds.x, bounds.y, 8);
  rectMode(CENTER);
  noStroke();
  fill(isPointerInside(bounds) ? color(255, 209, 102, 220) : color(7, 23, 41, 220));
  rect(0, 0, bounds.w, bounds.h, 999);
  stroke(isPointerInside(bounds) ? color(255, 240, 196, 180) : color(115, 217, 255, 110));
  strokeWeight(1.5);
  noFill();
  rect(0, 0, bounds.w, bounds.h, 999);
  noStroke();
  fill(isPointerInside(bounds) ? color(16, 22, 31) : color(244, 251, 255));
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(17);
  text(label, 0, 0);
  pop();
}

function getAuthActionBounds() {
  return {
    x: width * 0.34,
    y: -height * 0.43,
    w: 150,
    h: 44
  };
}

function isPointerInside(bounds) {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  return (
    mx > bounds.x - bounds.w / 2 &&
    mx < bounds.x + bounds.w / 2 &&
    my > bounds.y - bounds.h / 2 &&
    my < bounds.y + bounds.h / 2
  );
}

function drawCalibrateScreen() {
  if (window.drawCalibrateGameScreen) {
    window.drawCalibrateGameScreen();
    return;
  }

  background(8, 14, 26);

  push();
  translate(0, 0, -50);
  imageMode(CENTER);
  if (imgSkeleton) {
    let aspect = imgSkeleton.width / imgSkeleton.height;
    image(imgSkeleton, 0, 0, height * aspect * 0.7, height * 0.7);
  }
  pop();

  push();
  fill(255, 209, 102);
  textAlign(CENTER, CENTER);
  textSize(32);
  textStyle(BOLD);
  text("CALIBRACAO", 0, -height * 0.4);
  pop();

  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  for (let pt of calibrationPoints) {
    let d = dist(mx, my, pt.x, pt.y);
    let isHover = d < 25;

    push();
    translate(pt.x, pt.y, 10);
    fill(isHover ? color(255, 209, 102) : color(115, 217, 255, 120));
    stroke(isHover ? color(255, 250, 220) : color(115, 217, 255, 90));
    strokeWeight(isHover ? 2 : 1);
    ellipse(0, 0, isHover ? 44 : 38, isHover ? 44 : 38);

    if (isHover) {
      fill(244, 251, 255);
      noStroke();
      textSize(14);
      text(pt.label, 0, 35);
    }
    pop();
  }

  drawMenuButton("VOLTAR", 0, height * 0.35, 180, {
    base: color(255, 168, 76, 210),
    glow: color(255, 209, 102, 90)
  });
}

function drawManualScreen() {
  drawMenuBackground();

  push();
  noStroke();
  translate(0, 0, -40);
  fill(4, 11, 21, 175);
  rectMode(CENTER);
  rect(0, 0, width, height);
  pop();

  push();
  const panelWidth = min(width * 0.92, 980);
  const panelHeight = min(height * 0.76, 620);
  const leftColumnWidth = panelWidth * 0.34;
  const rightColumnWidth = panelWidth * 0.56;
  const titleSize = min(width * 0.046, 42);
  const subtitleSize = min(width * 0.02, 18);
  const cardTitleSize = width < 720 ? 15 : 18;
  const cardBodySize = width < 720 ? 12 : 15;
  const hintTextSize = width < 720 ? 12 : 14;
  const panelLeft = -panelWidth / 2;
  const panelTop = -panelHeight / 2;
  const backButton = getManualBackButtonBounds();

  translate(0, -6, 5);
  rectMode(CORNER);
  noStroke();
  fill(7, 18, 31, 230);
  rect(panelLeft, panelTop, panelWidth, panelHeight, 30);
  stroke(255, 209, 102, 70);
  strokeWeight(1.8);
  noFill();
  rect(panelLeft, panelTop, panelWidth, panelHeight, 30);

  noStroke();
  fill(10, 26, 43, 232);
  rect(panelLeft + 24, panelTop + 24, leftColumnWidth - 36, panelHeight - 48, 26);
  fill(9, 21, 36, 180);
  rect(panelLeft + leftColumnWidth, panelTop + 24, rightColumnWidth, panelHeight - 48, 26);

  fill(255, 209, 102);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(14);
  text("GUIA RAPIDO", panelLeft + 46, panelTop + 44);

  textSize(titleSize);
  text("COMO JOGAR", panelLeft + 42, panelTop + 74);

  fill(119, 242, 197);
  textSize(subtitleSize);
  text("Uma vista simples do fluxo do jogo para a apresentacao final.", panelLeft + 42, panelTop + 128, leftColumnWidth - 76, 70);

  drawManualStepCard(panelLeft + 40, panelTop + 200, leftColumnWidth - 72, 86, "1. Entrar", "Faz login facial para desbloquear a sessao do jogador.");
  drawManualStepCard(panelLeft + 40, panelTop + 298, leftColumnWidth - 72, 86, "2. Jogar", "Carrega em JOGAR para abrir um dos jogos ativos de forma aleatoria.");
  drawManualStepCard(panelLeft + 40, panelTop + 396, leftColumnWidth - 72, 86, "3. Sair", "Usa FECHAR dentro do jogo para regressar rapidamente ao menu.");

  const rightX = panelLeft + leftColumnWidth + 28;
  const rightTop = panelTop + 44;

  fill(235, 244, 255);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(cardTitleSize + 2);
  text("Durante o treino", rightX, rightTop);

  textStyle(NORMAL);
  textSize(cardBodySize);
  textLeading(cardBodySize * 1.6);
  text(
    "Observa o exercicio mostrado no ecra e imita o movimento com calma. O contador e a mensagem de feedback ajudam-te a perceber se estas a completar a repeticao corretamente.",
    rightX,
    rightTop + 38,
    rightColumnWidth - 44,
    116
  );

  fill(255, 209, 102);
  textStyle(BOLD);
  textSize(cardTitleSize + 2);
  text("Exploracao livre", rightX, rightTop + 166);

  fill(235, 244, 255);
  textStyle(NORMAL);
  textSize(cardBodySize);
  text(
    "Se quiseres testar zonas especificas do corpo, abre CALIBRACAO e escolhe diretamente ombros, membros superiores, cintura ou membros inferiores.",
    rightX,
    rightTop + 204,
    rightColumnWidth - 44,
    108
  );

  fill(255, 209, 102);
  textSize(hintTextSize);
  textStyle(BOLD);
  textLeading(hintTextSize * 1.5);
  textAlign(LEFT, TOP);
  text(
    "Dica: coloca-te centrado, com boa luz e com espaco suficiente para mexer bracos, tronco e pernas.",
    rightX,
    panelTop + panelHeight - 138,
    rightColumnWidth - 44,
    64
  );

  drawMenuButton("VOLTAR", backButton.x, backButton.y, backButton.w, {
    base: color(44, 115, 255, 210),
    glow: color(115, 217, 255, 90)
  });
  pop();
}

function getManualBackButtonBounds() {
  const panelWidth = min(width * 0.92, 980);
  const panelHeight = min(height * 0.76, 620);
  const panelTop = -panelHeight / 2;

  return {
    x: 0,
    y: panelTop + panelHeight - 58,
    w: min(230, panelWidth * 0.24),
    h: width < 720 ? 50 : 56
  };
}

function drawManualStepCard(x, y, w, h, title, copy) {
  push();
  rectMode(CORNER);
  noStroke();
  fill(255, 255, 255, 0);
  fill(12, 31, 49, 220);
  rect(x, y, w, h, 22);
  stroke(115, 217, 255, 65);
  strokeWeight(1.2);
  noFill();
  rect(x, y, w, h, 22);

  noStroke();
  fill(255, 209, 102);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(width < 720 ? 14 : 17);
  text(title, x + 18, y + 14);

  fill(235, 244, 255);
  textStyle(NORMAL);
  textSize(width < 720 ? 11 : 14);
  textLeading((width < 720 ? 11 : 14) * 1.45);
  text(copy, x + 18, y + 40, w - 36, h - 48);
  pop();
}

function drawMenuButton(label, x, y, w, theme = {}) {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  let h = width < 720 ? 50 : 56;
  let isHover = (mx > x - w / 2 && mx < x + w / 2 && my > y - h / 2 && my < y + h / 2);
  let base = theme.base || color(40, 100, 250);
  let glow = theme.glow || color(115, 217, 255, 70);

  push();
  translate(x, y, 5);
  rectMode(CENTER);
  noStroke();
  fill(red(glow), green(glow), blue(glow), isHover ? alpha(glow) + 40 : alpha(glow));
  rect(0, 0, w + 16, h + 16, 20);
  fill(7, 18, 31, 210);
  rect(0, 0, w, h, 18);
  stroke(isHover ? color(244, 251, 255, 220) : color(red(base), green(base), blue(base), 180));
  strokeWeight(isHover ? 2.2 : 1.4);
  fill(isHover ? lerpColor(base, color(255), 0.12) : base);
  rect(0, 0, w, h, 18);

  translate(0, 0, 2);
  noStroke();
  fill(250, 253, 255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(width < 720 ? 18 : 21);
  text(label, 0, 0);
  pop();
}

function menuMousePressed() {
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;
  let btnH = 50;
  let btnW = min(width * 0.5, 300);

  if (state === "MENU") {
    if (isPointerInside(getAuthActionBounds())) {
      if (window.isAuthenticated && window.isAuthenticated()) {
        if (window.logoutPlayer) window.logoutPlayer();
      } else if (window.showAuthPanel) {
        window.showAuthPanel('login', 'Inicia sessao para jogar.');
      }
      return;
    }

    if (abs(mx) < btnW / 2 && abs(my - (-50)) < btnH / 2) {
      if (window.requireAuth && !window.requireAuth('Tens de entrar antes de jogar.')) return;
      if (window.startAssignedTraining) {
        window.startAssignedTraining();
      } else {
        startNewGame();
      }
    }
    if (abs(mx) < btnW / 2 && abs(my - 30) < btnH / 2) state = "MANUAL";
    if (abs(mx) < btnW / 2 && abs(my - 110) < btnH / 2) state = "CALIBRATE";
  }
  else if (state === "CALIBRATE") {
    for (let pt of calibrationPoints) {
      if (dist(mx, my, pt.x, pt.y) < 25) {
        if (window.requireAuth && !window.requireAuth('Tens de entrar antes de iniciar um treino.')) return;
        if (window.startCalibrationGame && window.startCalibrationGame(pt.label)) return;
      }
    }
    if (abs(mx) < 90 && abs(my - (height * 0.35)) < btnH / 2) state = "MENU";
  }
  else if (state === "MANUAL") {
    const backButton = getManualBackButtonBounds();
    if (
      abs(mx - backButton.x) < backButton.w / 2 &&
      abs(my - backButton.y) < backButton.h / 2
    ) {
      state = "MENU";
    }
  }
}
