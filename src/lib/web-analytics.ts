export type TrafficReport = {
  days: 7 | 30;
  visitors: number;
  pageviews: number;
  daily: { date: string; pageviews: number }[];
  updatedAt: string;
};

type Metric = { visitors: number; pageviews: number };
const validMetric = (value: unknown): value is Metric => {
  if (!value || typeof value !== "object") return false;
  const { visitors, pageviews } = value as Metric;
  return Number.isSafeInteger(visitors) && Number.isSafeInteger(pageviews) && visitors >= 0 && pageviews >= visitors;
};

export async function getTrafficReport(days: 7 | 30, config: { token: string; projectId: string; teamId?: string }, now = new Date()): Promise<TrafficReport> {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dates = Array.from({ length: days }, (_, index) => new Date(today - (days - 1 - index) * 86400000).toISOString().slice(0, 10));
  const query = async (by: string) => {
    const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/aggregate");
    url.search = new URLSearchParams({ projectId: config.projectId, since: `${dates[0]}T00:00:00Z`, until: now.toISOString(), by, limit: "30", filter: "environment eq 'production'" }).toString();
    if (config.teamId) url.searchParams.set("teamId", config.teamId);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${config.token}` }, signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!response.ok) throw new Error("Analytics unavailable");
    const body = await response.json();
    if (body?.version !== 1 || body?.data === undefined) throw new Error("Invalid analytics response");
    return body.data as unknown;
  };
  const [totalData, dailyData] = await Promise.all([query("environment"), query("day")]);
  const total = Array.isArray(totalData) ? (totalData.length === 0 ? { pageviews: 0, visitors: 0 } : totalData.length === 1 ? totalData[0] : null) : totalData;
  if (!validMetric(total) || !Array.isArray(dailyData)) throw new Error("Invalid analytics response");
  const points = new Map<string, number>();
  for (const row of dailyData) {
    if (!validMetric(row) || !("timestamp" in row) || typeof row.timestamp !== "string") throw new Error("Invalid analytics response");
    const date = row.timestamp.slice(0, 10);
    if (!dates.includes(date) || !Number.isFinite(Date.parse(row.timestamp)) || points.has(date)) throw new Error("Invalid analytics response");
    points.set(date, row.pageviews);
  }
  return { days, visitors: total.visitors, pageviews: total.pageviews, daily: dates.map(date => ({ date, pageviews: points.get(date) ?? 0 })), updatedAt: now.toISOString() };
}
