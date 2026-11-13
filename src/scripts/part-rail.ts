// The section rail on part pages (layout 3, Patrick 2026-11-13). Progressive enhancement
// only: the rail's links work without this script. With it, the link of the section being
// read is marked (aria-current), which the rail shows as a filled amber stop. No motion.

export function initRail(rail: HTMLElement): void {
  const links = [...rail.querySelectorAll<HTMLAnchorElement>("ol a[href^='#']")];
  const pairs = links
    .map((a) => [a, document.getElementById(decodeURIComponent(a.hash.slice(1)))] as const)
    .filter((p): p is readonly [HTMLAnchorElement, HTMLElement] => p[1] !== null);
  if (pairs.length === 0) return;

  let current: HTMLAnchorElement | null = null;
  let queued = false;
  const update = () => {
    queued = false;
    // The section whose heading has passed the top third of the window, or the first one.
    const line = window.innerHeight / 3;
    let next = pairs[0]![0];
    for (const [a, target] of pairs) if (target.getBoundingClientRect().top <= line) next = a;
    if (next === current) return;
    current?.removeAttribute("aria-current");
    next.setAttribute("aria-current", "location");
    current = next;
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
}
