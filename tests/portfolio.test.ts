import assert from "node:assert/strict";
import test from "node:test";
import { filterProjects, searchCommands } from "../src/data/portfolio.ts";

test("filters include overlapping projects once and preserve source order", () => {
  assert.deepEqual(filterProjects("all").map(p => p.slug), ["siaga", "contextual-rag-chat", "kassentix-pos", "klk-invoice-system"]);
  assert.deepEqual(filterProjects("ai").map(p => p.slug), ["siaga", "contextual-rag-chat", "kassentix-pos"]);
  assert.deepEqual(filterProjects("business").map(p => p.slug), ["kassentix-pos", "klk-invoice-system"]);
});

test("command search normalizes whitespace/case and handles empty or unmatched input", () => {
  assert.deepEqual(searchCommands("  sKiLlS "), [{ label: "Skills", href: "/#skills" }]);
  assert.equal(searchCommands("").length, 6);
  assert.deepEqual(searchCommands("does not exist"), []);
  assert.deepEqual(searchCommands("Projects"), [{ label: "Projects", href: "/#projects" }]);
});
