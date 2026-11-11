// One Chromium for every browser gate (PLAN 1.8): the one that belongs to the pinned
// `playwright` dev dependency. CI installs it with Playwright's own installer. A cloud
// session has an older preinstalled build instead; when the pinned build is missing, the
// launcher falls back to the preinstalled `chromium` under PLAYWRIGHT_BROWSERS_PATH.
// No system Chrome is ever used, so CI and sessions measure with Playwright's browser.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser } from "playwright";

export { devices } from "playwright";
export type { Browser, BrowserContext, Page } from "playwright";

/** The Chromium binary the gates use, and where it comes from. */
export function chromiumPath(): { path: string; source: "pinned" | "preinstalled" } {
  const pinned = chromium.executablePath();
  if (existsSync(pinned)) return { path: pinned, source: "pinned" };
  const dir = process.env.PLAYWRIGHT_BROWSERS_PATH;
  const pre = dir ? join(dir, "chromium") : "";
  if (pre && existsSync(pre)) return { path: pre, source: "preinstalled" };
  throw new Error("No Chromium for the pinned Playwright. In CI: pnpm exec playwright install --with-deps chromium");
}

export async function launch(): Promise<Browser> {
  const { path, source } = chromiumPath();
  return chromium.launch(source === "pinned" ? {} : { executablePath: path });
}
