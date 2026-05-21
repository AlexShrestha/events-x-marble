/**
 * Tiny prompt helpers using node:readline. No deps.
 * Always writes prompts to stderr so stdout stays clean for piped consumers.
 */
import readline from "node:readline";

function newRl() {
  return readline.createInterface({ input: process.stdin, output: process.stderr });
}

/**
 * Prompt for a secret (API key, token, etc.). Echoes characters as `*` so
 * the value doesn't appear in scrollback / over-shoulder. Trims whitespace.
 *
 * Works under /dev/tty (the path the install script's `exec < /dev/tty`
 * routes through). Falls back to plain ask() if raw mode can't be enabled
 * (rare — typically when stdin isn't a TTY, e.g. piped automation).
 */
export async function askSecret(question, { validate } = {}) {
  const rl = newRl();
  while (true) {
    const value = await new Promise((resolve) => {
      // Try masked input first. If stdin isn't TTY-capable we silently fall
      // back to readline (visible input). Either way the value is returned.
      if (process.stdin.isTTY && process.stdin.setRawMode) {
        process.stderr.write(`${question} `);
        const chars = [];
        const onData = (buf) => {
          for (const byte of buf) {
            if (byte === 0x0d || byte === 0x0a) {
              // Enter
              process.stdin.removeListener("data", onData);
              process.stdin.setRawMode(false);
              process.stdin.pause();
              process.stderr.write("\n");
              resolve(chars.join("").trim());
              return;
            } else if (byte === 0x03) {
              // Ctrl-C
              process.stdin.setRawMode(false);
              process.exit(130);
            } else if (byte === 0x7f || byte === 0x08) {
              // Backspace
              if (chars.length > 0) {
                chars.pop();
                process.stderr.write("\b \b");
              }
            } else if (byte >= 0x20 && byte < 0x7f) {
              chars.push(String.fromCharCode(byte));
              process.stderr.write("*");
            }
          }
        };
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on("data", onData);
      } else {
        rl.question(`${question} `, (input) => resolve(input.trim()));
      }
    });
    if (validate) {
      const result = validate(value);
      if (result !== true && result !== undefined) {
        process.stderr.write(`  ${result}\n`);
        continue;
      }
    }
    rl.close();
    return value;
  }
}

export async function ask(question, { default: defaultValue, validate } = {}) {
  const rl = newRl();
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  while (true) {
    const answer = await new Promise((resolve) => {
      rl.question(`${question}${suffix} `, (input) => resolve(input.trim()));
    });
    const value = answer || defaultValue || "";
    if (validate) {
      const result = validate(value);
      if (result !== true && result !== undefined) {
        process.stderr.write(`  ${result}\n`);
        continue;
      }
    }
    rl.close();
    return value;
  }
}

export async function askYesNo(question, { default: defaultValue = false } = {}) {
  const suffix = defaultValue ? " [Y/n]" : " [y/N]";
  const answer = await ask(`${question}${suffix}`);
  if (!answer) return defaultValue;
  return /^y(es)?$/i.test(answer);
}

export async function askChoice(question, choices, { default: defaultIdx = 0 } = {}) {
  process.stderr.write(`${question}\n`);
  choices.forEach((c, i) => {
    process.stderr.write(`  ${i + 1}. ${c}${i === defaultIdx ? " (default)" : ""}\n`);
  });
  const answer = await ask(
    `pick 1-${choices.length}`,
    {
      default: String(defaultIdx + 1),
      validate: (v) => {
        const n = Number(v);
        if (!Number.isInteger(n) || n < 1 || n > choices.length) {
          return `enter a number between 1 and ${choices.length}`;
        }
        return true;
      },
    },
  );
  return Number(answer) - 1;
}

/** Parse a simple `--flag value` / `--flag=value` / boolean `--flag` arglist. */
export function parseFlags(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > 0) {
        out[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next === undefined || next.startsWith("--")) {
          out[a.slice(2)] = true;
        } else {
          out[a.slice(2)] = next;
          i++;
        }
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}
