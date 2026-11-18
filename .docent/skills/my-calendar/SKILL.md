---
name: my-calendar
description: Show today's meetings from macOS Calendar as a markdown table (Time, Title, Calendar).
---

# My Calendar

Fetch today's events from macOS Calendar using `icalBuddy` and print them as a markdown table. Read-only — nothing is added or changed.

## Command

```sh
icalBuddy -ec calendar,eventsToday eventsToday | awk -v today="$(date '+%A, %B %d, %Y')" '
BEGIN {
  cal = ""
  rows = 0
}
NF == 0 { next }
/•/ {
  if (rows == 0) {
    print "## Meetings on " today
    print ""
    print "| Time | Title | Calendar |"
    print "|------|-------|----------|"
  }
  content = $0
  sub(/^[[:space:]]*•[[:space:]]*/, "", content)
  if (match(content, / at /)) {
    time = substr(content, RSTART + 5)
    title = substr(content, 1, RSTART - 1)
  } else {
    time = "All day"
    title = content
  }
  printf "| %s | %s | %s |\n", time, title, cal
  rows++
  next
}
{ cal = $0 }
END {
  if (rows == 0) print "_No meetings today._"
}'
```

## Format

Markdown table with three columns:

| Time | Title | Calendar |
|------|-------|----------|
| 9:00 AM | Standup | Work |
| 2:00 PM | Design review | Work |
| All day | Off-site | Personal |

- **Time** — start time, or `All day` for all-day events
- **Title** — event title
- **Calendar** — source calendar (Work, Personal, etc.)

If today has no events, the table is replaced with `_No meetings today._`.

## Notes

- Reads from the macOS Calendar app. Configure calendars in System Settings → Internet Accounts.
- icalBuddy's default per-event output is `Title at Time` (or just `Title` for all-day). The awk parser splits on the first ` at ` to recover the time.
- `-ec calendar,eventsToday` limits output to the calendar source and event sections — notes, location, attendees, etc. are suppressed for a clean meeting list.
- The default bullet (`•`) is used as the event marker; calendar names are lines without a bullet.
