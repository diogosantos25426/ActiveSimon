let bodyPose, video, poses = [], connections;
let myFont;
let basketImg;

function preload() {
  bodyPose = ml5.bodyPose("BlazePose");
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
  basketImg = loadImage('assets/cesto.png');
  preloadMenu();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(myFont);

  if (window.initAuthUI) {
    window.initAuthUI();
  }

  if (window.initSupervisorPanel) {
    window.initSupervisorPanel();
  }

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodyPose.detectStart(video, (results) => {
    poses = results;
  });

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
  menuMousePressed();

  if (state === "GAMEOVER") {
    state = "MENU";
  }
}

function drawSkeleton(pose) {
  if (!pose || !connections) return;

  push();
  translate(0, 0, -190);
  scale(-1, 1);

  stroke(255);
  strokeWeight(4);

  for (let i = 0; i < connections.length; i++) {
    let a = pose.keypoints[connections[i][0]];
    let b = pose.keypoints[connections[i][1]];

    if (a.confidence > 0.1 && b.confidence > 0.1) {
      let x1 = map(a.x, 0, 640, -width / 2, width / 2);
      let y1 = map(a.y, 0, 480, -height / 2, height / 2);
      let x2 = map(b.x, 0, 640, -width / 2, width / 2);
      let y2 = map(b.y, 0, 480, -height / 2, height / 2);

      line(x1, y1, 0, x2, y2, 0);
    }
  }

  fill(0, 255, 0);
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
