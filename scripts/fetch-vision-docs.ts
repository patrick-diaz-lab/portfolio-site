// Sparse, shallow clone of the IC docs at the pinned commit into .cache/vision-src (D10).
// Runs at session start (SessionStart hook in .claude/settings.json), because the cloud
// environment's setup script can't read environment variables.
//
// - Only the folders in vision-src.json (cone sparse-checkout), depth 1, --filter=tree:0.
// - The token is used only as an in-memory auth header (scripts/lib/vision-git.ts).
// - Pushing is disabled: the push URL is set to an invalid value.
// - Without VISION_DOCS_TOKEN it prints a note and exits 0. Already at the pin: no-op.
// - Never prints file contents; prints only the commit and the folder names.
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT, TOKEN_VAR, git, readVisionSrc, repoUrl, safeErr } from "./lib/vision-git.ts";

const DEST = resolve(ROOT, ".cache", "vision-src");
const NO_PUSH = "no-push://disabled";

function log(msg: string): void {
  process.stdout.write(`fetch-vision-docs: ${msg}\n`);
}

function main(): number {
  const src = readVisionSrc();
  const token = process.env[TOKEN_VAR];
  if (!token) {
    log(`${TOKEN_VAR} not set; skipping the IC docs clone.`);
    return 0;
  }

  if (existsSync(resolve(DEST, ".git"))) {
    const head = git(["rev-parse", "HEAD"], { cwd: DEST });
    if (head.status === 0 && head.stdout.trim() === src.commit) {
      log(`already at ${src.commit.slice(0, 12)}; nothing to do.`);
      return 0;
    }
  } else {
    rmSync(DEST, { recursive: true, force: true });
    mkdirSync(DEST, { recursive: true });
    const steps: string[][] = [
      ["init", "-q"],
      ["remote", "add", "origin", repoUrl(src.repo)],
      ["remote", "set-url", "--push", "origin", NO_PUSH],
      ["config", "remote.origin.promisor", "true"],
    ];
    for (const a of steps) {
      const r = git(a, { cwd: DEST });
      if (r.status !== 0) {
        log(`git ${a[0]} failed: ${safeErr(r.stderr)}`);
        return 1;
      }
    }
  }

  const cone = src.paths.map((p) => p.replace(/\/$/, ""));
  const steps: [string[], boolean][] = [
    [["sparse-checkout", "set", "--cone", ...cone], false],
    [["fetch", "-q", "--depth", "1", "--filter=tree:0", "--no-tags", "origin", src.commit], true],
    [["-c", "advice.detachedHead=false", "checkout", "-q", "--detach", src.commit], true],
    // Keep pushing disabled even if something reset it.
    [["remote", "set-url", "--push", "origin", NO_PUSH], false],
  ];
  for (const [a, needsToken] of steps) {
    const r = git(a, { cwd: DEST, token: needsToken ? token : undefined });
    if (r.status !== 0) {
      log(`git ${a.find((x) => !x.startsWith("-") && !x.includes("=")) ?? a[0]} failed: ${safeErr(r.stderr, token)}`);
      return 1;
    }
  }
  log(`checked out ${src.commit.slice(0, 12)} with ${cone.join(", ")}.`);
  return 0;
}

process.exitCode = main();
