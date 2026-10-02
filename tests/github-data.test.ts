import assert from "node:assert/strict";
import test from "node:test";
import { getDateRange, parseCalendar, requestCalendar } from "../src/lib/github-data.ts";

const payload = () => ({ data: { user: { contributionsCollection: { contributionCalendar: { totalContributions: 2, weeks: [
  { contributionDays: [{ date: "2026-10-02", contributionCount: 2, contributionLevel: "FIRST_QUARTILE", weekday: 5 }, { date: "2026-10-03", contributionCount: 0, contributionLevel: "NONE", weekday: 6 }] },
  { contributionDays: [{ date: "2026-10-04", contributionCount: 0, contributionLevel: "NONE", weekday: 0 }] },
] } } } } });

test("range covers 365 inclusive UTC dates across leap years and changes at UTC midnight", () => {
  assert.deepEqual(getDateRange(new Date("2026-10-02T12:00:00Z")), { from: "2025-10-03T00:00:00.000Z", to: "2026-10-02T12:00:00.000Z" });
  assert.equal(getDateRange(new Date("2024-03-01T12:00:00Z")).from, "2023-03-03T00:00:00.000Z");
  assert.equal(getDateRange(new Date("2026-10-03T00:00:00Z")).from, "2025-10-04T00:00:00.000Z");
});
test("valid data and a real zero calendar remain distinct from failure", () => {
  assert.equal(parseCalendar(payload()).weeks[0][0].count, 2);
  const zero = payload(); zero.data.user.contributionsCollection.contributionCalendar.totalContributions = 0;
  const day = zero.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[0]; day.contributionCount = 0; day.contributionLevel = "NONE";
  assert.equal(parseCalendar(zero).total, 0);
});
test("rejects malformed, partial-error, invalid-date, negative, duplicate, and unordered responses", () => {
  for (const invalid of [null, {}, { data: { user: null } }, { ...payload(), errors: [{ message: "private upstream detail" }] }]) assert.throws(() => parseCalendar(invalid));
  for (const change of [{ date: "2026-02-30" }, { contributionCount: -1 }, { contributionCount: 1.2 }, { contributionLevel: "INVALID" }, { weekday: 4 }]) {
    const invalid = payload(); Object.assign(invalid.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[0], change); assert.throws(() => parseCalendar(invalid));
  }
  const duplicate = payload(); duplicate.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[1].date = "2026-10-02"; assert.throws(() => parseCalendar(duplicate));
  const gap = payload(); gap.data.user.contributionsCollection.contributionCalendar.weeks[1].contributionDays[0].date = "2026-10-11"; assert.throws(() => parseCalendar(gap));
});
test("transport rejects HTTP errors, GraphQL errors, and incomplete date ranges without exposing payloads", async () => {
  for (const response of [new Response("credential detail", {status:401}), Response.json({errors:[{message:"secret detail"}]}), Response.json(payload())]) {
    await assert.rejects(requestCalendar({ token: "test-only", now: new Date("2026-10-04T12:00:00Z"), fetcher: async () => response }), /GitHub activity unavailable/);
  }
});
test("transport validates a complete year and sends only the configured user/calendar query", async () => {
  const days = Array.from({ length: 365 }, (_, i) => { const date = new Date(Date.UTC(2025, 9, 3 + i)); return { date: date.toISOString().slice(0,10), weekday: date.getUTCDay(), contributionCount: 0, contributionLevel: "NONE" }; });
  const weeks: {contributionDays: typeof days}[] = [];
  for (const day of days) { if (!weeks.length || day.weekday === 0) weeks.push({contributionDays:[]}); weeks.at(-1)!.contributionDays.push(day); }
  const result = await requestCalendar({token:"test-only", now:new Date("2026-10-02T12:00:00Z"), fetcher:async (url, options) => {
    assert.equal(url, "https://api.github.com/graphql"); assert.equal(options?.method, "POST");
    const body = JSON.parse(options?.body as string); assert.deepEqual(body.variables, { login:"Jordannst", from:"2025-10-03T00:00:00.000Z", to:"2026-10-02T12:00:00.000Z" });
    assert.ok(options?.signal);
    return Response.json({data:{user:{contributionsCollection:{contributionCalendar:{totalContributions:0,weeks}}}}});
  }});
  assert.equal(result.weeks.flat().length,365); assert.equal(result.total,0);
});
test("slow upstream requests abort and return a sanitized failure", async () => {
  const keepAlive = setTimeout(() => {}, 6000);
  try {
    await assert.rejects(requestCalendar({ token:"test-only", now:new Date(), fetcher:async (_url, options) => new Promise((_resolve,reject) => { options?.signal?.addEventListener("abort", () => reject(new Error("secret upstream timeout")), { once:true }); }) }), /GitHub activity unavailable/);
  } finally { clearTimeout(keepAlive); }
});
