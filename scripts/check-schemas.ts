// Schema checks. For now only redaction/exceptions.yaml (D9); content schemas come in item 1.2.
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse } from "yaml";
import { RULE_IDS } from "./lib/rules.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FILE = "redaction/exceptions.yaml";
const KEYS = ["path", "rule", "snippet", "reason"] as const;

const errors: string[] = [];
const doc = parse(readFileSync(join(ROOT, FILE), "utf8")) as unknown;

if (typeof doc !== "object" || doc === null || !Array.isArray((doc as { exceptions?: unknown }).exceptions)) {
  errors.push(`${FILE}: top level must be { exceptions: [...] }`);
} else {
  const extra = Object.keys(doc).filter((k) => k !== "exceptions");
  if (extra.length) errors.push(`${FILE}: unknown top-level keys: ${extra.join(", ")}`);
  (doc as { exceptions: unknown[] }).exceptions.forEach((e, i) => {
    const at = `${FILE}: exceptions[${i}]`;
    if (typeof e !== "object" || e === null) return void errors.push(`${at}: must be a mapping`);
    const rec = e as Record<string, unknown>;
    for (const k of Object.keys(rec)) if (!(KEYS as readonly string[]).includes(k)) errors.push(`${at}: unknown key ${k}`);
    for (const k of KEYS) {
      if (typeof rec[k] !== "string" || (rec[k] as string).trim() === "") errors.push(`${at}: ${k} must be a non-empty string`);
    }
    if (rec.rule === "deny-list") errors.push(`${at}: deny-list hits can't have exceptions (the snippet would publish the word)`);
    else if (typeof rec.rule === "string" && !RULE_IDS.has(rec.rule)) errors.push(`${at}: unknown rule ${rec.rule}`);
    if (typeof rec.path === "string" && !existsSync(join(ROOT, rec.path))) errors.push(`${at}: path doesn't exist`);
  });
}

if (errors.length) {
  for (const e of errors) process.stdout.write(`${e}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("schemas: ok\n");
}
