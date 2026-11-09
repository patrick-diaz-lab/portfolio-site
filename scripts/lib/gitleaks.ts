// Pinned gitleaks (D9). Built from the Go module in tools/gitleaks, whose go.sum pins
// every module hash, into the git-ignored .cache/bin. Fails closed: no binary, no scan.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

export const GITLEAKS_VERSION = "v8.30.1";
const ROOT = resolve(import.meta.dirname, "..", "..");
const BIN = join(ROOT, ".cache", "bin", "gitleaks");

export function ensureGitleaks(): string {
  if (existsSync(BIN)) {
    const v = spawnSync(BIN, ["version"], { encoding: "utf8" });
    if (v.status === 0 && v.stdout.trim() === GITLEAKS_VERSION) return BIN;
  }
  const go = spawnSync("go", ["version"], { encoding: "utf8" });
  if (go.status !== 0) {
    throw new Error("gitleaks is not built and Go is not installed; the scan can't run (fails closed)");
  }
  mkdirSync(join(ROOT, ".cache", "bin"), { recursive: true });
  process.stderr.write(`scan: building gitleaks ${GITLEAKS_VERSION} from tools/gitleaks ...\n`);
  execFileSync(
    "go",
    [
      "build",
      "-mod=readonly",
      "-ldflags",
      `-X github.com/zricethezav/gitleaks/v8/version.Version=${GITLEAKS_VERSION}`,
      "-o",
      BIN,
      "github.com/zricethezav/gitleaks/v8",
    ],
    { cwd: join(ROOT, "tools", "gitleaks"), stdio: ["ignore", "ignore", "inherit"] },
  );
  return BIN;
}

export type LeakFinding = { rule: string; file: string; line: number };

type Report = { RuleID: string; File: string; StartLine: number }[];

// Runs gitleaks over a directory of materialized files. Only rule id, file and line
// leave this function; gitleaks' own output is discarded.
export function runGitleaks(dir: string): LeakFinding[] {
  const bin = ensureGitleaks();
  const reportDir = join(tmpdir(), `gitleaks-report-${process.pid}-${Date.now()}`);
  mkdirSync(reportDir, { recursive: true });
  const reportPath = join(reportDir, "report.json");
  try {
    const r = spawnSync(
      bin,
      [
        "dir",
        dir,
        "--no-banner",
        "--redact",
        "--log-level",
        "fatal",
        "--report-format",
        "json",
        "--report-path",
        reportPath,
        "--exit-code",
        "0",
      ],
      { encoding: "utf8" },
    );
    if (r.status !== 0) throw new Error(`gitleaks exited with status ${r.status}`);
    const report = JSON.parse(readFileSync(reportPath, "utf8")) as Report;
    return report.map((f) => ({ rule: `gitleaks:${f.RuleID}`, file: relative(dir, f.File), line: f.StartLine }));
  } finally {
    rmSync(reportDir, { recursive: true, force: true });
  }
}
