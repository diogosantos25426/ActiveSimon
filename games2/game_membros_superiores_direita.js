(() => {
window.games2Modules = window.games2Modules || {};

let imgBicepsDir, imgTricepsDir, imgPentearDir;
let targetExercisesSupDir = [
  { id: 0, label: "BICEPS (CURL)", goalReps: 10, currentReps: 0, color: [100, 200, 255] },
  { id: 1, label: "TRICEPS (PRESS)", goalReps: 10, currentReps: 0, color: [255, 100, 150] },
  { id: 2, label: "PENTEAR O CABELO", goalReps: 5, currentReps: 0, color: [200, 255, 100] }
];

let currentExIndexSup = 0;
let exercisePhaseSup = "DOWN";
let feedbackMsgSup = "VAMOS FORTALECER O BRACO!";

function preloadMembrosSuperioresDir() {
  imgBicepsDir = loadImage("assets/bicep_curl.png");
  imgTricepsDir = loadImage("assets/bicep_curl.png");
  imgPentearDir = loadImage("assets/alongamentoVertical.png");
}

function drawUpperLimbGameDir() {
  drawMirrorVideo();

  if (poses && poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    checkSupDirLogic(pose);
    if (window.shouldDrawGameDebug) drawDebugSup(pose);
  }

  drawGymInterfaceSup();
}

function checkSupDirLogic(pose) {
  const ex = targetExercisesSupDir[currentExIndexSup];
  if (!ex) return;

  const sR = pose.keypoints[12];
  const eR = pose.keypoints[14];
  const wR = pose.keypoints[16];
  const earR = pose.keypoints[8];

  if (sR.confidence > 0.5 && eR.confidence > 0.5 && wR.confidence > 0.5) {
    let isUp = false;
    let isDown = false;

    if (ex.label === "BICEPS (CURL)") {
      isUp = (wR.y < eR.y - 50);
      isDown = (wR.y > eR.y + 50);
    } else if (ex.label === "TRICEPS (PRESS)") {
      isUp = (dist(wR.x, wR.y, sR.x, sR.y) < 80);
      isDown = (wR.y > eR.y + 100);
    } else if (ex.label === "PENTEAR O CABELO") {
      isUp = (dist(wR.x, wR.y, earR.x, earR.y) < 70);
      isDown = (wR.y > sR.y + 50);
    }

    if (exercisePhaseSup === "DOWN" && isUp) {
      exercisePhaseSup = "UP";
      feedbackMsgSup = "ISSO! COMPLETA O MOVIMENTO.";
    } else if (exercisePhaseSup === "UP" && isDown) {
      exercisePhaseSup = "DOWN";
      ex.currentReps++;
      feedbackMsgSup = "MUITO BEM! MAIS UMA.";

      if (ex.currentReps >= ex.goalReps) {
        currentExIndexSup++;
        if (currentExIndexSup >= targetExercisesSupDir.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterfaceSup() {
  const ex = targetExercisesSupDir[currentExIndexSup];
  if (!ex) return;

  let icon;
  if (ex.id === 0) icon = imgBicepsDir;
  else if (ex.id === 1) icon = imgTricepsDir;
  else icon = imgPentearDir;

  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackMsgSup,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugSup(pose) {
  push();
  resetMatrix();
  translate(20, height - 100);
  fill(0, 180);
  rect(0, 0, 300, 80, 10);
  fill(255);
  textSize(12);
  const wR = pose.keypoints[16];
  const eR = pose.keypoints[14];
  text("DEBUG BRACO DIR:", 15, 25);
  text("Distancia Y (Pulso-Cotovelo): " + nf(wR.y - eR.y, 1, 1), 15, 45);
  text("Fase: " + exercisePhaseSup, 15, 65);
  pop();
}

function resetModule() {
  currentExIndexSup = 0;
  exercisePhaseSup = "DOWN";
  feedbackMsgSup = "VAMOS FORTALECER O BRACO!";
  targetExercisesSupDir.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}

window.games2Modules.upperRight = {
  preload: preloadMembrosSuperioresDir,
  draw: drawUpperLimbGameDir,
  reset: resetModule
};
})();
