// js/theme.js — Manages light/dark × golden/classic themes

const KEYS = { mode: 'wl-mode', palette: 'wl-palette' };

export function initTheme() {
  const mode    = localStorage.getItem(KEYS.mode)    || 'light';
  const palette = localStorage.getItem(KEYS.palette) || 'golden';
  apply(mode, palette);
  return { mode, palette };
}

export function apply(mode, palette) {
  const html = document.documentElement;
  html.setAttribute('data-mode',    mode);
  html.setAttribute('data-palette', palette);
  localStorage.setItem(KEYS.mode,    mode);
  localStorage.setItem(KEYS.palette, palette);
}

export function setMode(mode) {
  const palette = localStorage.getItem(KEYS.palette) || 'golden';
  apply(mode, palette);
}

export function setPalette(palette) {
  const mode = localStorage.getItem(KEYS.mode) || 'light';
  apply(mode, palette);
}

// ── Build / sync the floating theme-bar buttons ─────────────────────
export function syncThemeBar(mode, palette) {
  const pills = document.querySelectorAll('.theme-pill');
  pills.forEach(btn => {
    const t = btn.dataset.theme;
    btn.classList.remove('on', 'on-s');
    if (t === mode)    btn.classList.add('on');
    if (t === palette) btn.classList.add('on-s');
  });
}

export function buildThemeBar(mode, palette) {
  const bar = document.getElementById('themeBar');
  if (!bar) return;

  bar.innerHTML = `
    <button class="theme-pill${mode === 'light' ? ' on' : ''}" data-theme="light" title="Light mode">☀️</button>
    <button class="theme-pill${mode === 'dark'  ? ' on' : ''}" data-theme="dark"  title="Dark mode">🌙</button>
    <span class="theme-sep"></span>
    <button class="theme-pill${palette === 'golden'  ? ' on-s' : ''}" data-theme="golden"  title="Golden Jubilee theme" style="font-size:.7rem;padding:.28rem .55rem">🏅 Jubilee</button>
    <button class="theme-pill${palette === 'classic' ? ' on-s' : ''}" data-theme="classic" title="Classic theme"         style="font-size:.7rem;padding:.28rem .55rem">📚 Classic</button>
  `;

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.theme-pill');
    if (!btn) return;
    const t = btn.dataset.theme;
    if (t === 'light' || t === 'dark') {
      setMode(t);
    } else {
      setPalette(t);
    }
    const newMode    = localStorage.getItem(KEYS.mode);
    const newPalette = localStorage.getItem(KEYS.palette);
    buildThemeBar(newMode, newPalette);
  });
}
