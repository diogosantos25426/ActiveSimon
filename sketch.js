let bodyPose, video, poses = [], connections;
let myFont;
let basketImg; 

function preload() {
  // 1. Carregar Modelos e Fontes
  bodyPose = ml5.bodyPose("BlazePose");
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
  
  // 2. Carregar Assets do Jogo
  // Certifica-te que estes ficheiros existem na pasta assets/
  basketImg = loadImage('assets/cesto.png');
  
  // 3. Chamar preloads dos outros ficheiros
  preloadMenu(); // Carrega bgMenu e imgSkeleton (no menu.js)
}

function setup() {
  // Criamos o canvas ocupando a janela toda em modo 3D
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(myFont);
  
  // Configuração da Captura de Vídeo
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Iniciar deteção do BlazePose
  bodyPose.detectStart(video, (results) => { 
    poses = results; 
  });
  
  // Obter a estrutura das conexões do esqueleto
  connections = bodyPose.getSkeleton();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(20);

  // Máquina de Estados: Gere o que aparece no ecrã
  if (state === "MENU") {
    drawMenu();
  } else if (state === "MANUAL") {
    drawManualScreen();
  } else if (state === "CALIBRATE") {
    drawCalibrateScreen();
  } else if (state === "SETTINGS") {
    drawSettingsScreen();
  } else if (state === "SHOWING" || state === "PLAYER" || state === "WAITING") {
    gameLoop();
  } else if (state === "GAMEOVER") {
    drawGameOver();
  }
}

function mousePressed() {
  // Centraliza a lógica de cliques dos menus (definida no menu.js)
  menuMousePressed();
  
  // Lógica global para sair do Game Over
  if (state === "GAMEOVER") {
    state = "MENU";
  }
}

// --- FUNÇÃO AUXILIAR DE DESENHO DO ESQUELETO (Usada no gameLoop e Calibrate) ---
function drawSkeleton(pose) {
  if (!pose || !connections) return;

  push();
  // Colocamos o esqueleto ligeiramente à frente do vídeo (-200) para evitar "flicker"
  translate(0, 0, -190); 
  scale(-1, 1); // Espelhamos para bater certo com o vídeo invertido

  stroke(255); // Branco puro para contraste
  strokeWeight(4);
  
  // Desenhar as linhas (conexões)
  for (let i = 0; i < connections.length; i++) {
    let a = pose.keypoints[connections[i][0]];
    let b = pose.keypoints[connections[i][1]];

    if (a.confidence > 0.1 && b.confidence > 0.1) {
      // Mapeamos os 640x480 do vídeo para o tamanho real do canvas
      let x1 = map(a.x, 0, 640, -width / 2, width / 2);
      let y1 = map(a.y, 0, 480, -height / 2, height / 2);
      let x2 = map(b.x, 0, 640, -width / 2, width / 2);
      let y2 = map(b.y, 0, 480, -height / 2, height / 2);
      
      line(x1, y1, 0, x2, y2, 0);
    }
  }

  // Desenhar pontos nas articulações (Keypoints)
  fill(0, 255, 0); // Verde para os pontos
  noStroke();
  for (let kp of pose.keypoints) {
    if (kp.confidence > 0.1) {
      let x = map(kp.x, 0, 640, -width / 2, width / 2);
      let y = map(kp.y, 0, 480, -height / 2, height / 2);
      ellipse(x, y, 8, 8);
    }
  }
  pop();
}