let bodyPose, video, poses = [], connections;
let state = "MENU";
let score = 0;
let myFont;

function preload() {
  bodyPose = ml5.bodyPose("BlazePose");
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
}

function setup() {
  createCanvas(640, 480, WEBGL);
  textFont(myFont);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  bodyPose.detectStart(video, (results) => { poses = results; });
  connections = bodyPose.getSkeleton();
}

function draw() {
  background(20);

  if (state === "MENU") {
    drawMenu();
  } else if (state === "MANUAL") {
    drawManualScreen();
  } else if (state === "SETTINGS") {
    drawSettingsScreen();
  } else if (state === "SHOWING" || state === "PLAYER" || state === "WAITING") {
    gameLoop();
  } else if (state === "GAMEOVER") {
    drawGameOver();
  }
}

function mousePressed() {
  handleClicks();
  if (state === "MANUAL") {
    let mx = mouseX - width/2;
    let my = mouseY - height/2;
    if (abs(mx) < 75 && my > 100 && my < 140) state = "MENU";
  }
  if (state === "GAMEOVER") state = "MENU";
}

function gameLoop() {
  // --- 1. DESENHO DO VÍDEO (ESPELHADO) ---
  push();
  translate(0, 0, -200);
  
  // Inverte o eixo X para que o movimento seja intuitivo (efeito espelho)
  scale(-1, 1); 
  
  _renderer.GL.disable(_renderer.GL.DEPTH_TEST);
  // Desenha a imagem. Como o scale está invertido, ela "vira" para o lado certo
  image(video, -width / 2, -height / 2, width, height);
  _renderer.GL.enable(_renderer.GL.DEPTH_TEST);
  pop();

  // --- 2. LÓGICA DE SEQUÊNCIA ---
  if (state === "SHOWING") playSequence();

  // --- 3. DESENHO DOS ALVOS (CUBOS) ---
  // Nota: Não usamos scale(-1, 1) aqui para não inverter o texto ou a lógica
  push();
  scale(250);
  for (let t of targets) {
    push();
    translate(t.x, t.y, t.z);
    let isLit = (activeTargetID === t.id);
    // Destacamos o alvo ativo com brilho total
    fill(t.color[0], t.color[1], t.color[2], isLit ? 255 : 80);
    // Se estiver ativo, desenhamos uma borda branca para feedback visual
    if (isLit) {
      stroke(255);
      strokeWeight(0.02);
    } else {
      noStroke();
    }
    box(0.15);
    pop();
  }

  // --- 4. ESQUELETO E COLISÕES ---
  if (poses.length > 0) {
    let pose = poses[0];
    
    // Desenha o esqueleto (a função drawSkeleton já deve ter o -kp.x)
    drawSkeleton(pose);
    
    // Verifica colisão apenas se for a vez do jogador
    if (state === "PLAYER") {
      checkCollision(pose);
    }
  }
  pop(); // Fecha o scale(250)
}

function drawSkeleton(pose) {
  stroke(255); strokeWeight(0.01);
  for (let i = 0; i < connections.length; i++) {
    let a = pose.keypoints3D[connections[i][0]];
    let b = pose.keypoints3D[connections[i][1]];
    if (a.confidence > 0.1 && b.confidence > 0.1) {
      line(-a.x, a.y, a.z, -b.x, b.y, b.z);
    }
  }
}

function drawGameOver() {
  push();
  translate(0,0,10);
  fill(255, 0, 0);
  textAlign(CENTER, CENTER);
  textSize(40); text("FIM DE JOGO", 0, -50);
  fill(255);
  textSize(20); text("Pontos: " + score, 0, 10);
  text("Clica para voltar", 0, 60);
  pop();
}