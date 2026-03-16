

function preloadCalibrate() {
  imgSkeleton = loadImage('assets/esqueleto.png');
}

function drawCalibrateScreen() {
  push();
  background(20);
  
  // 1. Desenhar a Imagem do Esqueleto ao fundo
  push();
  translate(0, 0, -50);
  imageMode(CENTER);
  if (imgSkeleton) {
    // Ajusta o tamanho da imagem para caber no ecrã
    let aspect = imgSkeleton.width / imgSkeleton.height;
    image(imgSkeleton, 0, 0, height * aspect * 0.8, height * 0.8);
  }
  pop();

  // 2. Título
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("CALIBRAÇÃO BIOMECÂNICA", 0, -height * 0.4);

  // 3. Desenhar os 8 Círculos
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  for (let pt of calibrationPoints) {
    let d = dist(mx, my, pt.x, pt.y);
    let isHover = d < 25; // Raio do círculo

    push();
    translate(pt.x, pt.y, 10);
    
    // Se estiver em hover, fica vermelho sólido, senão fica transparente
    if (isHover) {
      fill(255, 0, 0, 255); 
      stroke(255);
      strokeWeight(2);
    } else {
      fill(255, 0, 0, 100); 
      noStroke();
    }
    
    ellipse(0, 0, 50, 50);
    
    // Etiqueta pequena
    if (isHover) {
      fill(255);
      textSize(12);
      text(pt.label, 0, 40);
    }
    pop();
  }

  // 4. Botão Voltar
  drawMenuButton("VOLTAR", 0, height * 0.35, 150);
  pop();
}