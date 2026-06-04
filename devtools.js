// ===== KBP DEV TOOLS =====
// Step 1 — GitHub auth gate (KostyaMikh only)
// Step 2 — Dev panel: Theme colours · Presentation manager · New presentation creator

(function () {
  'use strict';

  const REQUIRED_LOGIN   = 'KostyaMikh';
  const SESSION_KEY      = 'kbp_dev_token';
  const SESSION_USER_KEY = 'kbp_dev_user';
  const STORAGE_COLORS   = 'kbp_dev_colors';
  const STORAGE_ORDER    = 'kbp_dev_order';
  const STORAGE_THUMBS   = 'kbp_dev_thumbs';
  const STORAGE_CUSTOM   = 'kbp_dev_custom_cards';

  // ─────────────────────────────────────────────────────────────────────────────
  // CSS
  // ─────────────────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* ── Auth trigger ── */
    #devLoginTrigger {
      position: fixed; bottom: 18px; right: 18px;
      width: 32px; height: 32px; opacity: 0.12; cursor: pointer;
      z-index: 8000; transition: opacity 0.25s;
      background: none; border: none; padding: 0;
      display: flex; align-items: center; justify-content: center;
      color: var(--text);
    }
    #devLoginTrigger:hover { opacity: 0.55; }
    #devLoginTrigger svg { width: 22px; height: 22px; }

    /* ── Dev badge ── */
    #devBadge {
      position: fixed; bottom: 18px; right: 18px;
      z-index: 8000; display: none; align-items: center;
      gap: 7px; padding: 7px 14px; border-radius: 50px;
      background: linear-gradient(135deg,rgba(255,94,26,.18),rgba(230,48,0,.14));
      border: 1px solid rgba(255,94,26,.4); backdrop-filter: blur(12px);
      font-size: .78rem; font-weight: 700; color: var(--orange,#ff5e1a);
      cursor: pointer; font-family: 'Orbitron',sans-serif;
      letter-spacing: .08em; text-transform: uppercase;
      transition: box-shadow .25s;
    }
    #devBadge:hover { box-shadow: 0 4px 20px rgba(255,94,26,.35); }
    #devBadge .dev-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #ff5e1a; animation: devDotPulse 2s ease-in-out infinite;
    }
    @keyframes devDotPulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(255,94,26,0); }
      50%      { box-shadow: 0 0 0 5px rgba(255,94,26,.25); }
    }

    /* ── Logout btn ── */
    .dev-logout-btn {
      display: none; position: fixed; bottom: 58px; right: 18px;
      z-index: 8001; padding: 6px 14px; border-radius: 8px;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      color: rgba(240,240,245,.55); font-size: .75rem; font-weight: 600;
      cursor: pointer; transition: all .2s; backdrop-filter: blur(8px);
    }
    .dev-logout-btn:hover { color: #f87171; border-color: rgba(248,113,113,.4); }
    .dev-logout-btn.visible { display: block; }

    /* ── Auth modal ── */
    #devAuthModal {
      display: none; position: fixed; inset: 0; z-index: 9100;
      align-items: center; justify-content: center;
      background: rgba(8,8,16,.82); backdrop-filter: blur(8px); padding: 20px;
    }
    #devAuthModal.open { display: flex; }
    .dev-modal-box {
      background: #0f0f1a; border: 1px solid rgba(255,94,26,.25);
      border-radius: 20px; padding: 40px 36px; max-width: 420px; width: 100%;
      position: relative;
      box-shadow: 0 24px 80px rgba(0,0,0,.7),0 0 60px rgba(255,94,26,.08);
      animation: devModalIn .3s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes devModalIn {
      from { opacity:0; transform: scale(.88) translateY(16px); }
      to   { opacity:1; transform: scale(1)  translateY(0);    }
    }
    .dev-modal-close {
      position: absolute; top: 16px; right: 16px;
      background: none; border: none; color: rgba(240,240,245,.35);
      cursor: pointer; font-size: 1.4rem; line-height: 1;
      padding: 4px 8px; border-radius: 6px; transition: color .2s;
    }
    .dev-modal-close:hover { color: rgba(240,240,245,.8); }
    .dev-modal-icon { display: flex; justify-content: center; margin-bottom: 20px; }
    .dev-modal-icon svg {
      width: 40px; height: 40px; color: var(--orange,#ff5e1a);
      filter: drop-shadow(0 0 14px rgba(255,94,26,.5));
    }
    .dev-modal-title {
      font-family: 'Orbitron',sans-serif; font-size: 1.1rem; font-weight: 900;
      text-align: center; margin-bottom: 6px;
      background: linear-gradient(135deg,#ff8c42,#e63000);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .dev-modal-sub {
      font-size: .85rem; color: rgba(240,240,245,.45);
      text-align: center; margin-bottom: 28px; line-height: 1.6;
    }
    .dev-form-label {
      display: block; font-size: .78rem; font-weight: 600;
      color: rgba(240,240,245,.45); text-transform: uppercase;
      letter-spacing: .1em; margin-bottom: 8px;
    }
    .dev-token-input {
      width: 100%; background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1); border-radius: 10px;
      padding: 12px 16px; color: #f0f0f5;
      font-family: 'Inter',monospace; font-size: .88rem; outline: none;
      transition: border-color .2s,box-shadow .2s; letter-spacing: .03em;
    }
    .dev-token-input:focus {
      border-color: rgba(255,94,26,.5); box-shadow: 0 0 0 3px rgba(255,94,26,.1);
    }
    .dev-token-input::placeholder { color: rgba(240,240,245,.2); letter-spacing: 0; }
    .dev-hint { font-size: .75rem; color: rgba(240,240,245,.3); margin-top: 8px; line-height: 1.5; }
    .dev-hint a { color: rgba(255,140,66,.7); text-decoration: none; }
    .dev-hint a:hover { color: #ff8c42; }
    .dev-login-btn {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; width: 100%; margin-top: 20px; padding: 13px 24px;
      border-radius: 10px; background: linear-gradient(135deg,#ff5e1a,#e63000);
      color: white; font-family: 'Orbitron',sans-serif;
      font-size: .82rem; font-weight: 700; letter-spacing: .08em;
      text-transform: uppercase; border: none; cursor: pointer;
      transition: all .25s; box-shadow: 0 4px 20px rgba(255,94,26,.3);
    }
    .dev-login-btn:hover:not(:disabled) {
      transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,94,26,.5);
    }
    .dev-login-btn:disabled { opacity: .55; cursor: not-allowed; }
    .dev-login-btn .btn-spinner {
      width: 15px; height: 15px;
      border: 2px solid rgba(255,255,255,.3); border-top-color: white;
      border-radius: 50%; animation: spin .7s linear infinite; display: none;
    }
    .dev-login-btn.loading .btn-spinner { display: block; }
    .dev-login-btn.loading .btn-text   { display: none; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .dev-auth-msg {
      margin-top: 14px; font-size: .82rem; text-align: center;
      min-height: 18px; line-height: 1.5;
    }
    .dev-auth-msg.error   { color: #f87171; }
    .dev-auth-msg.success { color: #86efac; }

    /* ════════════════════════════════════════════
       DEV PANEL
    ════════════════════════════════════════════ */
    #devPanel {
      display: none;
      position: fixed; top: 0; right: 0; bottom: 0;
      width: 380px; max-width: 100vw;
      z-index: 9050;
      background: #0c0c18;
      border-left: 1px solid rgba(255,94,26,.18);
      box-shadow: -12px 0 60px rgba(0,0,0,.6);
      flex-direction: column;
      overflow: hidden;
      transform: translateX(100%);
      transition: transform .35s cubic-bezier(.4,0,.2,1);
    }
    #devPanel.open {
      display: flex;
      transform: translateX(0);
    }

    /* Panel header */
    .dp-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,.06);
      flex-shrink: 0;
    }
    .dp-title {
      font-family: 'Orbitron',sans-serif; font-size: .78rem; font-weight: 900;
      letter-spacing: .15em; text-transform: uppercase;
      background: linear-gradient(135deg,#ff8c42,#e63000);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .dp-close {
      background: none; border: none; color: rgba(240,240,245,.35);
      cursor: pointer; font-size: 1.3rem; padding: 2px 8px;
      border-radius: 6px; transition: color .2s; line-height: 1;
    }
    .dp-close:hover { color: rgba(240,240,245,.8); }

    /* Tab bar */
    .dp-tabs {
      display: flex; border-bottom: 1px solid rgba(255,255,255,.06);
      flex-shrink: 0;
    }
    .dp-tab {
      flex: 1; padding: 12px 4px; background: none; border: none;
      color: rgba(240,240,245,.35); font-size: .7rem; font-weight: 600;
      font-family: 'Inter',sans-serif; cursor: pointer;
      text-transform: uppercase; letter-spacing: .08em;
      border-bottom: 2px solid transparent;
      transition: color .2s, border-color .2s;
    }
    .dp-tab:hover { color: rgba(240,240,245,.65); }
    .dp-tab.active {
      color: #ff8c42; border-bottom-color: #ff5e1a;
    }

    /* Scrollable body */
    .dp-body {
      flex: 1; overflow-y: auto; padding: 20px;
      scrollbar-width: thin; scrollbar-color: rgba(255,94,26,.2) transparent;
    }
    .dp-body::-webkit-scrollbar { width: 4px; }
    .dp-body::-webkit-scrollbar-thumb { background: rgba(255,94,26,.2); border-radius: 2px; }

    /* Tab panes */
    .dp-pane { display: none; }
    .dp-pane.active { display: block; }

    /* Section headings inside panel */
    .dp-section-title {
      font-size: .7rem; font-weight: 700; letter-spacing: .14em;
      text-transform: uppercase; color: rgba(240,240,245,.3);
      margin: 0 0 12px;
    }
    .dp-divider {
      border: none; border-top: 1px solid rgba(255,255,255,.06);
      margin: 20px 0;
    }

    /* ── Colour rows ── */
    .dp-color-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; border-radius: 10px;
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
      margin-bottom: 8px;
    }
    .dp-color-label {
      font-size: .82rem; color: rgba(240,240,245,.65); font-weight: 500;
    }
    .dp-color-swatch {
      display: flex; align-items: center; gap: 10px;
    }
    .dp-color-preview {
      width: 24px; height: 24px; border-radius: 6px;
      border: 1px solid rgba(255,255,255,.15); cursor: pointer;
      transition: transform .2s;
    }
    .dp-color-preview:hover { transform: scale(1.15); }
    input[type="color"].dp-color-picker {
      width: 0; height: 0; opacity: 0; position: absolute; pointer-events: none;
    }
    .dp-color-value {
      font-size: .75rem; color: rgba(240,240,245,.3);
      font-family: monospace;
    }
    .dp-reset-color {
      background: none; border: none; cursor: pointer;
      color: rgba(240,240,245,.25); font-size: .7rem; padding: 2px 6px;
      border-radius: 4px; transition: color .2s;
    }
    .dp-reset-color:hover { color: #f87171; }

    /* Save colours button */
    .dp-save-btn {
      display: flex; align-items: center; justify-content: center;
      gap: 8px; width: 100%; margin-top: 16px;
      padding: 11px 20px; border-radius: 10px;
      background: linear-gradient(135deg,#ff5e1a,#e63000);
      color: white; font-family: 'Orbitron',sans-serif;
      font-size: .72rem; font-weight: 700; letter-spacing: .1em;
      text-transform: uppercase; border: none; cursor: pointer;
      transition: all .25s; box-shadow: 0 4px 16px rgba(255,94,26,.25);
    }
    .dp-save-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,94,26,.45); }
    .dp-save-btn.secondary {
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1);
      color: rgba(240,240,245,.6);
      box-shadow: none; margin-top: 8px;
    }
    .dp-save-btn.secondary:hover {
      background: rgba(255,255,255,.08); color: rgba(240,240,245,.9); transform: none;
    }

    /* ── Presentation list (manager tab) ── */
    .dp-card-list { display: flex; flex-direction: column; gap: 10px; }
    .dp-card-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 10px;
      background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
      cursor: grab;
    }
    .dp-card-item:active { cursor: grabbing; }
    .dp-card-item.dragging { opacity: .4; }
    .dp-card-item.drag-over { border-color: rgba(255,94,26,.5); background: rgba(255,94,26,.06); }
    .dp-card-thumb {
      width: 52px; height: 32px; border-radius: 5px; object-fit: cover;
      background: #1a1a2e; flex-shrink: 0;
    }
    .dp-card-info { flex: 1; min-width: 0; }
    .dp-card-name {
      font-size: .82rem; font-weight: 600; color: rgba(240,240,245,.8);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .dp-card-lang {
      font-size: .68rem; color: rgba(240,240,245,.3); margin-top: 2px;
    }
    .dp-drag-handle {
      color: rgba(240,240,245,.2); font-size: .9rem;
      flex-shrink: 0; user-select: none; padding: 0 4px;
    }
    /* Thumb replace button */
    .dp-thumb-btn {
      background: none; border: 1px solid rgba(255,255,255,.1);
      border-radius: 6px; color: rgba(240,240,245,.4);
      font-size: .65rem; padding: 4px 8px; cursor: pointer;
      transition: all .2s; white-space: nowrap; flex-shrink: 0;
    }
    .dp-thumb-btn:hover { border-color: rgba(255,94,26,.4); color: #ff8c42; }

    /* ── New presentation form ── */
    .dp-field { margin-bottom: 14px; }
    .dp-field label {
      display: block; font-size: .72rem; font-weight: 600;
      color: rgba(240,240,245,.35); text-transform: uppercase;
      letter-spacing: .1em; margin-bottom: 6px;
    }
    .dp-field input, .dp-field select, .dp-field textarea {
      width: 100%; background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1); border-radius: 8px;
      padding: 10px 12px; color: #f0f0f5;
      font-family: 'Inter',sans-serif; font-size: .85rem; outline: none;
      transition: border-color .2s;
    }
    .dp-field input:focus, .dp-field select:focus, .dp-field textarea:focus {
      border-color: rgba(255,94,26,.45);
    }
    .dp-field input::placeholder, .dp-field textarea::placeholder {
      color: rgba(240,240,245,.2);
    }
    .dp-field select option { background: #0c0c18; }
    .dp-field textarea { resize: vertical; min-height: 64px; }

    /* Buttons row in new card form */
    .dp-btn-group { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .dp-btn-chip {
      padding: 6px 12px; border-radius: 6px; font-size: .72rem; font-weight: 600;
      background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
      color: rgba(240,240,245,.5); cursor: pointer; transition: all .2s;
    }
    .dp-btn-chip:hover { border-color: rgba(255,94,26,.4); color: #ff8c42; }
    .dp-remove-btn {
      background: none; border: none; color: rgba(248,113,113,.5);
      cursor: pointer; font-size: .8rem; padding: 0 4px;
      transition: color .2s;
    }
    .dp-remove-btn:hover { color: #f87171; }
    .dp-btn-entry {
      display: flex; gap: 6px; align-items: center; margin-bottom: 6px;
    }
    .dp-btn-entry input { flex: 1; }
    .dp-add-btn-link {
      background: none; border: none; color: rgba(255,140,66,.6);
      font-size: .75rem; cursor: pointer; padding: 4px 0;
      text-decoration: underline; transition: color .2s;
    }
    .dp-add-btn-link:hover { color: #ff8c42; }

    /* Status badge preview */
    .dp-status-row {
      display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;
    }
    .dp-status-chip {
      padding: 6px 14px; border-radius: 6px; font-size: .72rem; font-weight: 700;
      cursor: pointer; border: 1px solid transparent; transition: all .2s;
      opacity: .5;
    }
    .dp-status-chip.selected { opacity: 1; }
    .dp-status-chip.available  { background: rgba(255,94,26,.12);  border-color: rgba(255,94,26,.35);  color: #ff8c42; }
    .dp-status-chip.early      { background: rgba(245,158,11,.12); border-color: rgba(245,158,11,.35); color: #f59e0b; }
    .dp-status-chip.coming     { background: rgba(134,239,172,.1); border-color: rgba(134,239,172,.3); color: #86efac; }

    /* Toast */
    #devToast {
      position: fixed; bottom: 80px; right: 24px; z-index: 9200;
      padding: 10px 18px; border-radius: 10px;
      background: rgba(15,15,26,.95); border: 1px solid rgba(255,94,26,.3);
      color: #f0f0f5; font-size: .82rem; font-weight: 500;
      backdrop-filter: blur(12px);
      transform: translateY(16px); opacity: 0;
      transition: all .3s; pointer-events: none;
    }
    #devToast.show { transform: translateY(0); opacity: 1; }
    #devToast.success { border-color: rgba(134,239,172,.4); color: #86efac; }
    #devToast.error   { border-color: rgba(248,113,113,.4); color: #f87171; }
  `;
  document.head.appendChild(style);

  // ─────────────────────────────────────────────────────────────────────────────
  // DOM — fixed elements
  // ─────────────────────────────────────────────────────────────────────────────
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'className') node.className = v;
      else if (k === 'innerHTML') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    });
    children.forEach(c => c && node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  }

  // Auth trigger
  const trigger = el('button', { id: 'devLoginTrigger', 'aria-label': 'Developer login',
    innerHTML: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` });
  document.body.appendChild(trigger);

  // Dev badge
  const badge = el('button', { id: 'devBadge', innerHTML: '<span class="dev-dot"></span> Dev Mode' });
  document.body.appendChild(badge);

  // Logout btn
  const logoutBtn = el('button', { className: 'dev-logout-btn' }, 'Logout');
  document.body.appendChild(logoutBtn);

  // Toast
  const toast = el('div', { id: 'devToast' });
  document.body.appendChild(toast);
  let toastTimer;
  function showToast(msg, type = '') {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = type ? 'show ' + type : 'show';
    toastTimer = setTimeout(() => { toast.className = type; }, 2800);
  }

  // Auth modal
  const modal = el('div', { id: 'devAuthModal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'devModalTitle' });
  modal.innerHTML = `
    <div class="dev-modal-box">
      <button class="dev-modal-close" aria-label="Close">&times;</button>
      <div class="dev-modal-icon">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
      </div>
      <p class="dev-modal-title" id="devModalTitle">Developer Access</p>
      <p class="dev-modal-sub">Enter a GitHub Personal Access Token.<br>Access is granted only for <strong style="color:rgba(240,240,245,.7)">KostyaMikh</strong>.</p>
      <label class="dev-form-label" for="devTokenInput">GitHub Token</label>
      <input type="password" id="devTokenInput" class="dev-token-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false">
      <p class="dev-hint">Generate at <a href="https://github.com/settings/tokens/new?scopes=read:user&description=KBP+Dev+Tools" target="_blank" rel="noopener">GitHub → Settings → Tokens (classic)</a>. Only <code>read:user</code> scope needed.</p>
      <button class="dev-login-btn" id="devLoginBtn">
        <span class="btn-spinner"></span><span class="btn-text">Verify &amp; Login</span>
      </button>
      <p class="dev-auth-msg" id="devAuthMsg"></p>
    </div>`;
  document.body.appendChild(modal);

  // ─────────────────────────────────────────────────────────────────────────────
  // DEV PANEL
  // ─────────────────────────────────────────────────────────────────────────────
  const panel = el('div', { id: 'devPanel', role: 'complementary', 'aria-label': 'Developer tools panel' });
  panel.innerHTML = `
    <div class="dp-header">
      <span class="dp-title">🛠 Dev Tools</span>
      <button class="dp-close" aria-label="Close panel">&times;</button>
    </div>
    <div class="dp-tabs">
      <button class="dp-tab active" data-tab="colors">🎨 Theme</button>
      <button class="dp-tab" data-tab="manager">🖼 Cards</button>
      <button class="dp-tab" data-tab="new">➕ New</button>
    </div>
    <div class="dp-body">

      <!-- ── THEME TAB ── -->
      <div class="dp-pane active" id="dpPane-colors">
        <p class="dp-section-title">Site Colours</p>
        <div id="dpColorRows"></div>
        <button class="dp-save-btn" id="dpSaveColors">Save Colors</button>
        <button class="dp-save-btn secondary" id="dpResetColors">Reset to Defaults</button>
      </div>

      <!-- ── MANAGER TAB ── -->
      <div class="dp-pane" id="dpPane-manager">
        <p class="dp-section-title">Drag to reorder · Click thumbnail to replace</p>
        <div class="dp-card-list" id="dpCardList"></div>
        <button class="dp-save-btn" id="dpSaveOrder" style="margin-top:16px">Save Order</button>
      </div>

      <!-- ── NEW CARD TAB ── -->
      <div class="dp-pane" id="dpPane-new">
        <p class="dp-section-title">Create New Presentation Card</p>

        <div class="dp-field">
          <label>Title</label>
          <input type="text" id="dpNewTitle" placeholder="e.g. Jurassic Park">
        </div>
        <div class="dp-field">
          <label>Theme / Subject</label>
          <input type="text" id="dpNewTheme" placeholder="e.g. Literature &amp; Science">
        </div>
        <div class="dp-field">
          <label>Language</label>
          <select id="dpNewLang">
            <option value="polski">Polski</option>
            <option value="english">English</option>
            <option value="espanol">Español</option>
          </select>
        </div>
        <div class="dp-field">
          <label>Thumbnail URL</label>
          <input type="url" id="dpNewThumb" placeholder="https://... or leave blank">
        </div>
        <div class="dp-field">
          <label>Status</label>
          <div class="dp-status-row" id="dpStatusRow">
            <span class="dp-status-chip available selected" data-status="available">✅ Available</span>
            <span class="dp-status-chip early" data-status="early">🔓 Early Access</span>
            <span class="dp-status-chip coming" data-status="coming">⏳ Coming Soon</span>
          </div>
        </div>

        <hr class="dp-divider">
        <p class="dp-section-title">Buttons</p>
        <div id="dpBtnList"></div>
        <button class="dp-add-btn-link" id="dpAddBtn">+ Add button</button>

        <hr class="dp-divider">
        <button class="dp-save-btn" id="dpPublishCard">Publish Card</button>
      </div>

    </div>`;
  document.body.appendChild(panel);

  // ─────────────────────────────────────────────────────────────────────────────
  // COLOUR DEFINITIONS
  // ─────────────────────────────────────────────────────────────────────────────
  const COLOR_DEFS = [
    { label: 'Primary Orange', varName: '--orange',       default: '#ff5e1a' },
    { label: 'Light Orange',   varName: '--orange-light', default: '#ff8c42' },
    { label: 'Red',            varName: '--red',          default: '#e63000' },
    { label: 'Background',     varName: '--bg',           default: '#080810' },
    { label: 'Text',           varName: '--text',         default: '#f0f0f5' },
  ];

  function loadSavedColors() {
    try { return JSON.parse(localStorage.getItem(STORAGE_COLORS) || '{}'); } catch { return {}; }
  }
  function applyColors(map) {
    const root = document.documentElement;
    COLOR_DEFS.forEach(d => {
      const v = map[d.varName] || d.default;
      root.style.setProperty(d.varName, v);
    });
  }

  // Apply on page load immediately
  applyColors(loadSavedColors());

  function buildColorRows() {
    const container = document.getElementById('dpColorRows');
    if (!container) return;
    container.innerHTML = '';
    const saved = loadSavedColors();

    COLOR_DEFS.forEach(def => {
      const current = saved[def.varName] || def.default;
      const row = el('div', { className: 'dp-color-row' });

      const pickerId = 'dpPicker-' + def.varName.replace(/--/g,'');
      const previewId = 'dpPreview-' + def.varName.replace(/--/g,'');
      const valueId = 'dpValue-' + def.varName.replace(/--/g,'');

      row.innerHTML = `
        <span class="dp-color-label">${def.label}</span>
        <div class="dp-color-swatch">
          <button class="dp-reset-color" title="Reset to default" data-var="${def.varName}">↺</button>
          <span class="dp-color-value" id="${valueId}">${current}</span>
          <div class="dp-color-preview" id="${previewId}" style="background:${current}" title="Click to pick colour"></div>
          <input type="color" class="dp-color-picker" id="${pickerId}" value="${current}">
        </div>`;
      container.appendChild(row);

      const preview = row.querySelector('.dp-color-preview');
      const picker  = row.querySelector('.dp-color-picker');
      const valueEl = row.querySelector('.dp-color-value');
      const resetBtn = row.querySelector('.dp-reset-color');

      preview.addEventListener('click', () => picker.click());
      picker.addEventListener('input', () => {
        const v = picker.value;
        preview.style.background = v;
        valueEl.textContent = v;
        // Live preview on page
        document.documentElement.style.setProperty(def.varName, v);
      });
      resetBtn.addEventListener('click', () => {
        picker.value = def.default;
        preview.style.background = def.default;
        valueEl.textContent = def.default;
        document.documentElement.style.setProperty(def.varName, def.default);
      });
    });
  }

  document.getElementById('dpSaveColors').addEventListener('click', () => {
    const map = {};
    COLOR_DEFS.forEach(def => {
      const picker = document.getElementById('dpPicker-' + def.varName.replace(/--/g,''));
      if (picker) map[def.varName] = picker.value;
    });
    localStorage.setItem(STORAGE_COLORS, JSON.stringify(map));
    applyColors(map);
    showToast('Colors saved ✓', 'success');
  });

  document.getElementById('dpResetColors').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_COLORS);
    applyColors({});
    buildColorRows();
    showToast('Colors reset to defaults', '');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PRESENTATION MANAGER
  // ─────────────────────────────────────────────────────────────────────────────
  function getCardsFromDOM() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return [];
    return Array.from(grid.querySelectorAll('.pres-card[data-id]')).map(c => ({
      id:    c.dataset.id,
      title: c.querySelector('.card-title')?.textContent?.trim() || '',
      lang:  c.dataset.lang || '',
      thumb: c.querySelector('.card-thumb img')?.src || '',
    }));
  }

  function loadSavedThumbs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_THUMBS) || '{}'); } catch { return {}; }
  }

  function applyThumbs() {
    const thumbs = loadSavedThumbs();
    Object.entries(thumbs).forEach(([id, src]) => {
      const card = document.querySelector(`.pres-card[data-id="${id}"] .card-thumb img`);
      if (card) card.src = src;
    });
  }

  function applyOrder() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;
    const order = JSON.parse(localStorage.getItem(STORAGE_ORDER) || '[]');
    if (!order.length) return;
    order.forEach(id => {
      const card = grid.querySelector(`.pres-card[data-id="${id}"]`);
      if (card) grid.appendChild(card);
    });
  }

  function buildManagerTab() {
    const list = document.getElementById('dpCardList');
    if (!list) return;
    list.innerHTML = '';
    const cards = getCardsFromDOM();
    if (!cards.length) {
      list.innerHTML = '<p style="font-size:.8rem;color:rgba(240,240,245,.3);text-align:center;padding:20px">No cards found.<br>Add data-id attributes to your .pres-card elements.</p>';
      return;
    }

    cards.forEach((card, i) => {
      const item = el('div', { className: 'dp-card-item', draggable: 'true', 'data-id': card.id });
      item.innerHTML = `
        <span class="dp-drag-handle" title="Drag to reorder">⠿</span>
        <img class="dp-card-thumb" src="${card.thumb}" alt="" onerror="this.src='thumbnails/no_thumbnail.jpg'">
        <div class="dp-card-info">
          <div class="dp-card-name">${card.title || '(untitled)'}</div>
          <div class="dp-card-lang">${card.lang}</div>
        </div>
        <button class="dp-thumb-btn" title="Replace thumbnail">🖼 Thumb</button>`;
      list.appendChild(item);

      // Hidden file input for thumb replacement
      const fileInput = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
      document.body.appendChild(fileInput);

      item.querySelector('.dp-thumb-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = ev.target.result;
          // Update in DOM
          const domImg = document.querySelector(`.pres-card[data-id="${card.id}"] .card-thumb img`);
          if (domImg) domImg.src = src;
          // Update preview
          item.querySelector('.dp-card-thumb').src = src;
          // Persist
          const thumbs = loadSavedThumbs();
          thumbs[card.id] = src;
          localStorage.setItem(STORAGE_THUMBS, JSON.stringify(thumbs));
          showToast('Thumbnail updated ✓', 'success');
        };
        reader.readAsDataURL(file);
      });
    });

    // Drag-and-drop reorder
    let dragSrc = null;
    list.addEventListener('dragstart', e => {
      dragSrc = e.target.closest('.dp-card-item');
      if (dragSrc) dragSrc.classList.add('dragging');
    });
    list.addEventListener('dragover', e => {
      e.preventDefault();
      const target = e.target.closest('.dp-card-item');
      if (target && target !== dragSrc) {
        list.querySelectorAll('.dp-card-item').forEach(i => i.classList.remove('drag-over'));
        target.classList.add('drag-over');
      }
    });
    list.addEventListener('drop', e => {
      e.preventDefault();
      const target = e.target.closest('.dp-card-item');
      if (target && dragSrc && target !== dragSrc) {
        const items = Array.from(list.querySelectorAll('.dp-card-item'));
        const srcIdx = items.indexOf(dragSrc);
        const tgtIdx = items.indexOf(target);
        if (srcIdx < tgtIdx) list.insertBefore(dragSrc, target.nextSibling);
        else list.insertBefore(dragSrc, target);
      }
      list.querySelectorAll('.dp-card-item').forEach(i => i.classList.remove('drag-over', 'dragging'));
      dragSrc = null;
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.dp-card-item').forEach(i => i.classList.remove('dragging', 'drag-over'));
      dragSrc = null;
    });
  }

  document.getElementById('dpSaveOrder').addEventListener('click', () => {
    const items = document.querySelectorAll('#dpCardList .dp-card-item');
    const order = Array.from(items).map(i => i.dataset.id);
    localStorage.setItem(STORAGE_ORDER, JSON.stringify(order));
    // Apply to real DOM
    const grid = document.getElementById('catalogGrid');
    if (grid) {
      order.forEach(id => {
        const card = grid.querySelector(`.pres-card[data-id="${id}"]`);
        if (card) grid.appendChild(card);
      });
    }
    showToast('Order saved ✓', 'success');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // NEW PRESENTATION CARD
  // ─────────────────────────────────────────────────────────────────────────────
  let selectedStatus = 'available';

  document.getElementById('dpStatusRow').addEventListener('click', e => {
    const chip = e.target.closest('.dp-status-chip');
    if (!chip) return;
    document.querySelectorAll('.dp-status-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    selectedStatus = chip.dataset.status;
  });

  let buttonEntries = [];

  function renderBtnList() {
    const container = document.getElementById('dpBtnList');
    container.innerHTML = '';
    buttonEntries.forEach((btn, i) => {
      const row = el('div', { className: 'dp-btn-entry' });
      row.innerHTML = `
        <input type="text" placeholder="Button label" value="${btn.label || ''}" data-i="${i}" data-field="label">
        <input type="url"  placeholder="https://..." value="${btn.url || ''}" data-i="${i}" data-field="url">
        <button class="dp-remove-btn" data-i="${i}">✕</button>`;
      row.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => {
          buttonEntries[+inp.dataset.i][inp.dataset.field] = inp.value;
        });
      });
      row.querySelector('.dp-remove-btn').addEventListener('click', () => {
        buttonEntries.splice(+row.querySelector('.dp-remove-btn').dataset.i, 1);
        renderBtnList();
      });
      container.appendChild(row);
    });
  }

  document.getElementById('dpAddBtn').addEventListener('click', () => {
    buttonEntries.push({ label: '', url: '' });
    renderBtnList();
  });

  // Default one button
  buttonEntries = [{ label: 'View Presentation', url: '' }];
  renderBtnList();

  function buildCardHTML(data) {
    const langClass = { polski: 'polski', english: 'english', espanol: 'espanol' }[data.lang] || 'english';
    const langLabel = { polski: 'Polski', english: 'English', espanol: 'Español' }[data.lang] || data.lang;
    const thumbSrc  = data.thumb || 'thumbnails/no_thumbnail.jpg';
    const id        = 'custom-' + Date.now();

    let statusHTML = '';
    if (data.status === 'early') {
      statusHTML = `<span class="card-btn coming-soon-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:none;cursor:default;">🔓 Early Access</span>`;
    } else if (data.status === 'coming') {
      statusHTML = `<span class="card-btn coming-soon-btn">⏳ Wkrótce dostępne</span>`;
    }

    const buttonsHTML = data.buttons.map(b => {
      if (!b.label || !b.url) return '';
      return `<a href="${b.url}" target="_blank" class="card-btn">${b.label}</a>`;
    }).join('');

    return `
      <div class="pres-card glass" data-lang="${data.lang}" data-id="${id}">
        <div class="card-glow"></div>
        <a href="${data.buttons[0]?.url || '#'}" target="_blank" class="card-thumb-link">
          <div class="card-thumb">
            <img src="${thumbSrc}" alt="${data.title}" onerror="this.src='thumbnails/no_thumbnail.jpg'">
            <div class="thumb-overlay">
              <span class="thumb-play">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </span>
            </div>
          </div>
        </a>
        <div class="card-body">
          <div class="card-top">
            <span class="lang-badge ${langClass}">${langLabel}</span>
            <span class="theme-tag">${data.theme}</span>
          </div>
          <h3 class="card-title">${data.title}</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:2px;">
            ${statusHTML}
            ${buttonsHTML}
          </div>
        </div>
      </div>`;
  }

  document.getElementById('dpPublishCard').addEventListener('click', () => {
    const title = document.getElementById('dpNewTitle').value.trim();
    const theme = document.getElementById('dpNewTheme').value.trim();
    const lang  = document.getElementById('dpNewLang').value;
    const thumb = document.getElementById('dpNewThumb').value.trim();

    if (!title) { showToast('Title is required', 'error'); return; }

    const data = { title, theme, lang, thumb, status: selectedStatus, buttons: buttonEntries.filter(b => b.label) };
    const html = buildCardHTML(data);

    // Inject as first card (per catalog rules)
    const grid = document.getElementById('catalogGrid');
    if (grid) {
      grid.insertAdjacentHTML('afterbegin', html);
      // Persist
      const customs = JSON.parse(localStorage.getItem(STORAGE_CUSTOM) || '[]');
      customs.unshift({ ...data, id: 'custom-' + Date.now() });
      localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(customs));
      showToast('Card published ✓', 'success');
      // Reset form
      document.getElementById('dpNewTitle').value = '';
      document.getElementById('dpNewTheme').value = '';
      document.getElementById('dpNewThumb').value = '';
      buttonEntries = [{ label: 'View Presentation', url: '' }];
      renderBtnList();
      // Refresh manager
      buildManagerTab();
    } else {
      showToast('No catalog grid found on this page', 'error');
    }
  });

  // Inject any previously saved custom cards on page load
  function injectSavedCustomCards() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;
    const customs = JSON.parse(localStorage.getItem(STORAGE_CUSTOM) || '[]');
    customs.forEach(data => {
      grid.insertAdjacentHTML('afterbegin', buildCardHTML(data));
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PANEL OPEN / CLOSE
  // ─────────────────────────────────────────────────────────────────────────────
  function openPanel() {
    panel.classList.add('open');
    buildColorRows();
    buildManagerTab();
    // Init button list
    renderBtnList();
  }

  function closePanel() {
    panel.classList.remove('open');
  }

  panel.querySelector('.dp-close').addEventListener('click', closePanel);

  // Tab switching
  panel.querySelectorAll('.dp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.dp-tab').forEach(t => t.classList.remove('active'));
      panel.querySelectorAll('.dp-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('dpPane-' + tab.dataset.tab).classList.add('active');
      // Refresh manager list when switching to it
      if (tab.dataset.tab === 'manager') buildManagerTab();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('open')) closeModal();
      else if (panel.classList.contains('open')) closePanel();
    }
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTH HELPERS
  // ─────────────────────────────────────────────────────────────────────────────
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
    const msgEl = document.getElementById('devAuthMsg');
    msgEl.textContent = text;
    msgEl.className = 'dev-auth-msg' + (type ? ' ' + type : '');
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
    document.dispatchEvent(new CustomEvent('kbpDevLogin', { detail: { username } }));
    console.info('[KBP Dev] Authenticated as', username);
  }

  function deactivateDevMode() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
    badge.style.display = 'none';
    logoutBtn.classList.remove('visible');
    trigger.style.display = 'flex';
    closePanel();
    document.dispatchEvent(new CustomEvent('kbpDevLogout'));
  }

  async function verifyToken(token) {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (res.status === 401) throw new Error('Token is invalid or expired.');
    if (!res.ok) throw new Error('GitHub API error (' + res.status + '). Try again.');
    const data = await res.json();
    return data.login;
  }

  async function handleLogin() {
    const token = document.getElementById('devTokenInput').value.trim();
    if (!token) { setMsg('Please enter your GitHub token.', 'error'); return; }
    setLoading(true);
    setMsg('Contacting GitHub…', '');
    try {
      const login = await verifyToken(token);
      if (login !== REQUIRED_LOGIN) {
        setMsg('Access denied — this tool is for ' + REQUIRED_LOGIN + ' only.', 'error');
        setLoading(false);
        return;
      }
      sessionStorage.setItem(SESSION_KEY, token);
      sessionStorage.setItem(SESSION_USER_KEY, login);
      setMsg('✓ Authenticated as ' + login, 'success');
      setTimeout(() => { closeModal(); activateDevMode(login); }, 700);
    } catch (err) {
      setMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────────────────────────
  trigger.addEventListener('click', openModal);
  document.getElementById('devLoginBtn').addEventListener('click', handleLogin);
  document.getElementById('devTokenInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  modal.querySelector('.dev-modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Badge: single click → open panel, right-click / double-click area → show logout
  badge.addEventListener('click', () => {
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  });
  badge.addEventListener('contextmenu', e => {
    e.preventDefault();
    logoutBtn.classList.toggle('visible');
  });
  logoutBtn.addEventListener('click', deactivateDevMode);
  document.addEventListener('click', e => {
    if (e.target !== badge && e.target !== logoutBtn) logoutBtn.classList.remove('visible');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // RESTORE SESSION
  // ─────────────────────────────────────────────────────────────────────────────
  (function restoreSession() {
    const savedToken = sessionStorage.getItem(SESSION_KEY);
    const savedUser  = sessionStorage.getItem(SESSION_USER_KEY);
    if (savedToken && savedUser === REQUIRED_LOGIN) {
      verifyToken(savedToken)
        .then(login => {
          if (login === REQUIRED_LOGIN) activateDevMode(login);
          else { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_USER_KEY); }
        })
        .catch(() => { sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_USER_KEY); });
    }
  })();

  // ─────────────────────────────────────────────────────────────────────────────
  // INIT (apply saved state for all visitors, not just dev)
  // ─────────────────────────────────────────────────────────────────────────────
  injectSavedCustomCards();
  applyThumbs();
  applyOrder();

})();
