const GAMES2_IMPLEMENTATION_MAP = {
  games2_lower_right: "lowerRight",
  games2_lower_left: "lowerLeft",
  games2_lower_general: "lowerGeneral",
  games2_upper_right: "upperRight",
  games2_upper_left: "upperLeft",
  games2_upper_general: "upperGeneral",
  games2_shoulder_right: "shoulderRight",
  games2_shoulder_left: "shoulderLeft",
  games2_shoulder_general: "shoulderGeneral",
  games2_waist: "waist"
};

const CALIBRATION_GAME_MAP = {
  Cabeca: "upper_general",
  "Ombro Esq": "shoulder_left",
  "Ombro Dir": "shoulder_right",
  "Ombro Esquerdo": "shoulder_left",
  "Ombro Direito": "shoulder_right",
  "Ombros (Geral)": "shoulder_general",
  "Cotovelo Esq": "upper_left",
  "Cotovelo Dir": "upper_right",
  "M. Sup. Esquerda": "upper_left",
  "M. Sup. Direita": "upper_right",
  "M. Superiores": "upper_general",
  "Joelho Esq": "lower_left",
  "Joelho Dir": "lower_right",
  "M. Inf. Esquerda": "lower_left",
  "M. Inf. Direita": "lower_right",
  "M. Inf. Geral": "lower_general",
  Cintura: "waist"
};

function getGames2ModuleByImplementation(implementationKey) {
  const moduleKey = GAMES2_IMPLEMENTATION_MAP[implementationKey];
  if (!moduleKey) return null;
  return window.games2Modules?.[moduleKey] || null;
}

function preloadGames2Modules() {
  if (!window.games2Modules) return;
  Object.values(window.games2Modules).forEach((module) => {
    if (typeof module.preload === "function") {
      module.preload();
    }
  });
}

function registerGames2Implementations() {
  if (!window.registerGameImplementation) return;

  Object.entries(GAMES2_IMPLEMENTATION_MAP).forEach(([implementationKey]) => {
    window.registerGameImplementation(implementationKey, {
      start(session) {
        const module = getGames2ModuleByImplementation(implementationKey);
        if (module?.reset) module.reset();
        state = "PLAYER";
      },
      gameLoop() {
        const module = getGames2ModuleByImplementation(implementationKey);
        if (module?.draw) module.draw();
      }
    });
  });
}

function startCalibrationGame(label) {
  const gameCode = CALIBRATION_GAME_MAP[label];
  if (!gameCode || typeof window.startNewGame !== "function") return false;
  window.startNewGame(gameCode, "medium");
  return true;
}

window.preloadGames2Modules = preloadGames2Modules;
window.registerGames2Implementations = registerGames2Implementations;
window.startCalibrationGame = startCalibrationGame;
