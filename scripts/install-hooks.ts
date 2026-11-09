// Points git at the repo's hooks (.githooks): pre-commit scan, pre-push check + scan.
// Runs from `pnpm install` (root "prepare"). Outside a git checkout it does nothing.
import { spawnSync } from "node:child_process";

const inGit = spawnSync("git", ["rev-parse", "--git-dir"], { stdio: "ignore" }).status === 0;
if (inGit) {
  const r = spawnSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "inherit" });
  process.exitCode = r.status ?? 1;
}
