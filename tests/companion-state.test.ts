import test from "node:test";
import assert from "node:assert/strict";
import { readCompanionState, type CompanionState } from "../src/lib/companion-state.ts";

const snapshot: CompanionState = {
  version: 1, pose: "walk", frame: 3, xRatio: .32, liftRatio: 0,
  direction: -1, elapsed: 40, age: 1800, cooldown: 25000, idleDelay: 1400, velocity: 0,
};
test("retains position, direction, animation progress and activity timers", () => {
  assert.deepEqual(readCompanionState(JSON.stringify(snapshot)), snapshot);
  const airborne = { ...snapshot, pose: "drag", frame: 1, liftRatio: .4, velocity: .2 };
  assert.deepEqual(readCompanionState(JSON.stringify(airborne)), airborne);
});
test("ignores corrupt or incompatible browser snapshots", () => {
  for (const raw of [null, "{", "null", "[]", "{}", ...[
    { version: 2 }, { pose: "unknown" }, { pose: "__proto__" }, { frame: 99 }, { frame: 1.5 },
    { xRatio: -1 }, { xRatio: 1.1 }, { liftRatio: 2 }, { direction: 0 },
    { age: null }, { elapsed: 200 }, { idleDelay: "900" }, { cooldown: 30001 }, { velocity: 11 },
  ].map(patch => JSON.stringify({ ...snapshot, ...patch }))]) assert.equal(readCompanionState(raw), null);
});

test("restores each stage of the seated activity without losing its progress", () => {
  for (const pose of ["sitDown", "sit", "standUp"] as const) {
    const seated = { ...snapshot, pose, frame: 0, elapsed: 240, age: 240, xRatio: .46 };
    assert.deepEqual(readCompanionState(JSON.stringify(seated)), seated);
  }
  assert.equal(readCompanionState(JSON.stringify({ ...snapshot, pose: "sit", frame: 0, elapsed: 5200 })), null);
});
