/**
 * `events-x-marble cron-install [--uninstall]`
 *
 * macOS: writes a launchd plist at
 *   ~/Library/LaunchAgents/com.events-x-marble.weekly.plist
 * scheduled for Sundays 8am local. Logs to /tmp/events-x-marble-weekly.log.
 *
 * Linux: writes a user crontab entry (uses `crontab` shell command).
 *
 * Uninstall: pass --uninstall to remove.
 *
 * The cron just runs the events-x-marble binary from its installed path,
 * so it picks up subsequent CLI upgrades automatically.
 */
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFlags } from "./prompt.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXM_BIN = path.resolve(__dirname, "..", "bin", "exm.mjs");
const LOG = "/tmp/events-x-marble-weekly.log";

const PLIST_PATH = path.join(
  os.homedir(),
  "Library",
  "LaunchAgents",
  "com.events-x-marble.weekly.plist",
);
const LABEL = "com.events-x-marble.weekly";

export async function run(args) {
  const flags = parseFlags(args);
  const platform = process.platform;

  if (flags.uninstall) {
    if (platform === "darwin") return uninstallMac();
    if (platform === "linux") return uninstallLinux();
    return process.stderr.write(`unsupported platform: ${platform}\n`);
  }

  if (platform === "darwin") return installMac();
  if (platform === "linux") return installLinux();
  return process.stderr.write(
    `unsupported platform: ${platform}.\n` +
      `manual setup: schedule "node ${EXM_BIN} run" weekly via your OS task scheduler.\n`,
  );
}

// ---- macOS launchd ----

function installMac() {
  const node = process.execPath;
  mkdirSync(path.dirname(PLIST_PATH), { recursive: true });

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${node}</string>
    <string>${EXM_BIN}</string>
    <string>run</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>0</integer>
    <key>Hour</key><integer>8</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key><string>${LOG}</string>
  <key>StandardErrorPath</key><string>${LOG}</string>
  <key>RunAtLoad</key><false/>
</dict>
</plist>
`;
  writeFileSync(PLIST_PATH, plist, "utf8");
  process.stderr.write(`[cron-install] wrote ${PLIST_PATH}\n`);

  // Bootstrap into launchd.
  const uid = process.getuid?.() ?? 0;
  spawnSync("launchctl", ["bootout", `gui/${uid}`, PLIST_PATH], { stdio: "ignore" });
  const r = spawnSync("launchctl", ["bootstrap", `gui/${uid}`, PLIST_PATH], { stdio: "inherit" });
  if (r.status === 0) {
    process.stderr.write(`[cron-install] ✓ scheduled for Sunday 8am local. Logs: ${LOG}\n`);
  } else {
    process.stderr.write(
      `[cron-install] launchctl bootstrap returned ${r.status}; plist is written but you may need to enable manually:\n` +
        `  launchctl bootstrap gui/${uid} ${PLIST_PATH}\n`,
    );
  }
}

function uninstallMac() {
  if (!existsSync(PLIST_PATH)) {
    process.stderr.write("[cron-install] nothing to uninstall (no plist found).\n");
    return;
  }
  const uid = process.getuid?.() ?? 0;
  spawnSync("launchctl", ["bootout", `gui/${uid}`, PLIST_PATH], { stdio: "ignore" });
  unlinkSync(PLIST_PATH);
  process.stderr.write(`[cron-install] ✓ removed ${PLIST_PATH}\n`);
}

// ---- Linux user crontab ----

function installLinux() {
  const node = process.execPath;
  const line = `0 8 * * 0 ${node} ${EXM_BIN} run >> ${LOG} 2>&1  # events-x-marble`;

  let current = "";
  try {
    current = execSync("crontab -l", { stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    current = "";
  }
  if (current.includes("# events-x-marble")) {
    process.stderr.write("[cron-install] events-x-marble entry already present in crontab. Run --uninstall first if you want to refresh.\n");
    return;
  }
  const next = current.trimEnd() + (current ? "\n" : "") + line + "\n";
  const tmp = path.join(os.tmpdir(), `exm-crontab-${process.pid}`);
  writeFileSync(tmp, next, "utf8");
  spawnSync("crontab", [tmp], { stdio: "inherit" });
  try {
    unlinkSync(tmp);
  } catch {}
  process.stderr.write(`[cron-install] ✓ added crontab entry. Logs: ${LOG}\n`);
}

function uninstallLinux() {
  let current = "";
  try {
    current = execSync("crontab -l", { stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    process.stderr.write("[cron-install] no crontab to clean.\n");
    return;
  }
  const lines = current.split("\n").filter((l) => !l.includes("# events-x-marble"));
  const next = lines.join("\n");
  const tmp = path.join(os.tmpdir(), `exm-crontab-${process.pid}`);
  writeFileSync(tmp, next, "utf8");
  spawnSync("crontab", [tmp], { stdio: "inherit" });
  try {
    unlinkSync(tmp);
  } catch {}
  process.stderr.write("[cron-install] ✓ removed events-x-marble entry from crontab.\n");
}

// Quell unused-import warning when invoked from init via dynamic import.
void readFileSync;
