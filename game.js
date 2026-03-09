let targets = [
  { id: 0, x: -0.5, y: -0.3, z: 0, color: [255, 0, 0] },
  { id: 1, x: 0.5, y: -0.3, z: 0, color: [0, 0, 255] },
  { id: 2, x: -0.5, y: 0.3, z: 0, color: [0, 255, 0] },
  { id: 3, x: 0.5, y: 0.3, z: 0, color: [255, 255, 0] }
];

let sequence = [];
let playerSequence = [];
let step = 0;
let lastStepTime = 0;
let activeTargetID = -1;

// Variáveis de Configuração
let gameDifficulty = 1; // 1: Fácil, 2: Médio, 3: Difícil
let gameVolume = 0.5;

function startNewGame() {
  score = 0;
  sequence = [];
  nextLevel();
}

function nextLevel() {
  sequence.push(floor(random(4)));
  playerSequence = [];
  step = 0;
  state = "SHOWING";
  lastStepTime = millis();
}

function playSequence() {
  // A velocidade base depende da dificuldade escolhida
  let baseSpeed = gameDifficulty === 1 ? 1200 : gameDifficulty === 2 ? 800 : 500;
  let speed = baseSpeed - (sequence.length * 20); 
  speed = max(speed, 300);

  if (millis() - lastStepTime > speed) {
    if (step < sequence.length) {
      activeTargetID = sequence[step];
      step++;
      lastStepTime = millis();
    } else {
      activeTargetID = -1;
      state = "PLAYER";
      playerSequence = [];
    }
  }
}

function checkCollision(pose) {
  let wrists = [pose.keypoints3D[15], pose.keypoints3D[16]];
  for (let w of wrists) {
    if (w.confidence > 0.6) {
      for (let t of targets) {
        let d = dist(-w.x, w.y, w.z, t.x, t.y, t.z);
        if (d < 0.18) { 
          handleInput(t.id);
        }
      }
    }
  }
}

function handleInput(id) {
  if (activeTargetID === id) return;
  activeTargetID = id;
  
  // Aqui poderias tocar o som usando gameVolume: somCubo.setVolume(gameVolume);
  
  if (id === sequence[playerSequence.length]) {
    playerSequence.push(id);
    if (playerSequence.length === sequence.length) {
      score++;
      setTimeout(nextLevel, 600);
    }
  } else {
    state = "GAMEOVER";
  }
}