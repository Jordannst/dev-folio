import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { defaultDesign, designs, resolveDesign } from "../src/designs/registry.ts";
import { decideRoute } from "../src/designs/routing.ts";
import { edgeConfigId } from "../src/designs/edge-config.ts";

const base = { activeDesign: "dot-matrix", previewDesign: undefined, hasAdminSession: false, dev: false };

test("registry lists classic first, defaults to it, and never uses reserved ids", () => {
  assert.deepEqual(designs.map(d => d.id), ["classic", "dot-matrix"]);
  assert.equal(defaultDesign, "classic");
  assert.ok(!designs.some(d => (d.id as string) === "exit"));
});

test("resolveDesign keeps known ids and falls back for anything else", () => {
  assert.equal(resolveDesign("dot-matrix"), "dot-matrix");
  for (const value of [undefined, null, "", "Dot-Matrix", " dot-matrix", "unknown", 42, { id: "dot-matrix" }]) assert.equal(resolveDesign(value), "classic");
});

test("public paths rewrite to the active design or the default", () => {
  assert.deepEqual(decideRoute({ ...base, pathname: "/" }), { kind: "rewrite", pathname: "/designs/dot-matrix", clearPreview: false });
  assert.deepEqual(decideRoute({ ...base, pathname: "/projects" }), { kind: "rewrite", pathname: "/designs/dot-matrix/projects", clearPreview: false });
  assert.deepEqual(decideRoute({ ...base, pathname: "/", activeDesign: "nope" }), { kind: "rewrite", pathname: "/designs/classic", clearPreview: false });
});

test("preview needs an admin session and a known id, otherwise it is cleared", () => {
  assert.deepEqual(decideRoute({ ...base, pathname: "/", previewDesign: "classic", hasAdminSession: true }), { kind: "rewrite", pathname: "/designs/classic", clearPreview: false });
  assert.deepEqual(decideRoute({ ...base, pathname: "/", previewDesign: "classic" }), { kind: "rewrite", pathname: "/designs/dot-matrix", clearPreview: true });
  assert.deepEqual(decideRoute({ ...base, pathname: "/projects", previewDesign: "ghost", hasAdminSession: true }), { kind: "rewrite", pathname: "/designs/dot-matrix/projects", clearPreview: true });
});

test("internal design paths open only in development", () => {
  assert.deepEqual(decideRoute({ ...base, pathname: "/designs/dot-matrix", dev: true }), { kind: "next" });
  assert.deepEqual(decideRoute({ ...base, pathname: "/designs/dot-matrix/projects" }), { kind: "not-found" });
  assert.deepEqual(decideRoute({ ...base, pathname: "/designs/classic", hasAdminSession: true }), { kind: "not-found" });
  assert.deepEqual(decideRoute({ ...base, pathname: "/admin" }), { kind: "next" });
});

test("reads the store id from the EDGE_CONFIG connection string", () => {
  assert.equal(edgeConfigId("https://edge-config.vercel.com/ecfg_abc123?token=t"), "ecfg_abc123");
  for (const value of [undefined, "", "not a url", "https://example.com/"]) assert.equal(edgeConfigId(value), null);
});

// next 16.3.8 has a DoS reachable only through Server Actions (GHSA-p3m5-59mp-jv5r, fixed in 16.4.1). Drop this test with that upgrade.
test("app has no Server Actions while next is below 16.4.1", () => {
  const files = readdirSync("src", { recursive: true }).map(String).filter(file => /\.tsx?$/.test(file));
  assert.deepEqual(files.filter(file => /["']use server["']/.test(readFileSync(`src/${file}`, "utf8"))), []);
});
