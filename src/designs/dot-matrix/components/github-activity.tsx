import { getGitHubActivity } from "@/lib/github";
import { Icon } from "./icon";
import { ContributionTooltip } from "./contribution-tooltip";
import { CountUp } from "./count-up";

const dayFormatter = new Intl.DateTimeFormat("en", { day:"numeric", month:"short", year:"numeric", timeZone:"UTC" });
const monthFormatter = new Intl.DateTimeFormat("en", { month:"short", timeZone:"UTC" });
const dateLabel = (value: string) => dayFormatter.format(new Date(value));

export async function GitHubActivity() {
  const activity = await getGitHubActivity();
  return <div className="github-activity">
    {activity.status === "unavailable" ? <p className="muted">GitHub activity is temporarily unavailable.</p> : <>
      <p className="calendar-summary"><strong><CountUp value={activity.calendar.total} /></strong> contributions · {dateLabel(activity.from)} – {dateLabel(activity.to)}</p>
      <ContributionTooltip>
        <div className="calendar-weeks">{activity.calendar.weeks.map((week, index, weeks) => {
          const month = week[0].date.slice(0,7);
          // Label a column where a month starts; skip labels with no room: a partial first month the next label
          // would overlap, and a month starting in the last column (its text would overflow the calendar).
          const showMonth = index === 0 ? weeks[2]?.[0].date.slice(0,7) === month : index < weeks.length - 1 && month !== weeks[index - 1][0].date.slice(0,7);
          return <div className="calendar-week" key={week[0].date}><span className="calendar-month">{showMonth ? monthFormatter.format(new Date(`${week[0].date}T00:00:00Z`)) : ""}</span>{week.map(day => <span className={`calendar-day level-${day.level}`} key={day.date} style={{ gridRow: day.weekday + 2 }} role="img" aria-label={`${day.count} contributions on ${dateLabel(`${day.date}T00:00:00Z`)}`} data-contribution-date={day.date} data-contribution-count={day.count} />)}</div>;
        })}</div>
      </ContributionTooltip>
      <div className="calendar-meta"><span>Updated {dateLabel(activity.fetchedAt)}, {new Date(activity.fetchedAt).toISOString().slice(11,16)} UTC</span>
        <span className="legend" aria-hidden="true">Less {[0, 1, 2, 3, 4].map(level => <i key={level} className={`calendar-day level-${level}`} />)} More</span></div>
    </>}
    <a className="text-link" href="https://github.com/Jordannst" target="_blank" rel="noopener noreferrer">View on GitHub <Icon name="ne" /><span className="sr-only"> (opens in new tab)</span></a>
  </div>;
}
