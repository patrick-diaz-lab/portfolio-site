// Git calls against the IC repo with the read-only docs token (D10).
//
// The token reaches git only as an in-memory http.extraHeader passed through the
// GIT_CONFIG_COUNT/KEY/VALUE environment of the child process: never on a command line,
// in a URL, in git config on disk, or in a credential helper. Output is captured and
// never printed, so neither the token nor any file content reaches a log.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dirname, "..", "..");
export const TOKEN_VAR = "VISION_DOCS_TOKEN";

export type VisionSrc = { repo: string; commit: string; paths: string[] };

export function readVisionSrc(): VisionSrc {
  const v = JSON.parse(readFileSync(resolve(ROOT, "vision-src.json"), "utf8")) as VisionSrc;
  if (!/^[\w.-]+\/[\w.-]+$/.test(v.repo)) throw new Error("vision-src.json: bad repo");
  if (!/^[0-9a-f]{40}$/.test(v.commit)) throw new Error("vision-src.json: commit must be a full 40-char sha");
  if (!Array.isArray(v.paths) || v.paths.length === 0 || v.paths.some((p) => !/^[\w./-]+\/$/.test(p) || p.includes("..")))
    throw new Error("vision-src.json: paths must be folder paths ending in /");
  return v;
}

export function repoUrl(repo: string): string {
  return `https://github.com/${repo}.git`;
}

export type GitResult = { status: number | null; stdout: string; stderr: string };

// Runs git. With a token, adds the auth header in memory only. Never inherits stdio.
export function git(args: string[], opts: { cwd?: string; token?: string } = {}): GitResult {
  const env: NodeJS.ProcessEnv = { ...process.env, GIT_TERMINAL_PROMPT: "0" };
  delete env[TOKEN_VAR];
  const extra: [string, string][] = [["credential.helper", ""]];
  if (opts.token) {
    const basic = Buffer.from(`x-access-token:${opts.token}`).toString("base64");
    extra.push(["http.https://github.com/.extraHeader", `Authorization: Basic ${basic}`]);
  }
  const base = Number(env.GIT_CONFIG_COUNT ?? "0") || 0;
  extra.forEach(([k, v], i) => {
    env[`GIT_CONFIG_KEY_${base + i}`] = k;
    env[`GIT_CONFIG_VALUE_${base + i}`] = v;
  });
  env.GIT_CONFIG_COUNT = String(base + extra.length);
  const r = spawnSync("git", args, { cwd: opts.cwd ?? ROOT, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

// Strips anything that could carry the token from git's error text before it's shown.
export function safeErr(s: string, token?: string): string {
  let out = s;
  if (token) {
    out = out.split(token).join("***");
    out = out.split(Buffer.from(`x-access-token:${token}`).toString("base64")).join("***");
  }
  return out.replace(/Authorization:[^\n]*/gi, "Authorization: ***").trim().split("\n").slice(-3).join("\n");
}
