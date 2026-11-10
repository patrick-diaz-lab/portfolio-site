// `pnpm check-tools`: the toolchain in this environment (PLAN 0.3). Prints the versions of
// Node, pnpm, Go, git and Chrome; fails if Node is older than 22.23.4 (astro 7.4.2).
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const MIN_NODE = [22, 23, 4];

function version(cmd: string, args: string[]): string {
  const r = spawnSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (r.error || r.status !== 0) return "not found";
  return (r.stdout || r.stderr).trim().split("\n")[0] ?? "unknown";
}

// Chromium bundled with the preinstalled Playwright, if any (cloud VMs), found without
// hard-coding its install path.
async function playwrightChromium(): Promise<string | undefined> {
  try {
    const pw = (await import("playwright" as string)) as { chromium: { executablePath(): string } };
    return pw.chromium.executablePath();
  } catch {
    return undefined;
  }
}

function chrome(pwPath: string | undefined): string {
  const candidates = [
    process.env.CHROME_PATH,
    pwPath,
    "google-chrome",
    "chromium",
    "chromium-browser",
  ].filter((c): c is string => !!c);
  for (const c of candidates) {
    if (c.startsWith("/") && !existsSync(c)) continue;
    const v = version(c, ["--version"]);
    if (v !== "not found") return v;
  }
  return "not found";
}

function atLeast(v: string, min: number[]): boolean {
  const parts = v.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < min.length; i++) {
    const a = parts[i] ?? 0;
    const b = min[i] ?? 0;
    if (a !== b) return a > b;
  }
  return true;
}

const rows: [string, string][] = [
  ["node", process.version],
  ["pnpm", version("pnpm", ["--version"])],
  ["go", version("go", ["version"])],
  ["git", version("git", ["--version"])],
  ["chrome", chrome(await playwrightChromium())],
];
for (const [name, v] of rows) process.stdout.write(`${name.padEnd(7)} ${v}\n`);

const ok = atLeast(process.version, MIN_NODE);
process.stdout.write(ok ? "check-tools: ok\n" : `check-tools: FAILED (node must be >= ${MIN_NODE.join(".")})\n`);
process.exitCode = ok ? 0 : 1;
