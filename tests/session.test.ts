import assert from "node:assert/strict";
import test from "node:test";
import { SESSION_MAX_AGE, signSession, verifySession } from "../src/designs/session.ts";
import { missingAuthEnv } from "../src/designs/admin-config.ts";

const secret = "test-secret-with-at-least-32-bytes!!";

test("accepts a fresh session for the admin id", async () => {
  assert.equal(await verifySession(await signSession("123", secret, 1_000), secret, "123", 2_000), true);
});

test("rejects forged payloads, other secrets, other users and expired tokens", async () => {
  const token = await signSession("123", secret, 1_000);
  const forged = `${Buffer.from(JSON.stringify({ sub: "999", exp: 9e15 })).toString("base64url")}.${token.split(".")[1]}`;
  assert.equal(await verifySession(forged, secret, "999", 1_000), false);
  assert.equal(await verifySession(token, "another-secret-another-secret!!!", "123", 1_000), false);
  assert.equal(await verifySession(token, secret, "456", 1_000), false);
  assert.equal(await verifySession(token, secret, "123", 1_000 + SESSION_MAX_AGE * 1000 + 1), false);
});

test("malformed tokens and missing configuration never throw", async () => {
  for (const token of [undefined, "", "abc", "a.b.c", "!!!.???", "."]) assert.equal(await verifySession(token, secret, "123"), false);
  const token = await signSession("123", secret);
  assert.equal(await verifySession(token, undefined, "123"), false);
  assert.equal(await verifySession(token, "", "123"), false);
  assert.equal(await verifySession(token, secret, undefined), false);
});

test("lists missing or empty auth env names in a stable order", () => {
  const full = { GITHUB_CLIENT_ID: "a", GITHUB_CLIENT_SECRET: "b", ADMIN_GITHUB_ID: "1", SESSION_SECRET: "s" };
  assert.deepEqual(missingAuthEnv(full), []);
  assert.deepEqual(missingAuthEnv({ ...full, GITHUB_CLIENT_SECRET: "", SESSION_SECRET: undefined }), ["GITHUB_CLIENT_SECRET", "SESSION_SECRET"]);
});
