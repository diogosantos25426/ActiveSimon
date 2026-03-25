(() => {
window.games2Modules = window.games2Modules || {};

let imgExtensaoEsq, imgAbducaoEsq, imgMarchaEsq;
let targetExercisesEsq = [
  { id: 0, label: "EXTENSAO DE JOELHO", goalReps: 5, currentReps: 0, color: [255, 120, 120] },
  { id: 1, label: "ABDUCAO DE PERNA", goalReps: 5, currentReps: 0, color: [120, 255, 180] }
];

let currentExIndexEsq = 0;
let exercisePhaseEsq = "DOWN";
let feedbackMsgEsq = "PREPARA A PERNA ESQUERDA!";

function preloadMembrosInferioresEsq() {
  imgExtensaoEsq = loadImage("assets/legExten_esq.jpg");
  imgAbducaoEsq = loadImage("assets/abducao_perna_esquerda.png");
  imgMarchaEsq = loadImage("assets/marcha.png");
}

function drawLowerLimbGameEsq() {
  drawMirrorVideo();

  if (poses && poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    checkGymLogicEsq(pose);
    if (window.shouldDrawGameDebug) drawDebugInfoEsq(pose);
  }

  drawGymInterfaceEsq();
}

function checkGymLogicEsq(pose) {
  const ex = targetExercisesEsq[currentExIndexEsq];
  if (!ex) return;

  const hip = pose.keypoints[23];
  const knee = pose.keypoints[25];
  const ankle = pose.keypoints[27];

  if (knee.confidence > 0.5 && hip.confidence > 0.5) {
    let isUp = false;
    let isDown = false;

    if (ex.label === "EXTENSAO DE JOELHO") {
      isUp = ankle.y < knee.y + 80;
      isDown = ankle.y > knee.y + 150;
    } else if (ex.label === "ABDUCAO DE PERNA") {
      isUp = ankle.x > hip.x + 50;
      isDown = ankle.x < hip.x + 20;
    }

    if (exercisePhaseEsq === "DOWN" && isUp) {
      exercisePhaseEsq = "UP";
      feedbackMsgEsq = "ISSO! AGORA BAIXA...";
    } else if (exercisePhaseEsq === "UP" && isDown) {
      exercisePhaseEsq = "DOWN";
      ex.currentReps++;
      if (window.playRepSuccessSound) window.playRepSuccessSound();
      feedbackMsgEsq = "BOA! CONTINUA...";

      if (ex.currentReps >= ex.goalReps) {
        currentExIndexEsq++;
        if (currentExIndexEsq >= targetExercisesEsq.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterfaceEsq() {
  const ex = targetExercisesEsq[currentExIndexEsq];
  if (!ex) return;

  const icon = ex.label === "EXTENSAO DE JOELHO" ? imgExtensaoEsq : (ex.label === "ABDUCAO DE PERNA" ? imgAbducaoEsq : imgMarchaEsq);
  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackMsgEsq,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugInfoEsq(pose) {
  push();
  resetMatrix();
  translate(width - 300, 20);
  fill(0, 180);
  rect(0, 0, 280, 80, 10);
  fill(255);
  textSize(12);
  text("DEBUG PERNA ESQ:", 15, 25);
  text("Fase: " + exercisePhaseEsq, 15, 45);
  text("Anca-Pulso X: " + nf(pose.keypoints[27].x - pose.keypoints[23].x, 1, 1), 15, 65);
  pop();
}

function resetModule() {
  currentExIndexEsq = 0;
  exercisePhaseEsq = "DOWN";
  feedbackMsgEsq = "PREPARA A PERNA ESQUERDA!";
  targetExercisesEsq.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}

window.games2Modules.lowerLeft = {
  preload: preloadMembrosInferioresEsq,
  draw: drawLowerLimbGameEsq,
  reset: resetModule
};
})();
