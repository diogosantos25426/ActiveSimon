(() => {
window.games2Modules = window.games2Modules || {};
// --- CONFIGURAÇÃO DOS EXERCÍCIOS DO OMBRO DIREITO ---
let imgVooDir, imgElevacaoDir, imgCruzamentoDir;
let targetExercisesOmbroDir = [
  { id: 0, label: "VOO LATERAL (DIR)",   goalReps: 5, currentReps: 0, color: [255, 200, 100] },
  { id: 1, label: "ELEVAÇÃO FRONTAL",    goalReps: 5, currentReps: 0, color: [100, 200, 255] },
  { id: 2, label: "TOQUE NO OMBRO ESQ",  goalReps: 8, currentReps: 0, color: [150, 255, 150] }
];

let currentExIndexOmbro = 0;
let exercisePhaseOmbro = "DOWN"; 
let feedbackMsgOmbro = "PREPARA O BRAÇO DIREITO!";

function preloadOmbroDireito() {
  // Substituir pelos caminhos reais das tuas imagens
  imgVooDir = loadImage('assets/alongamentoVertical.png'); 
  imgElevacaoDir = loadImage('assets/alongamentoVertical.png'); 
  imgCruzamentoDir = loadImage('assets/bicep_curl.png'); 
}

function drawOmbroDirGame() {
  drawMirrorVideo(); 

  if (poses && poses.length > 0) {
    let pose = poses[0];
    drawSkeleton(pose);      
    checkOmbroDirLogic(pose); 
    if (window.shouldDrawGameDebug) drawDebugOmbro(pose); 
  }

  drawGymInterfaceOmbro();
}

function checkOmbroDirLogic(pose) {
  let ex = targetExercisesOmbroDir[currentExIndexOmbro];
  if (!ex) return;

  // Keypoints Necessários
  let shoulderR = pose.keypoints[12]; // Ombro Direito
  let shoulderL = pose.keypoints[11]; // Ombro Esquerdo
  let wristR    = pose.keypoints[16]; // Pulso Direito
  let elbowR    = pose.keypoints[14]; // Cotovelo Direito

  if (shoulderR.confidence > 0.5 && wristR.confidence > 0.5) {
    
    let isUp = false;
    let isDown = false;

    // --- LÓGICA POR EXERCÍCIO ---
    
    if (ex.label === "VOO LATERAL (DIR)") {
      // UP: Pulso chega à altura do ombro (Y aproximado)
      // Usamos uma margem de 40 pixels para não ser demasiado rígido
      isUp = (wristR.y < shoulderR.y + 40 && wristR.y > shoulderR.y - 60);
      // DOWN: Pulso baixa em relação ao cotovelo/corpo
      isDown = (wristR.y > shoulderR.y + 150);
      
      // Bloqueio de segurança: Se subir demais (acima da cabeça)
      if (wristR.y < shoulderR.y - 100) {
        feedbackMsgOmbro = "NÃO SUBAS TANTO O BRAÇO!";
        return;
      }
    } 
    
    else if (ex.label === "ELEVAÇÃO FRONTAL") {
      // Semelhante ao voo, mas focado na subida frontal 
      // (O BlazePose trata o Y da mesma forma, a diferença visual é o X)
      isUp = (wristR.y < shoulderR.y + 20); 
      isDown = (wristR.y > shoulderR.y + 150);
    }

    else if (ex.label === "TOQUE NO OMBRO ESQ") {
      // Calcula distância entre pulso direito e ombro esquerdo
      let d = dist(wristR.x, wristR.y, shoulderL.x, shoulderL.y);
      isUp = (d < 70); // Mão tocou ou aproximou-se do ombro oposto
      isDown = (wristR.x > shoulderR.x); // Mão voltou para o lado direito
    }

    // --- MÁQUINA DE ESTADOS ---
    if (exercisePhaseOmbro === "DOWN" && isUp) {
      exercisePhaseOmbro = "UP";
      feedbackMsgOmbro = "MUITO BEM! BAIXA AGORA.";
    } 
    else if (exercisePhaseOmbro === "UP" && isDown) {
      exercisePhaseOmbro = "DOWN";
      ex.currentReps++;
      if (window.playRepSuccessSound) window.playRepSuccessSound();
      feedbackMsgOmbro = "BOA! MAIS UMA.";
      
      if (ex.currentReps >= ex.goalReps) {
        currentExIndexOmbro++;
        if (currentExIndexOmbro >= targetExercisesOmbroDir.length) state = "CONGRATS";
      }
    }
  }
}

function drawGymInterfaceOmbro() {
  let ex = targetExercisesOmbroDir[currentExIndexOmbro];
  if (!ex) return;

  let icon;
  if (ex.id === 0) icon = imgVooDir;
  else if (ex.id === 1) icon = imgElevacaoDir;
  else icon = imgCruzamentoDir;
  if (window.drawTherapyExerciseOverlay) {
    window.drawTherapyExerciseOverlay({
      exerciseLabel: ex.label,
      countText: ex.currentReps + " / " + ex.goalReps,
      feedback: feedbackMsgOmbro,
      icon,
      accent: ex.color
    });
  }
}

function drawDebugOmbro(pose) {
  let sR = pose.keypoints[12];
  let wR = pose.keypoints[16];

  push();
  resetMatrix();
  translate(20, 20);
  fill(0, 150);
  rect(0, 0, 280, 80, 5);
  fill(255);
  textSize(12);
  text("DEBUG OMBRO DIR:", 10, 20);
  text("Diferença Y (Pulso-Ombro): " + nf(wR.y - sR.y, 1, 1), 10, 40);
  text("Fase atual: " + exercisePhaseOmbro, 10, 60);
  pop();
}
function resetModule() {
  currentExIndexOmbro = 0;
  exercisePhaseOmbro = 'DOWN';
  feedbackMsgOmbro = 'PREPARA O BRACO DIREITO!';
  targetExercisesOmbroDir.forEach((exercise) => {
    exercise.currentReps = 0;
  });
}
window.games2Modules.shoulderRight = {
  preload: preloadOmbroDireito,
  draw: drawOmbroDirGame,
  reset: resetModule
};
})();



