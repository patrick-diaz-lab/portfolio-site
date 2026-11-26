// Design lab: one small script for every direction's map. Progressive enhancement only:
// each part is already a link and its text is in the list, so the page works without it.
//   - pointing at or focusing a part (in the drawing or in the list) marks both as selected
//   - where the direction has a detail card ([data-card]), the card shows that part
//   - touch: the first tap on a part in the drawing selects it, the second follows its link
export function initLabMap(root: HTMLElement): void {
  const parts = [...root.querySelectorAll<SVGAElement>("a.part")].sort((a, b) => Number(a.dataset.n) - Number(b.dataset.n));
  if (!parts.length) return;
  const rows = new Map([...root.querySelectorAll<HTMLElement>("[data-row]")].map((r) => [r.dataset.row!, r]));
  const card = root.querySelector<HTMLElement>("[data-card]");
  const field = (k: string) => card?.querySelector<HTMLElement>(`[data-card-${k}]`);
  const open = card?.querySelector<HTMLAnchorElement>("[data-card-open]");
  let current: SVGAElement | undefined;
  let pointer = "mouse";
  let tapped: Element | null = null;

  const select = (a: SVGAElement) => {
    if (current) {
      current.classList.remove("is-selected");
      rows.get(current.id)?.classList.remove("is-selected");
    }
    current = a;
    a.classList.add("is-selected");
    rows.get(a.id)?.classList.add("is-selected");
    if (!card) return;
    const set = (k: string, v: string) => { const el = field(k); if (el) el.textContent = v; };
    set("n", a.dataset.n ?? "");
    set("count", String(parts.length).padStart(2, "0"));
    set("line", a.dataset.line ?? "");
    set("title", a.dataset.label ?? "");
    set("text", a.dataset.hover ?? "");
    if (open) {
      open.href = a.getAttribute("href") ?? "#";
      const lang = a.getAttribute("hreflang");
      if (lang) open.setAttribute("hreflang", lang);
      else open.removeAttribute("hreflang");
    }
  };

  document.addEventListener("pointerdown", (e) => {
    pointer = e.pointerType;
    if (pointer !== "mouse" && tapped && !tapped.contains(e.target as Node)) tapped = null;
  }, true);

  for (const a of parts) {
    a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") select(a); });
    a.addEventListener("focus", () => select(a));
    a.addEventListener("click", (e) => {
      if (e.detail === 0 || pointer === "mouse" || tapped === a) return;
      e.preventDefault();
      select(a);
      tapped = a;
    });
    const row = rows.get(a.id);
    row?.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") select(a); });
    row?.addEventListener("focusin", () => select(a));
  }
  const step = (d: number) => select(parts[((current ? parts.indexOf(current) : 0) + d + parts.length) % parts.length]!);
  card?.querySelector("[data-card-prev]")?.addEventListener("click", () => step(-1));
  card?.querySelector("[data-card-next]")?.addEventListener("click", () => step(1));

  if (card) card.hidden = false;
  root.classList.add("is-enhanced");
  const start = parts.find((a) => a.id === root.dataset.start);
  if (start) select(start);
}
