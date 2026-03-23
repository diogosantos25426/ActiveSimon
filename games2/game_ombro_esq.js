(() => {
window.games2Modules = window.games2Modules || {};
// --- CONFIGURAÇÃO DOS EXERCÍCIOS DO OMBRO ESQUERDO ---
let imgVooEsq, imgElevacaoEsq, imgCruzamentoEsq;
let targetExercisesOmbroEsq = [
  { id: 0, label: "VOO LATERAL (ESQ)",   goalReps: 5, currentReps: 0, color: [255, 150, 150] },
  { id: 1, label: "ELEVAÇÃO FRONTAL",    goalReps: 5, currentReps: 0, color: [150, 200, 255] },
  { id: 2, label: "TOQUE NO OMBRO DIR",  goalReps: 8, currentReps: 0, color: [150, 255, 200] }
];

let currentExIndexOmbroEsq = 0;
let exercisePhaseOmbroEsq = "DOWN"; 
let feedbackMsgOmbroEsq = "PREPARA O BRAÇO ESQUERDO!";

function preloadOmbroEsquerdo() {
  // Devem ser carregadas no sketch.js
  imgVooEsq = loadImage('assets/alongamentoVertical.png'); 
  imgElevacaoEsq = loadImage('assets/alongamentoVertical.png'); 
  imgCruzamentoEsq = loadImage('assets/bicep_curl.png'); 
}

function drawOmbroEsqGame() {
  drawMirrorVideo(); 

  if (poses && poses.length > 0) {
    let pose = poses[0];
    drawSkeleton(pose);      
    checkOmbroEsqLogic(pose); 
    if (window.shouldDrawGameDebug) drawDebugOmbroEsq(pose); 
  }

  drawGymInterfaceOmbroEsq();
}

function checkOmbroEsqLogic(pose) {
  let ex = targetExercisesOmbroEsq[currentExIndexOmbroEsq];
  if (!ex) return;

  // Keypoints Lado Esquerdo
  let shoulderL = pose.keypoints[11]; // Ombro Esquerdo
  let shoulderR = pose.keypoints[12]; // Ombro Direito
  let wristL    = pose.keypoints[15]; // Pulso Esquerdo

  if (shoulderL.confidence > 0.5 && wristL.confidence > 0.5) {
    
    let isUp = false;
    let isDown = false;

    // --- LÓGICA POR EXERCÍCIO (ESPELHADA) ---
    
    if (ex.label === "VOO LATERAL (ESQ)") {
      // UP: Pulso à altura do ombro
      isUp = (wristL.y < shoulderL.y + 40 && wristL.y > shoulderL.y - 60);
      // DOWN: Pulso relaxado abaixo
      isDown = (wristL.y > shoulderL.y + 150);
      
      // Alerta de altura excessiva
      if (wristL.y < shoulderL.y - 100) {
        feedbackMsgOmbroEsq = "MANTÉM A MÃO NA LINHA DO OMBRO";
        return;
      }
    } 
    
    else if (ex.label === "ELEVAÇÃO FRONTAL") {
      isUp = (wristL.y < shoulderL.y + 20); 
      isDown = (wristL.y > shoulderL.y + 150);
    }

    else if (ex.label === "TOQUE NO OMBRO DIR") {
      // Distância entre pulso esquerdo e ombro direito
      let d = dist(wristL.x, wristL.y, shoulderR.x, shoulderR.y);
      isUp = (d < 70); 
      // DOWN: Mão voltou para o lado esquerdo do corpo (X diminui no sistema espelhado)
      isDown = (wristL.x < shoulderL.x); 
    }

    // --- MÁQUINA DE ESTADOS ---
    if (exercisePhaseOmbroEsq === "DOWN" && isUp) {
      exercisePhaseOmbroEsq = "UP";
      feedbackMsgOmbroEsq = "BOA! AGORA BAIXA.";
    } 
    else if (exercisePhaseOmbroEsq === "UP" && isDown) {
      exercisePhaseOmbroEsq = "DOWN";
      ex.currentReps++;
      if (window.playRepSuccessSound) window.playRepSuccessSound();
      feedbackMsgOmbroEsq = "MAIS UMA!";
      
      if (ex.currentReps >= ex.goalReps) {
        currentExIndexOmbroEsq++;
        if (currentExIndexOmbroEsq >= targetExercisesOmbroEsq.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterfaceOmbroEsq() {
  let ex = targetExercisesOmbroEsq[currentExIndexOmbroEsq];
  if (!ex) return;

  let icon;
  if (ex.id === 0) icon = imgVooEsq;
  else if (ex.id === 1) icon = imgElevacaoEsq;
  else icon = imgCruzamentoEsq;
  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackMsgOmbroEsq,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugOmbroEsq(pose) {
  let sL = pose.keypoints[11];
  let wL = pose.keypoints[15];

  push();
  resetMatrix();
  translate(width - 300, 20);
  fill(0, 150);
  rect(0, 0, 280, 80, 5);
  fill(255, 100, 100);
  textSize(12);
  text("DEBUG OMBRO ESQ:", 10, 20);
  text("Diferença Y: " + nf(wL.y - sL.y, 1, 1), 10, 40);
  text("Fase: " + exercisePhaseOmbroEsq, 10, 60);
  pop();
}
function resetModule() {
  currentExIndexOmbroEsq = 0;
  exercisePhaseOmbroEsq = 'DOWN';
  feedbackMsgOmbroEsq = 'PREPARA O BRACO ESQUERDO!';
  targetExercisesOmbroEsq.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}
window.games2Modules.shoulderLeft = {
  preload: preloadOmbroEsquerdo,
  draw: drawOmbroEsqGame,
  reset: resetModule
};
})();



