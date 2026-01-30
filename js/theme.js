/* ============================================
   Theme Toggle - Light / Dark mode with persistence
   ============================================ */

(function () {
    const THEME_KEY = 'theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';

    const root = document.documentElement;
    const switchEl = document.getElementById('theme-switch');

    function getStoredTheme() {
        try {
            return localStorage.getItem(THEME_KEY);
        } catch (e) {
            return null;
        }
    }

    function setStoredTheme(value) {
        try {
            localStorage.setItem(THEME_KEY, value);
        } catch (e) {}
    }

    function applyTheme(theme) {
        const isLight = theme === THEME_LIGHT;
        if (isLight) {
            root.setAttribute('data-theme', THEME_LIGHT);
        } else {
            root.removeAttribute('data-theme');
        }
        if (switchEl) {
            switchEl.setAttribute('aria-checked', isLight ? 'true' : 'false');
            switchEl.classList.toggle('theme-switch-on', isLight);
        }
    }

    function initTheme() {
        const stored = getStoredTheme();
        if (stored === THEME_LIGHT) {
            applyTheme(THEME_LIGHT);
        } else {
            applyTheme(THEME_DARK);
        }
    }

    function toggleTheme() {
        const current = root.getAttribute('data-theme');
        const next = current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
        setStoredTheme(next);
        applyTheme(next);
    }

    if (switchEl) {
        switchEl.addEventListener('click', toggleTheme);
    }

    initTheme();
})();
