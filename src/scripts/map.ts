// The piece map's panel (PLAN 1.3, D7; layout A, Patrick 2026-11-13). Progressive
// enhancement only: every part is already a link and its text is in the list under the map,
// so the map works without this script. With it, a panel next to the drawing shows one part
// at a time, and on wide screens the list becomes a compact index of names.
//   Mouse: hovering a part, on the map or in the index, shows it; a click follows its page.
//   Keyboard: focus shows it; Enter follows its page.
//   Touch: the first tap shows it; a second tap, or "Read the page", follows the page.
// A part without a page has nowhere to go, so activating it only shows it in the panel.

export function initMap(root: HTMLElement): void {
  const frame = root.querySelector<HTMLElement>(".map-frame");
  const card = root.querySelector<HTMLElement>("[data-card]");
  if (!frame || !card) return;
  const meta = card.querySelector<HTMLElement>("[data-card-meta]")!;
  const title = card.querySelector<HTMLElement>("[data-card-title]")!;
  const text = card.querySelector<HTMLElement>("[data-card-text]")!;
  const open = card.querySelector<HTMLAnchorElement>("[data-card-open]")!;
  const english = card.querySelector<HTMLElement>("[data-card-english]");
  const parts = [...frame.querySelectorAll<SVGAElement>("a.part")];
  if (parts.length === 0) return;

  const item = (a: SVGAElement) => root.querySelector<HTMLElement>(`#part-${CSS.escape(a.id)}`);
  const hasPage = (a: SVGAElement) => !(a.getAttribute("href") ?? "#").startsWith("#");
  // The panel and the index only act while the drawing is shown (not on phones).
  const wide = () => frame.offsetParent !== null;

  let current = parts[0]!;
  let pointer = "mouse";
  let tapped: Element | null = null;

  const show = (a: SVGAElement) => {
    current.classList.remove("is-selected");
    item(current)?.classList.remove("is-selected");
    current = a;
    a.classList.add("is-selected");
    const li = item(a);
    li?.classList.add("is-selected");
    const line = li?.closest(".wire-group")?.querySelector(".wire-line")?.textContent?.trim();
    const n = (i: number) => String(i).padStart(2, "0");
    meta.textContent = `${line ? `${line} · ` : ""}${n(parts.indexOf(a) + 1)} / ${n(parts.length)}`;
    title.textContent = a.dataset.label ?? "";
    text.textContent = a.dataset.hover ?? "";
    const page = hasPage(a);
    open.hidden = !page;
    if (page) open.href = a.getAttribute("href")!;
    const lang = a.getAttribute("hreflang");
    if (lang) open.setAttribute("hreflang", lang);
    else open.removeAttribute("hreflang");
    if (english) english.hidden = !(page && lang);
  };
  const step = (d: number) => show(parts[(parts.indexOf(current) + d + parts.length) % parts.length]!);

  document.addEventListener("pointerdown", (e) => {
    pointer = e.pointerType;
    if (pointer !== "mouse" && tapped && !tapped.contains(e.target as Node)) tapped = null;
  }, true);

  for (const a of parts) {
    a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") show(a); });
    a.addEventListener("focus", () => { if (a.matches(":focus-visible")) show(a); });
    a.addEventListener("click", (e) => {
      const page = hasPage(a);
      // Keyboard activation (detail 0) and mouse clicks follow a page at once.
      if (e.detail === 0 || pointer === "mouse") {
        if (!page) { e.preventDefault(); show(a); }
        return;
      }
      if (tapped !== a || !page) {
        e.preventDefault();
        show(a);
        tapped = a;
      }
    });

    // The same part in the index under the map.
    const name = item(a)?.querySelector<HTMLAnchorElement>("a.wire-name");
    if (!name) continue;
    name.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && wide()) show(a); });
    name.addEventListener("focus", () => { if (wide() && name.matches(":focus-visible")) show(a); });
    name.addEventListener("click", (e) => {
      if (wide() && !hasPage(a)) { e.preventDefault(); show(a); }
    });
  }

  card.querySelector("[data-card-prev]")?.addEventListener("click", () => step(-1));
  card.querySelector("[data-card-next]")?.addEventListener("click", () => step(1));

  card.hidden = false;
  root.classList.add("is-enhanced");
  show(current);
}
