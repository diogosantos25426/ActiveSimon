let bodyPose, video, poses = [], connections;
let myFont;
let basketImg; // imagem do cesto que o jogador deve usar

function preload() {
  // Carrega assets comuns
  bodyPose = ml5.bodyPose("BlazePose");
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
  // imagem do cesto (o usuário deve colocar assets/cesto.png)
  basketImg = loadImage('assets/cesto.png');
  
  // Chama o preload do menu (imagem de fundo)
  preloadMenu();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(myFont);
  
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  bodyPose.detectStart(video, (results) => { poses = results; });
  connections = bodyPose.getSkeleton();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
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

// Unificamos todos os cliques aqui
function mousePressed() {
  // Chama a lógica de cliques que está no menu.js
  menuMousePressed();
  
  if (state === "GAMEOVER") {
    state = "MENU";
  }
}