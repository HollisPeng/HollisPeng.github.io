type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function getSystemTheme(): Theme {
  return media.matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  const meta = document.getElementById('theme-color-meta');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#131314' : '#F8FAFD');
  }
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const nextLabel =
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    toggle.setAttribute('aria-label', nextLabel);
    toggle.setAttribute('title', nextLabel);
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

const currentTheme: Theme =
  document.documentElement.dataset.theme === 'dark' ||
  document.documentElement.dataset.theme === 'light'
    ? document.documentElement.dataset.theme
    : getStoredTheme() ?? getSystemTheme();

applyTheme(currentTheme);

const toggleBtn = document.getElementById('theme-toggle');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const active: Theme =
      document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const next: Theme = active === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      if (next === getSystemTheme()) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      /* Ignore storage errors in restricted browsing modes. */
    }
  });
}

// Automatically follow system theme changes
media.addEventListener('change', event => {
  const systemTheme: Theme = event.matches ? 'dark' : 'light';
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  applyTheme(systemTheme);
});
