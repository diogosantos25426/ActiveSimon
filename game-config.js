const DIFFICULTY_PRESETS = {
  easy: { key: "easy", label: "Facil" },
  medium: { key: "medium", label: "Medio" },
  hard: { key: "hard", label: "Dificil" }
};

const GAME_CATALOG = [
  {
    code: "lower_right",
    name: "Membros Inferiores - Direita",
    summary: "Exercicios de perna direita com extensao e abducao.",
    implementationKey: "games2_lower_right",
    bodyPart: "right_leg",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "lower_left",
    name: "Membros Inferiores - Esquerda",
    summary: "Exercicios de perna esquerda com extensao e marcha estatica.",
    implementationKey: "games2_lower_left",
    bodyPart: "left_leg",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "lower_general",
    name: "Membros Inferiores - Geral",
    summary: "Marcha alternada e saltos controlados com ambas as pernas.",
    implementationKey: "games2_lower_general",
    bodyPart: "legs",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "upper_right",
    name: "Membros Superiores - Direita",
    summary: "Biceps, triceps e movimentos funcionais do braco direito.",
    implementationKey: "games2_upper_right",
    bodyPart: "right_arm",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "upper_left",
    name: "Membros Superiores - Esquerda",
    summary: "Biceps, triceps e movimentos funcionais do braco esquerdo.",
    implementationKey: "games2_upper_left",
    bodyPart: "left_arm",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "upper_general",
    name: "Membros Superiores - Geral",
    summary: "Trabalho bilateral de ombros e bracos.",
    implementationKey: "games2_upper_general",
    bodyPart: "arms",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "shoulder_right",
    name: "Ombro Direito",
    summary: "Voo lateral, elevacao frontal e toque cruzado no ombro.",
    implementationKey: "games2_shoulder_right",
    bodyPart: "right_shoulder",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "shoulder_left",
    name: "Ombro Esquerdo",
    summary: "Trabalho dirigido do ombro esquerdo.",
    implementationKey: "games2_shoulder_left",
    bodyPart: "left_shoulder",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "shoulder_general",
    name: "Ombros - Geral",
    summary: "Exercicios combinados para ambos os ombros.",
    implementationKey: "games2_shoulder_general",
    bodyPart: "shoulders",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  },
  {
    code: "waist",
    name: "Cintura",
    summary: "Inclinacao, rotacao e extensao do tronco.",
    implementationKey: "games2_waist",
    bodyPart: "waist",
    status: "ready",
    enabled: true,
    difficulties: ["easy", "medium", "hard"],
    defaultDifficulty: "medium"
  }
];

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function cloneCatalogEntry(game) {
  return {
    ...game,
    difficulties: Array.isArray(game.difficulties) ? [...game.difficulties] : []
  };
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

  return cloneValue({
    gameCode: game.code,
    gameName: game.name,
    implementationKey: game.implementationKey,
    difficultyKey: difficulty.key,
    difficultyLabel: difficulty.label,
    status: game.status,
    bodyPart: game.bodyPart
  });
}

window.DIFFICULTY_PRESETS = DIFFICULTY_PRESETS;
window.GAME_CATALOG = GAME_CATALOG;
window.getGameDefinition = getGameDefinition;
window.getGameCatalog = getGameCatalog;
window.getEnabledGames = getEnabledGames;
window.registerGameDefinition = registerGameDefinition;
window.buildGameSessionConfig = buildGameSessionConfig;
