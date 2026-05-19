#!/usr/bin/env bash
# Install the launchd agent that runs scripts/weekly-digest.sh every Sunday 8am local.
#
# launchd > crontab on macOS:
#   - handles paths with spaces cleanly
#   - if the laptop is asleep at fire time, runs on next wake
#   - StartCalendarInterval semantics match cron
#   - inspect with `launchctl list | grep events-x-marble`

set -euo pipefail

LABEL="com.events-x-marble.weekly-digest"
SCRIPT="/Users/skela/Documents/events x marble/scripts/weekly-digest.sh"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ ! -x "$SCRIPT" ]; then
  echo "weekly-digest.sh is not executable; running: chmod +x \"$SCRIPT\""
  chmod +x "$SCRIPT"
fi

mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-lc</string>
    <string>"$SCRIPT"</string>
  </array>

  <!-- Every Sunday at 08:00 local time -->
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key>
    <integer>0</integer>
    <key>Hour</key>
    <integer>8</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>

  <!-- If laptop is asleep at fire time, run on next wake -->
  <key>RunAtLoad</key>
  <false/>

  <key>StandardOutPath</key>
  <string>/tmp/events-x-marble-launchd.out</string>
  <key>StandardErrorPath</key>
  <string>/tmp/events-x-marble-launchd.err</string>

  <!-- Inherit the user's PATH so /opt/homebrew/bin/bun is visible -->
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>
PLIST_EOF

if launchctl list | grep -q "$LABEL"; then
  echo "Unloading existing agent…"
  launchctl unload "$PLIST" 2>/dev/null || true
fi

echo "Loading launchd agent at $PLIST"
launchctl load "$PLIST"

echo ""
echo "Done. Verify with:"
echo "  launchctl list | grep $LABEL"
echo ""
echo "Trigger manually (skip the wait until Sunday) with:"
echo "  launchctl start $LABEL"
echo ""
echo "Inspect logs:"
echo "  tail -f /tmp/events-x-marble-weekly.log"
echo ""
echo "Uninstall:"
echo "  launchctl unload \"$PLIST\" && rm \"$PLIST\""
