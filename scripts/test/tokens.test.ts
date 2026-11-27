// The color tokens (D25): the dark values exist twice in src/styles/tokens.css, once for the
// system's setting and once for the visitor's own choice. These tests hold the two blocks to
// each other and to the light block, and keep light-dark() out of the file: a mode must not
// depend on how a browser resolves that function when the scheme changes.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const css = readFileSync(join(import.meta.dirname, "..", "..", "src", "styles", "tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const colorsIn = (block: string) => Object.fromEntries([...block.matchAll(/(--color-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
const blockAfter = (marker: string) => {
  const at = css.indexOf(marker);
  assert.notEqual(at, -1, `tokens.css has no "${marker}"`);
  const open = css.indexOf("{", at + marker.length - 1);
  return css.slice(open + 1, css.indexOf("}", open));
};

test("the two dark blocks hold the same colors", () => {
  const system = colorsIn(blockAfter(':root:not([data-theme="light"]) {'));
  const chosen = colorsIn(blockAfter(':root[data-theme="dark"] {'));
  assert.deepEqual(system, chosen);
});

test("dark mode sets every color the light mode sets", () => {
  const light = Object.keys(colorsIn(blockAfter(":root {"))).sort();
  const dark = Object.keys(colorsIn(blockAfter(':root[data-theme="dark"] {'))).sort();
  assert.deepEqual(dark, light);
});

test("no color depends on light-dark()", () => {
  assert.equal(css.includes("light-dark("), false);
});
