/**
 * Key the resolved theme is persisted under. Exported so the theme toggle and
 * this script cannot drift apart — a mismatch here shows up as the toggle
 * appearing to do nothing after a reload.
 */
export const THEME_STORAGE_KEY = 'questmind-theme'

// Runs synchronously in <body>, before React hydrates and before first paint.
// It has to be an inline script rather than an effect: reading localStorage
// after hydration means the light theme is painted first and then replaced,
// which is the flash this exists to prevent. Wrapped in try/catch because
// localStorage throws outright when cookies are blocked, and a themeless page
// is a far better outcome than a blank one.
const script = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var t=(s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.classList.toggle('light',t==='light');r.style.colorScheme=t;}catch(e){}})();`

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
