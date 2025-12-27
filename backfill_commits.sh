#!/bin/bash

START_DATE="2025-01-01"
END_DATE=$(date +"%Y-%m-%d")

current_date="$START_DATE"

# Realistic commit messages
COMMIT_MESSAGES=(
  "Update documentation"
  "Fix bug in backend integration"
  "Add new feature to modal system"
  "Refactor code for better performance"
  "Update dependencies"
  "Improve accessibility features"
  "Fix styling issues"
  "Add error handling"
  "Update README"
  "Optimize database queries"
  "Add unit tests"
  "Fix typo"
  "Merge branch updates"
  "Update configuration"
  "Improve user interface"
  "Add analytics tracking"
  "Update theme system"
  "Fix responsive design"
  "Add new component"
  "Code cleanup"
)

while true; do
  # Get day of week (1=Monday, 7=Sunday)
  if date -j >/dev/null 2>&1; then
    # macOS
    day_of_week=$(date -j -f "%Y-%m-%d" "$current_date" +"%u")
  else
    # Linux
    day_of_week=$(date -d "$current_date" +"%u")
  fi

  # Decide if we commit today based on day of week
  should_commit=false
  if [[ $day_of_week -le 5 ]]; then
    # Weekday: 90% chance of commits
    if [[ $((RANDOM % 100)) -lt 90 ]]; then
      should_commit=true
    fi
  else
    # Weekend: 25% chance of commits
    if [[ $((RANDOM % 100)) -lt 25 ]]; then
      should_commit=true
    fi
  fi

  if $should_commit; then
    # Random number of commits (5-20)
    num_commits=$((5 + RANDOM % 16))
    echo "📅 Processing $current_date ($([ $day_of_week -le 5 ] && echo "Weekday" || echo "Weekend")) - $num_commits commits"

    for i in $(seq 1 $num_commits); do
      # Random hour (9 AM to 11 PM for realistic work hours)
      hour=$((9 + RANDOM % 15))
      minute=$((RANDOM % 60))
      second=$((RANDOM % 60))
      commit_time="${current_date} $(printf '%02d:%02d:%02d' $hour $minute $second)"

      # Random commit message
      msg_index=$((RANDOM % ${#COMMIT_MESSAGES[@]}))
      commit_msg="${COMMIT_MESSAGES[$msg_index]}"

      GIT_AUTHOR_DATE="$commit_time" \
      GIT_COMMITTER_DATE="$commit_time" \
      git commit --allow-empty -m "$commit_msg" >/dev/null 2>&1
    done
    echo "✅ Completed $num_commits commits"
  else
    echo "⏭️  Skipping $current_date ($([ $day_of_week -le 5 ] && echo "Weekday" || echo "Weekend"))"
  fi

  # Stop if reached today
  if [[ "$current_date" == "$END_DATE" ]]; then
    break
  fi

  # ---- DATE INCREMENT (macOS & Linux compatible) ----
  if date -j -v+1d >/dev/null 2>&1; then
    # macOS
    current_date=$(date -j -v+1d -f "%Y-%m-%d" "$current_date" +"%Y-%m-%d")
  else
    # Linux
    current_date=$(date -d "$current_date +1 day" +"%Y-%m-%d")
  fi
done

echo ""
echo "✅ Backfill completed from $START_DATE to $END_DATE"
echo "📊 Total commits: $(git rev-list --count HEAD ^f345e47)"