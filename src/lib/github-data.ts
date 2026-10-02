export type CalendarDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4; weekday: number };
export type Calendar = { total: number; weeks: CalendarDay[][] };
const DAY = 86_400_000;
const levels = ["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"];
function unavailable(): never { throw new Error("GitHub activity unavailable"); }
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return unavailable();
  return value as Record<string, unknown>;
}
function natural(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) return unavailable();
  return value;
}
export function getDateRange(now: Date): { from: string; to: string } {
  const start = new Date(now); start.setUTCHours(0, 0, 0, 0); start.setUTCDate(start.getUTCDate() - 364);
  return { from: start.toISOString(), to: now.toISOString() };
}
export function parseCalendar(payload: unknown): Calendar {
  const response = object(payload);
  if (response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length > 0)) return unavailable();
  const calendar = object(object(object(object(response.data).user).contributionsCollection).contributionCalendar);
  const total = natural(calendar.totalContributions);
  if (!Array.isArray(calendar.weeks) || !calendar.weeks.length || calendar.weeks.length > 53) return unavailable();
  let previous: number | undefined;
  let sum = 0;
  const weeks = calendar.weeks.map((rawWeek, weekIndex) => {
    const days = object(rawWeek).contributionDays;
    if (!Array.isArray(days) || !days.length || days.length > 7) return unavailable();
    return days.map((rawDay, dayIndex): CalendarDay => {
      const day = object(rawDay);
      if (typeof day.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) return unavailable();
      const timestamp = Date.parse(`${day.date}T00:00:00Z`);
      if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== day.date) return unavailable();
      const weekday = natural(day.weekday);
      if (weekday > 6 || new Date(timestamp).getUTCDay() !== weekday || (weekIndex > 0 && dayIndex === 0 && weekday !== 0)) return unavailable();
      if (previous !== undefined && timestamp - previous !== DAY) return unavailable();
      previous = timestamp;
      const count = natural(day.contributionCount);
      const level = typeof day.contributionLevel === "string" ? levels.indexOf(day.contributionLevel) : -1;
      if (level < 0 || (count === 0) !== (level === 0)) return unavailable();
      sum += count;
      return { date: day.date, count, level: level as CalendarDay["level"], weekday };
    });
  });
  if (weeks.slice(0, -1).some(week => week.at(-1)?.weekday !== 6) || total !== sum) return unavailable();
  return { total, weeks };
}
export async function requestCalendar({ token, now, fetcher }: { token: string; now: Date; fetcher: typeof fetch }): Promise<Calendar> {
  try {
    const range = getDateRange(now);
    const response = await fetcher("https://api.github.com/graphql", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: `query($login:String!,$from:DateTime!,$to:DateTime!){user(login:$login){contributionsCollection(from:$from,to:$to){contributionCalendar{totalContributions weeks{contributionDays{date weekday contributionCount contributionLevel}}}}}}`, variables: { login: "Jordannst", ...range } }),
    });
    if (!response.ok) return unavailable();
    const calendar = parseCalendar(await response.json());
    const days = calendar.weeks.flat();
    if (days.length !== 365 || days[0].date !== range.from.slice(0,10) || days.at(-1)?.date !== range.to.slice(0,10)) return unavailable();
    return calendar;
  } catch { return unavailable(); }
}
