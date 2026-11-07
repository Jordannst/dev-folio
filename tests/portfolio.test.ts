import assert from "node:assert/strict";
import test from "node:test";
import { filterProjects } from "../src/data/portfolio.ts";
import { searchCommands } from "../src/lib/commands.ts";
import { commands as dotMatrixCommands } from "../src/designs/dot-matrix/commands.ts";
import { commands as classicCommands } from "../src/designs/classic/commands.ts";

test("filters include overlapping projects once and preserve source order", () => {
  assert.deepEqual(filterProjects("all").map(p => p.slug), ["siaga", "contextual-rag-chat", "kassentix-pos", "klk-invoice-system"]);
  assert.deepEqual(filterProjects("ai").map(p => p.slug), ["siaga", "contextual-rag-chat", "kassentix-pos"]);
  assert.deepEqual(filterProjects("business").map(p => p.slug), ["kassentix-pos", "klk-invoice-system"]);
});

test("command search normalizes whitespace/case and handles empty or unmatched input", () => {
  assert.deepEqual(searchCommands(dotMatrixCommands, "  sKiLlS "), [{ label: "Skills", href: "/#skills" }]);
  assert.equal(searchCommands(dotMatrixCommands, "").length, 8);
  assert.deepEqual(searchCommands(dotMatrixCommands, "theme"), [{ label: "Switch theme", href: "#theme" }]);
  assert.deepEqual(searchCommands(dotMatrixCommands, "does not exist"), []);
  assert.deepEqual(searchCommands(dotMatrixCommands, "Projects"), [{ label: "Projects", href: "/#projects" }]);
});

test("classic keeps its six section commands", () => {
  assert.equal(searchCommands(classicCommands, "").length, 6);
  assert.deepEqual(searchCommands(classicCommands, "  sKiLlS "), [{ label: "Skills", href: "/#skills" }]);
  assert.deepEqual(searchCommands(classicCommands, "theme"), []);
});
