// Tests for the content checks (PLAN 1.2 done-when). Fixtures are built in a temp dir:
// a valid built part with one entry of each kind, then one broken variant per rule.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, test } from "node:test";

const CHECK = resolve(import.meta.dirname, "..", "check-content.ts");
const dirs: string[] = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

const SHA = "0123456789abcdef0123456789abcdef01234567";

const PART = `---
id: gateway
piece: demo
title: Demo gateway
summary: A part used only in tests.
status: built
as_of: 2026-11-10
source_commit: ${SHA}
sources:
  - sources/vision/notes.md
evals:
  - name: classifier-local-heldout
    metric: accuracy
    value: 0.95
    n: 20
    date: 2026-11-04
related: []
---

What it does.
`;

const entry = (id: string, kind: string, extra = "") => `---
id: ${id}
piece: demo
part: gateway
page: /demo/gateway/
anchor: ${id}
kind: ${kind}
sources:
  - sources/vision/notes.md
as_of: 2026-11-10
source_commit: ${SHA}${extra}
---

Entry text.
`;

function fixture(change: (files: Record<string, string>) => void = () => {}) {
  const files: Record<string, string> = {
    "sources/vision/notes.md": "# Notes\n",
    "content/parts/demo/gateway.mdx": PART,
    "content/knowledge/demo/why-gateway.md": entry("why-gateway", "decision"),
    "content/knowledge/demo/no-sdk-keys.md": entry("no-sdk-keys", "rejected"),
    "content/knowledge/demo/budget-test.md": entry("budget-test", "testing"),
    "content/knowledge/demo/price-lesson.md": entry("price-lesson", "learning"),
  };
  change(files);
  const dir = mkdtempSync(join(tmpdir(), "content-"));
  dirs.push(dir);
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), c);
  }
  const r = spawnSync(process.execPath, [CHECK, "--root", dir], { encoding: "utf8" });
  return { status: r.status, output: r.stdout + r.stderr };
}

test("a valid built part with all four entry kinds passes", () => {
  const { status, output } = fixture();
  assert.equal(status, 0, output);
  assert.match(output, /content: ok \(0 piece\(s\), 1 part page\(s\), 4 entries\)/);
});

test("a part with a missing field fails, naming field and file:line", () => {
  const { status, output } = fixture((f) => {
    f["content/parts/demo/gateway.mdx"] = PART.replace(/^summary: .*\n/m, "");
  });
  assert.equal(status, 1, output);
  assert.match(output, /schema\s+content\/parts\/demo\/gateway\.mdx:\d+\s+summary:/);
});

test("an entry pointing at a missing page or anchor fails", () => {
  const { status, output } = fixture((f) => {
    f["content/knowledge/demo/stray.md"] = entry("stray", "decision").replace("part: gateway", "part: router").replace("/demo/gateway/", "/demo/router/");
    f["content/knowledge/demo/dupe.md"] = entry("dupe", "testing").replace("anchor: dupe", "anchor: why-gateway");
  });
  assert.equal(status, 1, output);
  assert.match(output, /anchor\s+content\/knowledge\/demo\/stray\.md:\d+\s+part "router" has no page/);
  assert.match(output, /anchor\s+content\/knowledge\/demo\/(dupe|why-gateway)\.md:\d+\s+anchor "why-gateway" is already used/);
});

test("a built part without the four entry kinds fails", () => {
  const { status, output } = fixture((f) => {
    delete f["content/knowledge/demo/no-sdk-keys.md"];
    delete f["content/knowledge/demo/price-lesson.md"];
  });
  assert.equal(status, 1, output);
  assert.match(output, /built-entries\s+content\/parts\/demo\/gateway\.mdx:\d+\s+.*missing: rejected, learning/);
});

test("free text in evals[] fails", () => {
  const variants: [string, string, RegExp][] = [
    ["    value: 0.95", "    value: about 95 percent", /evals\.0\.value: Invalid input: expected number/],
    ["    metric: accuracy", "    metric: pretty accurate", /evals\.0\.metric: Invalid option/],
    ["  - name: classifier-local-heldout", "  - name: Classifier on my held-out set", /evals\.0\.name: must be a lowercase slug/],
    ["    n: 20", "    n: 20\n    example: the case about the router", /evals\.0: Unrecognized key: "example"/],
  ];
  for (const [from, to, expect] of variants) {
    assert.ok(PART.includes(from), `fixture must contain ${from}`);
    const { status, output } = fixture((f) => {
      f["content/parts/demo/gateway.mdx"] = PART.replace(from, to);
    });
    assert.equal(status, 1, output);
    assert.match(output, expect, output);
  }
});

test("an eval name longer than 48 characters fails", () => {
  const { status, output } = fixture((f) => {
    f["content/parts/demo/gateway.mdx"] = PART.replace("name: classifier-local-heldout", `name: ${"a".repeat(49)}`);
  });
  assert.equal(status, 1, output);
  assert.match(output, /evals\.0\.name: must be at most 48 characters/);
});

test("a missing source file and an unknown related part fail", () => {
  const { status, output } = fixture((f) => {
    f["content/parts/demo/gateway.mdx"] = PART.replace("related: []", "related:\n  - router").replace("sources/vision/notes.md", "sources/vision/gone.md");
  });
  assert.equal(status, 1, output);
  assert.match(output, /related\s+.*related part "router" doesn't exist/);
  assert.match(output, /sources\s+.*sources\/vision\/gone\.md doesn't exist/);
});

// Map checks (PLAN 1.3): a piece folder with piece.yaml, map.yaml and its SVG.
const PIECE = `id: demo
title: Demo
tagline: A piece used only in tests.
summary: A piece used only in tests.
status: built
as_of: 2026-11-10
source_commit: ${SHA}
order: 1
map_svg: map.svg
chat_enabled: false
`;
const MAP = `parts:
  - id: gateway
    label: Gateway
    hover: The gateway.
    page: /demo/gateway/
    status: built
  - id: router
    label: Router
    hover: Built, no page yet.
    status: built
  - id: sandbox
    label: Sandbox
    hover: Not built.
    status: planned
`;
// Only built parts are drawn (Patrick, 2026-11-11): the planned sandbox has no element.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g id="gateway" class="part"><rect class="box" x="0" y="0" width="10" height="10" /></g>
  <g id="router" class="part"><rect class="box" x="20" y="0" width="10" height="10" /></g>
</svg>
`;
const withPiece = (f: Record<string, string>) => {
  f["pieces/demo/piece.yaml"] = PIECE;
  f["pieces/demo/map.yaml"] = MAP;
  f["pieces/demo/map.svg"] = SVG;
};

test("a piece whose built parts all have their SVG element passes", () => {
  const { status, output } = fixture(withPiece);
  assert.equal(status, 0, output);
  assert.match(output, /content: ok \(1 piece\(s\)/);
});

test("a built part without its SVG element fails, naming map.yaml:line", () => {
  const { status, output } = fixture((f) => {
    withPiece(f);
    f["pieces/demo/map.svg"] = SVG.replace(/\s*<g id="router"[^\n]*/, "");
  });
  assert.equal(status, 1, output);
  assert.match(output, /svg\s+pieces\/demo\/map\.yaml:7\s+part "router" has no <g id="router" class="part">/);
});

test("a drawn part that isn't built fails", () => {
  const { status, output } = fixture((f) => {
    withPiece(f);
    f["pieces/demo/map.svg"] = SVG.replace("</svg>", `  <g id="sandbox" class="part"><rect /></g>\n</svg>`);
  });
  assert.equal(status, 1, output);
  assert.match(output, /svg\s+pieces\/demo\/map\.svg:4\s+part "sandbox" is planned; only built parts are drawn/);
});

test("an SVG part missing from map.yaml, a nested group and a duplicate id fail", () => {
  const { status, output } = fixture((f) => {
    withPiece(f);
    f["pieces/demo/map.svg"] = SVG.replace("</svg>", `  <g id="extra" class="part"><g><rect /></g></g>\n</svg>`);
    f["pieces/demo/map.yaml"] = MAP + MAP.split("\n").slice(6, 10).join("\n") + "\n";
  });
  assert.equal(status, 1, output);
  assert.match(output, /svg\s+pieces\/demo\/map\.svg:4\s+part "extra" isn't in map\.yaml/);
  assert.match(output, /svg\s+pieces\/demo\/map\.svg:4\s+part "extra" holds a nested <g>/);
  assert.match(output, /map\s+pieces\/demo\/map\.yaml:\d+\s+part "router" is listed twice/);
});

test("a chip with a missing source fails; more than 4 chips fail", () => {
  const chip = (src: string) => `  - label: Accuracy\n    metric: accuracy\n    value: 1.0\n    n: 27\n    sources:\n      - ${src}\n    as_of: 2026-11-04\n`;
  const { status, output } = fixture((f) => {
    withPiece(f);
    f["pieces/demo/piece.yaml"] = PIECE + "chips:\n" + chip("sources/vision/gone.md");
  });
  assert.equal(status, 1, output);
  assert.match(output, /sources\s+pieces\/demo\/piece\.yaml:\d+\s+chip "Accuracy": sources\/vision\/gone\.md doesn't exist/);
  const many = fixture((f) => {
    withPiece(f);
    f["pieces/demo/piece.yaml"] = PIECE + "chips:\n" + chip("sources/vision/notes.md").repeat(5);
  });
  assert.equal(many.status, 1, many.output);
  assert.match(many.output, /schema\s+.*chips: at most 4 chips/);
});

test("a missing SVG file and a map link to a missing page fail", () => {
  const { status, output } = fixture((f) => {
    withPiece(f);
    delete f["pieces/demo/map.svg"];
    f["pieces/demo/map.yaml"] = MAP.replace("page: /demo/gateway/", "page: /demo/router/");
  });
  assert.equal(status, 1, output);
  assert.match(output, /svg\s+pieces\/demo\/piece\.yaml:\d+\s+map\.svg doesn't exist/);
  assert.match(output, /map\s+.*part "gateway" links to \/demo\/router\/, which has no page/);
});

// lost_to (item 1.4): rejected options render under the decision they lost to.
test("a rejected entry naming its decision passes", () => {
  const { status, output } = fixture((f) => {
    f["content/knowledge/demo/no-sdk-keys.md"] = entry("no-sdk-keys", "rejected", "\nlost_to: why-gateway");
  });
  assert.equal(status, 0, output);
});

test("lost_to must name a decision on the same part, and only on rejected entries", () => {
  const missing = fixture((f) => {
    f["content/knowledge/demo/no-sdk-keys.md"] = entry("no-sdk-keys", "rejected", "\nlost_to: nothing-here");
  });
  assert.equal(missing.status, 1, missing.output);
  assert.match(missing.output, /lost-to\s+content\/knowledge\/demo\/no-sdk-keys\.md:\d+\s+decision "nothing-here" doesn't exist/);
  const notDecision = fixture((f) => {
    f["content/knowledge/demo/no-sdk-keys.md"] = entry("no-sdk-keys", "rejected", "\nlost_to: budget-test");
  });
  assert.match(notDecision.output, /lost-to\s+.*"budget-test" is a testing entry, not a decision/);
  const wrongKind = fixture((f) => {
    f["content/knowledge/demo/budget-test.md"] = entry("budget-test", "testing", "\nlost_to: why-gateway");
  });
  assert.match(wrongKind.output, /lost-to\s+.*only rejected entries name a decision they lost to \(this one is testing\)/);
});

// layers-only (item 1.7): security pages name layers and reasons, never mechanics.
test("a layers-only part refuses code, paths, flags and file names, with file:line", () => {
  const { status, output } = fixture((f) => {
    f["content/parts/demo/gateway.mdx"] = PART.replace("related: []", "related: []\nlayers_only: true") + "Run `tool` here.\nIt reads ./hooks/thing and runs with --force.\nSee rules.yaml for more.\nA [link](/demo/gateway/) is fine.\n";
    f["content/knowledge/demo/why-gateway.md"] = entry("why-gateway", "decision") + "Kept in config/hooks/deny.txt.\n";
  });
  assert.equal(status, 1, output);
  assert.match(output, /layers-only\s+content\/parts\/demo\/gateway\.mdx:\d+\s+inline or fenced code/);
  assert.match(output, /layers-only\s+content\/parts\/demo\/gateway\.mdx:\d+\s+a path/);
  assert.match(output, /layers-only\s+content\/parts\/demo\/gateway\.mdx:\d+\s+a file name/);
  assert.match(output, /layers-only\s+content\/knowledge\/demo\/why-gateway\.md:\d+\s+a path/);
  assert.equal((output.match(/^\s+layers-only\s/gm) ?? []).length, 4, output);
});

test("without layers_only the same text passes", () => {
  const { status, output } = fixture((f) => {
    f["content/parts/demo/gateway.mdx"] = PART + "Run `tool` with --force on ./hooks/thing.\n";
  });
  assert.equal(status, 0, output);
});


// i18n (PLAN 1.9a): German overlays and the homepage match their English base.
const PIECE_DE = `title: Demo
tagline: Ein Teil nur für Tests.
summary: Ein Teil nur für Tests.
`;
const MAP_DE = `aria_label: Demo-Schema
parts:
  gateway:
    label: Gateway
    hover: Das Gateway.
  router:
    label: Router
    hover: Gebaut, noch ohne Seite.
  sandbox:
    label: Sandbox
    hover: Nicht gebaut.
`;

test("German overlays that match the base pass", () => {
  const { status, output } = fixture((f) => {
    withPiece(f);
    f["pieces/demo/piece.de.yaml"] = PIECE_DE;
    f["pieces/demo/map.de.yaml"] = MAP_DE;
  });
  assert.equal(status, 0, output);
});

test("a lone overlay, a missing part, an unknown key and an untranslatable text fail", () => {
  const lone = fixture((f) => {
    withPiece(f);
    f["pieces/demo/piece.de.yaml"] = PIECE_DE;
  });
  assert.match(lone.output, /i18n\s+pieces\/demo\/piece\.de\.yaml:1\s+a German piece needs both/);
  const { status, output } = fixture((f) => {
    withPiece(f);
    f["pieces/demo/map.svg"] = SVG.replace("</svg>", `  <text class="note" data-t="note-a">hi</text>\n  <text class="note">loose</text>\n</svg>`);
    f["pieces/demo/piece.de.yaml"] = PIECE_DE;
    f["pieces/demo/map.de.yaml"] = MAP_DE.replace(/  router:\n.*\n.*\n/, "") + "svg_text:\n  note-b: falsch\n";
  });
  assert.equal(status, 1, output);
  assert.match(output, /i18n\s+.*part "router" has no German label and hover/);
  assert.match(output, /i18n\s+.*schematic text "note-a" has no German text/);
  assert.match(output, /i18n\s+.*"note-b" isn't a data-t key in the schematic/);
  assert.match(output, /i18n\s+pieces\/demo\/map\.svg:1\s+schematic text "loose" has no data-t key/);
});

test("a label too long for its box fails", () => {
  const { status, output } = fixture((f) => {
    withPiece(f);
    f["pieces/demo/map.yaml"] = MAP.replace("label: Router", "label: A router with a long name");
  });
  assert.equal(status, 1, output);
  assert.match(output, /svg\s+pieces\/demo\/map\.yaml:\d+\s+label "A router with a long name" is longer than 18 characters/);
});

const HOME = (hrefs: string[]) => `title: Demo
description: A demo homepage.
positioning: A demo line.
background:
  - One sentence.
featured:
  piece: demo
  cta: Open
work_heading: Work
work:
${hrefs.map((h) => `  - title: Item\n    text: Text.\n    href: ${h}`).join("\n")}
contact_heading: Contact
contact_text: Write to me.
cv: CV on request
`;

test("homepages with the same work links pass; different links or a missing page fail", () => {
  const good = ["/demo/gateway/", "/demo/", "/demo/gateway/"];
  const ok = fixture((f) => {
    withPiece(f);
    f["content/home/en.yaml"] = HOME(good);
    f["content/home/de.yaml"] = HOME(good);
  });
  assert.equal(ok.status, 0, ok.output);
  const bad = fixture((f) => {
    withPiece(f);
    f["content/home/en.yaml"] = HOME(good);
    f["content/home/de.yaml"] = HOME(["/demo/", "/demo/gateway/", "/demo/nowhere/"]);
  });
  assert.equal(bad.status, 1, bad.output);
  assert.match(bad.output, /i18n\s+content\/home\/de\.yaml:\d+\s+work link \/demo\/nowhere\/ has no page/);
  assert.match(bad.output, /i18n\s+content\/home\/de\.yaml:1\s+the work links differ from en\.yaml/);
});

test("a homepage featuring or linking a piece that isn't built fails", () => {
  const { status, output } = fixture((f) => {
    withPiece(f);
    f["pieces/demo/piece.yaml"] = PIECE.replace("status: built", "status: in-progress");
    f["content/home/en.yaml"] = HOME(["/demo/gateway/", "/demo/", "/demo/gateway/"]);
    f["content/home/de.yaml"] = HOME(["/demo/gateway/", "/demo/", "/demo/gateway/"]);
  });
  assert.equal(status, 1, output);
  assert.match(output, /i18n\s+content\/home\/en\.yaml:\d+\s+featured piece "demo" doesn't exist or isn't built/);
  assert.match(output, /i18n\s+content\/home\/en\.yaml:\d+\s+work link \/demo\/gateway\/ has no page/);
});

test("a count chip needs n; a chip with a baseline needs none", () => {
  const chip = (body: string) => `chips:\n  - label: A chip\n${body}    sources:\n      - sources/vision/notes.md\n    as_of: 2026-11-12\n`;
  const count = fixture((f) => {
    withPiece(f);
    f["pieces/demo/piece.yaml"] = PIECE + chip("    metric: count\n    value: 0\n");
  });
  assert.equal(count.status, 1, count.output);
  assert.match(count.output, /schema\s+pieces\/demo\/piece\.yaml:\d+\s+chips\.0\.n: a count chip needs n/);
  const change = fixture((f) => {
    withPiece(f);
    f["pieces/demo/piece.yaml"] = PIECE + chip("    metric: cost_usd\n    value: 0.014\n    baseline: 0.040\n");
  });
  assert.equal(change.status, 0, change.output);
});
