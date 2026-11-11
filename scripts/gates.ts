// `pnpm gates` (PLAN 1.8): every browser gate over dist/, in CI (job `gates`) and in
// sessions. Runs each and fails if any failed. Run `pnpm build` first.
//   design-check   axe on every page (desktop, phone), no requests to other hosts
//   map-check      every piece map: names, Tab, cards, touch, links, no browser outline
//   page-check     every page: visible focus, no-JS, reduced motion
//   self-test      a broken focus style must fail page-check's focus gate
//   lighthouse     mobile, every category ≥ 95, size budget
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const node = process.execPath;
const steps: [string, string[]][] = [
  ["design-check", [join(ROOT, "scripts", "design-check.ts")]],
  ["map-check", [join(ROOT, "scripts", "map-check.ts")]],
  ["page-check", [join(ROOT, "scripts", "page-check.ts")]],
  ["self-test", [join(ROOT, "scripts", "page-check.ts"), "--self-test"]],
  ["lighthouse", [join(ROOT, "scripts", "lighthouse.ts")]],
];

const failed: string[] = [];
for (const [name, args] of steps) {
  process.stdout.write(`── ${name}\n`);
  const r = spawnSync(node, args, { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) failed.push(name);
}
process.stdout.write(failed.length ? `gates: FAILED (${failed.join(", ")})\n` : "gates: ok\n");
process.exitCode = failed.length ? 1 : 0;
