const FACE_SESSION_KEY = 'face_logged_user';
const FACE_LOGIN_PATH = 'face-login/index.html';
const PROFILE_SETUP_HINT = 'Prepara primeiro a base de dados com o ficheiro supabase/supervisor_auth_schema.sql.';

const authState = {
    profile: null,
    initialized: false
};

const authUI = {};

function cacheAuthElements() {
    authUI.shell = document.getElementById('auth-shell');
    authUI.message = document.getElementById('auth-message');
    authUI.sessionPill = document.getElementById('session-pill');
    authUI.openLogin = document.getElementById('auth-open-login');
    authUI.openRegister = document.getElementById('auth-open-register');
    authUI.refreshSession = document.getElementById('auth-refresh-session');
}

function setAuthMessage(message, type = '') {
    if (!authUI.message) return;
    authUI.message.textContent = message || '';
    authUI.message.className = `auth-message${type ? ` ${type}` : ''}`;
}

function renderAuthPanel(message = '') {
    if (!authUI.shell) return;
    authUI.shell.classList.remove('hidden');
    setAuthMessage(message);
}

function dismissAuthPanel() {
    if (!authUI.shell) return;
    authUI.shell.classList.add('hidden');
    setAuthMessage('');
}

function normalizeFaceSession(raw) {
    if (!raw || !raw.name) return null;
    return {
        id: raw.id || null,
        full_name: raw.name,
        supervisor_id: raw.supervisor_id || null,
        supervisor_name: raw.supervisor_name || null
    };
}

function readFaceSession() {
    try {
        const saved = localStorage.getItem(FACE_SESSION_KEY);
        if (!saved) return null;
        return normalizeFaceSession(JSON.parse(saved));
    } catch (_) {
        return null;
    }
}

function syncFaceSession() {
    authState.profile = readFaceSession();

    if (window.syncTrainingPlanWithSession) {
        window.syncTrainingPlanWithSession(authState.profile);
    }

    if (authState.profile) {
        dismissAuthPanel();
    } else {
        renderAuthPanel('Inicia sessao ou cria conta na pagina de reconhecimento facial.');
    }

    updateSessionPill();
}

function updateSessionPill() {
    if (!authUI.sessionPill) return;

    if (authState.profile) {
        authUI.sessionPill.innerHTML = `
            <strong>${authState.profile.full_name}</strong>
            <span>Supervisor: ${authState.profile.supervisor_name || 'Nao associado'}</span>
        `;
        authUI.sessionPill.classList.remove('hidden');
        return;
    }

    authUI.sessionPill.textContent = '';
    authUI.sessionPill.classList.add('hidden');
}

function openFaceLogin(mode) {
    const target = `${FACE_LOGIN_PATH}?mode=${encodeURIComponent(mode)}&returnTo=${encodeURIComponent('../index.html')}`;
    window.open(target, '_self');
}

function logoutPlayer() {
    authState.profile = null;
    localStorage.removeItem(FACE_SESSION_KEY);
    if (window.syncTrainingPlanWithSession) {
        window.syncTrainingPlanWithSession(null);
    }
    updateSessionPill();
    renderAuthPanel('Sessao terminada.');
}

function requireAuth(message = 'Tens de entrar antes de jogar.') {
    syncFaceSession();
    if (authState.profile) return true;
    renderAuthPanel(message);
    return false;
}

function getCurrentPlayer() {
    return authState.profile;
}

function isAuthenticated() {
    return Boolean(authState.profile);
}

function initAuthUI() {
    if (authState.initialized) return;
    authState.initialized = true;

    cacheAuthElements();

    authUI.openLogin.addEventListener('click', () => openFaceLogin('login'));
    authUI.openRegister.addEventListener('click', () => openFaceLogin('register'));
    authUI.refreshSession.addEventListener('click', () => syncFaceSession());

    window.addEventListener('storage', (event) => {
        if (event.key === FACE_SESSION_KEY) syncFaceSession();
    });
    window.addEventListener('focus', () => syncFaceSession());

    syncFaceSession();
}

window.initAuthUI = initAuthUI;
window.showAuthPanel = (_mode, message) => renderAuthPanel(message);
window.hideAuthPanel = dismissAuthPanel;
window.requireAuth = requireAuth;
window.getCurrentPlayer = getCurrentPlayer;
window.isAuthenticated = isAuthenticated;
window.logoutPlayer = logoutPlayer;
window.refreshFaceSession = syncFaceSession;
window.PROFILE_SETUP_HINT = PROFILE_SETUP_HINT;
