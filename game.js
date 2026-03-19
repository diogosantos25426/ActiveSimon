let activeGameSession = null;
const gameImplementations = {};

function setGameCloseButtonVisible(visible) {
  const button = document.getElementById("game-close-button");
  if (!button) return;
  button.classList.toggle("hidden", !visible);
}

function buildFallbackGameSession() {
  const firstGame = window.getEnabledGames ? window.getEnabledGames()[0] : null;
  return window.buildGameSessionConfig
    ? window.buildGameSessionConfig(firstGame?.code || "lower_right", firstGame?.defaultDifficulty || "medium")
    : {
        gameCode: "lower_right",
        gameName: "Membros Inferiores - Direita",
        implementationKey: "games2_lower_right",
        difficultyKey: "medium",
        difficultyLabel: "Medio",
        status: "ready",
        bodyPart: "right_leg"
      };
}

function drawMirrorVideo() {
  const sourceWidth = video?.width || 640;
  const sourceHeight = video?.height || 480;
  const scaleFactor = max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scaleFactor;
  const drawHeight = sourceHeight * scaleFactor;

  push();
  translate(0, 0, -200);
  scale(-1, 1);
  _renderer.GL.disable(_renderer.GL.DEPTH_TEST);
  image(video, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  _renderer.GL.enable(_renderer.GL.DEPTH_TEST);
  pop();
}

function drawTherapyExerciseOverlay({ exerciseLabel, countText, feedback, icon, accent }) {
  const accentColor = accent || [119, 242, 197];
  const cardWidth = min(width * 0.2, 250);
  const cardHeight = min(height * 0.4, 300);
  const cardX = width / 2 - cardWidth - 24;
  const cardY = -height / 2 + 102;
  const iconSize = min(cardWidth - 36, 188);

  push();
  _renderer.GL.disable(_renderer.GL.DEPTH_TEST);
  rectMode(CORNER);

  noStroke();
  fill(4, 10, 18, 88);
  rect(-width / 2, -height / 2, width, height);

  fill(10, 24, 39, 228);
  rect(cardX, cardY, cardWidth, cardHeight, 24);
  stroke(accentColor[0], accentColor[1], accentColor[2], 120);
  strokeWeight(1.5);
  noFill();
  rect(cardX, cardY, cardWidth, cardHeight, 24);

  noStroke();
  fill(235, 244, 255);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(min(width * 0.015, 14));
  text("EXERCICIO ATIVO", cardX + 18, cardY + 16);

  fill(255, 255, 255, 245);
  rect(cardX + 18, cardY + 42, cardWidth - 36, iconSize, 18);
  if (icon) {
    image(icon, cardX + 18, cardY + 42, cardWidth - 36, iconSize);
  }

  fill(accentColor[0], accentColor[1], accentColor[2]);
  textSize(min(width * 0.018, 16));
  textLeading(22);
  text(exerciseLabel || "Exercicio", cardX + 18, cardY + 58 + iconSize, cardWidth - 36, 52);

  const statsWidth = min(width * 0.16, 170);
  const statsX = -width / 2 + 26;
  const statsY = -height / 2 + 102;
  fill(7, 20, 33, 222);
  rect(statsX, statsY, statsWidth, 108, 22);
  stroke(accentColor[0], accentColor[1], accentColor[2], 90);
  strokeWeight(1.2);
  noFill();
  rect(statsX, statsY, statsWidth, 108, 22);

  noStroke();
  fill(235, 244, 255);
  textSize(min(width * 0.014, 13));
  textStyle(BOLD);
  text("REPETICOES", statsX + 18, statsY + 16);
  fill(accentColor[0], accentColor[1], accentColor[2]);
  textSize(min(width * 0.038, 38));
  text(countText || "0 / 0", statsX + 18, statsY + 42);

  const feedbackWidth = min(width * 0.46, 560);
  const feedbackHeight = 78;
  const feedbackX = -feedbackWidth / 2;
  const feedbackY = height / 2 - feedbackHeight - 26;
  fill(7, 20, 33, 230);
  rect(feedbackX, feedbackY, feedbackWidth, feedbackHeight, 999);
  stroke(accentColor[0], accentColor[1], accentColor[2], 80);
  strokeWeight(1.2);
  noFill();
  rect(feedbackX, feedbackY, feedbackWidth, feedbackHeight, 999);

  noStroke();
  fill(255, 209, 102);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(width * 0.018, 18));
  text(feedback || "Segue o movimento mostrado.", 0, feedbackY + feedbackHeight / 2);

  _renderer.GL.enable(_renderer.GL.DEPTH_TEST);
  pop();
}

function drawGameHud() {
  push();
  _renderer.GL.disable(_renderer.GL.DEPTH_TEST);

  rectMode(CORNER);
  noStroke();

  fill(2, 8, 14, 84);
  rect(-width / 2, -height / 2, width, 70);
  rect(-width / 2, height / 2 - 108, width, 108);

  for (let i = 0; i < 3; i++) {
    const bandY = -height / 2 + 86 + i * 18;
    fill(115, 217, 255, 10 - i * 2);
    rect(-width / 2, bandY, width, 2);
  }

  const headerWidth = min(width * 0.4, 420);
  const headerX = -width / 2 + 26;
  const headerY = -height / 2 + 18;
  fill(7, 20, 33, 212);
  rect(headerX, headerY, headerWidth, 64, 20);
  stroke(115, 217, 255, 105);
  strokeWeight(1.2);
  noFill();
  rect(headerX, headerY, headerWidth, 64, 20);

  noStroke();
  fill(255, 209, 102);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(min(width * 0.023, 22));
  text(activeGameSession?.gameName || "Treino Ativo", headerX + 18, headerY + 23);

  fill(119, 242, 197);
  textStyle(NORMAL);
  textSize(min(width * 0.0155, 14));
  text(`Dificuldade ${activeGameSession?.difficultyLabel || "Medio"}`, headerX + 18, headerY + 45);

  const footerWidth = min(width * 0.54, 560);
  const footerHeight = 52;
  const footerX = -footerWidth / 2;
  const footerY = height / 2 - footerHeight - 18;
  fill(7, 20, 33, 220);
  rect(footerX, footerY, footerWidth, footerHeight, 999);
  stroke(119, 242, 197, 90);
  strokeWeight(1.2);
  noFill();
  rect(footerX, footerY, footerWidth, footerHeight, 999);

  noStroke();
  fill(235, 244, 255);
  textAlign(CENTER, CENTER);
  textSize(min(width * 0.015, 14));
  text("Segue o movimento mostrado e usa FECHAR para voltar ao menu.", 0, footerY + footerHeight / 2);

  _renderer.GL.enable(_renderer.GL.DEPTH_TEST);
  pop();
}

function registerGameImplementation(implementationKey, implementation) {
  if (!implementationKey || !implementation) return;
  gameImplementations[implementationKey] = implementation;
}

function getActiveImplementation() {
  if (!activeGameSession?.implementationKey) return null;
  return gameImplementations[activeGameSession.implementationKey] || null;
}

function applyGameSession(gameCode, difficultyKey) {
  activeGameSession = window.buildGameSessionConfig
    ? window.buildGameSessionConfig(gameCode, difficultyKey)
    : buildFallbackGameSession();

  if (!activeGameSession) {
    activeGameSession = buildFallbackGameSession();
  }

  return activeGameSession;
}

function startNewGame(gameCode, difficultyKey = "medium") {
  const safeCode = gameCode || window.getEnabledGames?.()[0]?.code || "lower_right";
  applyGameSession(safeCode, difficultyKey);

  const implementation = getActiveImplementation();
  if (implementation?.start) {
    implementation.start(activeGameSession);
  }

  state = "PLAYER";
  setGameCloseButtonVisible(true);
}

function gameLoop() {
  const implementation = getActiveImplementation();
  if (implementation?.gameLoop) {
    implementation.gameLoop(activeGameSession);
    drawGameHud();
    return;
  }

  drawMirrorVideo();
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("Sem implementacao para este jogo.", 0, 0);
  pop();
  drawGameHud();
}

function drawCongratsScreen() {
  push();
  translate(0, 0, 10);
  fill(119, 242, 197);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("TREINO CONCLUIDO", 0, -50);
  fill(255);
  textSize(18);
  text(activeGameSession?.gameName || "Jogo concluido", 0, 0);
  text("Clica para voltar ao menu", 0, 48);
  pop();
}

function drawGameOver() {
  const implementation = getActiveImplementation();
  if (state === "CONGRATS") {
    if (implementation?.drawCongrats) {
      implementation.drawCongrats(activeGameSession);
      drawGameHud();
      return;
    }
    drawCongratsScreen();
    drawGameHud();
    return;
  }

  if (implementation?.drawGameOver) {
    implementation.drawGameOver(activeGameSession);
    drawGameHud();
    return;
  }

  push();
  translate(0, 0, 10);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("FIM DE JOGO", 0, -50);
  fill(255);
  textSize(18);
  text("Clica para voltar ao menu", 0, 40);
  pop();
  drawGameHud();
}

function exitActiveGame() {
  activeGameSession = buildFallbackGameSession();
  state = "MENU";
  setGameCloseButtonVisible(false);
}

applyGameSession();
setGameCloseButtonVisible(false);
window.drawMirrorVideo = drawMirrorVideo;
window.drawTherapyExerciseOverlay = drawTherapyExerciseOverlay;
window.shouldDrawGameDebug = false;
window.exitActiveGame = exitActiveGame;
window.registerGameImplementation = registerGameImplementation;
window.startNewGame = startNewGame;
