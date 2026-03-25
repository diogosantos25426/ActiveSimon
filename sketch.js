let bodyPose, video, poses = [], connections;
let myFont;
let basketImg;
let repSuccessSound;
let gameCloseButton;
let sessionPillElement;
let supervisorLaunchElement;

function setGameChromeVisible(isVisible) {
  if (gameCloseButton) {
    gameCloseButton.classList.toggle('hidden', !isVisible);
  }

  if (sessionPillElement) {
    sessionPillElement.classList.toggle('in-game-hidden', isVisible);
  }

  if (supervisorLaunchElement) {
    supervisorLaunchElement.classList.toggle('in-game-hidden', isVisible);
  }
}

function preload() {
  bodyPose = ml5.bodyPose("BlazePose");
  myFont = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
  basketImg = loadImage('assets/Cesto.png');
  repSuccessSound = loadSound('assets/sounds/1.mp3');
  if (window.preloadGames2Modules) {
    window.preloadGames2Modules();
  }
  preloadMenu();
}

function playRepSuccessSound() {
  if (!repSuccessSound) return;

  if (repSuccessSound.isPlaying()) {
    repSuccessSound.stop();
  }

  repSuccessSound.play();
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  textFont(myFont);
  gameCloseButton = document.getElementById('game-close-button');
  sessionPillElement = document.getElementById('session-pill');
  supervisorLaunchElement = document.getElementById('supervisor-launch');
  if (gameCloseButton) {
    gameCloseButton.addEventListener('click', () => {
      if (window.exitActiveGame) {
        window.exitActiveGame();
      }
    });
  }

  if (window.initAuthUI) {
    window.initAuthUI();
  }

  if (window.initSupervisorPanel) {
    window.initSupervisorPanel();
  }

  if (window.registerGames2Implementations) {
    window.registerGames2Implementations();
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

  const showGameCloseButton = (
    state === "SHOWING" ||
    state === "PLAYER" ||
    state === "WAITING" ||
    state === "GAMEOVER" ||
    state === "CONGRATS"
  );
  setGameChromeVisible(showGameCloseButton);

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
  } else if (state === "GAMEOVER" || state === "CONGRATS") {
    drawGameOver();
  }
}

function mousePressed() {
  menuMousePressed();

  if (state === "GAMEOVER" || state === "CONGRATS") {
    state = "MENU";
    setGameChromeVisible(false);
  }
}

function drawSkeleton(pose) {
  if (window.shouldDrawPoseOverlay === false) return;
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

window.playRepSuccessSound = playRepSuccessSound;
