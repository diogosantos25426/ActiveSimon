(() => {
window.games2Modules = window.games2Modules || {};

let imgAgachamento, imgMarchaGeral;
let targetExercisesGeral = [
  { id: 0, label: "AGACHAMENTO", goalReps: 8, currentReps: 0, color: [255, 220, 120] },
  { id: 1, label: "MARCHA ESTATICA", goalReps: 10, currentReps: 0, color: [120, 220, 255] }
];

let currentExIndexGeral = 0;
let exercisePhaseGeral = "DOWN";
let feedbackMsgGeral = "PREPARA AS DUAS PERNAS!";

function preloadMembrosInferioresGeral() {
  imgAgachamento = loadImage("assets/agachamentoparcoalcomapoio.jpg");
  imgMarchaGeral = loadImage("assets/marcha.png");
}

function drawLowerLimbGameGeral() {
  drawMirrorVideo();

  if (poses && poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    checkGymLogicGeral(pose);
    if (window.shouldDrawGameDebug) drawDebugInfoGeral(pose);
  }

  drawGymInterfaceGeral();
}

function checkGymLogicGeral(pose) {
  const ex = targetExercisesGeral[currentExIndexGeral];
  if (!ex) return;

  const hipL = pose.keypoints[23];
  const hipR = pose.keypoints[24];
  const kneeL = pose.keypoints[25];
  const kneeR = pose.keypoints[26];

  if (hipL.confidence > 0.5 && hipR.confidence > 0.5 && kneeL.confidence > 0.5 && kneeR.confidence > 0.5) {
    let isUp = false;
    let isDown = false;

    if (ex.label === "AGACHAMENTO") {
      const avgKneeY = (kneeL.y + kneeR.y) / 2;
      const avgHipY = (hipL.y + hipR.y) / 2;
      isUp = avgHipY > avgKneeY - 40;
      isDown = avgHipY < avgKneeY - 90;
    } else if (ex.label === "MARCHA ESTATICA") {
      isUp = (kneeL.y < hipL.y + 60 || kneeR.y < hipR.y + 60);
      isDown = (kneeL.y > hipL.y + 120 && kneeR.y > hipR.y + 120);
    }

    if (exercisePhaseGeral === "DOWN" && isUp) {
      exercisePhaseGeral = "UP";
      feedbackMsgGeral = "BOA! AGORA DESCE.";
    } else if (exercisePhaseGeral === "UP" && isDown) {
      exercisePhaseGeral = "DOWN";
      ex.currentReps++;
      if (window.playRepSuccessSound) window.playRepSuccessSound();
      feedbackMsgGeral = "MUITO BEM! CONTINUA.";

      if (ex.currentReps >= ex.goalReps) {
        currentExIndexGeral++;
        if (currentExIndexGeral >= targetExercisesGeral.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterfaceGeral() {
  const ex = targetExercisesGeral[currentExIndexGeral];
  if (!ex) return;

  const icon = ex.label === "AGACHAMENTO" ? imgAgachamento : imgMarchaGeral;
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

function drawDebugInfoGeral(pose) {
  push();
  resetMatrix();
  translate(width - 320, 20);
  fill(0, 180);
  rect(0, 0, 300, 80, 10);
  fill(255);
  textSize(12);
  text("DEBUG MEMBROS INFERIORES:", 15, 25);
  text("Fase: " + exercisePhaseGeral, 15, 45);
  text("Knees Y: " + nf((pose.keypoints[25].y + pose.keypoints[26].y) / 2, 1, 1), 15, 65);
  pop();
}

function resetModule() {
  currentExIndexGeral = 0;
  exercisePhaseGeral = "DOWN";
  feedbackMsgGeral = "PREPARA AS DUAS PERNAS!";
  targetExercisesGeral.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}

window.games2Modules.lowerGeneral = {
  preload: preloadMembrosInferioresGeral,
  draw: drawLowerLimbGameGeral,
  reset: resetModule
};
})();
