#!/usr/bin/env python3
import datetime
import random
import subprocess
import os

START_DATE = datetime.date(2026, 1, 1)
END_DATE = datetime.date(2026, 8, 19)

COMMIT_MESSAGES = [
    "Refactor responsive navbar toggle logic",
    "Optimize image assets and lazy loading",
    "Update meta tags for Open Graph and Twitter cards",
    "Fix layout shift in hero header",
    "Improve lighthouse accessibility score",
    "Update project case studies in portfolio",
    "Clean up unused CSS rules and modernize styling",
    "Add smooth scrolling behavior to anchor links",
    "Enhance mobile navigation drawer transition",
    "Update resume PDF download link and metadata",
    "Fix broken links in projects section",
    "Refactor contact form validation handler",
    "Implement dark mode theme persistence fix",
    "Update package dependencies and security patches",
    "Optimize font loading with font-display swap",
    "Improve SEO structured data markup",
    "Refactor backend API endpoints",
    "Add error handling for async fetch requests",
    "Improve keyboard navigation focus indicators",
    "Fix contrast ratio on badge components",
    "Update README with latest tech stack details",
    "Refactor utility helpers for date formatting",
    "Tune animation timings for project cards",
    "Add favicon variants for iOS and Android",
    "Fix sticky navigation z-index clipping",
    "Update GitHub workflow configurations",
    "Refactor script modularity and component structure",
    "Improve modal dialog trap focus handling",
    "Add telemetry logging for interaction events",
    "Clean up legacy comments and format code",
    "Optimize bundle size and tree shaking",
    "Enhance hover states on interactive cards",
    "Fix overflow issue on small mobile screens",
    "Add automated lint checks",
    "Update project screenshots and descriptions",
    "Refactor state management in client components",
    "Fix race condition in async data fetching",
    "Improve color contrast for WCAG AA compliance",
    "Optimize DOM node count and render cycles",
    "Update copyright year and footer metadata"
]

def main():
    repo_dir = "/Users/mukundjangid/portfolio-mjangid7"
    os.chdir(repo_dir)

    # Group all dates by week (ISO year and week number)
    all_dates = []
    curr = START_DATE
    while curr <= END_DATE:
        all_dates.append(curr)
        curr += datetime.timedelta(days=1)

    weeks = {}
    for d in all_dates:
        iso_year, iso_week, _ = d.isocalendar()
        key = (iso_year, iso_week)
        if key not in weeks:
            weeks[key] = []
        weeks[key].append(d)

    total_commits = 0
    active_days_count = 0

    env_base = os.environ.copy()
    env_base["GIT_AUTHOR_NAME"] = "mjangid7"
    env_base["GIT_AUTHOR_EMAIL"] = "mukund.jangid95@gmail.com"
    env_base["GIT_COMMITTER_NAME"] = "mjangid7"
    env_base["GIT_COMMITTER_EMAIL"] = "mukund.jangid95@gmail.com"
    env_base["GIT_CONFIG_GLOBAL"] = "/dev/null"

    # Seed random for reproducibility with a natural feel
    random.seed(42)

    for week_key, days in weeks.items():
        weekdays = [d for d in days if d.weekday() < 5]
        weekends = [d for d in days if d.weekday() >= 5]

        # Target 4 or 5 active days per week (sometimes 3 for a break or 6)
        target_active_days = random.choices([4, 5, 3, 6], weights=[45, 45, 5, 5])[0]
        target_active_days = min(target_active_days, len(days))

        # Favor weekdays first, occasionally pick a weekend day
        active_days = set()
        random.shuffle(weekdays)
        random.shuffle(weekends)

        # Pick from weekdays first
        for d in weekdays:
            if len(active_days) < target_active_days:
                if random.random() < 0.90:
                    active_days.add(d)

        # If needed, fill or add from weekends
        for d in weekends:
            if len(active_days) < target_active_days:
                if random.random() < 0.35:
                    active_days.add(d)

        # Ensure at least 3-4 days if the week had 7 days
        if len(days) >= 5 and len(active_days) < 4:
            available = [d for d in days if d not in active_days]
            if available:
                active_days.add(random.choice(available))

        for d in sorted(days):
            if d in active_days:
                active_days_count += 1
                # 2 to 9 commits per active day (varied intensity for heatmap color variations)
                num_commits = random.choices([2, 3, 4, 5, 6, 7, 8, 9], weights=[15, 20, 25, 20, 10, 5, 3, 2])[0]

                # Generate spaced out times between 09:30 and 23:15
                current_time_minutes = random.randint(9 * 60 + 30, 11 * 60)
                interval = (13 * 60) // (num_commits + 1)

                for _ in range(num_commits):
                    current_time_minutes += random.randint(max(15, interval - 45), interval + 45)
                    current_time_minutes = min(current_time_minutes, 23 * 60 + 45)

                    hour = current_time_minutes // 60
                    minute = current_time_minutes % 60
                    second = random.randint(0, 59)

                    dt_str = f"{d.strftime('%Y-%m-%d')} {hour:02d}:{minute:02d}:{second:02d} +0530"
                    commit_msg = random.choice(COMMIT_MESSAGES)

                    cmd_env = env_base.copy()
                    cmd_env["GIT_AUTHOR_DATE"] = dt_str
                    cmd_env["GIT_COMMITTER_DATE"] = dt_str

                    subprocess.run(
                        ["git", "commit", "--allow-empty", "-m", commit_msg],
                        env=cmd_env,
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        check=True
                    )
                    total_commits += 1

    print(f"Successfully created {total_commits} commits across {active_days_count} active days in 2026.")

if __name__ == "__main__":
    main()
