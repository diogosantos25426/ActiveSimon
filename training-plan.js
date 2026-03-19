const TRAINING_PLAN_KEY = "player_training_plan";
const TRAINING_SUPABASE_URL = "https://ocacphcysttwekdhjpwn.supabase.co";
const TRAINING_SUPABASE_KEY = "sb_publishable_yMtsceFTxXu5CMaUDd6T4g_W6x_PqDd";

const trainingState = {
  plan: null,
  selectedAssignmentId: null,
  lastPlayerId: null,
  sourceLabel: "local"
};

let trainingSupabaseClient = null;

function getPlanStorageKey(playerId = "guest") {
  return `${TRAINING_PLAN_KEY}:${playerId}`;
}

function getTrainingSupabaseClient() {
  if (trainingSupabaseClient) return trainingSupabaseClient;
  if (!window.supabase?.createClient) return null;

  trainingSupabaseClient = window.supabase.createClient(
    TRAINING_SUPABASE_URL,
    TRAINING_SUPABASE_KEY
  );
  return trainingSupabaseClient;
}

function getDefaultTrainingPlan() {
  return {
    source: "default-local",
    assignments: [
      {
        id: "default-right-hand-medium",
        gameCode: "simon_memory_right_hand",
        difficulty: "medium",
        enabled: true,
        sortOrder: 1
      }
    ]
  };
}

function normalizeTrainingPlan(plan) {
  const fallback = getDefaultTrainingPlan();
  if (!plan || !Array.isArray(plan.assignments)) return fallback;

  return {
    source: plan.source || fallback.source,
    assignments: plan.assignments
      .filter((assignment) => assignment && assignment.gameCode)
      .map((assignment, index) => ({
        id: assignment.id || `${assignment.gameCode}-${assignment.difficulty || "medium"}-${index}`,
        gameCode: assignment.gameCode,
        difficulty: assignment.difficulty || "medium",
        enabled: assignment.enabled !== false,
        sortOrder: Number.isFinite(assignment.sortOrder) ? assignment.sortOrder : index + 1
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  };
}

function persistTrainingPlan(playerId, plan) {
  localStorage.setItem(getPlanStorageKey(playerId), JSON.stringify(plan));
}

function setTrainingPlan(plan, playerId = "guest") {
  trainingState.plan = normalizeTrainingPlan(plan);
  trainingState.lastPlayerId = playerId;
  trainingState.sourceLabel = trainingState.plan.source || "local";
  const enabledAssignments = getEnabledAssignments();
  trainingState.selectedAssignmentId = enabledAssignments[0]?.id || null;
  persistTrainingPlan(playerId, trainingState.plan);
}

function loadStoredTrainingPlanForPlayer(player) {
  const playerId = player?.id || "guest";
  const stored = localStorage.getItem(getPlanStorageKey(playerId));
  const parsed = stored ? JSON.parse(stored) : getDefaultTrainingPlan();
  trainingState.plan = normalizeTrainingPlan(parsed);
  trainingState.lastPlayerId = playerId;
  trainingState.sourceLabel = trainingState.plan.source || "local";
  const enabledAssignments = getEnabledAssignments();
  trainingState.selectedAssignmentId = enabledAssignments[0]?.id || null;
}

function getEnabledAssignments() {
  const assignments = trainingState.plan?.assignments || [];
  return assignments
    .filter((assignment) => assignment.enabled)
    .filter((assignment) => {
      const game = window.getGameDefinition ? window.getGameDefinition(assignment.gameCode) : null;
      return Boolean(game && game.enabled);
    });
}

function getSelectedTrainingAssignment() {
  const enabledAssignments = getEnabledAssignments();
  return enabledAssignments.find((assignment) => assignment.id === trainingState.selectedAssignmentId)
    || enabledAssignments[0]
    || null;
}

function cycleTrainingSelection(direction = 1) {
  const enabledAssignments = getEnabledAssignments();
  if (enabledAssignments.length === 0) {
    trainingState.selectedAssignmentId = null;
    return null;
  }

  const currentIndex = enabledAssignments.findIndex(
    (assignment) => assignment.id === trainingState.selectedAssignmentId
  );
  const baseIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (baseIndex + direction + enabledAssignments.length) % enabledAssignments.length;
  trainingState.selectedAssignmentId = enabledAssignments[nextIndex].id;
  return enabledAssignments[nextIndex];
}

function getTrainingSummary() {
  const assignment = getSelectedTrainingAssignment();
  if (!assignment || !window.getGameDefinition) return null;

  const game = window.getGameDefinition(assignment.gameCode);
  return {
    ...assignment,
    gameName: game.name,
    difficultyLabel: window.DIFFICULTY_PRESETS?.[assignment.difficulty]?.label || assignment.difficulty,
    status: game.status,
    totalAssignments: getEnabledAssignments().length,
    sourceLabel: trainingState.sourceLabel
  };
}

function selectTrainingAssignment(assignmentId) {
  trainingState.selectedAssignmentId = assignmentId;
}

function registerCatalogRows(rows) {
  if (!window.registerGameDefinition || !Array.isArray(rows)) return;

  rows.forEach((row) => {
    window.registerGameDefinition({
      code: row.code,
      name: row.name,
      summary: row.summary || "Jogo configurado pelo supervisor.",
      implementationKey: row.implementation_key || "future_game",
      status: row.status || "planned",
      enabled: row.active !== false
    });
  });
}

async function fetchCatalogFromSupabase(client) {
  const { data, error } = await client
    .from("games_catalog")
    .select("code, name, summary, implementation_key, status, active");

  if (error) throw error;
  registerCatalogRows(data || []);
  return data || [];
}

async function fetchAssignmentsFromSupabase(client, playerId) {
  const { data, error } = await client
    .from("player_game_assignments")
    .select("id, player_profile_id, game_code, difficulty, enabled, sort_order, assigned_by_supervisor_id")
    .eq("player_profile_id", playerId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

function mapSupabaseAssignments(assignments) {
  return {
    source: "supabase",
    assignments: assignments.map((assignment, index) => ({
      id: String(assignment.id || `${assignment.game_code}-${index}`),
      gameCode: assignment.game_code,
      difficulty: assignment.difficulty || "medium",
      enabled: assignment.enabled !== false,
      sortOrder: Number.isFinite(assignment.sort_order) ? assignment.sort_order : index + 1
    }))
  };
}

async function loadTrainingPlanFromSupabase(player) {
  const client = getTrainingSupabaseClient();
  if (!client || !player?.id) return false;

  try {
    await fetchCatalogFromSupabase(client);
    const assignments = await fetchAssignmentsFromSupabase(client, player.id);
    if (assignments.length === 0) return false;
    setTrainingPlan(mapSupabaseAssignments(assignments), player.id);
    trainingState.sourceLabel = "supabase";
    return true;
  } catch (error) {
    console.warn("Nao foi possivel ler o plano de treino da Supabase.", error);
    return false;
  }
}

async function syncTrainingPlanWithSession(player) {
  loadStoredTrainingPlanForPlayer(player);

  if (!player?.id) return;

  const loadedFromSupabase = await loadTrainingPlanFromSupabase(player);
  if (!loadedFromSupabase && trainingState.lastPlayerId !== player.id) {
    loadStoredTrainingPlanForPlayer(player);
  }
}

function startAssignedTraining() {
  const assignment = getSelectedTrainingAssignment();
  if (!assignment) {
    alert("Ainda nao existe nenhum jogo ativo no plano deste utilizador.");
    return;
  }

  if (typeof window.startNewGame === "function") {
    window.startNewGame(assignment.gameCode, assignment.difficulty);
  }
}

window.getDefaultTrainingPlan = getDefaultTrainingPlan;
window.getTrainingSupabaseClient = getTrainingSupabaseClient;
window.setTrainingPlan = setTrainingPlan;
window.getEnabledAssignments = getEnabledAssignments;
window.getSelectedTrainingAssignment = getSelectedTrainingAssignment;
window.getTrainingSummary = getTrainingSummary;
window.cycleTrainingSelection = cycleTrainingSelection;
window.selectTrainingAssignment = selectTrainingAssignment;
window.syncTrainingPlanWithSession = syncTrainingPlanWithSession;
window.refreshTrainingPlan = syncTrainingPlanWithSession;
window.startAssignedTraining = startAssignedTraining;
