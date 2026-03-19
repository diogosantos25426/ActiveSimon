(() => {
window.games2Modules = window.games2Modules || {};

let imgExtensao, imgAbducao, imagemMarcha;
let targetExercises = [
  { id: 0, label: "EXTENSAO DE JOELHO", goalReps: 5, currentReps: 0, color: [255, 100, 100] },
  { id: 1, label: "ABDUCAO DE PERNA", goalReps: 5, currentReps: 0, color: [100, 255, 100] }
];

let currentExIndex = 0;
let exercisePhase = "DOWN";
let feedbackMsg = "PREPARA-TE!";
let backAngle = 0;

function preloadMembrosInferiores() {
  imgExtensao = loadImage("assets/legExten_dir.jpg");
  imgAbducao = loadImage("assets/abducao_perna_direita.png");
  imagemMarcha = loadImage("assets/marcha.png");
}

function drawLowerLimbGame() {
  drawMirrorVideo();

  if (poses && poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    checkGymLogic(pose);
    if (window.shouldDrawGameDebug) drawDebugInfo(pose);
  }

  drawGymInterface();
}

function checkGymLogic(pose) {
  const ex = targetExercises[currentExIndex];
  if (!ex) return;

  const hip = pose.keypoints[24];
  const knee = pose.keypoints[26];
  const ankle = pose.keypoints[28];
  const shoulder = pose.keypoints[12];

  if (knee.confidence > 0.5 && hip.confidence > 0.5 && shoulder.confidence > 0.5) {
    backAngle = abs(degrees(Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)));
    if (backAngle < 75 || backAngle > 105) {
      feedbackMsg = "MANTEM AS COSTAS DIREITAS!";
      return;
    }

    let isUp = false;
    let isDown = false;

    if (ex.label === "EXTENSAO DE JOELHO") {
      isUp = ankle.y < knee.y + 80;
      isDown = ankle.y > knee.y + 150;
    } else if (ex.label === "ABDUCAO DE PERNA") {
      isUp = ankle.x < hip.x - 50;
      isDown = ankle.x > hip.x - 20;
    }

    if (exercisePhase === "DOWN" && isUp) {
      exercisePhase = "UP";
      feedbackMsg = "ISSO! AGORA BAIXA...";
    } else if (exercisePhase === "UP" && isDown) {
      exercisePhase = "DOWN";
      ex.currentReps++;
      feedbackMsg = "BOA! CONTINUA...";

      if (ex.currentReps >= ex.goalReps) {
        currentExIndex++;
        if (currentExIndex >= targetExercises.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterface() {
  const ex = targetExercises[currentExIndex];
  if (!ex) return;

  const icon = ex.label === "EXTENSAO DE JOELHO" ? imgExtensao : (ex.label === "ABDUCAO DE PERNA" ? imgAbducao : imagemMarcha);
  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackMsg,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugInfo(pose) {
  const hip = pose.keypoints[24];
  const knee = pose.keypoints[26];
  const ankle = pose.keypoints[28];

  push();
  resetMatrix();
  translate(20, 20);
  fill(0, 200);
  rect(0, 0, 250, 100);
  fill(0, 255, 0);
  textSize(12);
  text("DEBUG MODE:", 10, 20);
  text("Costas: " + nf(backAngle, 1, 1) + " graus", 10, 40);
  text("Posicao: " + exercisePhase, 10, 60);
  text("Ankle Y relativo ao Knee: " + nf(ankle.y - knee.y, 1, 1), 10, 80);
  stroke(255, 255, 0);
  line(map(hip.x, 0, 640, 0, width), map(hip.y, 0, 480, 0, height), map(pose.keypoints[12].x, 0, 640, 0, width), map(pose.keypoints[12].y, 0, 480, 0, height));
  pop();
}

function resetModule() {
  currentExIndex = 0;
  exercisePhase = "DOWN";
  feedbackMsg = "PREPARA-TE!";
  backAngle = 0;
  targetExercises.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}

window.games2Modules.lowerRight = {
  preload: preloadMembrosInferiores,
  draw: drawLowerLimbGame,
  reset: resetModule
};
})();
