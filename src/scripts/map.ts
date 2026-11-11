// Hover/focus cards for the piece map (PLAN 1.3, D7). Progressive enhancement only: every
// part is already a link and its text is in the list under the map, so the map works
// without this script. On touch screens the first tap on a part opens its card; the card's
// "Open" button (or a second tap) follows the link.

export function initMap(root: HTMLElement): void {
  const frame = root.querySelector<HTMLElement>(".map-frame");
  const card = root.querySelector<HTMLElement>("[data-card]");
  if (!frame || !card) return;
  const title = card.querySelector<HTMLElement>("[data-card-title]")!;
  const text = card.querySelector<HTMLElement>("[data-card-text]")!;
  const open = card.querySelector<HTMLAnchorElement>("[data-card-open]")!;
  const parts = [...frame.querySelectorAll<SVGAElement>("a.part")];

  let pointer = "mouse";
  let current: SVGAElement | null = null;
  let tapped: SVGAElement | null = null;
  let timer = 0;

  const place = (a: SVGAElement) => {
    const f = frame.getBoundingClientRect();
    const r = a.querySelector(".box")?.getBoundingClientRect() ?? a.getBoundingClientRect();
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const left = Math.max(0, Math.min(r.left - f.left, f.width - w));
    const below = r.bottom - f.top + 8;
    const top = below + h <= f.height || r.top - f.top < h + 8 ? below : r.top - f.top - h - 8;
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  };

  const show = (a: SVGAElement) => {
    window.clearTimeout(timer);
    if (current && current !== a) current.classList.remove("is-open");
    current = a;
    title.textContent = a.dataset.label ?? "";
    text.textContent = a.dataset.hover ?? "";
    open.href = a.getAttribute("href") ?? "#h-parts";
    card.hidden = false;
    a.classList.add("is-open");
    place(a);
  };

  const hide = () => {
    window.clearTimeout(timer);
    card.hidden = true;
    current?.classList.remove("is-open");
    current = null;
    tapped = null;
  };
  const hideSoon = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(hide, 180);
  };

  document.addEventListener("pointerdown", (e) => {
    pointer = e.pointerType;
    const t = e.target as Node;
    if (pointer !== "mouse" && current && !card.contains(t) && !current.contains(t)) hide();
  }, true);

  for (const a of parts) {
    a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") show(a); });
    a.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hideSoon(); });
    a.addEventListener("focus", () => { if (a.matches(":focus-visible")) show(a); });
    a.addEventListener("blur", () => { if (!tapped) hideSoon(); });
    a.addEventListener("click", (e) => {
      // Keyboard activation (detail 0) and mouse clicks follow the link at once.
      if (e.detail === 0 || pointer === "mouse") return;
      if (tapped !== a) {
        e.preventDefault();
        show(a);
        tapped = a;
      }
    });
  }
  card.addEventListener("pointerenter", () => window.clearTimeout(timer));
  card.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hideSoon(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && current) hide(); });
  window.addEventListener("resize", () => { if (current) place(current); });
}
