/**
 * `events-x-marble init`
 *
 * One-time setup:
 *   1. Detect (or prompt for) the LLM API key env var.
 *   2. Pass A scope: detect an existing marble KG file (~/.events-x-marble/marble-kg.json,
 *      $MARBLE_STORAGE, or ./marble-kg.json) or prompt for one.
 *      Pass B will replace this with the marble black-box ingest+learn flow.
 *   3. Prompt for city + optional display name.
 *   4. POST /api/v1/register → receive {user_id, token, url}.
 *   5. Persist ~/.events-x-marble/config.json (chmod 600).
 *   6. Print the connect URL; offer to install the weekly cron and do a first run.
 *
 * Flags (override prompts):
 *   --site-url URL          (default https://events.timesmarble.com)
 *   --kg-path PATH          path to existing marble-kg.json
 *   --city SLUG             city slug (default: barcelona)
 *   --display-name NAME
 *   --llm-key-env NAME      env var holding the API key (e.g. ANTHROPIC_API_KEY)
 *   --provider NAME         opencode | anthropic | openai
 *   --no-cron               skip cron install offer (no prompt)
 *   --auto-first-run        do a first scoring run immediately after register
 *                           (no prompt; install script defaults to this so /me
 *                           lands on real picks instead of an empty dashboard)
 *   --no-first-run          skip the first scoring run (no prompt)
 *   --build-from PATH       BLACK-BOX MARBLE: if no marble KG exists at
 *                           --kg-path yet, build one from PATH (chat export,
 *                           journal, episodes JSON). Reports 'ingesting' +
 *                           'learning' state to the server while marble runs.
 *   --kg-format chat|episodes|text|auto
 *                           override format detection for --build-from.
 *                           Default: auto (peeks at the file extension + content).
 *   --dry-run               do everything except the registration POST
 *   --connect-session ID    Browser-handshake id from /api/v1/connect/new —
 *                           passed through register() so the polling browser
 *                           tab auto-detects the registration and lands on /me.
 */
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  CONFIG_DIR,
  CONFIG_FILE,
  DEFAULT_KG_PATH,
  DEFAULT_SITE_URL,
  ensureConfigDir,
  expandHome,
  saveConfig,
} from "./config.mjs";
import { ask, askYesNo, parseFlags } from "./prompt.mjs";
import { register } from "./server-client.mjs";
import { report } from "./status-report.mjs";
import { loadKg, kgCounts } from "./kg-load.mjs";

const KNOWN_KEY_ENVS = [
  { provider: "opencode", envName: "OPENCODE_API_KEY" },
  { provider: "anthropic", envName: "ANTHROPIC_API_KEY" },
  { provider: "openai", envName: "OPENAI_API_KEY" },
];

export async function run(args) {
  const flags = parseFlags(args);

  if (existsSync(CONFIG_FILE)) {
    process.stderr.write(`config already exists at ${CONFIG_FILE}\n`);
    const overwrite = await askYesNo("overwrite?", { default: false });
    if (!overwrite) {
      process.stderr.write("aborted.\n");
      process.exit(0);
    }
  }

  process.stderr.write("\n=== events-x-marble setup ===\n\n");

  // --- 1. LLM provider + key env var
  const { provider, llmApiKeyEnv } = await pickProvider(flags);

  // --- 2. KG path. Two modes:
  //   - Pass A path: existing marble-kg.json file (default location, $MARBLE_STORAGE, or cwd)
  //   - Pass B path: --build-from <data>  → KG will be built; default path is
  //     ~/.events-x-marble/marble-kg.json and doesn't need to exist yet.
  const buildingFromData = Boolean(flags["build-from"]);
  const kgPath = await pickKgPath(flags, buildingFromData);

  // --- 3. City + display name
  const citySlug = flags.city
    ?? await ask("city slug", { default: "barcelona", validate: (v) => v.length > 0 || "required" });
  const displayName = flags["display-name"]
    ?? await ask("display name (optional, for your own dashboard)", { default: "" });

  // --- 4. Server registration
  const siteUrl = flags["site-url"] ?? DEFAULT_SITE_URL;
  const connectSession = flags["connect-session"] ?? process.env.EXM_CONNECT_SESSION ?? undefined;
  let registration;
  if (flags["dry-run"]) {
    process.stderr.write(`\n[dry-run] would POST ${siteUrl}/api/v1/register\n`);
    if (connectSession) {
      process.stderr.write(`[dry-run] would link to browser session ${connectSession}\n`);
    }
    registration = {
      user_id: "usr_dry_run_0000",
      token: "tok_dry_run_0000",
      url: `${siteUrl}/me?token=tok_dry_run_0000`,
    };
  } else {
    process.stderr.write(`\nregistering with ${siteUrl}…\n`);
    registration = await register({
      siteUrl,
      displayName: displayName || undefined,
      label: hostnameLabel(),
      defaultCitySlug: citySlug,
      connectSessionId: connectSession,
    });
  }

  // --- 5. Persist config
  ensureConfigDir();
  const cfg = {
    site_url: siteUrl,
    user_id: registration.user_id,
    token: registration.token,
    llm_provider: provider,
    llm_api_key_env: llmApiKeyEnv,
    city_slug: citySlug,
    kg_path: kgPath,
    display_name: displayName || null,
    created_at: new Date().toISOString(),
    last_push_at: null,
  };
  if (!flags["dry-run"]) saveConfig(cfg);

  process.stderr.write("\n✓ registered.\n");
  process.stderr.write(`  user_id : ${registration.user_id}\n`);
  process.stderr.write(`  token   : ${redact(registration.token)} (full token saved to ${CONFIG_FILE})\n`);
  process.stderr.write(`  config  : ${CONFIG_FILE}\n`);
  process.stderr.write(`  kg path : ${kgPath}\n`);
  process.stderr.write(`  llm     : ${provider} (key from $${llmApiKeyEnv})\n`);

  if (connectSession && registration.connect_linked) {
    process.stderr.write(
      "\n✓ linked to your browser tab — it will auto-update with progress as the install finishes.\n",
    );
  } else {
    process.stderr.write(
      `\nOpen this URL once in your browser to connect:\n  ${registration.url}\n\n`,
    );
    process.stderr.write("The site will set a cookie and redirect to your /me dashboard.\n");
  }

  // --- 6. Verify pre-flight requirements + report status to server
  // The browser tab on /connect is polling /api/v1/me/status via the connect
  // /status endpoint — every state change below shows up there in real time.
  if (!flags["dry-run"]) {
    await verifyPreflight({
      cfg,
      kgPath,
      llmApiKeyEnv,
      // Pass B: optional black-box marble bootstrap.
      buildFrom: flags["build-from"] ?? undefined,
      kgFormat: flags["kg-format"] ?? undefined,
    });
  }

  if (!flags["no-cron"] && !flags["dry-run"]) {
    let installCron;
    if (flags["auto-cron"]) {
      installCron = true;
      process.stderr.write("\ninstalling weekly cron automatically (--auto-cron)…\n");
    } else {
      installCron = await askYesNo(
        "\ninstall the weekly cron now? (Sundays 8am local)",
        { default: true },
      );
    }
    if (installCron) {
      const cronInstall = await import("./cron-install.mjs");
      await cronInstall.run([]);
    } else {
      process.stderr.write("\nyou can install it later with: events-x-marble cron-install\n");
    }
  }

  if (!flags["dry-run"]) {
    let doRun;
    if (flags["auto-first-run"]) {
      doRun = true;
      process.stderr.write("\nstarting first scoring run automatically (--auto-first-run)…\n");
    } else if (flags["no-first-run"]) {
      doRun = false;
    } else {
      doRun = await askYesNo("\ndo a first scoring run now?", { default: true });
    }
    if (doRun) {
      const runMod = await import("./run.mjs");
      await runMod.run([]);
    } else {
      process.stderr.write("\nyou can run it manually with: events-x-marble run\n");
    }
  }
}

// ---- helpers ---------------------------------------------------------------

/**
 * After register + saveConfig, verify the pre-flight requirements and report
 * state to the server. The website's /connect polling shows these states live.
 *
 * Pass B: if KG doesn't exist AND `buildFrom` (a data file path) was provided,
 * we build the KG black-box via marble's library API and report 'ingesting'
 * then 'learning' state along the way.
 *
 * States surfaced:
 *   - key_missing  → user sees "set $XXX_API_KEY in your shell and re-run"
 *   - kg_missing   → user sees "we couldn't find your marble KG" (no --build-from passed)
 *   - ingesting    → marble.ingestConversations/Episodes running
 *   - learning     → marble.learn() running
 *   - ready        → site auto-redirects to /me
 *   - error        → with appropriate category
 */
async function verifyPreflight({ cfg, kgPath, llmApiKeyEnv, buildFrom, kgFormat }) {
  // 1. API key must be set in the user's env right now.
  if (!process.env[llmApiKeyEnv]) {
    const msg = `${llmApiKeyEnv} is not set in your shell — export it and re-run \`events-x-marble run\`.`;
    process.stderr.write(`\n! ${msg}\n`);
    await report({ cfg, state: "key_missing", message: msg });
    return;
  }

  // 2. KG file: if it doesn't exist, optionally build one from a data file
  //    (chat export / journal / etc.) via marble — entirely black-box.
  if (!existsSync(kgPath)) {
    if (!buildFrom) {
      const msg = `marble KG not found at ${kgPath} — pass --build-from <data-file> to build one from your data, or point --kg-path at an existing file.`;
      process.stderr.write(`\n! ${msg}\n`);
      await report({ cfg, state: "kg_missing", message: msg });
      return;
    }
    try {
      const { buildKgFromFile } = await import("./marble-build.mjs");
      process.stderr.write(`\nbuilding KG from ${buildFrom}…\n`);
      process.stderr.write("  (this can take 2–5 minutes; the browser tab is showing live progress)\n");
      const { summary } = await buildKgFromFile({
        cfg,
        kgPath,
        dataPath: buildFrom,
        format: kgFormat ?? "auto",
      });
      process.stderr.write(`\n✓ KG built (${summary})\n`);
      await report({ cfg, state: "ready", message: `kg built (${summary})` });
      return;
    } catch (e) {
      const msg = `KG build failed: ${e.message ?? e}`;
      process.stderr.write(`\n✗ ${msg}\n`);
      const cat = /learn/i.test(msg)
        ? "learn_failed"
        : /ingest|episode|conversation/i.test(msg)
          ? "ingest_failed"
          : "unknown";
      await report({ cfg, state: "error", message: msg, errorCategory: cat });
      throw e;
    }
  }

  try {
    const { kg } = await loadKg(kgPath);
    const counts = kgCounts(kg);
    const summary = `${counts.beliefs}b · ${counts.preferences}p · ${counts.identities}id · ${counts.interests}i`;
    process.stderr.write(`\n✓ KG loaded (${summary})\n`);
    // Tell the server we're set up. The first `events-x-marble run` will move
    // us through scoring → pushing → ready.
    await report({
      cfg,
      state: "ready",
      message: `init complete (${summary})`,
    });
  } catch (e) {
    const msg = `couldn't read marble KG at ${kgPath}: ${e.message ?? e}`;
    process.stderr.write(`\n✗ ${msg}\n`);
    await report({ cfg, state: "error", message: msg, errorCategory: "kg_load_failed" });
  }
}

async function pickProvider(flags) {
  if (flags["llm-key-env"] && flags.provider) {
    return { provider: flags.provider, llmApiKeyEnv: flags["llm-key-env"] };
  }
  // Detect any pre-existing LLM key env var.
  const detected = KNOWN_KEY_ENVS.find((k) => process.env[k.envName]);
  if (detected) {
    process.stderr.write(
      `detected ${detected.envName} in your environment → provider: ${detected.provider}\n`,
    );
    const useIt = await askYesNo("use this?", { default: true });
    if (useIt) {
      return { provider: detected.provider, llmApiKeyEnv: detected.envName };
    }
  }
  const choices = [
    "opencode      (OpenCode Zen — sk-...)",
    "anthropic     (Anthropic API — sk-ant-...)",
    "openai        (OpenAI API — sk-...)",
  ];
  process.stderr.write("\nLLM provider:\n");
  choices.forEach((c, i) => process.stderr.write(`  ${i + 1}. ${c}\n`));
  const pick = await ask("pick 1-3", {
    default: "1",
    validate: (v) => ["1", "2", "3"].includes(v) || "1, 2, or 3",
  });
  const provider = ["opencode", "anthropic", "openai"][Number(pick) - 1];
  const defaultEnv = KNOWN_KEY_ENVS.find((k) => k.provider === provider).envName;
  const llmApiKeyEnv = await ask("env var name holding the API key", {
    default: defaultEnv,
    validate: (v) => /^[A-Z_][A-Z0-9_]*$/.test(v) || "uppercase ENV var name",
  });
  if (!process.env[llmApiKeyEnv]) {
    process.stderr.write(
      `  note: ${llmApiKeyEnv} is not set in your current shell — export it before running\n`,
    );
  }
  return { provider, llmApiKeyEnv };
}

async function pickKgPath(flags, buildingFromData = false) {
  if (flags["kg-path"]) return expandHome(flags["kg-path"]);

  const candidates = [
    process.env.MARBLE_STORAGE,
    DEFAULT_KG_PATH,
    path.join(process.cwd(), "marble-kg.json"),
  ].filter(Boolean);

  for (const c of candidates) {
    const resolved = expandHome(c);
    if (existsSync(resolved)) {
      process.stderr.write(`\ndetected marble KG at ${resolved}\n`);
      const useIt = await askYesNo("use this?", { default: true });
      if (useIt) return resolved;
    }
  }

  // Pass B: when --build-from is provided, we don't need an existing file —
  // marble will create one at the default location.
  if (buildingFromData) {
    process.stderr.write(
      `\n--build-from passed → will build a fresh marble KG at ${DEFAULT_KG_PATH}\n`,
    );
    return DEFAULT_KG_PATH;
  }

  process.stderr.write(
    "\nno existing marble KG detected.\n" +
      "  Option A: point us at an existing marble-kg.json file (--kg-path)\n" +
      "  Option B: build one from your data file (--build-from <path>)\n",
  );
  const p = await ask("path to your marble-kg.json", {
    validate: (v) => {
      if (!v) return "required";
      const r = expandHome(v);
      if (!existsSync(r)) return `file not found: ${r}`;
      return true;
    },
  });
  return expandHome(p);
}

function redact(token) {
  if (!token || token.length < 12) return "(redacted)";
  return token.slice(0, 8) + "…" + token.slice(-4);
}

function hostnameLabel() {
  try {
    return os.hostname() || "laptop";
  } catch {
    return "laptop";
  }
}

// Reference CONFIG_DIR so it's clearly a dependency even though we only use it via ensureConfigDir.
void CONFIG_DIR;
