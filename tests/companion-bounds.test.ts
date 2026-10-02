import test from "node:test";
import assert from "node:assert/strict";
import { clampCompanion } from "../src/lib/companion-bounds.ts";

test("drag clamps left/right rails, floor, and top screen including partial scroll", () => {
  assert.deepEqual(clampCompanion(-50, -40, 688, 168, 80, 64), { x: 0, lift: 0 });
  assert.deepEqual(clampCompanion(900, 900, 688, 168, 80, 64), { x: 608, lift: 104 });
  assert.deepEqual(clampCompanion(400, 900, 359, 88, 60, 48), { x: 299, lift: 40 });
  assert.deepEqual(clampCompanion(100, 900, 688, 100, 80, 64), { x: 100, lift: 36 });
  assert.deepEqual(clampCompanion(100, 30, 688, 168, 80, 64), { x: 100, lift: 30 });
  assert.deepEqual(clampCompanion(100, 30, 40, 20, 60, 48), { x: 0, lift: 0 });
});
