// Tests for the sitemap and its indexing checks (PLAN 1.9b).
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSitemap, readPage } from "../sitemap.ts";

const O = "https://patrickdiaz.dev";
const head = (path: string, extra = "") => `<html><head>${extra}<link rel="canonical" href="${O}${path}"></head><body></body></html>`;
const pair = `<link rel="alternate" hreflang="en" href="${O}/vision/"><link rel="alternate" hreflang="de" href="${O}/de/vision/">`;
const noindex = `<html><head><meta name="robots" content="noindex"></head></html>`;

test("indexable pages with canonical links and alternates make the sitemap; noindex pages stay out", () => {
  const pages = [
    readPage("/vision/", head("/vision/", pair)),
    readPage("/de/vision/", head("/de/vision/", pair)),
    readPage("/privacy/", noindex),
  ];
  const { xml, problems, count } = buildSitemap(pages, O);
  assert.deepEqual(problems, []);
  assert.equal(count, 2);
  assert.match(xml, /<loc>https:\/\/patrickdiaz\.dev\/de\/vision\/<\/loc>\n    <xhtml:link rel="alternate" hreflang="en" href="https:\/\/patrickdiaz\.dev\/vision\/"\/>/);
  assert.doesNotMatch(xml, /privacy/);
});

test("a page that loses its indexing by accident fails", () => {
  const { problems } = buildSitemap([readPage("/vision/", noindex), readPage("/privacy/", head("/privacy/"))], O);
  assert.ok(problems.some((p) => p.includes("/vision/ carries noindex but isn't one of the pages meant to stay out of search")), problems.join("\n"));
  assert.ok(problems.some((p) => p.includes("/privacy/ should carry noindex")), problems.join("\n"));
});

test("a missing or wrong canonical link, or an alternate to a missing page, fails", () => {
  const { problems } = buildSitemap([
    readPage("/", "<html><head></head></html>"),
    readPage("/vision/", head("/de/vision/", `<link rel="alternate" hreflang="de" href="${O}/de/vision/">`)),
  ], O);
  assert.ok(problems.some((p) => p.startsWith("/ needs <link rel=\"canonical\"")), problems.join("\n"));
  assert.ok(problems.some((p) => p.startsWith("/vision/ needs <link rel=\"canonical\" href=\"https://patrickdiaz.dev/vision/\">")), problems.join("\n"));
  assert.ok(problems.some((p) => p.includes("hreflang de points to https://patrickdiaz.dev/de/vision/, which isn't an indexable page")), problems.join("\n"));
});
