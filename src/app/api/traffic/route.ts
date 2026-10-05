import { unstable_cache } from "next/cache";
import { getTrafficReport } from "@/lib/web-analytics";

const cachedReport = unstable_cache(async (days: 7 | 30, projectId: string, teamId: string | undefined, _utcDate: string) => {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("Analytics unavailable");
  return getTrafficReport(days, { token, projectId, teamId });
}, ["pogo-traffic-v1"], { revalidate: 300 });

export async function GET(request: Request) {
  const start = Date.now();
  const days = new URL(request.url).searchParams.get("days") ?? "7";
  if (days !== "7" && days !== "30") return Response.json({ error: "Invalid range" }, { status: 400 });
  const token = process.env.VERCEL_TOKEN, projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return Response.json({ error: "Analytics unavailable" }, { status: 503 });
  console.info(JSON.stringify({ route: "/api/traffic", phase: "start", days }));
  try {
    const report = await cachedReport(Number(days) as 7 | 30, projectId, process.env.VERCEL_TEAM_ID, new Date().toISOString().slice(0, 10));
    console.info(JSON.stringify({ route: "/api/traffic", phase: "done", ms: Date.now() - start }));
    return Response.json(report, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300" } });
  } catch {
    console.error(JSON.stringify({ route: "/api/traffic", phase: "unavailable", ms: Date.now() - start }));
    return Response.json({ error: "Analytics unavailable" }, { status: 503 });
  }
}
