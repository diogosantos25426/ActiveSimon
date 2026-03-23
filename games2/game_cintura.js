(() => {
window.games2Modules = window.games2Modules || {};

let imgInclinacao, imgRotacao, imgExtensaoTronco;
let targetExercisesCintura = [
  { id: 0, label: "INCLINACAO LATERAL", goalReps: 10, currentReps: 0, color: [255, 180, 100] },
  { id: 1, label: "ROTACAO DE TRONCO", goalReps: 10, currentReps: 0, color: [100, 255, 180] },
  { id: 2, label: "ALONGAMENTO VERTICAL", goalReps: 5, currentReps: 0, color: [180, 100, 255] }
];

let currentExIndexCintura = 0;
let exercisePhaseCintura = "CENTER";
let feedbackMsgCintura = "VAMOS MOVER A CINTURA!";

function preloadCintura() {
  imgInclinacao = loadImage("assets/inclinacao_lateral.png");
  imgRotacao = loadImage("assets/rotacaoTronco.png");
  imgExtensaoTronco = loadImage("assets/alongamentoVertical.png");
}

function drawCinturaGame() {
  drawMirrorVideo();

  if (poses && poses.length > 0) {
    const pose = poses[0];
    drawSkeleton(pose);
    checkCinturaLogic(pose);
    if (window.shouldDrawGameDebug) drawDebugCintura(pose);
  }

  drawGymInterfaceCintura();
}

function checkCinturaLogic(pose) {
  const ex = targetExercisesCintura[currentExIndexCintura];
  if (!ex) return;

  const sR = pose.keypoints[12];
  const sL = pose.keypoints[11];
  const hR = pose.keypoints[24];
  const hL = pose.keypoints[23];

  if (sR.confidence > 0.5 && sL.confidence > 0.5 && hR.confidence > 0.5) {
    if (ex.label === "INCLINACAO LATERAL") {
      const shoulderDiff = sR.y - sL.y;

      if (exercisePhaseCintura === "CENTER") {
        if (shoulderDiff > 40) {
          exercisePhaseCintura = "RIGHT";
          feedbackMsgCintura = "AGORA PARA O OUTRO LADO!";
        } else if (shoulderDiff < -40) {
          exercisePhaseCintura = "LEFT";
          feedbackMsgCintura = "MUITO BEM! VOLTA AO CENTRO.";
        }
      } else if ((exercisePhaseCintura === "RIGHT" && shoulderDiff < -30) || (exercisePhaseCintura === "LEFT" && shoulderDiff > 30)) {
        exercisePhaseCintura = "CENTER";
        ex.currentReps++;
        if (window.playRepSuccessSound) window.playRepSuccessSound();
        feedbackMsgCintura = "EXCELENTE! MAIS UMA.";
      }
    } else if (ex.label === "ROTACAO DE TRONCO") {
      const currentShoulderWidth = abs(sR.x - sL.x);
      const hipWidth = abs(hR.x - hL.x);

      if (currentShoulderWidth < hipWidth * 0.6) {
        if (exercisePhaseCintura !== "ROTATED") {
          exercisePhaseCintura = "ROTATED";
          feedbackMsgCintura = "RODA PARA O OUTRO LADO!";
        }
      } else if (currentShoulderWidth > hipWidth * 0.9 && exercisePhaseCintura === "ROTATED") {
        exercisePhaseCintura = "CENTER";
        ex.currentReps++;
        if (window.playRepSuccessSound) window.playRepSuccessSound();
        feedbackMsgCintura = "BOA ROTACAO!";
      }
    } else if (ex.label === "ALONGAMENTO VERTICAL") {
      const wR = pose.keypoints[16];
      const midShoulderY = (sR.y + sL.y) / 2;

      if (wR.y > midShoulderY + 50 && exercisePhaseCintura !== "DOWN") {
        exercisePhaseCintura = "DOWN";
        feedbackMsgCintura = "AGORA ESTICA PARA O CEU!";
      } else if (wR.y < midShoulderY - 100 && exercisePhaseCintura === "DOWN") {
        exercisePhaseCintura = "UP";
        ex.currentReps++;
        if (window.playRepSuccessSound) window.playRepSuccessSound();
        feedbackMsgCintura = "ISSO! DESCE OUTRA VEZ.";
        exercisePhaseCintura = "CENTER";
      }
    }

    if (ex.currentReps >= ex.goalReps) {
      currentExIndexCintura++;
      exercisePhaseCintura = "CENTER";
      if (currentExIndexCintura >= targetExercisesCintura.length) state = "CONGRATS";
    }
  }
}

function drawGymInterfaceCintura() {
  const ex = targetExercisesCintura[currentExIndexCintura];
  if (!ex) return;

  const icon = ex.id === 0 ? imgInclinacao : (ex.id === 1 ? imgRotacao : imgExtensaoTronco);
  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackMsgCintura,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugCintura(pose) {
  push();
  resetMatrix();
  translate(20, height - 100);
  fill(0, 180);
  rect(0, 0, 320, 80, 10);
  fill(255);
  textSize(12);
  const sR = pose.keypoints[12];
  const sL = pose.keypoints[11];
  text("DEBUG CINTURA:", 15, 25);
  text("Diferenca Y Ombros: " + nf(sR.y - sL.y, 1, 1), 15, 45);
  text("Largura Ombros: " + nf(abs(sR.x - sL.x), 1, 1), 15, 65);
  pop();
}

function resetModule() {
  currentExIndexCintura = 0;
  exercisePhaseCintura = "CENTER";
  feedbackMsgCintura = "VAMOS MOVER A CINTURA!";
  targetExercisesCintura.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}

window.games2Modules.waist = {
  preload: preloadCintura,
  draw: drawCinturaGame,
  reset: resetModule
};
})();
