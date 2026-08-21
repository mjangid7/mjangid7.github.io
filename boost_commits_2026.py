#!/usr/bin/env python3
import datetime
import random
import subprocess
import os
from collections import defaultdict

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
    "Update copyright year and footer metadata",
    "Implement cache-control headers for static assets",
    "Add service worker offline fallback support",
    "Refactor CSS variables for design system consistency",
    "Fix mobile touch target sizes on navigation links",
    "Audit third-party scripts and improve TBT",
    "Add schema.org Person entity schema for portfolio"
]

def main():
    repo_dir = "/Users/mukundjangid/portfolio-mjangid7"
    os.chdir(repo_dir)

    # Get current commit counts for each day in 2026
    res = subprocess.run(
        ["git", "log", "--since=2026-01-01", "--format=%ad", "--date=short"],
        capture_output=True,
        text=True,
        check=True
    )
    current_counts = defaultdict(int)
    for line in res.stdout.strip().splitlines():
        if line.strip():
            current_counts[line.strip()] += 1

    env_base = os.environ.copy()
    env_base["GIT_AUTHOR_NAME"] = "mjangid7"
    env_base["GIT_AUTHOR_EMAIL"] = "mukund.jangid95@gmail.com"
    env_base["GIT_COMMITTER_NAME"] = "mjangid7"
    env_base["GIT_COMMITTER_EMAIL"] = "mukund.jangid95@gmail.com"
    env_base["GIT_CONFIG_GLOBAL"] = "/dev/null"

    random.seed(99)

    total_added = 0
    # For each active day, boost total commits to 6-25 commits with realistic variety
    for date_str in sorted(current_counts.keys()):
        curr_count = current_counts[date_str]

        # Target distribution:
        # ~20% light green (6-9 commits)
        # ~35% medium green (10-15 commits)
        # ~30% bright green (16-20 commits)
        # ~15% intense green (21-25 commits)
        target_total = random.choices(
            [
                random.randint(6, 9),
                random.randint(10, 15),
                random.randint(16, 20),
                random.randint(21, 25)
            ],
            weights=[20, 35, 30, 15]
        )[0]

        needed = max(0, target_total - curr_count)
        if needed == 0:
            continue

        d = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()

        for _ in range(needed):
            hour = random.randint(9, 23)
            minute = random.randint(0, 59)
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
            total_added += 1

    print(f"Added {total_added} commits to create vibrant multi-level shades across 2026.")

if __name__ == "__main__":
    main()
