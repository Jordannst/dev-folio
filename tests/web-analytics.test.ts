import { test } from "node:test";
import assert from "node:assert/strict";
import { getTrafficReport } from "../src/lib/web-analytics.ts";

test("traffic report keeps period visitors separate from daily counts, handles empty data, and rejects failures", async context => {
  const now = new Date("2026-10-05T08:00:00Z");
  const config = { token: "test-secret", projectId: "test-project", teamId: "test-team" };
  let mode: "valid" | "empty" | "invalid" | "duplicate" | "failed" = "valid";
  context.mock.method(globalThis, "fetch", async (input: URL, options: RequestInit) => {
    assert.equal(input.hostname, "api.vercel.com");
    assert.equal(input.searchParams.get("since"), "2026-09-29T00:00:00Z");
    assert.equal(input.searchParams.get("filter"), "environment eq 'production'");
    assert.equal(input.searchParams.get("teamId"), config.teamId);
    assert.equal((options.headers as Record<string, string>).Authorization, "Bearer test-secret");
    if (mode === "failed") return new Response("credential error", { status: 403 });
    const daily = [
      { timestamp: "2026-10-04T00:00:00Z", visitors: 2, pageviews: 4 },
      { timestamp: "2026-10-05T00:00:00Z", visitors: 2, pageviews: 3 },
    ];
    const data = mode === "empty" ? [] : input.searchParams.get("by") === "environment" ? [{ visitors: 3, pageviews: mode === "invalid" ? -1 : 7 }] : mode === "duplicate" ? [...daily, daily[0]] : daily;
    return Response.json({ version: 1, data });
  });
  const report = await getTrafficReport(7, config, now);
  assert.equal(report.visitors, 3); // Do not add daily visitors (4) to calculate a period total.
  assert.equal(report.pageviews, 7);
  assert.equal(report.daily.length, 7);
  assert.equal(report.daily[0].pageviews, 0);
  assert.equal(report.daily.at(-1)?.pageviews, 3);
  assert.equal(JSON.stringify(report).includes(config.token), false);
  mode = "empty";
  assert.equal((await getTrafficReport(7, config, now)).pageviews, 0);
  for (const failure of ["invalid", "duplicate", "failed"] as const) {
    mode = failure;
    await assert.rejects(getTrafficReport(7, config, now), /Invalid analytics response|Analytics unavailable/);
  }
});
