// The light / dark switch (D25, PLAN 1.18). Progressive enhancement only: without this
// script the button stays hidden and the page follows the system setting. The choice is kept
// in the browser (the one thing the site stores there; the privacy page says so) and applied
// before the first paint by the inline script in the page head. A page still renders
// correctly when storage is blocked.
export function initTheme(): void {
  const root = document.documentElement;
  const dark = () => (root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
  const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")];
  const sync = () => buttons.forEach((b) => b.setAttribute("aria-pressed", String(dark())));
  for (const b of buttons) {
    b.hidden = false;
    b.addEventListener("click", () => {
      const next = dark() ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch {}
      sync();
    });
  }
  sync();
}
