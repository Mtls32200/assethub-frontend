// category.js — AssetHub custom category manager
// Handles: creation, edit (name/icon), deletion with Dropbox archiving

(function () {
  const STORAGE_KEY = 'assetHub_customCategories_v1';

  const STANDARD_COLUMNS = [
    { key: 'name',         label: 'Nom',          visible: true,  sortable: true,  fixed: false },
    { key: 'user',         label: 'Utilisateur',  visible: true,  sortable: false, fixed: false },
    { key: 'brand',        label: 'Marque',        visible: true,  sortable: true,  fixed: false },
    { key: 'model',        label: 'Model',        visible: true,  sortable: true,  fixed: false },
    { key: 'serialNumber', label: 'Serial Number',      visible: true,  sortable: true,  fixed: false },
    { key: 'localisation', label: 'Localisation',  visible: true,  sortable: true,  fixed: false },
    { key: 'status',       label: 'Statut',        visible: true,  sortable: true,  fixed: false },
    { key: 'notes',        label: 'Notes',         visible: true,  sortable: false, fixed: false },
  ];

  // ── Persist & Load ───────────────────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function save(cats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  window.getCustomCategories = function () {
    return load();
  };

  window.getCustomCategory = function (id) {
    return load().find(c => c.id === id) || null;
  };

  // ── Open "New Category" modal ────────────────────────────────────────────────
  window.openNewCategoryModal = function () {
    const icons = ['📦','💻','🖨','📷','🎧','🔌','📱','🖱','⌨️','🖥','📺','🔋','💡','🛠','📡','🗄','🔒','📠','🖲','💾','🗃','📟','🎙','🎚','🎛','🖋','🗂','📋','📌','🏷'];
    const html = `
      <div id="cat-modal-overlay" onclick="if(event.target===this)closeCategoryModal()" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
        z-index:1100;display:flex;align-items:center;justify-content:center;">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;
          width:90%;max-width:480px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.4);">

          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:16px;font-weight:700;">New category</div>
            <button onclick="closeCategoryModal()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-muted);line-height:1;padding:2px 6px;border-radius:6px;">✕</button>
          </div>

          <div style="padding:24px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;">Category name</label>
                <input id="cat-name-input" class="form-input" placeholder="e.g., Phones, Printers…" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none;">
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;">Selected icon</label>
                <div id="cat-icon-preview" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:22px;text-align:center;cursor:pointer;" onclick="document.getElementById('cat-icon-picker').style.display='flex'">📦</div>
              </div>
            </div>

            <div id="cat-icon-picker" style="display:none;flex-wrap:wrap;gap:6px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:20px;max-height:160px;overflow-y:auto;">
              ${icons.map(ic => `<button onclick="selectCatIcon('${ic}')" style="background:none;border:1px solid transparent;border-radius:7px;padding:6px 8px;font-size:20px;cursor:pointer;transition:all .1s;" onmouseover="this.style.background='var(--surface)';this.style.borderColor='var(--border-light)'" onmouseout="this.style.background='none';this.style.borderColor='transparent'">${ic}</button>`).join('')}
            </div>

            <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:20px;">
              <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;">Colonnes standard incluses</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${STANDARD_COLUMNS.map(c => `<span style="background:rgba(79,142,247,0.1);color:var(--accent);border:1px solid rgba(79,142,247,0.2);border-radius:20px;padding:2px 10px;font-size:11.5px;font-weight:500;">${c.label}</span>`).join('')}
              </div>
            </div>

            <div style="font-size:12px;color:var(--text-muted);padding:10px 12px;background:rgba(79,142,247,0.06);border:1px solid rgba(79,142,247,0.15);border-radius:8px;">
              📁 A file <strong style="color:var(--text)">[nom]_inventory.xlsx</strong> will be created in your Dropbox.
            </div>
          </div>

          <div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;">
            <button onclick="closeCategoryModal()" class="btn btn-secondary">Annuler</button>
            <button onclick="saveNewCategory()" class="btn btn-primary">✓ Create category</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    window._catIconSelected = '📦';
    document.getElementById('cat-name-input').focus();
  };

  window.selectCatIcon = function (icon) {
    window._catIconSelected = icon;
    document.getElementById('cat-icon-preview').textContent = icon;
    document.getElementById('cat-icon-picker').style.display = 'none';
  };

  window.closeCategoryModal = function () {
    document.getElementById('cat-modal-overlay')?.remove();
  };

  window.saveNewCategory = async function () {
    const nameEl = document.getElementById('cat-name-input');
    const name = nameEl?.value?.trim();
    if (!name) { nameEl?.focus(); return; }

    const icon = window._catIconSelected || '📦';
    const id = 'cat_' + name.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '_' + Date.now();
    const filename = name.toLowerCase().replace(/\s+/g, '_') + '_inventory.xlsx';
    const dbxPath = `/02. OPS/04. MTLS IT-TI/01b. Inventory/${filename}`;

    const cats = load();
    cats.push({ id, name, icon, filename, dbxPath, createdAt: new Date().toISOString() });
    save(cats);

    // Register default columns for this category
    const colCfg = JSON.parse(localStorage.getItem('assetHub_columns_v1') || '{}');
    colCfg[id] = JSON.parse(JSON.stringify(STANDARD_COLUMNS));
    localStorage.setItem('assetHub_columns_v1', JSON.stringify(colCfg));

    // Initialize empty data array in state
    if (window.state) window.state[id] = [];

    // Create XLSX on Dropbox
    try {
      const headers = STANDARD_COLUMNS.map(c => c.label);
      const buf = rowsToXlsxBuffer([], headers);
      await dbxUploadFile(dbxPath, buf);
      toast(`Category "${name}" created ✓`, 'success');
    } catch (e) {
      toast(`Category created, Dropbox error: ${e.message}`, 'error');
    }

    closeCategoryModal();
    if (window.render) window.render();
  };

  // ── Open "Edit Category" modal ───────────────────────────────────────────────
  window.openEditCategoryModal = function (catId) {
    const cats = load();
    const cat = cats.find(c => c.id === catId);
    if (!cat) return;

    const icons = ['📦','💻','🖨','📷','🎧','🔌','📱','🖱','⌨️','🖥','📺','🔋','💡','🛠','📡','🗄','🔒','📠','🖲','💾','🗃','📟','🎙','🎚','🎛','🖋','🗂','📋','📌','🏷'];

    const html = `
      <div id="cat-edit-overlay" onclick="if(event.target===this)closeEditCategoryModal()" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
        z-index:1100;display:flex;align-items:center;justify-content:center;">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;
          width:90%;max-width:480px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.4);">

          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:16px;font-weight:700;">Edit category</div>
            <button onclick="closeEditCategoryModal()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-muted);line-height:1;padding:2px 6px;border-radius:6px;">✕</button>
          </div>

          <div style="padding:24px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;">Nom</label>
                <input id="cat-edit-name" class="form-input" value="${cat.name}" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none;">
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                <label style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;">Icon</label>
                <div id="cat-edit-icon-preview" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:22px;text-align:center;cursor:pointer;" onclick="document.getElementById('cat-edit-icon-picker').style.display='flex'">${cat.icon}</div>
              </div>
            </div>

            <div id="cat-edit-icon-picker" style="display:none;flex-wrap:wrap;gap:6px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:20px;max-height:160px;overflow-y:auto;">
              ${icons.map(ic => `<button onclick="selectEditCatIcon('${ic}')" style="background:none;border:1px solid transparent;border-radius:7px;padding:6px 8px;font-size:20px;cursor:pointer;transition:all .1s;" onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background='none'">${ic}</button>`).join('')}
            </div>

            <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:12px;">
              <div style="font-size:12px;font-weight:600;color:var(--danger);margin-bottom:6px;">⚠ Dangerous zone</div>
              <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Deleting this category will archive the Excel file in the folder <code style="color:var(--text)">historique/</code> in Dropbox.</p>
              <button onclick="confirmDeleteCategory('${cat.id}')" class="btn btn-danger btn-sm">🗑 Delete category</button>
            </div>
          </div>

          <div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;">
            <button onclick="closeEditCategoryModal()" class="btn btn-secondary">Annuler</button>
            <button onclick="saveEditCategory('${cat.id}')" class="btn btn-primary">✓ Save</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    window._catEditIconSelected = cat.icon;
  };

  window.selectEditCatIcon = function (icon) {
    window._catEditIconSelected = icon;
    document.getElementById('cat-edit-icon-preview').textContent = icon;
    document.getElementById('cat-edit-icon-picker').style.display = 'none';
  };

  window.closeEditCategoryModal = function () {
    document.getElementById('cat-edit-overlay')?.remove();
  };

  window.saveEditCategory = function (catId) {
    const nameEl = document.getElementById('cat-edit-name');
    const name = nameEl?.value?.trim();
    if (!name) { nameEl?.focus(); return; }

    const icon = window._catEditIconSelected || '📦';
    const cats = load();
    const idx = cats.findIndex(c => c.id === catId);
    if (idx < 0) return;

    cats[idx].name = name;
    cats[idx].icon = icon;
    save(cats);

    closeEditCategoryModal();
    toast(`Category updated ✓`, 'success');
    if (window.render) window.render();
  };

  // ── Confirm + Delete category ────────────────────────────────────────────────
  window.confirmDeleteCategory = function (catId) {
    const cat = load().find(c => c.id === catId);
    if (!cat) return;

    const html = `
      <div id="cat-del-overlay" onclick="if(event.target===this)closeCatDelModal()" style="
        position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);
        z-index:1200;display:flex;align-items:center;justify-content:center;">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;
          width:90%;max-width:400px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.5);">
          <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <div style="font-size:16px;font-weight:700;color:var(--danger);">Delete category</div>
            <button onclick="closeCatDelModal()" style="background:none;border:none;cursor:pointer;font-size:20px;color:var(--text-muted);">✕</button>
          </div>
          <div style="padding:24px;">
            <p style="color:var(--text-muted);font-size:14px;line-height:1.6;">
              Delete <strong style="color:var(--text)">${cat.icon} ${cat.name}</strong> ?<br><br>
              Le fichier <code style="color:var(--accent)">${cat.filename}</code> sera déplacé vers <code style="color:var(--accent)">historique/</code> in Dropbox. This action cannot be undone.
            </p>
          </div>
          <div style="padding:16px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;">
            <button onclick="closeCatDelModal()" class="btn btn-secondary">Annuler</button>
            <button onclick="doDeleteCategory('${cat.id}')" class="btn btn-danger">🗑 Delete permanently</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  };

  window.closeCatDelModal = function () {
    document.getElementById('cat-del-overlay')?.remove();
  };

  window.doDeleteCategory = async function (catId) {
    const cats = load();
    const cat = cats.find(c => c.id === catId);
    if (!cat) return;

    try {
      // Archive the Excel file on Dropbox
      const archivePath = `/02. OPS/04. MTLS IT-TI/01b. Inventory/historique/${cat.filename.replace('.xlsx', '')}_archived_${Date.now()}.xlsx`;
      try {
        await dbxRequest('files/move_v2', {
          from_path: cat.dbxPath,
          to_path: archivePath,
          allow_shared_folder: false,
          autorename: true,
          allow_ownership_transfer: false
        });
        toast(`File archived to history/ ✓`, 'info');
      } catch (e) {
        // File might not exist yet — not a blocker
        console.warn('Archive move failed (file may not exist):', e.message);
      }

      // Remove from local storage
      const updated = cats.filter(c => c.id !== catId);
      save(updated);

      // Remove columns config
      const colCfg = JSON.parse(localStorage.getItem('assetHub_columns_v1') || '{}');
      delete colCfg[catId];
      localStorage.setItem('assetHub_columns_v1', JSON.stringify(colCfg));

      // Remove from state
      if (window.state) delete window.state[catId];

      // If we were viewing this category, go back to dashboard
      if (window.state && window.state.view === catId) {
        window.state.view = 'dashboard';
      }

      closeCatDelModal();
      closeEditCategoryModal();
      toast(`Category "${cat.name}" deleted`, 'success');
      if (window.render) window.render();
    } catch (e) {
      toast('Erreur suppression: ' + e.message, 'error');
    }
  };

  // ── Normalize / denormalize for generic categories ───────────────────────────
  window.normalizeGenericCategory = function (catId, rows) {
    return rows.map((r, i) => {
      const cat = window.getCustomCategory(catId);
      const obj = {
        id: r['Asset ID'] || `${catId.slice(0,3).toUpperCase()}${i+1}`,
        name: (r['Nom'] || '').trim(),
        user: (r['Utilisateur'] || '').trim(),
        brand: (r['Marque'] || '').trim(),
        model: (r['Model'] || r['Modèle'] || '').trim(),
        serialNumber: (r['Serial Number'] || '').replace(/\s/g,''),
        localisation: (r['Localisation'] || '').trim(),
        status: (r['Statut'] || '').trim(),
        notes: (r['Notes'] || '').trim(),
        _type: catId,
      };
      // Custom columns
      if (typeof getColumns === 'function') {
        getColumns(catId).filter(c => c.custom).forEach(col => { obj[col.key] = (r[col.label] || '').trim(); });
      }
      return obj;
    });
  };

  window.denormalizeGenericCategory = function (catId, item) {
    const row = {
      'Asset ID': item.id,
      'Nom': item.name || '',
      'Utilisateur': item.user || '',
      'Marque': item.brand || '',
      'Model': item.model || '',
      'Serial Number': item.serialNumber || '',
      'Localisation': item.localisation || '',
      'Statut': item.status || '',
      'Notes': item.notes || '',
    };
    if (typeof getColumns === 'function') {
      getColumns(catId).filter(c => c.custom).forEach(col => { row[col.label] = item[col.key] || ''; });
    }
    return row;
  };

  window.saveGenericCategory = async function (catId) {
    const cat = window.getCustomCategory(catId);
    if (!cat || !window.state || window.state[catId] == null) return;
    const customCols = (typeof getColumns === 'function') ? getColumns(catId).filter(c => c.custom) : [];
    const rows = window.state[catId].map(item => window.denormalizeGenericCategory(catId, item));
    const headers = ['Asset ID','Nom','Utilisateur','Marque','Model','Serial Number','Localisation','Statut','Notes', ...customCols.map(c => c.label)];
    const buf = rowsToXlsxBuffer(rows, headers);
    await dbxUploadFile(cat.dbxPath, buf);
  };

  // ── Inject CSS for settings gear button ─────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .cat-settings-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 7px;
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--text-muted); cursor: pointer; font-size: 14px;
      transition: all 0.15s; flex-shrink: 0;
    }
    .cat-settings-btn:hover { background: var(--border); color: var(--text); border-color: var(--border-light); }

    .nav-inventory-header {
      display: flex; align-items: center; justify-content: space-between; padding: 0 8px 8px;
    }
    .nav-add-cat-btn {
      width: 20px; height: 20px; border-radius: 5px;
      background: rgba(79,142,247,0.12); border: 1px solid rgba(79,142,247,0.2);
      color: var(--accent); cursor: pointer; font-size: 14px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s; flex-shrink: 0; line-height: 1;
    }
    .nav-add-cat-btn:hover { background: var(--accent); color: white; }

    .page-title-with-settings {
      display: flex; align-items: center; gap: 10px;
    }
  `;
  document.head.appendChild(style);

})();
