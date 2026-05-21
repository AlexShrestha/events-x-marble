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
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
import { ask, askSecret, askYesNo, parseFlags } from "./prompt.mjs";
import { register } from "./server-client.mjs";
import { report } from "./status-report.mjs";
import { loadKg, kgCounts } from "./kg-load.mjs";

// Env vars we auto-detect to short-circuit the provider prompt. Order
// matches PROVIDER_ORDER below (openai → anthropic → opencode → openrouter).
// "custom" has no auto-detect since LLM_API_KEY is ambiguous on its own.
const KNOWN_KEY_ENVS = [
  { provider: "openai", envName: "OPENAI_API_KEY" },
  { provider: "anthropic", envName: "ANTHROPIC_API_KEY" },
  { provider: "opencode", envName: "OPENCODE_API_KEY" },
  { provider: "openrouter", envName: "OPENROUTER_API_KEY" },
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
  const { provider, llmApiKeyEnv, llmApiKeyValue, llmBaseUrl, llmModel } =
    await pickProvider(flags);

  // --- 2. KG path. Auto-discovery handles the "no KG yet" case in
  //        verifyPreflight() — the path here just specifies WHERE the KG
  //        will live (existing or to-be-built).
  const kgPath = await pickKgPath(flags);

  // --- 3. City + display name
  // Zero-prompt UX: when --connect-session is set, the server has already
  // geo-detected the user's city from the browser's edge headers — let it
  // dictate and skip the prompt entirely. Only ask manually if no session
  // (running events-x-marble init directly, no /connect browser tab).
  const connectSessionForCity =
    flags["connect-session"] ?? process.env.EXM_CONNECT_SESSION;
  let citySlug;
  if (flags.city) {
    citySlug = flags.city;
  } else if (connectSessionForCity) {
    citySlug = null; // defer to server's geo-detected default
    process.stderr.write("city: detecting from your browser location…\n");
  } else {
    citySlug = await ask("city slug", {
      default: "barcelona",
      validate: (v) => v.length > 0 || "required",
    });
  }
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
      ...(citySlug ? { defaultCitySlug: citySlug } : {}),
      connectSessionId: connectSession,
    });
    // Server response includes `city` (the effective city after geo detection
    // and auto-bootstrap). Adopt it so the CLI's saved config matches what
    // the server expects.
    if (registration.city) {
      citySlug = registration.city;
      process.stderr.write(`city: ${citySlug} (detected from browser)\n`);
    }
  }
  // Fallback if dry-run or server returned no city.
  if (!citySlug) citySlug = "barcelona";

  // --- 5. Persist config
  ensureConfigDir();
  const cfg = {
    site_url: siteUrl,
    user_id: registration.user_id,
    token: registration.token,
    llm_provider: provider,
    llm_api_key_env: llmApiKeyEnv,
    // If the user pasted their key during pickProvider's setup branch, save
    // it (chmod 600 on the config file). resolveApiKey() prefers this over
    // process.env, so future runs and the launchd cron work without env-var
    // propagation.
    ...(llmApiKeyValue ? { llm_api_key_value: llmApiKeyValue } : {}),
    // For custom providers: save the base URL + model. resolveLlmConfig() in
    // llm-providers.mjs picks these up when calling the LLM.
    ...(llmBaseUrl ? { llm_base_url: llmBaseUrl } : {}),
    ...(llmModel ? { llm_model: llmModel } : {}),
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
  process.stderr.write(
    `  llm     : ${provider} ${llmApiKeyValue ? "(key stored in config, chmod 600)" : `(key from $${llmApiKeyEnv})`}\n`,
  );

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
  // 1. API key must be available — either pasted into config during init
  //    (chmod 600) OR set in the env right now. If neither, surface the
  //    actionable hint rather than blowing up downstream.
  const hasConfigKey = Boolean(cfg.llm_api_key_value);
  const hasEnvKey = Boolean(process.env[llmApiKeyEnv]);
  if (!hasConfigKey && !hasEnvKey) {
    const msg = `no API key available — export ${llmApiKeyEnv} in your shell, or re-run \`events-x-marble init\` and pick "paste your key now".`;
    process.stderr.write(`\n! ${msg}\n`);
    await report({ cfg, state: "key_missing", message: msg });
    return;
  }

  // 2. KG file: if it doesn't exist, build one from whatever data we can
  //    find on the laptop. The discoverDataSources() sweep finds Claude
  //    exports, ChatGPT history, ~/Downloads chat-shape JSON, Claude Code
  //    sessions, and markdown journals. --build-from is just a manual
  //    override that adds ONE more path to the discovered set.
  if (!existsSync(kgPath)) {
    const { discoverDataSources } = await import("./discover-data.mjs");
    const discovered = discoverDataSources({});
    if (buildFrom && existsSync(buildFrom)) {
      discovered.unshift({
        path: buildFrom,
        format: kgFormat ?? "auto",
        kind: "manual-build-from",
        label: `manual override · ${buildFrom}`,
        sizeBytes: 0,
        recordEstimate: 1,
      });
    }
    if (discovered.length === 0) {
      const msg =
        `marble KG not found at ${kgPath}, and we couldn't auto-discover any data on your laptop. ` +
        `Common places we checked: ~/.claude/projects (Claude Code sessions), ~/Library/Application Support/Anthropic (Claude desktop), ~/Downloads (ChatGPT exports + chat-shape JSON), ~/Documents/Journal & Notes. ` +
        `Pass --build-from /path/to/your-data.json to point us at a file we missed.`;
      process.stderr.write(`\n! ${msg}\n`);
      await report({ cfg, state: "kg_missing", message: msg });
      return;
    }
    try {
      const { buildKgFromSources } = await import("./marble-build.mjs");
      process.stderr.write(`\nfound ${discovered.length} source(s) marble can learn from:\n`);
      for (const src of discovered.slice(0, 10)) {
        process.stderr.write(`  - ${src.label}  (${formatBytes(src.sizeBytes)})\n`);
      }
      if (discovered.length > 10) {
        process.stderr.write(`  …and ${discovered.length - 10} more\n`);
      }
      process.stderr.write(`\nbuilding KG (5–8 min; browser tab tracks progress)…\n`);
      const { summary, ingested, skipped } = await buildKgFromSources({
        cfg,
        kgPath,
        sources: discovered,
      });
      process.stderr.write(`\n✓ KG built from ${ingested.length} source(s) (${summary})\n`);
      if (skipped.length > 0) {
        process.stderr.write(`  (${skipped.length} skipped — see log above)\n`);
      }
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
  const { PROVIDERS, PROVIDER_ORDER } = await import("./llm-providers.mjs");

  // CLI-flag override (used by automation).
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

  // Show all five providers. PROVIDER_ORDER controls the display order
  // (currently: openai · anthropic · opencode · openrouter · custom).
  process.stderr.write("\nLLM provider:\n");
  PROVIDER_ORDER.forEach((key, i) => {
    const def = PROVIDERS[key];
    const hint = def.keyHint ? ` — ${def.keyHint}` : "";
    process.stderr.write(`  ${i + 1}. ${key.padEnd(11)} (${def.label}${hint})\n`);
  });
  const max = PROVIDER_ORDER.length;
  const pick = await ask(`pick 1-${max}`, {
    default: "1",
    validate: (v) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 1 && n <= max) || `1 through ${max}`;
    },
  });
  const provider = PROVIDER_ORDER[Number(pick) - 1];
  const def = PROVIDERS[provider];
  const defaultEnv = def.keyEnv;

  // The 'custom' branch needs base URL + model in addition to a key — handle it
  // separately since the questions differ.
  if (provider === "custom") {
    return await pickCustomProvider({ def });
  }

  // Standard provider — env var or paste-now path.
  if (process.env[defaultEnv]) {
    process.stderr.write(`  ✓ ${defaultEnv} is set in your shell — using it.\n`);
    return { provider, llmApiKeyEnv: defaultEnv };
  }

  process.stderr.write(`\n${defaultEnv} isn't set in your shell. Set it up:\n`);
  process.stderr.write(`  1. paste your key now — saved to ~/.events-x-marble/config.json (chmod 600)\n`);
  process.stderr.write(`  2. I'll export ${defaultEnv} in my shell before running\n`);
  if (def.signupUrl) {
    process.stderr.write(`  3. I don't have a key — open ${def.signupUrl}\n`);
  }
  const maxSetup = def.signupUrl ? 3 : 2;
  const setupChoice = await ask(`pick 1-${maxSetup}`, {
    default: "1",
    validate: (v) => {
      const n = Number(v);
      return (Number.isInteger(n) && n >= 1 && n <= maxSetup) || `1 through ${maxSetup}`;
    },
  });

  if (setupChoice === "1") {
    const apiKey = await askSecret(`paste your ${def.label} key:`, {
      validate: (v) => {
        if (!v) return "required";
        if (v.length < 10) return "that doesn't look like a real key (too short)";
        return true;
      },
    });
    return { provider, llmApiKeyEnv: defaultEnv, llmApiKeyValue: apiKey };
  }

  if (setupChoice === "2") {
    process.stderr.write(`  note: export ${defaultEnv}=… in your shell before running. The first scoring will fail until you do.\n`);
    return { provider, llmApiKeyEnv: defaultEnv };
  }

  // Option 3: open signup page, then loop back to paste.
  if (def.signupUrl) {
    process.stderr.write(`\nopening ${def.signupUrl} in your browser…\n`);
    try {
      const { spawnSync } = await import("node:child_process");
      const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
      spawnSync(opener, [def.signupUrl], { stdio: "ignore" });
    } catch {}
    process.stderr.write(`\nonce you've got a key, paste it here:\n`);
    const apiKey = await askSecret(`${def.label} key:`, {
      validate: (v) => (v && v.length >= 10) || "required (looks too short to be a real key)",
    });
    return { provider, llmApiKeyEnv: defaultEnv, llmApiKeyValue: apiKey };
  }

  // Unreachable in practice — fall through to the env-var note.
  return { provider, llmApiKeyEnv: defaultEnv };
}

/**
 * Custom (OpenAI-compatible) provider flow. Asks for base URL, model, and
 * API key. Saves all three into config so resolveLlmConfig() can route
 * arbitrary OpenAI-compatible endpoints (Together, Fireworks, Groq, vLLM,
 * local Ollama with auth, etc.).
 */
async function pickCustomProvider({ def }) {
  process.stderr.write(`\nCustom OpenAI-compatible endpoint — used for any host that exposes /v1/chat/completions.\n`);
  process.stderr.write(`  Examples: Together (api.together.xyz/v1), Fireworks, Groq, vLLM, Ollama, etc.\n\n`);
  const baseUrl = await ask("base URL (e.g. https://api.together.xyz/v1)", {
    validate: (v) => {
      if (!v) return "required";
      if (!/^https?:\/\//.test(v)) return "must start with http:// or https://";
      return true;
    },
  });
  const model = await ask("model name (e.g. meta-llama/Llama-3.3-70B-Instruct-Turbo)", {
    validate: (v) => (v && v.length >= 2) || "required",
  });
  const apiKey = await askSecret("API key for that endpoint:", {
    validate: (v) => (v && v.length >= 8) || "required (looks too short)",
  });
  return {
    provider: "custom",
    llmApiKeyEnv: def.keyEnv,
    llmApiKeyValue: apiKey,
    llmBaseUrl: baseUrl.replace(/\/$/, ""),
    llmModel: model,
  };
}

/**
 * Find an existing marble knowledge-graph file the user already has on this
 * laptop, OR fall through and let verifyPreflight build a fresh one.
 *
 * We look in:
 *   1. flags["kg-path"]                            (explicit override)
 *   2. $MARBLE_STORAGE                              (env override)
 *   3. ~/.events-x-marble/marble-kg.json            (our canonical location)
 *   4. ./marble-kg.json                             (cwd, marble's own default)
 *   5. ~/marble-kg.json                             (home dir)
 *   6. ~/Downloads/*marble-kg*.json                 (exported KG from marble CLI)
 *   7. ~/Downloads/*-marble-kg.json,                (named variants like alex-marble-kg)
 *      ~/Downloads/*-marble-kg-full.json
 *
 * Each candidate is shape-validated — must be JSON with a `user` object that
 * carries at least one of (interests | beliefs | preferences | identities).
 * Random JSON in Downloads (e.g. a chatgpt export) won't be mistaken for a KG.
 *
 * This is a meaningful UX win: users who have a marble KG already skip the
 * 5-8 minute ingest+learn pipeline entirely — `events-x-marble run` just
 * scores against the existing file.
 */
async function pickKgPath(flags) {
  if (flags["kg-path"]) return expandHome(flags["kg-path"]);

  const home = os.homedir();
  const downloads = path.join(home, "Downloads");

  // Tier 1: exact paths we control.
  const exactCandidates = [
    process.env.MARBLE_STORAGE,
    DEFAULT_KG_PATH,
    path.join(process.cwd(), "marble-kg.json"),
    path.join(home, "marble-kg.json"),
  ].filter(Boolean);
  for (const c of exactCandidates) {
    const resolved = expandHome(c);
    if (existsSync(resolved) && isLikelyMarbleKg(resolved)) {
      process.stderr.write(`\n✓ marble KG detected at ${resolved}\n`);
      process.stderr.write(`  skipping the 5–8 min KG build — we'll use this directly.\n`);
      return resolved;
    }
  }

  // Tier 2: glob ~/Downloads for marble-kg-shaped filenames. We don't walk
  // beyond ~/Downloads to keep the scan fast and predictable.
  if (existsSync(downloads)) {
    try {
      const entries = readdirSync(downloads);
      const matches = entries
        .filter((f) => {
          const lower = f.toLowerCase();
          if (!lower.endsWith(".json")) return false;
          // Match: marble-kg.json, alex-marble-kg.json, alex-marble-kg-full.json,
          //        my-marble-kg-2025.json, etc.
          return /marble[-_]?kg/.test(lower) || /marble[-_]?graph/.test(lower);
        })
        .map((f) => path.join(downloads, f))
        .filter((p) => isLikelyMarbleKg(p))
        // Prefer larger files (more signal) when multiple match.
        .sort((a, b) => safeStatSize(b) - safeStatSize(a));

      if (matches.length > 0) {
        const chosen = matches[0];
        process.stderr.write(`\n✓ marble KG detected at ${chosen}\n`);
        if (matches.length > 1) {
          process.stderr.write(
            `  (also found ${matches.length - 1} other candidate(s); using the largest)\n`,
          );
        }
        process.stderr.write(`  skipping the 5–8 min KG build — we'll use this directly.\n`);
        return chosen;
      }
    } catch {
      // best-effort scan
    }
  }

  // No existing KG anywhere — fall through. verifyPreflight() will build one
  // by auto-discovering data sources on the laptop and feeding marble.
  process.stderr.write(
    `\nno existing marble KG found — we'll build one at ${DEFAULT_KG_PATH} from whatever data we can discover.\n`,
  );
  return DEFAULT_KG_PATH;
}

/**
 * Validate a candidate file is shaped like a marble KG. The kg-loader.ts
 * accepts three shapes — { user: {...} }, { kg: { user: {...} } }, or a
 * flattened user object. We peek the first 8 KB so giant chat-history JSONs
 * (which can be 30+ MB) don't slow startup.
 */
function isLikelyMarbleKg(p) {
  try {
    const stat = statSync(p);
    if (!stat.isFile() || stat.size < 64) return false;
    // Peek first 8 KB. A real marble KG always has a `user` key near the top,
    // OR is a flat object with beliefs/preferences/identities/interests.
    const peek = readFileSync(p, { encoding: "utf8" }).slice(0, 8192);
    const t = peek.trimStart();
    if (!t.startsWith("{")) return false;
    return (
      /"user"\s*:\s*\{/.test(peek) ||
      /"kg"\s*:\s*\{/.test(peek) ||
      /"(beliefs|preferences|identities|interests|syntheses|insights)"\s*:\s*\[/.test(peek)
    );
  } catch {
    return false;
  }
}

function safeStatSize(p) {
  try { return statSync(p).size; } catch { return 0; }
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

/** Pretty bytes for the discovery listing. e.g. 1.2 MB / 340 KB / 87 KB. */
function formatBytes(n) {
  if (!Number.isFinite(n) || n <= 0) return "?";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Reference CONFIG_DIR so it's clearly a dependency even though we only use it via ensureConfigDir.
void CONFIG_DIR;
