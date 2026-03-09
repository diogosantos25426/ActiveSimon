let targets = [
  { id: 0, x: -0.5, y: -0.3, z: 0, color: [255, 0, 0] },
  { id: 1, x: 0.5, y: -0.3, z: 0, color: [0, 0, 255] },
  { id: 2, x: -0.5, y: 0.3, z: 0, color: [0, 255, 0] },
  { id: 3, x: 0.5, y: 0.3, z: 0, color: [255, 255, 0] }
];

let sequence = [];
let playerSequence = [];
let step = 0;
let lastStepTime = 0;
let activeTargetID = -1;
let score = 0;
let lastInputID = -1; // Para evitar múltiplos inputs no mesmo cubo

// Mecânica do Cesto (dimensões actualizadas)
let basket = { x: 0, y: 0.7, w: 0.8, h: 0.4 };
let carriedTargetID = -1; // id do cubo que está a ser agarrado
let handX = 0, handY = 0; // posição da mão direita (normalizada)

let handPath = []; // Guarda o rasto da mão
let maxPathLength = 20; // Tamanho do rasto
function gameLoop() {
  // 1. FUNDO ESPELHADO
  push();
  translate(0, 0, -200);
  scale(-1, 1); 
  _renderer.GL.disable(_renderer.GL.DEPTH_TEST);
  image(video, -width / 2, -height / 2, width, height);
  _renderer.GL.enable(_renderer.GL.DEPTH_TEST);
  pop();

  if (state === "SHOWING") playSequence();

  if (poses && poses.length > 0) {
    let pose = poses[0];
    drawSkeleton(pose);
    drawHandTrace(pose); // NOVO: Desenha o rasto branco
    if (state === "PLAYER") checkCollision(pose);
  }

  // 3. DESENHO DOS CESTO + CUBOS
  push();
  let s = min(width, height) * 0.4;
  scale(s);

  // desenhar cesto como rect fluorescente com texto
  push();
  noFill();
  stroke(255, 200, 0);
  strokeWeight(0.02);
  rectMode(CENTER);
  rect(basket.x, basket.y, basket.w, basket.h, 0.1);
  fill(255, 100);
  noStroke();
  textSize(0.1);
  textAlign(CENTER);
  text("DEPOSITE AQUI", basket.x, basket.y + 0.05);
  pop();

  for (let t of targets) {
    push();
    // Lógica de posição: se estiver agarrado, segue a mão. Se não, volta à base.
    let dx = (t.id === carriedTargetID) ? handX : t.x;
    let dy = (t.id === carriedTargetID) ? handY : t.y;
    translate(dx, dy, 0);

    let isNextCorrect = (state === "PLAYER" && sequence[playerSequence.length] === t.id);
    let isLit = (activeTargetID === t.id || carriedTargetID === t.id || isNextCorrect);
    
    // Área de colisão visual
    noFill();
    stroke(255, 50);
    ellipse(0, 0, 0.3);

    // Cubo
    fill(t.color[0], t.color[1], t.color[2], isLit ? 255 : 80);
    if (isLit) {
      stroke(255);
      strokeWeight(0.02);
    } else {
      noStroke();
    }
    box(0.15);
    pop();
  }
  pop();

  drawScore();
}
function drawHandTrace(pose) {
  let h = pose.keypoints[16]; // Pulso Direito
  if (h && h.confidence > 0.5) {
    // Mapear coordenadas
    let x = map(h.x, 0, 640, width / 2, -width / 2); // Já invertido para o espelho
    let y = map(h.y, 0, 480, -height / 2, height / 2);
    
    // Adicionar posição atual ao rasto
    handPath.push({x: x, y: y});
    if (handPath.length > maxPathLength) handPath.shift();
  }

  // Desenhar o rasto
  push();
  translate(0, 0, -180); // À frente do vídeo
  noFill();
  stroke(255, 200); // Branco semi-transparente
  strokeWeight(8);
  beginShape();
  for (let p of handPath) {
    vertex(p.x, p.y);
  }
  endShape();
  pop();
}

function drawSkeleton(pose) {
  push();
  // Como o vídeo está em translate(0,0,-200), vamos desenhar o esqueleto um pouco à frente
  translate(0, 0, -190); 
  // Inverter o X para acompanhar o espelho do vídeo
  scale(-1, 1); 

  stroke(0, 255, 0); // Cor verde para destacar
  strokeWeight(5);
  
  if (pose.keypoints && connections) {
    for (let i = 0; i < connections.length; i++) {
      let a = pose.keypoints[connections[i][0]];
      let b = pose.keypoints[connections[i][1]];

      // Se ambos os pontos forem detetados
      if (a && b && a.confidence > 0.1 && b.confidence > 0.1) {
        // Mapear as coordenadas 640x480 do vídeo para o tamanho do canvas WEBGL
        let x1 = map(a.x, 0, 640, -width / 2, width / 2);
        let y1 = map(a.y, 0, 480, -height / 2, height / 2);
        let x2 = map(b.x, 0, 640, -width / 2, width / 2);
        let y2 = map(b.y, 0, 480, -height / 2, height / 2);
        
        line(x1, y1, 0, x2, y2, 0);
      }
    }
    
    // Opcional: Desenhar pontos nas articulações
    fill(255, 0, 0);
    noStroke();
    for (let kp of pose.keypoints) {
      if (kp.confidence > 0.1) {
        let x = map(kp.x, 0, 640, -width / 2, width / 2);
        let y = map(kp.y, 0, 480, -height / 2, height / 2);
        ellipse(x, y, 10, 10);
      }
    }
  }
  pop();
}
function drawScore() {
  push();
  // Posiciona no topo do ecrã
  translate(0, -height / 2 + 40, 50); 
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(30);
  // nfc() formata o número para garantir que não aparecem decimais estranhos
  text("PONTOS: " + score, 0, 0);
  pop();
}

// --- DESENHO DO ESQUELETO ---


// --- LÓGICA DE JOGO ---
function startNewGame() {
  score = 0;
  state = "PLAYER";
  sequence = []; // Limpa a sequência antiga
  nextLevel();
  // reset da interacção de agarrar
  carriedTargetID = -1;
  handX = handY = 0;
}

function nextLevel() {
  // Adiciona um novo cubo aleatório à sequência existente
  sequence.push(floor(random(4)));
  
  // Faz reset às variáveis de controlo da ronda do jogador
  playerSequence = []; 
  step = 0;
  lastInputID = -1;
  activeTargetID = -1;
  carriedTargetID = -1; // Garante que não começa a carregar nada
  
  // Muda para o estado de exibição para mostrar a nova sequência ao jogador
  state = "SHOWING";
  lastStepTime = millis();
}

function playSequence() {
  let speed = max(1000 - (sequence.length * 50), 400);
  if (millis() - lastStepTime > speed) {
    if (step < sequence.length) {
      if (activeTargetID === -1) {
        activeTargetID = sequence[step];
      } else {
        activeTargetID = -1;
        step++;
      }
      lastStepTime = millis();
    } else {
      activeTargetID = -1;
      state = "PLAYER";
    }
  }}

function checkCollision(pose) {
  if (!pose.keypoints) return;
  
  // No BlazePose v1, o índice 16 é o pulso direito
  let h = pose.keypoints[16];

  if (h && h.confidence > 0.5) {
    // MAPEAMENTO CORRIGIDO:
    // O vídeo está em scale(-1, 1), por isso o 0 da câmara (esquerda) 
    // aparece na direita do ecrã.
    let nx = map(h.x, 0, 640, 0.6, -0.6); 
    let ny = map(h.y, 0, 480, -0.4, 0.8);

    handX = nx;
    handY = ny;

    // DEBUG VISUAL: Desenha uma pequena esfera onde o código "acha" que a tua mão está
    /*
    push();
    let s = min(width, height) * 0.4;
    scale(s);
    translate(nx, ny, 0);
    fill(255, 255, 0);
    noStroke();
    sphere(0.05);
    pop();
    */

    if (carriedTargetID === -1) {
      // Verificar se a sequência existe antes de tentar aceder
      if (sequence.length > 0 && playerSequence.length < sequence.length) {
        let targetNecessarioID = sequence[playerSequence.length];
        
        for (let t of targets) {
          // Só tentamos agarrar o cubo que brilha (o próximo da sequência)
          if (t.id === targetNecessarioID) {
            let d = dist(nx, ny, t.x, t.y);
            if (d < 0.25) { // Aumentei ligeiramente a tolerância (raio)
              carriedTargetID = t.id;
              break;
            }
          }
        }
      }
    } else {
      // Lógica do cesto
      let inBasketX = (nx > basket.x - basket.w/2 && nx < basket.x + basket.w/2);
      let inBasketY = (ny > basket.y - basket.h/2 && ny < basket.y + basket.h/2);
      
      if (inBasketX && inBasketY) {
        handleInput(carriedTargetID);
        carriedTargetID = -1;
      }
    }
  }
}
function handleInput(id) {
  // 1. Validar se o cubo depositado é o correto para a posição atual da sequência
  let expectedID = sequence[playerSequence.length];

  if (id === expectedID) {
    playerSequence.push(id); // Adiciona aos acertos do jogador nesta ronda
    
    // 2. Verificar se o jogador já depositou TODOS os cubos da sequência atual
    if (playerSequence.length === sequence.length) {
      score++; // Aumenta a pontuação apenas quando termina a sequência toda
      state = "WAITING"; // Pequena pausa para feedback visual
      
      // Espera um pouco e gera o próximo nível (sequência maior)
      setTimeout(nextLevel, 800);
    } else {
      // O jogador acertou, mas ainda faltam mais cubos da sequência
      // Não fazemos nada, apenas deixamos o playerSequence crescer
      console.log("Acertou no cubo! Faltam: " + (sequence.length - playerSequence.length));
    }
  } else {
    // Errou a ordem da sequência
    state = "GAMEOVER";
  }
  
  // Reset do ID de input para permitir pegar no próximo cubo
  lastInputID = -1;
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