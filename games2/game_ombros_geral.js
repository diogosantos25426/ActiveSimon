(() => {
window.games2Modules = window.games2Modules || {};

let imgShrugs, imgVitoria;
let targetExercisesOmbrosGeral = [
  { id: 0, label: "ENCOLHIMENTO (SHRUGS)", goalReps: 10, currentReps: 0, color: [200, 200, 255] },
  { id: 1, label: "V DE VITORIA", goalReps: 5, currentReps: 0, color: [255, 255, 150] }
];

let currentExIndexGeral = 0;
let exercisePhaseGeral = "DOWN";
let feedbackMsgGeral = "VAMOS TRABALHAR OS OMBROS!";

function preloadOmbrosGeral() {
  imgShrugs = loadImage("assets/agachamentoparcoalcomapoio.jpg");
  imgVitoria = loadImage("assets/alongamentoVertical.png");
}

function drawOmbrosGeralGame() {
  drawMirrorVideo();

  if (poses && poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    checkOmbrosGeralLogic(pose);
    if (window.shouldDrawGameDebug) drawDebugGeral(pose);
  }

  drawGymInterfaceGeral();
}

function checkOmbrosGeralLogic(pose) {
  const ex = targetExercisesOmbrosGeral[currentExIndexGeral];
  if (!ex) return;

  const sR = pose.keypoints[12];
  const sL = pose.keypoints[11];
  const eR = pose.keypoints[8];
  const eL = pose.keypoints[7];
  const wR = pose.keypoints[16];
  const wL = pose.keypoints[15];

  if (sR.confidence > 0.5 && sL.confidence > 0.5) {
    let isUp = false;
    let isDown = false;

    if (ex.label === "ENCOLHIMENTO (SHRUGS)") {
      const distR = dist(sR.x, sR.y, eR.x, eR.y);
      const distL = dist(sL.x, sL.y, eL.x, eL.y);
      const avgDist = (distR + distL) / 2;
      isUp = avgDist < 55;
      isDown = avgDist > 85;
    } else if (ex.label === "V DE VITORIA") {
      const armsUp = (wR.y < sR.y - 50 && wL.y < sL.y - 50);
      const armsWide = (abs(wR.x - wL.x) > abs(sR.x - sL.x) * 1.5);
      isUp = armsUp && armsWide;
      isDown = (wR.y > sR.y + 50 && wL.y > sL.y + 50);
    }

    if (exercisePhaseGeral === "DOWN" && isUp) {
      exercisePhaseGeral = "UP";
      feedbackMsgGeral = "ISSO! AGORA RELAXA.";
    } else if (exercisePhaseGeral === "UP" && isDown) {
      exercisePhaseGeral = "DOWN";
      ex.currentReps++;
      feedbackMsgGeral = "BOA POSTURA! CONTINUA.";

      if (ex.currentReps >= ex.goalReps) {
        currentExIndexGeral++;
        if (currentExIndexGeral >= targetExercisesOmbrosGeral.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterfaceGeral() {
  const ex = targetExercisesOmbrosGeral[currentExIndexGeral];
  if (!ex) return;

  const icon = ex.id === 0 ? imgShrugs : imgVitoria;
  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackMsgGeral,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugGeral(pose) {
  push();
  resetMatrix();
  translate(20, height - 100);
  fill(0, 180);
  rect(0, 0, 320, 80, 10);
  fill(255);
  textSize(12);
  text("DEBUG GERAL OMBROS:", 15, 25);
  const distR = dist(pose.keypoints[12].x, pose.keypoints[12].y, pose.keypoints[8].x, pose.keypoints[8].y);
  text("Distancia Ombro-Orelha: " + nf(distR, 1, 1), 15, 45);
  text("Fase: " + exercisePhaseGeral, 15, 65);
  pop();
}

function resetModule() {
  currentExIndexGeral = 0;
  exercisePhaseGeral = "DOWN";
  feedbackMsgGeral = "VAMOS TRABALHAR OS OMBROS!";
  targetExercisesOmbrosGeral.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}

window.games2Modules.shoulderGeneral = {
  preload: preloadOmbrosGeral,
  draw: drawOmbrosGeralGame,
  reset: resetModule
};
})();
