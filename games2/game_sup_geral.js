(() => {
window.games2Modules = window.games2Modules || {};

let imgMaosCeu, imgBicepsDuo, imgVooDuplo;
let targetExercisesSupGeral = [
  { id: 0, label: "MAOS AO CEU (OMBRO)", goalReps: 8, currentReps: 0, color: [255, 255, 100] },
  { id: 1, label: "BICEPS DUPLO", goalReps: 10, currentReps: 0, color: [100, 255, 100] },
  { id: 2, label: "VOO LATERAL DUPLO", goalReps: 8, currentReps: 0, color: [100, 200, 255] }
];

let currentExIndexSupG = 0;
let phaseSupG = "DOWN";
let feedbackSupG = "VAMOS TRABALHAR TUDO!";

function preloadMembrosSuperioresGeral() {
  imgMaosCeu = loadImage("assets/alongamentoVertical.png");
  imgBicepsDuo = loadImage("assets/bicep_curl.png");
  imgVooDuplo = loadImage("assets/alongamentoVertical.png");
}

function drawUpperLimbGameGeral() {
  drawMirrorVideo();

  if (poses && poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    checkSupGeralLogic(pose);
    if (window.shouldDrawGameDebug) drawDebugSupGeral(pose);
  }

  drawGymInterfaceSupGeral();
}

function checkSupGeralLogic(pose) {
  const ex = targetExercisesSupGeral[currentExIndexSupG];
  if (!ex) return;

  const sL = pose.keypoints[11];
  const sR = pose.keypoints[12];
  const eL = pose.keypoints[13];
  const eR = pose.keypoints[14];
  const wL = pose.keypoints[15];
  const wR = pose.keypoints[16];

  if (sL.confidence > 0.5 && sR.confidence > 0.5 && wL.confidence > 0.5 && wR.confidence > 0.5) {
    let isUp = false;
    let isDown = false;

    if (ex.label === "MAOS AO CEU (OMBRO)") {
      isUp = (wL.y < sL.y - 100 && wR.y < sR.y - 100);
      isDown = (wL.y > sL.y && wR.y > sR.y);
    } else if (ex.label === "BICEPS DUPLO") {
      isUp = (wL.y < eL.y - 40 && wR.y < eR.y - 40);
      isDown = (wL.y > eL.y + 40 && wR.y > eR.y + 40);
    } else if (ex.label === "VOO LATERAL DUPLO") {
      isUp = (wL.y < sL.y + 30 && wL.y > sL.y - 60 && wR.y < sR.y + 30 && wR.y > sR.y - 60);
      isDown = (wL.y > sL.y + 120 && wR.y > sR.y + 120);
    }

    if (phaseSupG === "DOWN" && isUp) {
      phaseSupG = "UP";
      feedbackSupG = "BOA! AGORA BAIXA OS DOIS.";
    } else if (phaseSupG === "UP" && isDown) {
      phaseSupG = "DOWN";
      ex.currentReps++;
      if (window.playRepSuccessSound) window.playRepSuccessSound();
      feedbackSupG = "EXCELENTE COORDENACAO!";

      if (ex.currentReps >= ex.goalReps) {
        currentExIndexSupG++;
        if (currentExIndexSupG >= targetExercisesSupGeral.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterfaceSupGeral() {
  const ex = targetExercisesSupGeral[currentExIndexSupG];
  if (!ex) return;

  const icon = ex.id === 0 ? imgMaosCeu : (ex.id === 1 ? imgBicepsDuo : imgVooDuplo);
  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackSupG,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugSupGeral(pose) {
  push();
  resetMatrix();
  translate(width / 2 - 150, height - 100);
  fill(0, 200);
  rect(0, 0, 300, 80, 10);
  fill(0, 255, 200);
  textSize(12);
  text("CONTROLO BILATERAL ATIVO", 15, 25);
  text("Sincronia Y: " + nf(abs(pose.keypoints[15].y - pose.keypoints[16].y), 1, 1), 15, 45);
  text("Estado: " + phaseSupG, 15, 65);
  pop();
}

function resetModule() {
  currentExIndexSupG = 0;
  phaseSupG = "DOWN";
  feedbackSupG = "VAMOS TRABALHAR TUDO!";
  targetExercisesSupGeral.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}

window.games2Modules.upperGeneral = {
  preload: preloadMembrosSuperioresGeral,
  draw: drawUpperLimbGameGeral,
  reset: resetModule
};
})();
