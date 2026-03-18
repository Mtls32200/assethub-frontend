// columns.js — AssetHub column manager
// Handles column order, visibility, and custom columns per category (built-in + custom)

(function () {

  // ── Default column definitions ──────────────────────────────────────────────
  const DEFAULTS = {
    computer: [
      { key: 'computerName', label: 'Name',        visible: true,  sortable: true,  fixed: false },
      { key: 'user',         label: 'User', visible: true,  sortable: false, fixed: false },
      { key: 'brand',        label: 'Brand',      visible: true,  sortable: true,  fixed: false },
      { key: 'model',        label: 'Model',      visible: true,  sortable: true,  fixed: false },
      { key: 'status',       label: 'Status',      visible: true,  sortable: true,  fixed: false },
      { key: 'serialNumber', label: 'S/N',         visible: true,  sortable: true,  fixed: false },
      { key: 'ram',          label: 'RAM',         visible: true,  sortable: true,  fixed: false },
      { key: 'onboarded',    label: 'Onboarded',    visible: true,  sortable: true,  fixed: false },
      { key: 'inStock',      label: 'In stock',    visible: true,  sortable: false, fixed: false },
      { key: 'notes',        label: 'Notes',       visible: true,  sortable: false, fixed: false },
      { key: 'sku',          label: 'SKU',         visible: false, sortable: false, fixed: false },
      { key: 'invoiceNum',   label: 'Invoice #',  visible: false, sortable: false, fixed: false },
      { key: 'purchasePrice',label: 'Purchase price',  visible: false, sortable: false, fixed: false },
      { key: 'purchaseDate', label: 'Purchase date',visible: false, sortable: false, fixed: false },
    ],
    monitor: [
      { key: 'id',           label: 'Asset ID',     visible: false, sortable: true,  fixed: false },
      { key: 'name',         label: 'Name',         visible: true,  sortable: true,  fixed: false },
      { key: 'user',         label: 'User',         visible: true,  sortable: true,  fixed: false },
      { key: 'brand',        label: 'Brand',        visible: true,  sortable: true,  fixed: false },
      { key: 'model',        label: 'Model',        visible: true,  sortable: true,  fixed: false },
      { key: 'serviceTag',   label: 'Service Tag',  visible: true,  sortable: true,  fixed: false },
      { key: 'serialNumber', label: 'S/N',          visible: true,  sortable: true,  fixed: false },
      { key: 'status',       label: 'Status',       visible: true,  sortable: true,  fixed: false },
      { key: 'inStock',      label: 'In stock',     visible: true,  sortable: false, fixed: false },
      { key: 'price',        label: 'Price',        visible: true,  sortable: true,  fixed: false },
      { key: 'purchaseDate', label: 'Purchase Date',visible: false, sortable: true,  fixed: false },
      { key: 'invoice',      label: 'Invoice #',    visible: false, sortable: true,  fixed: false },
      { key: 'notes',        label: 'Notes',        visible: true,  sortable: false, fixed: false },
    ],
    peripheral: [
      { key: 'name',         label: 'Name',         visible: true,  sortable: true,  fixed: false },
      { key: 'user',         label: 'User', visible: true,  sortable: false, fixed: false },
      { key: 'type',         label: 'Type',        visible: true,  sortable: true,  fixed: false },
      { key: 'brand',        label: 'Brand',      visible: true,  sortable: true,  fixed: false },
      { key: 'model',        label: 'Model',      visible: true,  sortable: true,  fixed: false },
      { key: 'serialNumber', label: 'S/N',         visible: true,  sortable: true,  fixed: false },
      { key: 'status',       label: 'Status',      visible: true,  sortable: true,  fixed: false },
      { key: 'inStock',      label: 'In stock',    visible: true,  sortable: false, fixed: false },
      { key: 'notes',        label: 'Notes',       visible: true,  sortable: false, fixed: false },
    ],
    stamp: [
      { key: 'name',         label: 'Name',         visible: true,  sortable: true,  fixed: false },
      { key: 'user',         label: 'User', visible: true,  sortable: false, fixed: false },
      { key: 'status',       label: 'Status',      visible: true,  sortable: true,  fixed: false },
      { key: 'inStock',      label: 'In stock',    visible: true,  sortable: false, fixed: false },
      { key: 'notes',        label: 'Notes',       visible: true,  sortable: false, fixed: false },
    ],
  };

  // Standard columns for custom categories
  const GENERIC_DEFAULTS = [
    { key: 'name',         label: 'Name',          visible: true,  sortable: true,  fixed: false },
    { key: 'user',         label: 'User',  visible: true,  sortable: false, fixed: false },
    { key: 'brand',        label: 'Brand',        visible: true,  sortable: true,  fixed: false },
    { key: 'model',        label: 'Model',        visible: true,  sortable: true,  fixed: false },
    { key: 'serialNumber', label: 'Serial #',      visible: true,  sortable: true,  fixed: false },
    { key: 'status',       label: 'Status',        visible: true,  sortable: true,  fixed: false },
    { key: 'notes',        label: 'Notes',         visible: true,  sortable: false, fixed: false },
  ];

  const STORAGE_KEY = 'assetHub_columns_v1';

  // ── Load / save ─────────────────────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function save(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeCols(cols, defaults) {
    const fallback = clone(defaults);
    if (!Array.isArray(cols)) return fallback;

    const result = [];
    const seen = new Set();

    cols.forEach(col => {
      if (!col || typeof col !== 'object') return;
      const key = (col.key || '').toString().trim();
      const label = (col.label || '').toString().trim();
      if (!key || !label || seen.has(key)) return;
      seen.add(key);

      const defaultCol = defaults.find(d => d.key === key);
      result.push({
        key,
        label,
        visible: typeof col.visible === 'boolean' ? col.visible : (defaultCol ? !!defaultCol.visible : true),
        sortable: typeof col.sortable === 'boolean' ? col.sortable : (defaultCol ? !!defaultCol.sortable : false),
        fixed: typeof col.fixed === 'boolean' ? col.fixed : (defaultCol ? !!defaultCol.fixed : false),
        custom: !!col.custom || !defaultCol,
      });
    });

    defaults.forEach(def => {
      if (!seen.has(def.key)) {
        result.push({ ...def });
        seen.add(def.key);
      }
    });

    return result;
  }

  // ── Get columns for a category (merges saved config with defaults) ──────────
  window.getColumns = function (cat) {
    const saved = load()[cat];
    const defaults = DEFAULTS[cat] || GENERIC_DEFAULTS;
    return normalizeCols(saved, defaults);
  };

  // ── Save columns for a category ─────────────────────────────────────────────
  window.saveColumns = function (cat, cols) {
    const config = load();
    const defaults = DEFAULTS[cat] || GENERIC_DEFAULTS;
    config[cat] = normalizeCols(cols, defaults);
    save(config);
  };

  // ── Reset columns for a category ────────────────────────────────────────────
  window.resetColumns = function (cat) {
    const config = load();
    delete config[cat];
    save(config);
  };

  // ── Open the column manager modal ───────────────────────────────────────────
  window.openColumnManager = function (cat) {
    const cols = getColumns(cat);

    // Determine label: built-in or custom
    const builtInLabels = { computer: 'Computers', monitor: 'Monitors', peripheral: 'Peripherals', stamp: 'Stamps' };
    let catLabel = builtInLabels[cat];
    if (!catLabel && window.getCustomCategories) {
      const custom = window.getCustomCategories().find(c => c.id === cat);
      catLabel = custom ? `${custom.icon} ${custom.name}` : cat;
    }

    const rows = cols.map((col, i) => `
      <div class="cm-row" draggable="true" data-index="${i}" data-key="${col.key}">
        <span class="cm-drag">⠿</span>
        <label class="cm-toggle">
          <input type="checkbox" ${col.visible ? 'checked' : ''} onchange="cmToggleVisible(${i})">
          <span class="cm-toggle-slider"></span>
        </label>
        <span class="cm-label">${col.label}</span>
        ${col.custom ? `<button class="cm-del-btn" onclick="cmDeleteCustom(${i})" title="Delete">✕</button>` : ''}
      </div>`).join('');

    const html = `
      <div id="cm-overlay" onclick="if(event.target===this)closeColumnManager()" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;
        display:flex;align-items:center;justify-content:center;">
        <div style="background:var(--surface);border-radius:14px;width:380px;max-height:80vh;
          display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
          
          <div style="padding:20px 20px 0;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:15px;font-weight:700;">Manage columns</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${catLabel}</div>
            </div>
            <button onclick="closeColumnManager()" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--text-muted);line-height:1;">✕</button>
          </div>

          <div style="padding:12px 20px 6px;font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:.8px;">
            Drag to reorder · Toggle visibility
          </div>

          <div id="cm-list" style="overflow-y:auto;padding:0 12px;flex:1;">
            ${rows}
          </div>

          <div style="padding:14px 20px;border-top:1px solid var(--border);">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;">
              <input id="cm-new-label" type="text" placeholder="New column name…"
                style="flex:1;padding:7px 10px;border-radius:7px;border:1px solid var(--border);
                background:var(--surface2);color:var(--text);font-size:13px;"
                onkeydown="if(event.key==='Enter')cmAddCustom()">
              <button onclick="cmAddCustom()" style="padding:7px 14px;border-radius:7px;
                background:var(--accent);color:white;border:none;cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;">
                + Add
              </button>
            </div>
            <div style="display:flex;gap:8px;">
              <button onclick="cmReset()" style="flex:1;padding:8px;border-radius:8px;
                background:var(--surface2);border:1px solid var(--border);color:var(--text-muted);
                cursor:pointer;font-size:13px;">↺ Reset</button>
              <button onclick="cmApply()" style="flex:2;padding:8px;border-radius:8px;
                background:var(--accent);border:none;color:white;cursor:pointer;font-size:13px;font-weight:600;">
                ✓ Apply
              </button>
            </div>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);

    // Store working state
    window._cmCat = cat;
    window._cmCols = JSON.parse(JSON.stringify(cols));

    initCmDragDrop();
  };

  window.closeColumnManager = function () {
    const el = document.getElementById('cm-overlay');
    if (el) el.remove();
  };

  window.cmToggleVisible = function (i) {
    window._cmCols[i].visible = !window._cmCols[i].visible;
  };

  window.cmDeleteCustom = function (i) {
    window._cmCols.splice(i, 1);
    refreshCmList();
  };

  window.cmAddCustom = function () {
    const input = document.getElementById('cm-new-label');
    const label = input.value.trim();
    if (!label) return;

    const normalizedLabel = label.replace(/\s+/g, ' ').trim();
    const existing = (window._cmCols || []).find(col => (col.label || '').toLowerCase() === normalizedLabel.toLowerCase());
    if (existing) {
      if (typeof toast === 'function') toast('Cette colonne existe déjà', 'error');
      input.focus();
      input.select();
      return;
    }

    const key = 'custom_' + normalizedLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    window._cmCols.push({ key, label: normalizedLabel, visible: true, sortable: false, fixed: false, custom: true });
    input.value = '';
    refreshCmList();
  };

  window.cmApply = async function () {
    try {
      saveColumns(window._cmCat, window._cmCols);
      if (typeof window.syncCurrentCategoryToDropbox === 'function') {
        await window.syncCurrentCategoryToDropbox(window._cmCat);
      }
      closeColumnManager();
      if (window.render) window.render();
      if (typeof toast === 'function') toast('Colonnes synchronisées avec Excel ✓', 'success');
    } catch (e) {
      if (typeof toast === 'function') toast('Erreur synchronisation colonnes: ' + e.message, 'error');
    }
  };

  window.cmReset = async function () {
    try {
      resetColumns(window._cmCat);
      if (typeof window.syncCurrentCategoryToDropbox === 'function') {
        await window.syncCurrentCategoryToDropbox(window._cmCat);
      }
      closeColumnManager();
      if (window.render) window.render();
      if (typeof toast === 'function') toast('Colonnes réinitialisées et Excel mis à jour ✓', 'success');
    } catch (e) {
      if (typeof toast === 'function') toast('Erreur réinitialisation colonnes: ' + e.message, 'error');
    }
  };

  function refreshCmList() {
    const list = document.getElementById('cm-list');
    if (!list) return;
    list.innerHTML = window._cmCols.map((col, i) => `
      <div class="cm-row" draggable="true" data-index="${i}" data-key="${col.key}">
        <span class="cm-drag">⠿</span>
        <label class="cm-toggle">
          <input type="checkbox" ${col.visible ? 'checked' : ''} onchange="cmToggleVisible(${i})">
          <span class="cm-toggle-slider"></span>
        </label>
        <span class="cm-label">${col.label}</span>
        ${col.custom ? `<button class="cm-del-btn" onclick="cmDeleteCustom(${i})" title="Delete">✕</button>` : ''}
      </div>`).join('');
    initCmDragDrop();
  }

  function initCmDragDrop() {
    const list = document.getElementById('cm-list');
    if (!list) return;
    let dragged = null;
    list.querySelectorAll('.cm-row').forEach(row => {
      row.addEventListener('dragstart', e => { dragged = row; row.style.opacity = '0.4'; });
      row.addEventListener('dragend', e => { dragged = null; row.style.opacity = '1'; });
      row.addEventListener('dragover', e => { e.preventDefault(); });
      row.addEventListener('drop', e => {
        e.preventDefault();
        if (!dragged || dragged === row) return;
        const fromIdx = parseInt(dragged.dataset.index);
        const toIdx = parseInt(row.dataset.index);
        const [moved] = window._cmCols.splice(fromIdx, 1);
        window._cmCols.splice(toIdx, 0, moved);
        refreshCmList();
      });
    });
  }

  // ── Inject CSS ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .cm-row {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 8px; border-radius: 8px; cursor: grab; margin-bottom: 2px;
      border: 1px solid transparent; transition: background 0.12s;
    }
    .cm-row:hover { background: var(--surface2); border-color: var(--border); }
    .cm-drag { color: var(--text-dim); font-size: 14px; cursor: grab; flex-shrink: 0; }
    .cm-label { flex: 1; font-size: 13px; font-weight: 500; color: var(--text); }
    .cm-del-btn {
      background: none; border: none; cursor: pointer; color: var(--danger);
      font-size: 12px; padding: 2px 5px; border-radius: 4px; line-height: 1;
    }
    .cm-del-btn:hover { background: rgba(255,80,80,0.1); }
    .cm-toggle { position: relative; display: inline-block; width: 32px; height: 18px; flex-shrink: 0; }
    .cm-toggle input { opacity: 0; width: 0; height: 0; }
    .cm-toggle-slider {
      position: absolute; inset: 0; border-radius: 18px;
      background: var(--border); transition: .2s; cursor: pointer;
    }
    .cm-toggle-slider::before {
      content: ''; position: absolute; width: 12px; height: 12px;
      left: 3px; top: 3px; border-radius: 50%;
      background: white; transition: .2s;
    }
    .cm-toggle input:checked + .cm-toggle-slider { background: var(--accent); }
    .cm-toggle input:checked + .cm-toggle-slider::before { transform: translateX(14px); }
    .btn-columns {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 7px; cursor: pointer; font-size: 13px;
      background: var(--surface2); border: 1px solid var(--border); color: var(--text-muted);
      transition: all 0.15s; white-space: nowrap;
    }
    .btn-columns:hover { border-color: var(--accent); color: var(--accent); }
  `;
  document.head.appendChild(style);

  // ── Column resizing ─────────────────────────────────────────────────────────
  const WIDTHS_KEY = 'assetHub_colWidths_v1';

  function loadWidths() {
    try { return JSON.parse(localStorage.getItem(WIDTHS_KEY) || '{}'); } catch { return {}; }
  }

  function saveWidths(data) {
    localStorage.setItem(WIDTHS_KEY, JSON.stringify(data));
  }

  function getCategory() {
    const wrap = document.querySelector('.table-wrap');
    return wrap ? wrap.dataset.cat : null;
  }

  function applyWidths(table, cat) {
    if (!cat) return;
    const widths = loadWidths()[cat];
    if (!widths) return;
    const ths = table.querySelectorAll('thead th');
    ths.forEach((th, i) => {
      if (widths[i]) th.style.width = widths[i] + 'px';
    });
  }

  function persistWidths(table, cat) {
    if (!cat) return;
    const ths = table.querySelectorAll('thead th');
    const widths = {};
    ths.forEach((th, i) => { widths[i] = th.offsetWidth; });
    const all = loadWidths();
    all[cat] = widths;
    saveWidths(all);
  }

  function makeResizable(table, cat) {
    const ths = table.querySelectorAll('thead th');
    const savedWidths = loadWidths()[cat];

    ths.forEach((th, colIndex) => {
      // Apply saved user-resize widths if any
      if (savedWidths && savedWidths[colIndex]) {
        th.style.width = savedWidths[colIndex] + 'px';
      }

      if (th.querySelector('.col-resize-handle')) return;
      th.style.position = 'relative';

      const handle = document.createElement('div');
      handle.className = 'col-resize-handle';
      th.appendChild(handle);

      let startX, startW;

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startX = e.clientX;
        startW = th.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        handle.classList.add('dragging');

        const onMove = (e) => {
          const diff = e.clientX - startX;
          const newW = Math.max(40, startW + diff);
          th.style.width = newW + 'px';
        };

        const onUp = () => {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          handle.classList.remove('dragging');
          persistWidths(table, cat);
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      handle.addEventListener('click', e => e.stopPropagation());
    });
  }

  // Keys that have a fixed width — everything else is flexible
  const FIXED_KEYS = new Set([
    'inStock','onboarded','status','ram','serialNumber','serviceTag',
    'brand','model','price','purchasePrice','purchaseDate','invoice','invoiceNum','localisation',
    'sku','type','actions'
  ]);

  function expandFlexCols(table) {
    const wrap = table.closest('.table-wrap');
    if (!wrap) return;

    const ths = Array.from(table.querySelectorAll('thead th'));
    const wrapWidth = wrap.clientWidth;

    // Sum of all fixed widths (use offsetWidth which reflects actual rendered width)
    let fixedTotal = 0;
    let flexCols = [];
    ths.forEach(th => {
      const key = th.dataset.key || 'actions';
      if (FIXED_KEYS.has(key) || !th.dataset.key) {
        fixedTotal += th.offsetWidth;
      } else {
        flexCols.push(th);
      }
    });

    if (flexCols.length === 0) return;

    const available = wrapWidth - fixedTotal - 2; // 2px for borders
    if (available <= 0) return;

    const perCol = Math.floor(available / flexCols.length);
    flexCols.forEach(th => {
      const minW = parseInt(th.style.width) || 100;
      const newW = Math.max(minW, perCol);
      th.style.width = newW + 'px';
      th.style.minWidth = '';  // never block drag
      th.style.maxWidth = '';
    });
  }

  window.initResizableCols = function () {
    const tables = document.querySelectorAll('.table-wrap table');
    tables.forEach(table => {
      const cat = getCategory();
      makeResizable(table, cat);
      const savedWidths = loadWidths()[cat];
      if (!savedWidths) expandFlexCols(table);
    });
  };

  // Re-expand on window resize
  let _resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      document.querySelectorAll('.table-wrap table').forEach(table => {
        const cat = table.closest('.table-wrap')?.dataset.cat;
        if (!loadWidths()[cat]) expandFlexCols(table);
      });
    }, 100);
  });

  window.resetColWidths = function (cat) {
    const all = loadWidths();
    delete all[cat];
    saveWidths(all);
    if (window.render) window.render();
  };

  const resizeStyle = document.createElement("style");
  resizeStyle.textContent = `
.col-resize-handle {
  position: absolute; right: -2px; top: 0; bottom: 0; width: 6px;
  cursor: col-resize; z-index: 10; background: transparent;
  transition: background 0.15s ease, opacity 0.15s ease; border-radius: 3px;
}
.col-resize-handle:hover, .col-resize-handle.dragging { background: #3b82f6; opacity: 0.8; }
.table-wrap th { position: relative; user-select: none; }
.table-wrap th:hover .col-resize-handle { opacity: 1; }
`;
  document.head.appendChild(resizeStyle);

})();
