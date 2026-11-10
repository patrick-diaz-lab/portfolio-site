// `pnpm check`: types, schemas, content (PLAN 1.2), links, verbatim-copy warning (D21), redaction scan (PLAN 0.2). Runs every step and
// fails if any failed. Extra arguments go to the scan (for example --dir dist).
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const node = process.execPath;
const steps: [string, string, string[]][] = [
  ["types", node, [join(ROOT, "node_modules", "typescript", "bin", "tsc"), "--noEmit", "-p", ROOT]],
  ["schemas", node, [join(ROOT, "scripts", "check-schemas.ts")]],
  ["content", node, [join(ROOT, "scripts", "check-content.ts")]],
  ["links", node, [join(ROOT, "scripts", "check-links.ts")]],
  ["verbatim", node, [join(ROOT, "scripts", "check-verbatim.ts")]],
  ["scan", node, [join(ROOT, "scripts", "scan.ts"), ...process.argv.slice(2)]],
];

const failed: string[] = [];
for (const [name, cmd, args] of steps) {
  process.stdout.write(`── ${name}\n`);
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) failed.push(name);
}
process.stdout.write(failed.length ? `check: FAILED (${failed.join(", ")})\n` : "check: ok\n");
process.exitCode = failed.length ? 1 : 0;
