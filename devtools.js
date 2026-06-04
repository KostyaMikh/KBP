// ===== KBP DEV TOOLS =====
// Auth → Dev Panel → Theme / Card Manager / New Card / Git Push

(function () {
  'use strict';

  const REQUIRED_LOGIN = 'KostyaMikh';
  const REPO_OWNER     = 'KostyaMikh';   // GitHub username
  const REPO_NAME      = 'KBP';          // repo name
  const REPO_BRANCH    = 'main';

  const KEY_TOKEN   = 'kbp_dev_token';
  const KEY_USER    = 'kbp_dev_user';
  const KEY_COLORS  = 'kbp_dev_colors';
  const KEY_ORDER   = 'kbp_dev_order';
  const KEY_THUMBS  = 'kbp_dev_thumbs';
  const KEY_CUSTOM  = 'kbp_dev_custom';

  // ── Inject stylesheet ──────────────────────────────────────────────────────
  const cssLink = document.createElement('link');
  cssLink.rel  = 'stylesheet';
  cssLink.href = 'devtools.css';
  document.head.appendChild(cssLink);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function $(id)         { return document.getElementById(id); }
  function ls(k)         { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } }
  function lsSet(k, v)   { localStorage.setItem(k, JSON.stringify(v)); }

  let toastTimer;
  function showToast(msg, type) {
    const t = $('devToast');
    clearTimeout(toastTimer);
    t.textContent = msg;
    t.className   = 'show' + (type ? ' ' + type : '');
    toastTimer = setTimeout(() => { t.className = type || ''; }, 2800);
  }

  // ── Build DOM ──────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `

    <!-- Toast -->
    <div id="devToast"></div>

    <!-- Hidden lock trigger -->
    <button id="devLoginTrigger" aria-label="Developer login">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </button>

    <!-- Dev mode badge (visible when logged in) -->
    <button id="devBadge"><span class="dev-dot"></span> Dev Mode</button>
    <button class="dev-logout-btn" id="devLogoutBtn">Logout</button>

    <!-- Auth modal -->
    <div id="devAuthModal" role="dialog" aria-modal="true" aria-labelledby="devModalTitle">
      <div class="dev-modal-box">
        <button class="dev-modal-close" id="devModalClose" aria-label="Close">&times;</button>
        <div class="dev-modal-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387
              .599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416
              -.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729
              1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997
              .107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931
              0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176
              0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803
              c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23
              .653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221
              0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293
              c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12
              c0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <p class="dev-modal-title" id="devModalTitle">Developer Access</p>
        <p class="dev-modal-sub">
          Enter a GitHub Personal Access Token.<br>
          Only <strong style="color:rgba(240,240,245,.75)">KostyaMikh</strong> can log in.
        </p>
        <label class="dev-form-label" for="devTokenInput">GitHub Token</label>
        <input type="password" id="devTokenInput" class="dev-token-input"
               placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false">
        <p class="dev-hint">
          Create one at
          <a href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=KBP+Dev+Tools"
             target="_blank" rel="noopener">
            GitHub &rarr; Settings &rarr; Tokens (classic)
          </a>.<br>
          Tick <strong style="color:#ff8c42">repo</strong> (full) + <strong style="color:#ff8c42">read:user</strong>.
          Without <code>repo</code> scope, pushing will give a 403 error.
        </p>
        <button class="dev-login-btn" id="devLoginBtn">
          <span class="btn-spinner"></span>
          <span class="btn-text">Verify &amp; Login</span>
        </button>
        <p class="dev-auth-msg" id="devAuthMsg"></p>
      </div>
    </div>

    <!-- Dev panel -->
    <div id="devPanel" role="complementary" aria-label="Developer tools">
      <div class="dp-header">
        <span class="dp-title">🛠 Dev Tools</span>
        <button class="dp-close" id="dpClose" aria-label="Close">&times;</button>
      </div>
      <div class="dp-tabs" id="dpTabs">
        <button class="dp-tab active" data-tab="colors">🎨 Theme</button>
        <button class="dp-tab"        data-tab="manager">🖼 Cards</button>
        <button class="dp-tab"        data-tab="new">➕ New</button>
        <button class="dp-tab"        data-tab="edit">✏️ Edit</button>
        <button class="dp-tab"        data-tab="git">🚀 Git</button>
      </div>
      <div class="dp-body">

        <!-- THEME TAB -->
        <div class="dp-pane active" id="dpPane-colors">
          <p class="dp-section-title">Site Colours — live preview as you pick</p>
          <div id="dpColorRows"></div>
          <button class="dp-save-btn" id="dpSaveColors">
            <span class="btn-text">Save Colors</span>
          </button>
          <button class="dp-save-btn secondary" id="dpResetColors">Reset to Defaults</button>
        </div>

        <!-- MANAGER TAB -->
        <div class="dp-pane" id="dpPane-manager">
          <p class="dp-section-title">Drag to reorder · click 🖼 to replace thumbnail</p>
          <div class="dp-card-list" id="dpCardList"></div>
          <button class="dp-save-btn" id="dpSaveOrder" style="margin-top:14px">Save Order</button>
        </div>

        <!-- NEW CARD TAB -->
        <div class="dp-pane" id="dpPane-new">
          <p class="dp-section-title">New Presentation Card</p>

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
            <label>Thumbnail</label>
            <div class="dp-upload-area" id="dpNewThumbArea">
              📁 Click or drop an image here
              <img id="dpNewThumbPreview" class="dp-upload-preview" alt="preview">
            </div>
            <input type="file" id="dpNewThumbFile" accept="image/*" style="display:none">
            <input type="url"  id="dpNewThumbUrl"  placeholder="…or paste image URL" style="margin-top:5px">
          </div>

          <div class="dp-field">
            <label>Status</label>
            <div class="dp-status-row" id="dpStatusRow">
              <span class="dp-status-chip available selected" data-status="available">✅ Available</span>
              <span class="dp-status-chip early"             data-status="early">🔓 Early Access</span>
              <span class="dp-status-chip coming"            data-status="coming">⏳ Coming Soon</span>
            </div>
          </div>

          <hr class="dp-divider">
          <p class="dp-section-title">Buttons</p>
          <div id="dpBtnList"></div>
          <button class="dp-add-btn-link" id="dpAddBtn">+ Add button</button>

          <hr class="dp-divider">
          <button class="dp-save-btn" id="dpPublishCard">
            <span class="btn-text">Publish Card</span>
          </button>
        </div>

        <!-- EDIT TAB -->
        <div class="dp-pane" id="dpPane-edit">
          <p class="dp-section-title">Delete any element</p>
          <p style="font-size:.78rem;color:rgba(240,240,245,.38);line-height:1.6;margin-bottom:12px">
            Enable delete mode, then hover over anything on the page and click the red ✕ to remove it.
          </p>
          <button class="dp-save-btn" id="dpDeleteToggle">
            <span class="btn-text">🗑 Enable Delete Mode</span>
          </button>
          <p class="dp-git-status" id="dpDeleteStatus"></p>

          <hr class="dp-divider">
          <p class="dp-section-title">Add a text block</p>
          <p style="font-size:.78rem;color:rgba(240,240,245,.38);line-height:1.6;margin-bottom:12px">
            Type your text, then click <strong style="color:rgba(240,240,245,.6)">Pick position</strong>
            and click any element on the page — the block will be inserted before it.
          </p>
          <div class="dp-field">
            <label>Content (HTML allowed)</label>
            <textarea id="dpTextContent" placeholder="e.g. &lt;h2&gt;New Section&lt;/h2&gt; or plain text"></textarea>
          </div>
          <div class="dp-field">
            <label>Style</label>
            <select id="dpTextStyle">
              <option value="">Plain text</option>
              <option value="heading">Heading (Orbitron)</option>
              <option value="banner">Announcement banner</option>
              <option value="note">Muted note</option>
            </select>
          </div>
          <button class="dp-save-btn secondary" id="dpPickPosition" style="margin-top:8px">
            <span class="btn-text">🎯 Pick Position on Page</span>
          </button>
          <p class="dp-git-status" id="dpInsertStatus">Ready — pick a position first.</p>
        </div>

        <!-- GIT TAB -->
        <div class="dp-pane" id="dpPane-git">
          <p class="dp-section-title">Push changes to GitHub</p>
          <p style="font-size:.78rem;color:rgba(240,240,245,.4);line-height:1.6;margin-bottom:14px">
            This will commit and push the current
            <code style="color:#ff8c42">catalog.html</code> to
            <strong style="color:rgba(240,240,245,.6)">${REPO_OWNER}/${REPO_NAME}</strong>
            on branch <strong style="color:rgba(240,240,245,.6)">${REPO_BRANCH}</strong>.
          </p>
          <div class="dp-field">
            <label>Commit message</label>
            <input type="text" id="dpCommitMsg" value="chore: update catalog via dev tools">
          </div>
          <button class="dp-save-btn green" id="dpPushBtn">
            <span class="btn-spinner"></span>
            <span class="btn-text">🚀 Commit &amp; Push</span>
          </button>
          <p class="dp-git-status" id="dpGitStatus"></p>

          <hr class="dp-divider">
          <p class="dp-section-title">Upload thumbnail to repo</p>
          <div class="dp-field">
            <label>File name (e.g. my_pres.jpg)</label>
            <input type="text" id="dpUploadName" placeholder="thumbnails/my_pres.jpg">
          </div>
          <div class="dp-field">
            <label>Image file</label>
            <div class="dp-upload-area" id="dpUploadArea">
              📁 Click or drop image here
              <img id="dpUploadPreview" class="dp-upload-preview" alt="preview">
            </div>
            <input type="file" id="dpUploadFile" accept="image/*" style="display:none">
          </div>
          <button class="dp-save-btn" id="dpUploadBtn">
            <span class="btn-spinner"></span>
            <span class="btn-text">Upload Image to Repo</span>
          </button>
          <p class="dp-git-status" id="dpUploadStatus"></p>
        </div>

      </div>
    </div>
  `);

  // ── GitHub API helpers ─────────────────────────────────────────────────────
  function ghHeaders() {
    // Note: header values must be plain ASCII — no smart quotes or special chars
    const token = sessionStorage.getItem(KEY_TOKEN) || '';
    const h = new Headers();
    h.append('Authorization', 'Bearer ' + token);
    h.append('Accept', 'application/vnd.github+json');
    h.append('Content-Type', 'application/json');
    return h;
  }

  async function ghGet(path) {
    const r = await fetch('https://api.github.com' + path, { headers: ghHeaders() });
    if (!r.ok) throw new Error('GitHub ' + r.status + ': ' + (await r.text()));
    return r.json();
  }

  async function ghPut(path, body) {
    const r = await fetch('https://api.github.com' + path, {
      method: 'PUT',
      headers: ghHeaders(),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('GitHub ' + r.status + ': ' + (await r.text()));
    return r.json();
  }

  async function verifyToken(token) {
    const h = new Headers();
    h.append('Authorization', 'Bearer ' + token);
    h.append('Accept', 'application/vnd.github+json');
    const r = await fetch('https://api.github.com/user', { headers: h });
    if (r.status === 401) throw new Error('Token invalid or expired.');
    if (!r.ok) throw new Error('GitHub API error (' + r.status + ').');
    return (await r.json()).login;
  }

  // Base64 encode a file (returns Promise<string>)
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get current SHA of a file (needed for updates)
  async function getFileSha(path) {
    try {
      const data = await ghGet(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${REPO_BRANCH}`);
      return data.sha;
    } catch {
      return null; // file doesn't exist yet → create
    }
  }

  // ── Colour system ──────────────────────────────────────────────────────────
  const COLOR_DEFS = [
    { label: 'Primary Orange', varName: '--orange',       def: '#ff5e1a' },
    { label: 'Light Orange',   varName: '--orange-light', def: '#ff8c42' },
    { label: 'Red',            varName: '--red',          def: '#e63000' },
    { label: 'Background',     varName: '--bg',           def: '#080810' },
    { label: 'Text',           varName: '--text',         def: '#f0f0f5' },
  ];

  function applyColors(map) {
    const root = document.documentElement;
    COLOR_DEFS.forEach(d => root.style.setProperty(d.varName, map[d.varName] || d.def));
  }
  applyColors(ls(KEY_COLORS) || {});

  function buildColorRows() {
    const container = $('dpColorRows');
    if (!container) return;
    container.innerHTML = '';
    const saved = ls(KEY_COLORS) || {};
    COLOR_DEFS.forEach(d => {
      const current = saved[d.varName] || d.def;
      const safeName = d.varName.replace(/--/, '');
      container.insertAdjacentHTML('beforeend', `
        <div class="dp-color-row">
          <span class="dp-color-label">${d.label}</span>
          <div class="dp-color-swatch">
            <button class="dp-reset-color" data-var="${d.varName}" title="Reset">↺</button>
            <span class="dp-color-value" id="dpVal-${safeName}">${current}</span>
            <div class="dp-color-preview" id="dpPrev-${safeName}" style="background:${current}"></div>
            <input type="color" class="dp-color-picker" id="dpPick-${safeName}" value="${current}">
          </div>
        </div>`);
      const preview = $('dpPrev-' + safeName);
      const picker  = $('dpPick-' + safeName);
      const valEl   = $('dpVal-'  + safeName);
      preview.addEventListener('click', () => picker.click());
      picker.addEventListener('input', () => {
        preview.style.background = picker.value;
        valEl.textContent = picker.value;
        document.documentElement.style.setProperty(d.varName, picker.value);
      });
      container.querySelector(`[data-var="${d.varName}"]`).addEventListener('click', () => {
        picker.value = d.def;
        preview.style.background = d.def;
        valEl.textContent = d.def;
        document.documentElement.style.setProperty(d.varName, d.def);
      });
    });
  }

  $('dpSaveColors').addEventListener('click', () => {
    const map = {};
    COLOR_DEFS.forEach(d => {
      const p = $('dpPick-' + d.varName.replace(/--/, ''));
      if (p) map[d.varName] = p.value;
    });
    lsSet(KEY_COLORS, map);
    applyColors(map);
    showToast('Colors saved ✓', 'success');
  });

  $('dpResetColors').addEventListener('click', () => {
    localStorage.removeItem(KEY_COLORS);
    applyColors({});
    buildColorRows();
    showToast('Colors reset', '');
  });

  // ── Manager tab ────────────────────────────────────────────────────────────
  let managerBuilt = false;

  function applyOrder() {
    const grid  = $('catalogGrid');
    const order = ls(KEY_ORDER);
    if (!grid || !order) return;
    order.forEach(id => {
      const c = grid.querySelector(`.pres-card[data-id="${id}"]`);
      if (c) grid.appendChild(c);
    });
  }

  function applyThumbs() {
    const thumbs = ls(KEY_THUMBS);
    if (!thumbs) return;
    Object.entries(thumbs).forEach(([id, src]) => {
      const img = document.querySelector(`.pres-card[data-id="${id}"] .card-thumb img`);
      if (img) img.src = src;
    });
  }

  function buildManagerTab(force) {
    if (managerBuilt && !force) return;
    managerBuilt = true;
    const list = $('dpCardList');
    if (!list) return;
    list.innerHTML = '';
    const grid = $('catalogGrid');
    if (!grid) {
      list.innerHTML = '<p style="font-size:.78rem;color:rgba(240,240,245,.3);text-align:center;padding:20px">Open catalog.html to manage cards.</p>';
      return;
    }
    const cards = Array.from(grid.querySelectorAll('.pres-card[data-id]'));
    if (!cards.length) {
      list.innerHTML = '<p style="font-size:.78rem;color:rgba(240,240,245,.3);text-align:center;padding:20px">No cards with data-id found.</p>';
      return;
    }
    cards.forEach(card => {
      const id    = card.dataset.id;
      const title = card.querySelector('.card-title')?.textContent?.trim() || '(untitled)';
      const lang  = card.dataset.lang || '';
      const thumb = card.querySelector('.card-thumb img')?.src || '';

      const item = document.createElement('div');
      item.className      = 'dp-card-item';
      item.draggable      = true;
      item.dataset.id     = id;
      item.innerHTML = `
        <span class="dp-drag-handle">⠿</span>
        <img class="dp-card-thumb" src="${thumb}" alt=""
             onerror="this.src='thumbnails/no_thumbnail.jpg'">
        <div class="dp-card-info">
          <div class="dp-card-name">${title}</div>
          <div class="dp-card-lang">${lang}</div>
        </div>
        <button class="dp-thumb-btn">🖼 Replace</button>`;
      list.appendChild(item);

      // File picker for thumb replacement
      const fileInput = document.createElement('input');
      fileInput.type   = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);

      item.querySelector('.dp-thumb-btn').addEventListener('click', e => {
        e.stopPropagation();
        fileInput.click();
      });
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          const src = ev.target.result;
          const domImg = document.querySelector(`.pres-card[data-id="${id}"] .card-thumb img`);
          if (domImg) domImg.src = src;
          item.querySelector('.dp-card-thumb').src = src;
          const thumbs = ls(KEY_THUMBS) || {};
          thumbs[id] = src;
          lsSet(KEY_THUMBS, thumbs);
          showToast('Thumbnail updated ✓ (saved locally)', 'success');
        };
        reader.readAsDataURL(file);
      });
    });

    // Drag-and-drop
    let dragSrc = null;
    list.addEventListener('dragstart', e => {
      dragSrc = e.target.closest('.dp-card-item');
      if (dragSrc) dragSrc.classList.add('dragging');
    });
    list.addEventListener('dragover', e => {
      e.preventDefault();
      const target = e.target.closest('.dp-card-item');
      list.querySelectorAll('.dp-card-item').forEach(i => i.classList.remove('drag-over'));
      if (target && target !== dragSrc) target.classList.add('drag-over');
    });
    list.addEventListener('drop', e => {
      e.preventDefault();
      const target = e.target.closest('.dp-card-item');
      if (target && dragSrc && target !== dragSrc) {
        const items  = [...list.querySelectorAll('.dp-card-item')];
        const srcIdx = items.indexOf(dragSrc);
        const tgtIdx = items.indexOf(target);
        list.insertBefore(dragSrc, srcIdx < tgtIdx ? target.nextSibling : target);
      }
      list.querySelectorAll('.dp-card-item').forEach(i => i.classList.remove('drag-over', 'dragging'));
      dragSrc = null;
    });
    list.addEventListener('dragend', () => {
      list.querySelectorAll('.dp-card-item').forEach(i => i.classList.remove('dragging', 'drag-over'));
    });
  }

  $('dpSaveOrder').addEventListener('click', () => {
    const items = [...document.querySelectorAll('#dpCardList .dp-card-item')];
    const order = items.map(i => i.dataset.id);
    lsSet(KEY_ORDER, order);
    const grid = $('catalogGrid');
    if (grid) order.forEach(id => {
      const c = grid.querySelector(`.pres-card[data-id="${id}"]`);
      if (c) grid.appendChild(c);
    });
    showToast('Order saved ✓', 'success');
  });

  // ── New card tab ───────────────────────────────────────────────────────────
  let selectedStatus  = 'available';
  let buttonEntries   = [{ label: 'View Presentation', url: '' }];
  let newThumbDataUrl = null;

  // Status chips
  $('dpStatusRow').addEventListener('click', e => {
    const chip = e.target.closest('.dp-status-chip');
    if (!chip) return;
    document.querySelectorAll('.dp-status-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    selectedStatus = chip.dataset.status;
  });

  // Thumbnail upload area (new card)
  function setupUploadArea(areaId, fileInputId, previewId, onData) {
    const area      = $(areaId);
    const fileInput = $(fileInputId);
    const preview   = $(previewId);
    if (!area) return;
    area.addEventListener('click', () => fileInput.click());
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', e => {
      e.preventDefault();
      area.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) loadImageFile(file, preview, onData);
    });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) loadImageFile(file, preview, onData);
    });
  }

  function loadImageFile(file, previewEl, callback) {
    const reader = new FileReader();
    reader.onload = e => {
      if (previewEl) {
        previewEl.src     = e.target.result;
        previewEl.style.display = 'block';
      }
      if (callback) callback(e.target.result, file);
    };
    reader.readAsDataURL(file);
  }

  setupUploadArea('dpNewThumbArea', 'dpNewThumbFile', 'dpNewThumbPreview', (dataUrl) => {
    newThumbDataUrl = dataUrl;
  });

  // Button entries
  function renderBtnList() {
    const container = $('dpBtnList');
    if (!container) return;
    container.innerHTML = '';
    buttonEntries.forEach((btn, i) => {
      container.insertAdjacentHTML('beforeend', `
        <div class="dp-btn-entry">
          <input type="text" placeholder="Button label" value="${btn.label || ''}" data-i="${i}" data-field="label">
          <input type="url"  placeholder="https://…"   value="${btn.url   || ''}" data-i="${i}" data-field="url">
          <button class="dp-remove-btn" data-i="${i}">✕</button>
        </div>`);
    });
    container.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        buttonEntries[+inp.dataset.i][inp.dataset.field] = inp.value;
      });
    });
    container.querySelectorAll('.dp-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        buttonEntries.splice(+btn.dataset.i, 1);
        renderBtnList();
      });
    });
  }
  renderBtnList();
  $('dpAddBtn').addEventListener('click', () => {
    buttonEntries.push({ label: '', url: '' });
    renderBtnList();
  });

  function buildCardHTML(data) {
    const langClass = { polski: 'polski', english: 'english', espanol: 'espanol' }[data.lang] || 'english';
    const langLabel = { polski: 'Polski', english: 'English', espanol: 'Español' }[data.lang] || data.lang;
    const thumbSrc  = data.thumb || 'thumbnails/no_thumbnail.jpg';
    const id        = 'custom-' + Date.now();
    const firstUrl  = data.buttons[0]?.url || '#';

    const statusHTML = data.status === 'early'
      ? `<span class="card-btn coming-soon-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:none;cursor:default;">🔓 Early Access</span>`
      : data.status === 'coming'
        ? `<span class="card-btn coming-soon-btn">⏳ Wkrótce dostępne</span>`
        : '';

    const btnsHTML = data.buttons
      .filter(b => b.label && b.url)
      .map(b => `<a href="${b.url}" target="_blank" class="card-btn">${b.label}</a>`)
      .join('');

    return `
      <div class="pres-card glass" data-lang="${data.lang}" data-id="${id}">
        <div class="card-glow"></div>
        <a href="${firstUrl}" target="_blank" class="card-thumb-link">
          <div class="card-thumb">
            <img src="${thumbSrc}" alt="${data.title}"
                 onerror="this.src='thumbnails/no_thumbnail.jpg'">
            <div class="thumb-overlay">
              <span class="thumb-play">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
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
            ${statusHTML}${btnsHTML}
          </div>
        </div>
      </div>`;
  }

  $('dpPublishCard').addEventListener('click', () => {
    const title = $('dpNewTitle').value.trim();
    const theme = $('dpNewTheme').value.trim();
    const lang  = $('dpNewLang').value;
    const urlThumb = $('dpNewThumbUrl').value.trim();
    const thumb = newThumbDataUrl || urlThumb || '';

    if (!title) { showToast('Title is required', 'error'); return; }

    const data   = { title, theme, lang, thumb, status: selectedStatus, buttons: buttonEntries.filter(b => b.label) };
    const html   = buildCardHTML(data);
    const grid   = $('catalogGrid');
    if (!grid) { showToast('No catalog grid on this page', 'error'); return; }

    grid.insertAdjacentHTML('afterbegin', html);
    const customs = ls(KEY_CUSTOM) || [];
    customs.unshift({ ...data, id: 'custom-' + Date.now() });
    lsSet(KEY_CUSTOM, customs);
    showToast('Card published ✓', 'success');

    // Reset form
    $('dpNewTitle').value = '';
    $('dpNewTheme').value = '';
    $('dpNewThumbUrl').value = '';
    $('dpNewThumbPreview').style.display = 'none';
    newThumbDataUrl = null;
    buttonEntries = [{ label: 'View Presentation', url: '' }];
    renderBtnList();
    buildManagerTab();
  });

  // ── Git tab ────────────────────────────────────────────────────────────────

  // Upload image to repo
  let uploadFileObj = null;
  let uploadBase64  = null;

  setupUploadArea('dpUploadArea', 'dpUploadFile', 'dpUploadPreview', (dataUrl, file) => {
    uploadFileObj = file;
    uploadBase64  = dataUrl.split(',')[1];
    // Auto-fill filename
    if (!$('dpUploadName').value) {
      $('dpUploadName').value = 'thumbnails/' + file.name.toLowerCase().replace(/\s+/g, '_');
    }
  });

  $('dpUploadBtn').addEventListener('click', async () => {
    const btn      = $('dpUploadBtn');
    const statusEl = $('dpUploadStatus');
    const path     = $('dpUploadName').value.trim();

    if (!uploadBase64) { showToast('Choose an image first', 'error'); return; }
    if (!path)         { showToast('Enter a file name', 'error'); return; }

    btn.classList.add('loading'); btn.disabled = true;
    statusEl.textContent = 'Uploading…'; statusEl.className = 'dp-git-status';

    try {
      const sha = await getFileSha(path);
      const body = {
        message: 'upload: add ' + path,
        content: uploadBase64,
        branch: REPO_BRANCH,
      };
      if (sha) body.sha = sha;
      await ghPut(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, body);
      statusEl.textContent = '✓ Uploaded to ' + path;
      statusEl.className   = 'dp-git-status ok';
      showToast('Image uploaded ✓', 'success');
    } catch (err) {
      statusEl.textContent = '✗ ' + err.message;
      statusEl.className   = 'dp-git-status error';
      showToast('Upload failed', 'error');
    } finally {
      btn.classList.remove('loading'); btn.disabled = false;
    }
  });

  // Push catalog.html to repo
  $('dpPushBtn').addEventListener('click', async () => {
    const btn      = $('dpPushBtn');
    const statusEl = $('dpGitStatus');
    const msg      = $('dpCommitMsg').value.trim() || 'chore: update catalog via dev tools';

    btn.classList.add('loading'); btn.disabled = true;
    statusEl.textContent = 'Reading current catalog.html…';
    statusEl.className   = 'dp-git-status';

    try {
      // Fetch current catalog.html via GitHub API to get its SHA
      const filePath = 'catalog.html';
      const current  = await ghGet(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${REPO_BRANCH}`);
      const sha      = current.sha;

      // Get the live DOM HTML
      const html    = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      const encoded = btoa(unescape(encodeURIComponent(html)));

      statusEl.textContent = 'Pushing…';

      await ghPut(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
        message: msg,
        content: encoded,
        sha,
        branch: REPO_BRANCH,
      });

      statusEl.textContent = '✓ Pushed successfully';
      statusEl.className   = 'dp-git-status ok';
      showToast('Pushed to GitHub ✓', 'success');
    } catch (err) {
      let msg = err.message;
      if (msg.includes('403')) {
        msg = '403: Token needs "repo" scope. Go to github.com/settings/tokens, delete the old token, create a new one with the "repo" checkbox ticked, then log out and log back in.';
      }
      statusEl.textContent = '✗ ' + msg;
      statusEl.className   = 'dp-git-status error';
      showToast('Push failed — see Git tab', 'error');
    } finally {
      btn.classList.remove('loading'); btn.disabled = false;
    }
  });

  // ── Edit tab: delete mode + insert element ────────────────────────────────
  let deleteMode   = false;
  let insertMode   = false;
  let lastHovered  = null;

  // Elements we never want to allow deleting (dev tools own UI)
  const PROTECTED = ['devPanel','devBadge','devLoginTrigger','devLogoutBtn',
                     'devAuthModal','devToast'];

  function isProtected(el) {
    return PROTECTED.some(id => el.id === id || el.closest('#' + id));
  }

  // ── Delete mode ──
  function setDeleteMode(on) {
    deleteMode = on;
    const btn = $('dpDeleteToggle');
    const st  = $('dpDeleteStatus');
    if (on) {
      btn.textContent = '✅ Delete Mode ON — click to disable';
      btn.style.background = 'linear-gradient(135deg,#dc2626,#991b1b)';
      st.textContent  = 'Hover an element and click ✕ to delete it.';
      st.className    = 'dp-git-status ok';
      document.body.classList.add('kbp-delete-mode');
    } else {
      btn.innerHTML   = '<span class="btn-text">🗑 Enable Delete Mode</span>';
      btn.style.background = '';
      st.textContent  = '';
      st.className    = 'dp-git-status';
      document.body.classList.remove('kbp-delete-mode');
      removeDeleteOverlay();
    }
  }

  $('dpDeleteToggle').addEventListener('click', () => setDeleteMode(!deleteMode));

  // Overlay div that floats over the hovered element
  const delOverlay = document.createElement('div');
  delOverlay.id = 'kbpDelOverlay';
  delOverlay.innerHTML = '✕';
  delOverlay.title = 'Delete this element';
  document.body.appendChild(delOverlay);

  function removeDeleteOverlay() {
    delOverlay.style.display = 'none';
    lastHovered = null;
  }

  document.addEventListener('mouseover', e => {
    if (!deleteMode) return;
    const target = e.target.closest('[class],[id]');
    if (!target || isProtected(target) || target === delOverlay) return;
    lastHovered = target;
    const r = target.getBoundingClientRect();
    delOverlay.style.cssText = `
      display:flex; position:fixed;
      top:${r.top}px; left:${r.left}px;
      width:${r.width}px; height:${r.height}px;
      border:2px solid #ef4444; border-radius:4px;
      background:rgba(239,68,68,.08);
      align-items:center; justify-content:center;
      font-size:1.6rem; color:#ef4444; cursor:pointer;
      z-index:9080; pointer-events:auto; box-sizing:border-box;
      font-weight:700; user-select:none;`;
  });

  document.addEventListener('mouseout', e => {
    if (!deleteMode) return;
    if (e.relatedTarget === delOverlay) return;
    if (!delOverlay.contains(e.relatedTarget)) removeDeleteOverlay();
  });

  delOverlay.addEventListener('mouseleave', removeDeleteOverlay);

  delOverlay.addEventListener('click', () => {
    if (!lastHovered) return;
    if (confirm('Delete this element? This cannot be undone until you refresh.')) {
      lastHovered.remove();
      removeDeleteOverlay();
      showToast('Element deleted', '');
      managerBuilt = false; // re-sync manager list next open
    }
  });

  // ── Insert text/element mode ──
  function setInsertMode(on) {
    insertMode = on;
    const btn = $('dpPickPosition');
    const st  = $('dpInsertStatus');
    if (on) {
      btn.textContent = '❌ Cancel';
      st.textContent  = 'Click any element on the page — content inserts before it.';
      st.className    = 'dp-git-status ok';
      document.body.classList.add('kbp-insert-mode');
    } else {
      btn.innerHTML   = '<span class="btn-text">🎯 Pick Position on Page</span>';
      st.textContent  = 'Ready — pick a position first.';
      st.className    = 'dp-git-status';
      document.body.classList.remove('kbp-insert-mode');
    }
  }

  $('dpPickPosition').addEventListener('click', () => setInsertMode(!insertMode));

  function buildTextHTML(content, style) {
    if (style === 'heading') {
      return `<h2 style="font-family:'Orbitron',sans-serif;font-size:clamp(1.5rem,4vw,2.5rem);
        font-weight:900;text-align:center;margin:40px 0 20px;
        background:linear-gradient(135deg,var(--orange-light),var(--red));
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        background-clip:text;" data-dev-inserted="1">${content}</h2>`;
    }
    if (style === 'banner') {
      return `<div class="glass" data-dev-inserted="1"
        style="margin:24px auto;max-width:900px;padding:20px 28px;border-radius:16px;
        border:1px solid rgba(255,94,26,.3);background:rgba(255,94,26,.07);
        font-size:.95rem;color:var(--text-muted);line-height:1.6;text-align:center;">
        ${content}</div>`;
    }
    if (style === 'note') {
      return `<p data-dev-inserted="1"
        style="text-align:center;font-size:.85rem;color:var(--text-muted);
        font-style:italic;margin:20px 0;">${content}</p>`;
    }
    return `<p data-dev-inserted="1"
      style="font-size:1rem;color:var(--text);line-height:1.7;margin:20px 0;">
      ${content}</p>`;
  }

  // Capture page click when in insert mode
  document.addEventListener('click', e => {
    if (!insertMode) return;
    // Ignore clicks inside the dev panel itself
    if (e.target.closest('#devPanel')) return;
    e.preventDefault();
    e.stopPropagation();

    const content = $('dpTextContent').value.trim();
    if (!content) {
      showToast('Enter some content first', 'error');
      setInsertMode(false);
      return;
    }

    const style   = $('dpTextStyle').value;
    const html    = buildTextHTML(content, style);
    const target  = e.target.closest('[class],[id]') || e.target;

    target.insertAdjacentHTML('beforebegin', html);
    setInsertMode(false);
    $('dpInsertStatus').textContent = '✓ Inserted!';
    $('dpInsertStatus').className   = 'dp-git-status ok';
    showToast('Element inserted ✓', 'success');
  }, true); // capture phase so we get it before other handlers

  // ── Panel open/close ───────────────────────────────────────────────────────
  function openPanel() {
    $('devPanel').classList.add('open');
    // Build colour rows once
    if (!$('dpColorRows').children.length) buildColorRows();
    // Build manager only once
    buildManagerTab();
    renderBtnList();
  }
  function closePanel() {
    $('devPanel').classList.remove('open');
    // Keep delete/insert mode active even when panel is closed so you can use the page freely
  }

  $('dpClose').addEventListener('click', closePanel);

  $('dpTabs').addEventListener('click', e => {
    const tab = e.target.closest('.dp-tab');
    if (!tab) return;
    document.querySelectorAll('.dp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dp-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    $('dpPane-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'manager') buildManagerTab(true); // force refresh
  });

  // ── Auth ───────────────────────────────────────────────────────────────────
  function openModal() {
    $('devAuthModal').classList.add('open');
    $('devTokenInput').focus();
    setMsg('', '');
  }
  function closeModal() {
    $('devAuthModal').classList.remove('open');
    $('devTokenInput').value = '';
    setMsg('', '');
  }
  function setMsg(text, type) {
    $('devAuthMsg').textContent = text;
    $('devAuthMsg').className   = 'dev-auth-msg' + (type ? ' ' + type : '');
  }

  function activateDevMode(username) {
    $('devLoginTrigger').style.display = 'none';
    $('devBadge').style.display        = 'flex';
    $('devLogoutBtn').classList.remove('visible');
    document.dispatchEvent(new CustomEvent('kbpDevLogin', { detail: { username } }));
  }

  function deactivateDevMode() {
    sessionStorage.removeItem(KEY_TOKEN);
    sessionStorage.removeItem(KEY_USER);
    $('devBadge').style.display = 'none';
    $('devLogoutBtn').classList.remove('visible');
    $('devLoginTrigger').style.display = 'flex';
    setDeleteMode(false);
    setInsertMode(false);
    closePanel();
    document.dispatchEvent(new CustomEvent('kbpDevLogout'));
  }

  async function handleLogin() {
    const token = $('devTokenInput').value.trim();
    if (!token) { setMsg('Please enter your GitHub token.', 'error'); return; }
    const btn = $('devLoginBtn');
    btn.disabled = true; btn.classList.add('loading');
    setMsg('Contacting GitHub…', '');
    try {
      const login = await verifyToken(token);
      if (login !== REQUIRED_LOGIN) {
        setMsg('Access denied — only ' + REQUIRED_LOGIN + ' can log in.', 'error');
        return;
      }
      sessionStorage.setItem(KEY_TOKEN, token);
      sessionStorage.setItem(KEY_USER,  login);
      setMsg('✓ Authenticated as ' + login, 'success');
      setTimeout(() => { closeModal(); activateDevMode(login); }, 600);
    } catch (err) {
      setMsg(err.message, 'error');
    } finally {
      btn.disabled = false; btn.classList.remove('loading');
    }
  }

  // ── Events ─────────────────────────────────────────────────────────────────
  $('devLoginTrigger').addEventListener('click', openModal);
  $('devLoginBtn').addEventListener('click', handleLogin);
  $('devTokenInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  $('devModalClose').addEventListener('click', closeModal);
  $('devAuthModal').addEventListener('click', e => { if (e.target === $('devAuthModal')) closeModal(); });

  $('devBadge').addEventListener('click', () => {
    if ($('devPanel').classList.contains('open')) closePanel();
    else openPanel();
  });
  $('devBadge').addEventListener('contextmenu', e => {
    e.preventDefault();
    $('devLogoutBtn').classList.toggle('visible');
  });
  $('devLogoutBtn').addEventListener('click', deactivateDevMode);
  document.addEventListener('click', e => {
    if (e.target !== $('devBadge') && e.target !== $('devLogoutBtn')) {
      $('devLogoutBtn').classList.remove('visible');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if ($('devAuthModal').classList.contains('open')) closeModal();
    else if ($('devPanel').classList.contains('open')) closePanel();
  });

  // ── Restore session ────────────────────────────────────────────────────────
  (function restoreSession() {
    const token = sessionStorage.getItem(KEY_TOKEN);
    const user  = sessionStorage.getItem(KEY_USER);
    if (!token || user !== REQUIRED_LOGIN) return;
    verifyToken(token)
      .then(login => {
        if (login === REQUIRED_LOGIN) activateDevMode(login);
        else { sessionStorage.removeItem(KEY_TOKEN); sessionStorage.removeItem(KEY_USER); }
      })
      .catch(() => { sessionStorage.removeItem(KEY_TOKEN); sessionStorage.removeItem(KEY_USER); });
  })();

  // ── Apply persisted data (runs for all visitors) ───────────────────────────
  applyThumbs();
  applyOrder();

  // Inject custom cards saved from previous sessions
  (function injectCustomCards() {
    const grid    = $('catalogGrid');
    const customs = ls(KEY_CUSTOM);
    if (!grid || !customs) return;
    customs.forEach(data => grid.insertAdjacentHTML('afterbegin', buildCardHTML(data)));
  })();

})();
