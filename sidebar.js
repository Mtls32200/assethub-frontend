// sidebar.js — AssetHub sidebar collapse toggle

(function () {
  const STORAGE_KEY = 'sidebarCollapsed';

  function isCollapsed() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  function applyState(collapsed) {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    if (!sidebar || !main) return;
    sidebar.classList.toggle('collapsed', collapsed);
    main.classList.toggle('sidebar-collapsed', collapsed);
  }

  window.toggleSidebar = function () {
    const newState = !isCollapsed();
    localStorage.setItem(STORAGE_KEY, newState);
    applyState(newState);
  };

  window.initSidebar = function () {
    applyState(isCollapsed());
  };
})();
