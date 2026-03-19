let activeGameSession = null;
let targets = [];
const gameImplementations = {};

let sequence = [];
let playerSequence = [];
let step = 0;
let lastStepTime = 0;
let activeTargetID = -1;
let score = 0;
let lastInputID = -1;

let basket = { x: 0, y: 0.7, w: 0.8, h: 0.4 };
let carriedTargetID = -1;
let handX = 0, handY = 0;

let handPath = [];
let maxPathLength = 20;

function buildFallbackGameSession() {
  return window.buildGameSessionConfig
    ? window.buildGameSessionConfig("simon_memory_right_hand", "medium")
    : {
        gameCode: "simon_memory_right_hand",
        gameName: "Simon Memoria - Mao Direita",
        implementationKey: "simon_memory",
        difficultyKey: "medium",
        difficultyLabel: "Medio",
        controllerKeypoint: 16,
        initialSequenceLength: 3,
        showStepBaseMs: 980,
        showStepDecayMs: 45,
        showStepFloorMs: 430,
        grabRadius: 0.25,
        maxPathLength: 20,
        roundAdvanceDelayMs: 800,
        targets: [
          { id: 0, x: -0.5, y: -0.3, z: 0, color: [255, 0, 0] },
          { id: 1, x: 0.5, y: -0.3, z: 0, color: [0, 0, 255] },
          { id: 2, x: -0.5, y: 0.3, z: 0, color: [0, 255, 0] },
          { id: 3, x: 0.5, y: 0.3, z: 0, color: [255, 255, 0] }
        ],
        basket: { x: 0, y: 0.7, w: 0.8, h: 0.4 },
        inputArea: { minX: -0.6, maxX: 0.6, minY: -0.4, maxY: 0.8 }
      };
}

function applyGameSession(gameCode, difficultyKey) {
  activeGameSession = window.buildGameSessionConfig
    ? window.buildGameSessionConfig(gameCode, difficultyKey)
    : buildFallbackGameSession();

  if (!activeGameSession || activeGameSession.implementationKey !== "simon_memory") {
    activeGameSession = buildFallbackGameSession();
  }

  targets = activeGameSession.targets.map((target) => ({ ...target }));
  basket = { ...activeGameSession.basket };
  maxPathLength = activeGameSession.maxPathLength;
  return activeGameSession;
}

function registerGameImplementation(implementationKey, implementation) {
  if (!implementationKey || !implementation) return;
  gameImplementations[implementationKey] = implementation;
}

function getActiveImplementation() {
  if (!activeGameSession?.implementationKey) return null;
  return gameImplementations[activeGameSession.implementationKey] || null;
}

function gameLoop() {
  const implementation = getActiveImplementation();
  if (implementation?.gameLoop) {
    implementation.gameLoop(activeGameSession);
    return;
  }

  push();
  translate(0, 0, -200);
  scale(-1, 1);
  _renderer.GL.disable(_renderer.GL.DEPTH_TEST);
  image(video, -width / 2, -height / 2, width, height);
  _renderer.GL.enable(_renderer.GL.DEPTH_TEST);
  pop();

  if (state === "SHOWING") playSequence();

  if (poses && poses.length > 0) {
    let pose = poses[0];
    drawSkeleton(pose);
    drawHandTrace(pose);
    if (state === "PLAYER") checkCollision(pose);
  }

  push();
  let s = min(width, height) * 0.4;
  scale(s);

  push();
  noFill();
  stroke(255, 200, 0);
  strokeWeight(0.02);
  rectMode(CENTER);
  rect(basket.x, basket.y, basket.w, basket.h, 0.1);
  fill(255, 100);
  noStroke();
  textSize(0.1);
  textAlign(CENTER);
  text("DEPOSITE AQUI", basket.x, basket.y + 0.05);
  pop();

  for (let t of targets) {
    push();
    let dx = (t.id === carriedTargetID) ? handX : t.x;
    let dy = (t.id === carriedTargetID) ? handY : t.y;
    translate(dx, dy, 0);

    let isNextCorrect = (state === "PLAYER" && sequence[playerSequence.length] === t.id);
    let isLit = (activeTargetID === t.id || carriedTargetID === t.id || isNextCorrect);

    noFill();
    stroke(255, 50);
    ellipse(0, 0, 0.3);

    fill(t.color[0], t.color[1], t.color[2], isLit ? 255 : 80);
    if (isLit) {
      stroke(255);
      strokeWeight(0.02);
    } else {
      noStroke();
    }
    box(0.15);
    pop();
  }
  pop();

  drawScore();
}

function drawHandTrace(pose) {
  const keypointIndex = activeGameSession?.controllerKeypoint ?? 16;
  let h = pose.keypoints[keypointIndex];
  if (h && h.confidence > 0.5) {
    let x = map(h.x, 0, 640, width / 2, -width / 2);
    let y = map(h.y, 0, 480, -height / 2, height / 2);

    handPath.push({ x: x, y: y });
    if (handPath.length > maxPathLength) handPath.shift();
  }

  push();
  translate(0, 0, -180);
  noFill();
  stroke(255, 200);
  strokeWeight(8);
  beginShape();
  for (let p of handPath) {
    vertex(p.x, p.y);
  }
  endShape();
  pop();
}

function drawSkeleton(pose) {
  push();
  translate(0, 0, -190);
  scale(-1, 1);

  stroke(0, 255, 0);
  strokeWeight(5);

  if (pose.keypoints && connections) {
    for (let i = 0; i < connections.length; i++) {
      let a = pose.keypoints[connections[i][0]];
      let b = pose.keypoints[connections[i][1]];

      if (a && b && a.confidence > 0.1 && b.confidence > 0.1) {
        let x1 = map(a.x, 0, 640, -width / 2, width / 2);
        let y1 = map(a.y, 0, 480, -height / 2, height / 2);
        let x2 = map(b.x, 0, 640, -width / 2, width / 2);
        let y2 = map(b.y, 0, 480, -height / 2, height / 2);

        let idxA = connections[i][0];
        let offsetXA = 0, offsetYA = 0;
        if (idxA === 5) { offsetXA = -15; offsetYA = -15; }
        else if (idxA === 6) { offsetXA = 15; offsetYA = -15; }
        else if (idxA === 7) { offsetYA = -15; }
        else if (idxA === 8) { offsetYA = -15; }
        x1 += offsetXA;
        y1 += offsetYA;

        let idxB = connections[i][1];
        let offsetXB = 0, offsetYB = 0;
        if (idxB === 5) { offsetXB = -15; offsetYB = -15; }
        else if (idxB === 6) { offsetXB = 15; offsetYB = -15; }
        else if (idxB === 7) { offsetYB = -15; }
        else if (idxB === 8) { offsetYB = -15; }
        x2 += offsetXB;
        y2 += offsetYB;

        line(x1, y1, 0, x2, y2, 0);
      }
    }

    fill(255, 0, 0);
    noStroke();
    for (let kp of pose.keypoints) {
      if (kp.confidence > 0.1) {
        let x = map(kp.x, 0, 640, -width / 2, width / 2);
        let y = map(kp.y, 0, 480, -height / 2, height / 2);

        let idx = pose.keypoints.indexOf(kp);
        let offsetX = 0, offsetY = 0;
        if (idx === 5) { offsetX = -15; offsetY = -15; }
        else if (idx === 6) { offsetX = 15; offsetY = -15; }
        else if (idx === 7) { offsetY = -15; }
        else if (idx === 8) { offsetY = -15; }
        x += offsetX;
        y += offsetY;

        ellipse(x, y, 10, 10);
      }
    }
  }
  pop();
}

function drawScore() {
  push();
  translate(0, -height / 2 + 40, 50);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(28);
  text("PONTOS: " + score, 0, 0);
  if (activeGameSession) {
    textSize(14);
    fill(119, 242, 197);
    text(`${activeGameSession.gameName} | ${activeGameSession.difficultyLabel}`, 0, 24);
  }
  pop();
}

function startNewGame(gameCode = "simon_memory_right_hand", difficultyKey = "medium") {
  applyGameSession(gameCode, difficultyKey);
  score = 0;
  state = "PLAYER";
  sequence = [];
  for (let i = 0; i < Math.max(0, (activeGameSession?.initialSequenceLength || 1) - 1); i++) {
    sequence.push(floor(random(targets.length)));
  }
  nextLevel();
  carriedTargetID = -1;
  handX = handY = 0;
  handPath = [];
}

function nextLevel() {
  sequence.push(floor(random(targets.length)));

  playerSequence = [];
  step = 0;
  lastInputID = -1;
  activeTargetID = -1;
  carriedTargetID = -1;

  state = "SHOWING";
  lastStepTime = millis();
}

function playSequence() {
  let speed = max(
    (activeGameSession?.showStepBaseMs || 1000) - (sequence.length * (activeGameSession?.showStepDecayMs || 50)),
    activeGameSession?.showStepFloorMs || 400
  );
  if (millis() - lastStepTime > speed) {
    if (step < sequence.length) {
      if (activeTargetID === -1) {
        activeTargetID = sequence[step];
      } else {
        activeTargetID = -1;
        step++;
      }
      lastStepTime = millis();
    } else {
      activeTargetID = -1;
      state = "PLAYER";
    }
  }
}

function checkCollision(pose) {
  if (!pose.keypoints) return;

  let h = pose.keypoints[activeGameSession?.controllerKeypoint ?? 16];
  if (h && h.confidence > 0.5) {
    const inputArea = activeGameSession?.inputArea || { minX: -0.6, maxX: 0.6, minY: -0.4, maxY: 0.8 };
    let nx = map(h.x, 0, 640, inputArea.maxX, inputArea.minX);
    let ny = map(h.y, 0, 480, inputArea.minY, inputArea.maxY);

    handX = nx;
    handY = ny;

    if (carriedTargetID === -1) {
      if (sequence.length > 0 && playerSequence.length < sequence.length) {
        let targetNecessarioID = sequence[playerSequence.length];

        for (let t of targets) {
          if (t.id === targetNecessarioID) {
            let d = dist(nx, ny, t.x, t.y);
            if (d < (activeGameSession?.grabRadius || 0.25)) {
              carriedTargetID = t.id;
              break;
            }
          }
        }
      }
    } else {
      let inBasketX = (nx > basket.x - basket.w / 2 && nx < basket.x + basket.w / 2);
      let inBasketY = (ny > basket.y - basket.h / 2 && ny < basket.y + basket.h / 2);

      if (inBasketX && inBasketY) {
        handleInput(carriedTargetID);
        carriedTargetID = -1;
      }
    }
  }
}

function handleInput(id) {
  let expectedID = sequence[playerSequence.length];

  if (id === expectedID) {
    playerSequence.push(id);

    if (playerSequence.length === sequence.length) {
      score++;
      state = "WAITING";
      setTimeout(nextLevel, activeGameSession?.roundAdvanceDelayMs || 800);
    } else {
      console.log("Acertou no cubo! Faltam: " + (sequence.length - playerSequence.length));
    }
  } else {
    state = "GAMEOVER";
  }

  lastInputID = -1;
}

function drawGameOver() {
  const implementation = getActiveImplementation();
  if (implementation?.drawGameOver) {
    implementation.drawGameOver(activeGameSession, { score });
    return;
  }

  push();
  translate(0, 0, 10);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("FIM DE JOGO", 0, -50);
  fill(255);
  textSize(20);
  text("Pontos: " + score, 0, 10);
  text("Clica para voltar", 0, 60);
  pop();
}

applyGameSession("simon_memory_right_hand", "medium");
window.registerGameImplementation = registerGameImplementation;
window.startNewGame = startNewGame;
