const DIFFICULTY_PRESETS = {
  easy: {
    key: "easy",
    label: "Facil",
    initialSequenceLength: 2,
    showStepBaseMs: 1150,
    showStepDecayMs: 35,
    showStepFloorMs: 520,
    grabRadius: 0.28,
    maxPathLength: 16,
    roundAdvanceDelayMs: 950,
    inputArea: { minX: -0.6, maxX: 0.6, minY: -0.4, maxY: 0.8 }
  },
  medium: {
    key: "medium",
    label: "Medio",
    initialSequenceLength: 3,
    showStepBaseMs: 980,
    showStepDecayMs: 45,
    showStepFloorMs: 430,
    grabRadius: 0.25,
    maxPathLength: 20,
    roundAdvanceDelayMs: 800,
    inputArea: { minX: -0.6, maxX: 0.6, minY: -0.4, maxY: 0.8 }
  },
  hard: {
    key: "hard",
    label: "Dificil",
    initialSequenceLength: 4,
    showStepBaseMs: 860,
    showStepDecayMs: 55,
    showStepFloorMs: 360,
    grabRadius: 0.22,
    maxPathLength: 24,
    roundAdvanceDelayMs: 700,
    inputArea: { minX: -0.62, maxX: 0.62, minY: -0.42, maxY: 0.82 }
  }
};

const DEFAULT_SIMON_TARGETS = [
  { id: 0, x: -0.5, y: -0.3, z: 0, color: [255, 0, 0] },
  { id: 1, x: 0.5, y: -0.3, z: 0, color: [0, 0, 255] },
  { id: 2, x: -0.5, y: 0.3, z: 0, color: [0, 255, 0] },
  { id: 3, x: 0.5, y: 0.3, z: 0, color: [255, 255, 0] }
];

const GAME_CATALOG = [
  {
    code: "simon_memory_right_hand",
    name: "Simon Memoria - Mao Direita",
    summary: "Replica sequencias usando a mao direita e deposita no cesto.",
    implementationKey: "simon_memory",
    controllerKeypoint: 16,
    bodyPart: "right_hand",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium",
    targets: DEFAULT_SIMON_TARGETS,
    basket: { x: 0, y: 0.7, w: 0.8, h: 0.4 }
  },
  {
    code: "simon_memory_left_hand",
    name: "Simon Memoria - Mao Esquerda",
    summary: "Espaco reservado para o jogo da mao esquerda.",
    implementationKey: "future_game",
    controllerKeypoint: 15,
    bodyPart: "left_hand",
    status: "planned",
    enabled: false,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium",
    targets: DEFAULT_SIMON_TARGETS,
    basket: { x: 0, y: 0.7, w: 0.8, h: 0.4 }
  },
  {
    code: "simon_memory_head",
    name: "Simon Memoria - Cabeca",
    summary: "Espaco reservado para o jogo controlado com a cabeca.",
    implementationKey: "future_game",
    controllerKeypoint: 0,
    bodyPart: "head",
    status: "planned",
    enabled: false,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "easy",
    targets: DEFAULT_SIMON_TARGETS,
    basket: { x: 0, y: 0.7, w: 0.8, h: 0.4 }
  },
  {
    code: "simon_memory_waist",
    name: "Simon Memoria - Cintura",
    summary: "Espaco reservado para o jogo controlado com a cintura.",
    implementationKey: "future_game",
    controllerKeypoint: 24,
    bodyPart: "waist",
    status: "planned",
    enabled: false,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "easy",
    targets: DEFAULT_SIMON_TARGETS,
    basket: { x: 0, y: 0.7, w: 0.8, h: 0.4 }
  }
];

function cloneCatalogEntry(game) {
  return {
    ...game,
    difficulties: Array.isArray(game.difficulties) ? [...game.difficulties] : [],
    targets: cloneValue(game.targets || []),
    basket: cloneValue(game.basket || null)
  };
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDifficultyPreset(difficultyKey = "medium") {
  return DIFFICULTY_PRESETS[difficultyKey] || DIFFICULTY_PRESETS.medium;
}

function getGameDefinition(gameCode) {
  return GAME_CATALOG.find((game) => game.code === gameCode) || GAME_CATALOG[0];
}

function getGameCatalog() {
  return GAME_CATALOG.map((game) => cloneCatalogEntry(game));
}

function getEnabledGames() {
  return GAME_CATALOG.filter((game) => game.enabled);
}

function registerGameDefinition(gameDefinition) {
  if (!gameDefinition || !gameDefinition.code) return null;

  const existingIndex = GAME_CATALOG.findIndex((game) => game.code === gameDefinition.code);
  const mergedGame = {
    ...(existingIndex >= 0 ? GAME_CATALOG[existingIndex] : {}),
    ...gameDefinition
  };

  if (!Array.isArray(mergedGame.difficulties) || mergedGame.difficulties.length === 0) {
    mergedGame.difficulties = ["easy", "medium", "hard"];
  }

  if (!mergedGame.defaultDifficulty || !mergedGame.difficulties.includes(mergedGame.defaultDifficulty)) {
    mergedGame.defaultDifficulty = mergedGame.difficulties[0];
  }

  if (!mergedGame.targets) mergedGame.targets = DEFAULT_SIMON_TARGETS;
  if (!mergedGame.basket) mergedGame.basket = { x: 0, y: 0.7, w: 0.8, h: 0.4 };

  if (existingIndex >= 0) {
    GAME_CATALOG.splice(existingIndex, 1, mergedGame);
  } else {
    GAME_CATALOG.push(mergedGame);
  }

  return cloneCatalogEntry(mergedGame);
}

function buildGameSessionConfig(gameCode, difficultyKey) {
  const game = getGameDefinition(gameCode);
  const safeDifficultyKey = game.difficulties.includes(difficultyKey)
    ? difficultyKey
    : game.defaultDifficulty;
  const difficulty = getDifficultyPreset(safeDifficultyKey);

  return {
    gameCode: game.code,
    gameName: game.name,
    implementationKey: game.implementationKey,
    difficultyKey: difficulty.key,
    difficultyLabel: difficulty.label,
    controllerKeypoint: game.controllerKeypoint,
    status: game.status,
    targets: cloneValue(game.targets),
    basket: cloneValue(game.basket),
    ...cloneValue(difficulty)
  };
}

window.DIFFICULTY_PRESETS = DIFFICULTY_PRESETS;
window.GAME_CATALOG = GAME_CATALOG;
window.getGameDefinition = getGameDefinition;
window.getGameCatalog = getGameCatalog;
window.getEnabledGames = getEnabledGames;
window.registerGameDefinition = registerGameDefinition;
window.buildGameSessionConfig = buildGameSessionConfig;
