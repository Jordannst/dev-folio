import "server-only";
import { unstable_cache } from "next/cache";
import { getDateRange, requestCalendar, type Calendar } from "./github-data";

export type Activity = { status: "ready"; calendar: Calendar; from: string; to: string; fetchedAt: string } | { status: "unavailable" };

const cachedCalendar = unstable_cache(async (_utcDate: string) => {
  const now = new Date();
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GitHub activity unavailable");
  const calendar = await requestCalendar({ token, now, fetcher: fetch });
  return { calendar, ...getDateRange(now), fetchedAt: new Date().toISOString() };
}, ["Jordannst-contributions-v1"], { revalidate: 21600 });

export async function getGitHubActivity(): Promise<Activity> {
  if (!process.env.GITHUB_TOKEN) return { status: "unavailable" };
  try { return { status: "ready", ...await cachedCalendar(new Date().toISOString().slice(0, 10)) }; }
  catch { return { status: "unavailable" }; }
}
