(() => {
window.games2Modules = window.games2Modules || {};

let imgBicepsEsq, imgTricepsEsq, imgPentearEsq;
let targetExercisesSupEsq = [
  { id: 0, label: "BICEPS ESQ (CURL)", goalReps: 10, currentReps: 0, color: [150, 200, 255] },
  { id: 1, label: "TRICEPS ESQ (PRESS)", goalReps: 10, currentReps: 0, color: [255, 150, 150] },
  { id: 2, label: "PENTEAR (ESQ)", goalReps: 5, currentReps: 0, color: [200, 255, 150] }
];

let currentExIndexSupEsq = 0;
let exercisePhaseSupEsq = "DOWN";
let feedbackMsgSupEsq = "BRACO ESQUERDO PRONTO?";

function preloadMembrosSuperioresEsq() {
  imgBicepsEsq = loadImage("assets/bicep_curl.png");
  imgTricepsEsq = loadImage("assets/bicep_curl.png");
  imgPentearEsq = loadImage("assets/alongamentoVertical.png");
}

function drawUpperLimbGameEsq() {
  drawMirrorVideo();

  if (poses && poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    checkSupEsqLogic(pose);
    if (window.shouldDrawGameDebug) drawDebugSupEsq(pose);
  }

  drawGymInterfaceSupEsq();
}

function checkSupEsqLogic(pose) {
  const ex = targetExercisesSupEsq[currentExIndexSupEsq];
  if (!ex) return;

  const sL = pose.keypoints[11];
  const eL = pose.keypoints[13];
  const wL = pose.keypoints[15];
  const earL = pose.keypoints[7];

  if (sL.confidence > 0.5 && eL.confidence > 0.5 && wL.confidence > 0.5) {
    let isUp = false;
    let isDown = false;

    if (ex.label === "BICEPS ESQ (CURL)") {
      isUp = (wL.y < eL.y - 50);
      isDown = (wL.y > eL.y + 50);
    } else if (ex.label === "TRICEPS ESQ (PRESS)") {
      isUp = (dist(wL.x, wL.y, sL.x, sL.y) < 80);
      isDown = (wL.y > eL.y + 100);
    } else if (ex.label === "PENTEAR (ESQ)") {
      const d = dist(wL.x, wL.y, earL.x, earL.y);
      isUp = (d < 70);
      isDown = (wL.y > sL.y + 50);
    }

    if (exercisePhaseSupEsq === "DOWN" && isUp) {
      exercisePhaseSupEsq = "UP";
      feedbackMsgSupEsq = "ISSO! SOBE MAIS UM POUCO.";
    } else if (exercisePhaseSupEsq === "UP" && isDown) {
      exercisePhaseSupEsq = "DOWN";
      ex.currentReps++;
      if (window.playRepSuccessSound) window.playRepSuccessSound();
      feedbackMsgSupEsq = "BOA! CONTINUA ASSIM.";

      if (ex.currentReps >= ex.goalReps) {
        currentExIndexSupEsq++;
        if (currentExIndexSupEsq >= targetExercisesSupEsq.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterfaceSupEsq() {
  const ex = targetExercisesSupEsq[currentExIndexSupEsq];
  if (!ex) return;

  let icon;
  if (ex.id === 0) icon = imgBicepsEsq;
  else if (ex.id === 1) icon = imgTricepsEsq;
  else icon = imgPentearEsq;

  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackMsgSupEsq,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugSupEsq(pose) {
  push();
  resetMatrix();
  translate(width - 320, height - 100);
  fill(0, 180);
  rect(0, 0, 300, 80, 10);
  fill(255, 150, 150);
  textSize(12);
  const wL = pose.keypoints[15];
  const eL = pose.keypoints[13];
  text("DEBUG BRACO ESQ:", 15, 25);
  text("Diferenca Y (Pulso-Cotovelo): " + nf(wL.y - eL.y, 1, 1), 15, 45);
  text("Fase: " + exercisePhaseSupEsq, 15, 65);
  pop();
}

function resetModule() {
  currentExIndexSupEsq = 0;
  exercisePhaseSupEsq = "DOWN";
  feedbackMsgSupEsq = "BRACO ESQUERDO PRONTO?";
  targetExercisesSupEsq.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}

window.games2Modules.upperLeft = {
  preload: preloadMembrosSuperioresEsq,
  draw: drawUpperLimbGameEsq,
  reset: resetModule
};
})();
