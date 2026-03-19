const supervisorState = {
  session: null,
  players: [],
  games: [],
  assignmentsByPlayer: {},
  activePlayerId: null
};

const supervisorUI = {};

function cacheSupervisorElements() {
  supervisorUI.launch = document.getElementById("supervisor-launch");
  supervisorUI.shell = document.getElementById("supervisor-shell");
  supervisorUI.close = document.getElementById("supervisor-close");
  supervisorUI.loginView = document.getElementById("supervisor-login");
  supervisorUI.workspace = document.getElementById("supervisor-workspace");
  supervisorUI.pinInput = document.getElementById("supervisor-pin-input");
  supervisorUI.loginButton = document.getElementById("supervisor-login-button");
  supervisorUI.status = document.getElementById("supervisor-status");
  supervisorUI.sessionCopy = document.getElementById("supervisor-session-copy");
  supervisorUI.playerItems = document.getElementById("player-items");
  supervisorUI.playerName = document.getElementById("assignment-player-name");
  supervisorUI.defaultDifficulty = document.getElementById("assignment-default-difficulty");
  supervisorUI.assignmentGrid = document.getElementById("assignment-grid");
  supervisorUI.assignmentStatus = document.getElementById("assignment-status");
  supervisorUI.saveButton = document.getElementById("save-assignment-button");
  supervisorUI.logoutButton = document.getElementById("supervisor-logout");
}

function setSupervisorMessage(message, type = "") {
  if (!supervisorUI.status) return;
  supervisorUI.status.textContent = message || "";
  supervisorUI.status.className = `supervisor-status${type ? ` ${type}` : ""}`;
}

function setAssignmentMessage(message, type = "") {
  if (!supervisorUI.assignmentStatus) return;
  supervisorUI.assignmentStatus.textContent = message || "";
  supervisorUI.assignmentStatus.className = `supervisor-status${type ? ` ${type}` : ""}`;
}

function openSupervisorPanel() {
  supervisorUI.shell?.classList.remove("hidden");
}

function closeSupervisorPanel() {
  supervisorUI.shell?.classList.add("hidden");
}

function showSupervisorLogin() {
  supervisorUI.loginView?.classList.remove("hidden");
  supervisorUI.workspace?.classList.add("hidden");
}

function showSupervisorWorkspace() {
  supervisorUI.loginView?.classList.add("hidden");
  supervisorUI.workspace?.classList.remove("hidden");
}

function getSupervisorClient() {
  return window.getTrainingSupabaseClient ? window.getTrainingSupabaseClient() : null;
}

async function validateSupervisorPin(pin) {
  const client = getSupervisorClient();
  if (!client) throw new Error("Cliente Supabase indisponivel.");

  const { data, error } = await client.rpc("validate_supervisor_pin", {
    pin_input: pin
  });

  if (error) throw error;
  const supervisor = Array.isArray(data) ? data[0] : data;
  if (!supervisor?.supervisor_id) throw new Error("PIN invalido.");
  return {
    id: supervisor.supervisor_id,
    name: supervisor.supervisor_name
  };
}

async function fetchSupervisorPlayers() {
  const client = getSupervisorClient();
  const { data, error } = await client
    .from("face_profiles")
    .select("id, name, supervisor_id")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchSupervisorGames() {
  const client = getSupervisorClient();
  const { data, error } = await client
    .from("games_catalog")
    .select("code, name, summary, implementation_key, status, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) throw error;

  const games = (data || []).map((game) => ({
    code: game.code,
    name: game.name,
    summary: game.summary || "Jogo configurado pelo supervisor.",
    implementationKey: game.implementation_key || "future_game",
    status: game.status || "planned",
    enabled: game.active !== false,
    difficulties: ["easy", "medium", "hard"]
  }));

  if (games.length === 0 && window.getGameCatalog) {
    return window.getGameCatalog().filter((game) => game.enabled);
  }

  return games;
}

async function fetchPlayerAssignments(playerId) {
  const client = getSupervisorClient();
  const { data, error } = await client
    .from("player_game_assignments")
    .select("id, game_code, difficulty, enabled, sort_order")
    .eq("player_profile_id", playerId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

function getDifficultyLabel(value) {
  return window.DIFFICULTY_PRESETS?.[value]?.label || value;
}

function renderSupervisorPlayers() {
  if (!supervisorUI.playerItems) return;

  if (supervisorState.players.length === 0) {
    supervisorUI.playerItems.innerHTML = "<div class='player-item'><strong>Sem jogadores</strong><span>Cria contas faciais primeiro.</span></div>";
    return;
  }

  supervisorUI.playerItems.innerHTML = supervisorState.players.map((player) => {
    const activeClass = player.id === supervisorState.activePlayerId ? " active" : "";
    const linked = player.supervisor_id ? `Supervisor ${player.supervisor_id}` : "Sem supervisor associado";
    return `
      <button class="player-item${activeClass}" type="button" data-player-id="${player.id}">
        <strong>${player.name}</strong>
        <span>${linked}</span>
      </button>
    `;
  }).join("");

  supervisorUI.playerItems.querySelectorAll("[data-player-id]").forEach((button) => {
    button.addEventListener("click", () => selectSupervisorPlayer(button.dataset.playerId));
  });
}

function buildAssignmentRows(playerId) {
  const existingAssignments = supervisorState.assignmentsByPlayer[playerId] || [];
  const assignmentMap = new Map(existingAssignments.map((assignment) => [assignment.game_code, assignment]));

  return supervisorState.games.map((game, index) => {
    const existing = assignmentMap.get(game.code);
    const checked = existing ? existing.enabled !== false : false;
    const selectedDifficulty = existing?.difficulty || "medium";

    return `
      <label class="assignment-row">
        <div class="assignment-main">
          <input type="checkbox" data-game-enabled="${game.code}" ${checked ? "checked" : ""}>
          <div class="assignment-meta">
            <strong>${game.name}</strong>
            <span>${game.summary || "Jogo sem descricao."}</span>
          </div>
        </div>
        <select data-game-difficulty="${game.code}">
          <option value="easy" ${selectedDifficulty === "easy" ? "selected" : ""}>${getDifficultyLabel("easy")}</option>
          <option value="medium" ${selectedDifficulty === "medium" ? "selected" : ""}>${getDifficultyLabel("medium")}</option>
          <option value="hard" ${selectedDifficulty === "hard" ? "selected" : ""}>${getDifficultyLabel("hard")}</option>
        </select>
        <span>${index + 1}. ordem</span>
      </label>
    `;
  }).join("");
}

function renderAssignmentEditor() {
  const player = supervisorState.players.find((item) => item.id === supervisorState.activePlayerId);

  if (!player) {
    supervisorUI.playerName.textContent = "Seleciona um jogador para editar o plano.";
    supervisorUI.assignmentGrid.innerHTML = "";
    return;
  }

  supervisorUI.playerName.textContent = `Jogador selecionado: ${player.name}`;

  if (supervisorState.games.length === 0) {
    supervisorUI.assignmentGrid.innerHTML = "<div class='assignment-row'><div class='assignment-meta'><strong>Sem jogos ativos</strong><span>Adiciona jogos em games_catalog para atribuires treino.</span></div></div>";
    return;
  }

  supervisorUI.assignmentGrid.innerHTML = buildAssignmentRows(player.id);
}

async function selectSupervisorPlayer(playerId) {
  supervisorState.activePlayerId = playerId;
  setAssignmentMessage("");

  try {
    supervisorState.assignmentsByPlayer[playerId] = await fetchPlayerAssignments(playerId);
  } catch (error) {
    setAssignmentMessage(`Nao foi possivel carregar o treino deste jogador: ${error.message}`, "error");
  }

  renderSupervisorPlayers();
  renderAssignmentEditor();
}

async function loadSupervisorWorkspace() {
  supervisorState.players = await fetchSupervisorPlayers();
  supervisorState.games = await fetchSupervisorGames();

  if (window.registerGameDefinition) {
    supervisorState.games.forEach((game) => window.registerGameDefinition(game));
  }

  supervisorUI.sessionCopy.textContent = `Sessao ativa: ${supervisorState.session.name}`;
  renderSupervisorPlayers();

  if (supervisorState.players.length > 0) {
    await selectSupervisorPlayer(supervisorState.players[0].id);
  } else {
    renderAssignmentEditor();
  }
}

async function loginSupervisor() {
  const pin = supervisorUI.pinInput?.value.trim();
  if (!pin) {
    setSupervisorMessage("Insere o PIN do supervisor.", "error");
    return;
  }

  setSupervisorMessage("A validar PIN...");

  try {
    supervisorState.session = await validateSupervisorPin(pin);
    await loadSupervisorWorkspace();
    setSupervisorMessage("");
    setAssignmentMessage("Painel carregado. Escolhe um jogador e guarda o treino.", "success");
    showSupervisorWorkspace();
  } catch (error) {
    setSupervisorMessage(`Nao foi possivel entrar: ${error.message}`, "error");
  }
}

function collectSelectedAssignments() {
  const rows = Array.from(supervisorUI.assignmentGrid.querySelectorAll(".assignment-row"));
  let sortOrder = 1;

  return rows.flatMap((row, index) => {
    const checkbox = row.querySelector("[data-game-enabled]");
    const difficulty = row.querySelector("[data-game-difficulty]");
    if (!checkbox?.checked) return [];

    return [{
      player_profile_id: supervisorState.activePlayerId,
      game_code: checkbox.dataset.gameEnabled,
      difficulty: difficulty?.value || supervisorUI.defaultDifficulty.value || "medium",
      enabled: true,
      sort_order: sortOrder++,
      assigned_by_supervisor_id: supervisorState.session.id
    }];
  });
}

async function saveSupervisorAssignments() {
  if (!supervisorState.session) {
    setAssignmentMessage("Primeiro entra com o PIN do supervisor.", "error");
    return;
  }

  if (!supervisorState.activePlayerId) {
    setAssignmentMessage("Seleciona um jogador primeiro.", "error");
    return;
  }

  const client = getSupervisorClient();
  const assignments = collectSelectedAssignments();

  setAssignmentMessage("A guardar treino...");

  try {
    const { error: deleteError } = await client
      .from("player_game_assignments")
      .delete()
      .eq("player_profile_id", supervisorState.activePlayerId);

    if (deleteError) throw deleteError;

    if (assignments.length > 0) {
      const { error: insertError } = await client
        .from("player_game_assignments")
        .insert(assignments);
      if (insertError) throw insertError;
    }

    supervisorState.assignmentsByPlayer[supervisorState.activePlayerId] = await fetchPlayerAssignments(
      supervisorState.activePlayerId
    );

    const currentPlayer = window.getCurrentPlayer ? window.getCurrentPlayer() : null;
    if (currentPlayer?.id === supervisorState.activePlayerId && window.refreshTrainingPlan) {
      window.refreshTrainingPlan(currentPlayer);
    }

    setAssignmentMessage("Treino guardado com sucesso para a sessao seguinte.", "success");
    renderAssignmentEditor();
  } catch (error) {
    setAssignmentMessage(`Erro ao guardar treino: ${error.message}`, "error");
  }
}

function logoutSupervisor() {
  supervisorState.session = null;
  supervisorState.players = [];
  supervisorState.games = [];
  supervisorState.assignmentsByPlayer = {};
  supervisorState.activePlayerId = null;
  if (supervisorUI.pinInput) supervisorUI.pinInput.value = "";
  if (supervisorUI.playerItems) supervisorUI.playerItems.innerHTML = "";
  if (supervisorUI.assignmentGrid) supervisorUI.assignmentGrid.innerHTML = "";
  supervisorUI.playerName.textContent = "Seleciona um jogador para editar o plano.";
  setSupervisorMessage("");
  setAssignmentMessage("");
  showSupervisorLogin();
}

function initSupervisorPanel() {
  cacheSupervisorElements();
  if (!supervisorUI.launch) return;

  supervisorUI.launch.addEventListener("click", openSupervisorPanel);
  supervisorUI.close.addEventListener("click", closeSupervisorPanel);
  supervisorUI.loginButton.addEventListener("click", loginSupervisor);
  supervisorUI.saveButton.addEventListener("click", saveSupervisorAssignments);
  supervisorUI.logoutButton.addEventListener("click", logoutSupervisor);
  supervisorUI.shell.addEventListener("click", (event) => {
    if (event.target === supervisorUI.shell) closeSupervisorPanel();
  });
}

window.initSupervisorPanel = initSupervisorPanel;
