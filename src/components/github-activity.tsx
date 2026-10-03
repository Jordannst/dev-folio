import { connection } from "next/server";
import { getGitHubActivity } from "@/lib/github";
import { Icon } from "./icon";

const dayFormatter = new Intl.DateTimeFormat("en", { day:"numeric", month:"short", year:"numeric", timeZone:"UTC" });
const monthFormatter = new Intl.DateTimeFormat("en", { month:"short", timeZone:"UTC" });
const dateLabel = (value: string) => dayFormatter.format(new Date(value));

export async function GitHubActivity() {
  await connection();
  const activity = await getGitHubActivity();
  return <div className="github-activity">
    {activity.status === "unavailable" ? <p className="muted">GitHub activity is temporarily unavailable.</p> : <>
      <p className="calendar-summary"><strong>{activity.calendar.total.toLocaleString("en")}</strong> contributions · {dateLabel(activity.from)} – {dateLabel(activity.to)}</p>
      <div className="calendar" role="region" aria-label="GitHub contribution calendar">
        <div className="calendar-weeks">{activity.calendar.weeks.map((week, index, weeks) => {
          const month = week[0].date.slice(0,7);
          const showMonth = index === 0 || month !== weeks[index - 1][0].date.slice(0,7);
          return <div className="calendar-week" key={week[0].date}><span className="calendar-month">{showMonth ? monthFormatter.format(new Date(`${week[0].date}T00:00:00Z`)) : ""}</span>{week.map(day => <span className={`calendar-day level-${day.level}`} key={day.date} style={{ gridRow: day.weekday + 2 }} role="img" aria-label={`${day.count} contributions on ${dateLabel(`${day.date}T00:00:00Z`)}`} title={`${day.date}: ${day.count} contributions`}>{day.count > 0 ? day.count : ""}</span>)}</div>;
        })}</div>
      </div>
      <p className="calendar-updated">Updated {dateLabel(activity.fetchedAt)}, {new Date(activity.fetchedAt).toISOString().slice(11,16)} UTC</p>
    </>}
    <a className="text-link" href="https://github.com/Jordannst" target="_blank" rel="noopener noreferrer">View on GitHub <Icon name="arrow" /><span className="sr-only"> (opens in new tab)</span></a>
  </div>;
}
