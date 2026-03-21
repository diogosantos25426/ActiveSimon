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
  const countWidth = min(width * 0.18, 220);
  const countHeight = 128;
  const countX = -width / 2 + 26;
  const countY = -height / 2 + 112;
  const cardWidth = min(width * 0.19, 258);
  const cardHeight = min(height * 0.44, 372);
  const cardX = width / 2 - cardWidth - 28;
  const cardY = -height / 2 + 110;
  const iconSize = min(cardWidth - 34, 224);
  const feedbackWidth = min(width * 0.4, 520);
  const feedbackHeight = 92;
  const feedbackX = -feedbackWidth / 2;
  const feedbackY = height / 2 - feedbackHeight - 24;

  push();
  _renderer.GL.disable(_renderer.GL.DEPTH_TEST);
  rectMode(CORNER);

  noStroke();
  fill(4, 10, 18, 42);
  rect(-width / 2, -height / 2, width, height);

  fill(3, 8, 15, 120);
  rect(-width / 2, -height / 2, 160, height);
  rect(width / 2 - 160, -height / 2, 160, height);

  fill(accentColor[0], accentColor[1], accentColor[2], 16);
  rect(countX - 10, countY - 10, countWidth + 20, countHeight + 20, 28);
  rect(cardX - 10, cardY - 10, cardWidth + 20, cardHeight + 20, 28);
  rect(feedbackX - 10, feedbackY - 10, feedbackWidth + 20, feedbackHeight + 20, 999);

  fill(6, 17, 30, 230);
  rect(countX, countY, countWidth, countHeight, 26);
  stroke(accentColor[0], accentColor[1], accentColor[2], 95);
  strokeWeight(1.4);
  noFill();
  rect(countX, countY, countWidth, countHeight, 26);

  noStroke();
  fill(8, 21, 37, 236);
  rect(cardX, cardY, cardWidth, cardHeight, 24);
  stroke(accentColor[0], accentColor[1], accentColor[2], 120);
  strokeWeight(1.5);
  noFill();
  rect(cardX, cardY, cardWidth, cardHeight, 24);

  noStroke();
  fill(235, 244, 255);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(min(width * 0.014, 13));
  text("EXERCICIO ATIVO", cardX + 18, cardY + 16);

  fill(255, 255, 255, 248);
  rect(cardX + 17, cardY + 42, cardWidth - 34, iconSize, 18);
  if (icon) {
    image(icon, cardX + 17, cardY + 42, cardWidth - 34, iconSize);
  }

  fill(accentColor[0], accentColor[1], accentColor[2]);
  textSize(min(width * 0.017, 18));
  textLeading(24);
  text(exerciseLabel || "Exercicio", cardX + 18, cardY + 58 + iconSize, cardWidth - 36, 72);

  noStroke();
  fill(235, 244, 255);
  textAlign(LEFT, TOP);
  textSize(min(width * 0.014, 13));
  textStyle(BOLD);
  text("REPETICOES", countX + 18, countY + 18);
  fill(accentColor[0], accentColor[1], accentColor[2]);
  textAlign(CENTER, CENTER);
  textSize(min(countWidth * 0.34, width * 0.04, 48));
  text(countText || "0 / 0", countX + countWidth / 2, countY + 76);

  fill(7, 20, 33, 235);
  rect(feedbackX, feedbackY, feedbackWidth, feedbackHeight, 999);
  stroke(accentColor[0], accentColor[1], accentColor[2], 80);
  strokeWeight(1.2);
  noFill();
  rect(feedbackX, feedbackY, feedbackWidth, feedbackHeight, 999);

  noStroke();
  fill(255, 209, 102);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(min(width * 0.018, 19));
  text(feedback || "Segue o movimento mostrado.", 0, feedbackY + 34);

  fill(220, 235, 255);
  textStyle(NORMAL);
  textSize(min(width * 0.0135, 14));
  text("Usa FECHAR para voltar ao menu.", 0, feedbackY + 62);

  _renderer.GL.enable(_renderer.GL.DEPTH_TEST);
  pop();
}

function drawGameHud() {
  push();
  _renderer.GL.disable(_renderer.GL.DEPTH_TEST);

  rectMode(CORNER);
  noStroke();

  const headerWidth = min(width * 0.42, 430);
  const headerX = -width / 2 + 26;
  const headerY = -height / 2 + 18;
  fill(6, 18, 31, 226);
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

  _renderer.GL.enable(_renderer.GL.DEPTH_TEST);
  pop();
}

function registerGameImplementation(implementationKey, implementation) {
  if (!implementationKey || !implementation) return;
  gameImplementations[implementationKey] = implementation;
}

function hasGameImplementation(implementationKey) {
  if (!implementationKey) return false;
  return Boolean(gameImplementations[implementationKey]);
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
window.hasGameImplementation = hasGameImplementation;
window.startNewGame = startNewGame;
