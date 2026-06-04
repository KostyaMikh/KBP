// ===== KBP DEV TOOLS — Step 1: Authentication Gate =====
// Access: click the hidden lock icon in the footer
// Auth: GitHub Personal Access Token verified against api.github.com/user
// Only grants dev mode if the authenticated user is KostyaMikh

(function () {
  'use strict';

  const REQUIRED_LOGIN = 'KostyaMikh';
  const SESSION_KEY = 'kbp_dev_token';
  const SESSION_USER_KEY = 'kbp_dev_user';

  // ── Styles ──────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* Dev login trigger (hidden lock in footer) */
    #devLoginTrigger {
      position: fixed;
      bottom: 18px;
      right: 18px;
      width: 32px;
      height: 32px;
      opacity: 0.12;
      cursor: pointer;
      z-index: 8000;
      transition: opacity 0.25s;
      background: none;
      border: none;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
    }
    #devLoginTrigger:hover {
      opacity: 0.55;
    }
    #devLoginTrigger svg {
      width: 22px;
      height: 22px;
    }

    /* Dev badge shown when logged in */
    #devBadge {
      position: fixed;
      bottom: 18px;
      right: 18px;
      z-index: 8000;
      display: none;
      align-items: center;
      gap: 7px;
      padding: 7px 14px;
      border-radius: 50px;
      background: linear-gradient(135deg, rgba(255,94,26,0.18), rgba(230,48,0,0.14));
      border: 1px solid rgba(255,94,26,0.4);
      backdrop-filter: blur(12px);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--orange, #ff5e1a);
      cursor: pointer;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      transition: box-shadow 0.25s;
    }
    #devBadge:hover {
      box-shadow: 0 4px 20px rgba(255,94,26,0.35);
    }
    #devBadge .dev-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #ff5e1a;
      animation: devDotPulse 2s ease-in-out infinite;
    }
    @keyframes devDotPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,94,26,0); }
      50%      { box-shadow: 0 0 0 5px rgba(255,94,26,0.25); }
    }

    /* Modal overlay */
    #devAuthModal {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9000;
      align-items: center;
      justify-content: center;
      background: rgba(8,8,16,0.82);
      backdrop-filter: blur(8px);
      padding: 20px;
    }
    #devAuthModal.open {
      display: flex;
    }

    /* Modal box */
    .dev-modal-box {
      background: #0f0f1a;
      border: 1px solid rgba(255,94,26,0.25);
      border-radius: 20px;
      padding: 40px 36px;
      max-width: 420px;
      width: 100%;
      position: relative;
      box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,94,26,0.08);
      animation: devModalIn 0.3s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes devModalIn {
      from { opacity:0; transform: scale(0.88) translateY(16px); }
      to   { opacity:1; transform: scale(1) translateY(0); }
    }

    .dev-modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: rgba(240,240,245,0.35);
      cursor: pointer;
      font-size: 1.4rem;
      line-height: 1;
      padding: 4px 8px;
      border-radius: 6px;
      transition: color 0.2s;
    }
    .dev-modal-close:hover { color: rgba(240,240,245,0.8); }

    .dev-modal-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .dev-modal-icon svg {
      width: 40px;
      height: 40px;
      color: var(--orange, #ff5e1a);
      filter: drop-shadow(0 0 14px rgba(255,94,26,0.5));
    }

    .dev-modal-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.1rem;
      font-weight: 900;
      text-align: center;
      margin-bottom: 6px;
      background: linear-gradient(135deg, #ff8c42, #e63000);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .dev-modal-sub {
      font-size: 0.85rem;
      color: rgba(240,240,245,0.45);
      text-align: center;
      margin-bottom: 28px;
      line-height: 1.6;
    }

    .dev-form-label {
      display: block;
      font-size: 0.78rem;
      font-weight: 600;
      color: rgba(240,240,245,0.45);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 8px;
    }

    .dev-token-input {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 12px 16px;
      color: #f0f0f5;
      font-family: 'Inter', monospace;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      letter-spacing: 0.03em;
    }
    .dev-token-input:focus {
      border-color: rgba(255,94,26,0.5);
      box-shadow: 0 0 0 3px rgba(255,94,26,0.1);
    }
    .dev-token-input::placeholder {
      color: rgba(240,240,245,0.2);
      font-family: 'Inter', sans-serif;
      letter-spacing: 0;
    }

    .dev-hint {
      font-size: 0.75rem;
      color: rgba(240,240,245,0.3);
      margin-top: 8px;
      line-height: 1.5;
    }
    .dev-hint a {
      color: rgba(255,140,66,0.7);
      text-decoration: none;
    }
    .dev-hint a:hover { color: #ff8c42; }

    .dev-login-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      margin-top: 20px;
      padding: 13px 24px;
      border-radius: 10px;
      background: linear-gradient(135deg, #ff5e1a, #e63000);
      color: white;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 4px 20px rgba(255,94,26,0.3);
    }
    .dev-login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(255,94,26,0.5);
    }
    .dev-login-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .dev-login-btn .btn-spinner {
      width: 15px;
      height: 15px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: none;
    }
    .dev-login-btn.loading .btn-spinner { display: block; }
    .dev-login-btn.loading .btn-text   { display: none; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .dev-auth-msg {
      margin-top: 14px;
      font-size: 0.82rem;
      text-align: center;
      min-height: 18px;
      line-height: 1.5;
    }
    .dev-auth-msg.error { color: #f87171; }
    .dev-auth-msg.success { color: #86efac; }

    /* Logout confirm inside badge tooltip */
    .dev-logout-btn {
      display: none;
      position: fixed;
      bottom: 58px;
      right: 18px;
      z-index: 8001;
      padding: 6px 14px;
      border-radius: 8px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(240,240,245,0.55);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      backdrop-filter: blur(8px);
    }
    .dev-logout-btn:hover {
      color: #f87171;
      border-color: rgba(248,113,113,0.4);
    }
    .dev-logout-btn.visible { display: block; }
  `;
  document.head.appendChild(style);

  // ── DOM: hidden trigger (tiny lock icon, bottom-right) ───────────────────────
  const trigger = document.createElement('button');
  trigger.id = 'devLoginTrigger';
  trigger.title = '';
  trigger.setAttribute('aria-label', 'Developer login');
  trigger.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`;
  document.body.appendChild(trigger);

  // ── DOM: dev badge (shown when logged in) ────────────────────────────────────
  const badge = document.createElement('button');
  badge.id = 'devBadge';
  badge.innerHTML = `<span class="dev-dot"></span> Dev Mode`;
  document.body.appendChild(badge);

  // ── DOM: logout button ───────────────────────────────────────────────────────
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'dev-logout-btn';
  logoutBtn.textContent = 'Logout';
  document.body.appendChild(logoutBtn);

  // ── DOM: auth modal ──────────────────────────────────────────────────────────
  const modal = document.createElement('div');
  modal.id = 'devAuthModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'devModalTitle');
  modal.innerHTML = `
    <div class="dev-modal-box">
      <button class="dev-modal-close" aria-label="Close">&times;</button>

      <div class="dev-modal-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234
            c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729
            1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604
            -2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176
            0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404
            2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221
            0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576
            C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
      </div>

      <p class="dev-modal-title" id="devModalTitle">Developer Access</p>
      <p class="dev-modal-sub">
        Enter a GitHub Personal Access Token.<br>
        Access is granted only for <strong style="color:rgba(240,240,245,0.7)">KostyaMikh</strong>.
      </p>

      <label class="dev-form-label" for="devTokenInput">GitHub Token</label>
      <input
        type="password"
        id="devTokenInput"
        class="dev-token-input"
        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
        autocomplete="off"
        spellcheck="false"
      >
      <p class="dev-hint">
        Generate a token at
        <a href="https://github.com/settings/tokens/new?scopes=read:user&description=KBP+Dev+Tools" target="_blank" rel="noopener">
          GitHub → Settings → Developer settings → Tokens (classic)
        </a>. Only the <code>read:user</code> scope is needed.
      </p>

      <button class="dev-login-btn" id="devLoginBtn">
        <span class="btn-spinner"></span>
        <span class="btn-text">Verify &amp; Login</span>
      </button>
      <p class="dev-auth-msg" id="devAuthMsg"></p>
    </div>`;
  document.body.appendChild(modal);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function openModal() {
    modal.classList.add('open');
    document.getElementById('devTokenInput').focus();
    setMsg('', '');
  }

  function closeModal() {
    modal.classList.remove('open');
    document.getElementById('devTokenInput').value = '';
    setMsg('', '');
  }

  function setMsg(text, type) {
    const el = document.getElementById('devAuthMsg');
    el.textContent = text;
    el.className = 'dev-auth-msg' + (type ? ' ' + type : '');
  }

  function setLoading(on) {
    const btn = document.getElementById('devLoginBtn');
    btn.disabled = on;
    btn.classList.toggle('loading', on);
  }

  function activateDevMode(username) {
    trigger.style.display = 'none';
    badge.style.display = 'flex';
    logoutBtn.classList.remove('visible');

    // Fire a custom event so future dev-tools modules can react
    document.dispatchEvent(new CustomEvent('kbpDevLogin', { detail: { username } }));
    console.info('[KBP Dev] Authenticated as', username);
  }

  function deactivateDevMode() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
    badge.style.display = 'none';
    logoutBtn.classList.remove('visible');
    trigger.style.display = 'flex';
    document.dispatchEvent(new CustomEvent('kbpDevLogout'));
    console.info('[KBP Dev] Logged out');
  }

  // ── Verify token against GitHub API ─────────────────────────────────────────
  async function verifyToken(token) {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (res.status === 401) {
      throw new Error('Token is invalid or expired.');
    }
    if (!res.ok) {
      throw new Error('GitHub API error (' + res.status + '). Try again.');
    }

    const data = await res.json();
    return data.login; // e.g. "KostyaMikh"
  }

  // ── Login flow ───────────────────────────────────────────────────────────────
  async function handleLogin() {
    const token = document.getElementById('devTokenInput').value.trim();
    if (!token) {
      setMsg('Please enter your GitHub token.', 'error');
      return;
    }

    setLoading(true);
    setMsg('Contacting GitHub…', '');

    try {
      const login = await verifyToken(token);

      if (login !== REQUIRED_LOGIN) {
        setMsg('Access denied — this tool is for ' + REQUIRED_LOGIN + ' only.', 'error');
        setLoading(false);
        return;
      }

      // Persist in sessionStorage (cleared on tab close)
      sessionStorage.setItem(SESSION_KEY, token);
      sessionStorage.setItem(SESSION_USER_KEY, login);

      setMsg('✓ Authenticated as ' + login, 'success');
      setTimeout(() => {
        closeModal();
        activateDevMode(login);
      }, 700);

    } catch (err) {
      setMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Event listeners ──────────────────────────────────────────────────────────
  trigger.addEventListener('click', openModal);

  document.getElementById('devLoginBtn').addEventListener('click', handleLogin);

  document.getElementById('devTokenInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleLogin();
  });

  modal.querySelector('.dev-modal-close').addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Badge click toggles logout button
  badge.addEventListener('click', function () {
    logoutBtn.classList.toggle('visible');
  });

  logoutBtn.addEventListener('click', deactivateDevMode);

  // Hide logout popup when clicking elsewhere
  document.addEventListener('click', function (e) {
    if (e.target !== badge && e.target !== logoutBtn) {
      logoutBtn.classList.remove('visible');
    }
  });

  // ── Restore session on page load ─────────────────────────────────────────────
  (function restoreSession() {
    const savedToken = sessionStorage.getItem(SESSION_KEY);
    const savedUser  = sessionStorage.getItem(SESSION_USER_KEY);
    if (savedToken && savedUser === REQUIRED_LOGIN) {
      // Re-verify silently in the background
      verifyToken(savedToken)
        .then(function (login) {
          if (login === REQUIRED_LOGIN) {
            activateDevMode(login);
          } else {
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_USER_KEY);
          }
        })
        .catch(function () {
          sessionStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_USER_KEY);
        });
    }
  })();

})();
