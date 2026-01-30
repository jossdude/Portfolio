/**
 * Loads project and little-project data from JSON and renders cards into the grids.
 * Expects: data/projects-index.json, data/little-projects-index.json,
 * projects/{slug}/project.json, little-projects/{slug}/project.json
 */
(function () {
  const PROJECT_ICONS = {
    box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    lightning: 'M13 10V3L4 14h7v7l9-11h-7z'
  };

  const FLIP_HINT_PATH = 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';
  const LITTLE_PROJECT_ICON_PATH = 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9';

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function createFeaturedProjectCard(data, slug) {
    const iconPath = PROJECT_ICONS[data.icon] || PROJECT_ICONS.box;
    const backLabel = data.backLabel || 'Learn more';
    const article = document.createElement('article');
    article.className = 'project-card';
    article.innerHTML =
      '<div class="project-card-inner">' +
        '<div class="project-front">' +
          '<div>' +
            '<div class="project-icon"><svg viewBox="0 0 24 24"><path d="' + escapeHtml(iconPath) + '"/></svg></div>' +
            '<h3>' + escapeHtml(data.title) + '</h3>' +
            '<p>' + escapeHtml(data.description) + '</p>' +
          '</div>' +
          '<span class="project-tag">' + escapeHtml(data.tag) + '</span>' +
          '<div class="flip-hint">' +
            '<span>Hover to flip</span>' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="' + escapeHtml(FLIP_HINT_PATH) + '"/></svg>' +
          '</div>' +
        '</div>' +
        '<div class="project-back">' +
          '<h3>' + escapeHtml(data.backTitle) + '</h3>' +
          '<p>' + escapeHtml(data.backDescription) + '</p>' +
          '<div class="btn btn-secondary" style="background: rgba(255,255,255,0.2); border-color: white;">' + escapeHtml(backLabel) + '</div>' +
        '</div>' +
      '</div>';
    return article;
  }

  function createLittleProjectCard(data) {
    const a = document.createElement('a');
    a.href = data.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'little-project-card';
    a.innerHTML =
      '<div class="little-project-icon">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="' + escapeHtml(LITTLE_PROJECT_ICON_PATH) + '"/>' +
        '</svg>' +
      '</div>' +
      '<h3>' + escapeHtml(data.title) + '</h3>' +
      '<p>' + escapeHtml(data.description) + '</p>' +
      '<span class="little-project-link">Visit Site →</span>';
    return a;
  }

  function setGridLoading(selector, message) {
    const grid = document.querySelector(selector);
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center; color: var(--text-muted);">' + escapeHtml(message) + '</p>';
  }

  function setGridError(selector, message) {
    const grid = document.querySelector(selector);
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center; color: var(--text-muted);">' + escapeHtml(message) + '</p>';
  }

  async function loadFeaturedProjects() {
    const grid = document.querySelector('#projects .projects-grid');
    if (!grid) return;
    setGridLoading('#projects .projects-grid', 'Loading…');
    let slugs = [];
    try {
      const res = await fetch('data/projects-index.json');
      if (!res.ok) throw new Error(res.statusText);
      slugs = await res.json();
    } catch (e) {
      setGridError('#projects .projects-grid', 'Could not load projects.');
      return;
    }
    grid.innerHTML = '';
    const base = 'projects/';
    for (const slug of slugs) {
      try {
        const res = await fetch(base + slug + '/project.json');
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        grid.appendChild(createFeaturedProjectCard(data, slug));
      } catch (e) {
        console.warn('Failed to load project:', slug, e);
      }
    }
  }

  async function loadLittleProjects() {
    const grid = document.querySelector('#little-projects .little-projects-grid');
    if (!grid) return;
    setGridLoading('#little-projects .little-projects-grid', 'Loading…');
    let slugs = [];
    try {
      const res = await fetch('data/little-projects-index.json');
      if (!res.ok) throw new Error(res.statusText);
      slugs = await res.json();
    } catch (e) {
      setGridError('#little-projects .little-projects-grid', 'Could not load little projects.');
      return;
    }
    grid.innerHTML = '';
    const base = 'little-projects/';
    for (const slug of slugs) {
      try {
        const res = await fetch(base + slug + '/project.json');
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        grid.appendChild(createLittleProjectCard(data));
      } catch (e) {
        console.warn('Failed to load little project:', slug, e);
      }
    }
  }

  function init() {
    loadFeaturedProjects();
    loadLittleProjects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
