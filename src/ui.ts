import chalk from "chalk";
import type { ModelConfig } from "./providers.js";
import type { Interface as ReadlineInterface } from "readline";

// ── Theme ────────────────────────────────────────────────────────────────────

const THEME = {
  accent: chalk.hex("#A78BFA"),
  accentBold: chalk.hex("#A78BFA").bold,
  success: chalk.hex("#6EE7B7"),
  tool: chalk.hex("#93C5FD"),
  toolDim: chalk.hex("#93C5FD").dim,
  error: chalk.hex("#F87171"),
  dim: chalk.dim,
  gray: chalk.gray,
};

const SYM = {
  dot: "●",
  diamond: "◆",
  chevron: "❯",
  tl: "┌",
  tr: "┐",
  bl: "└",
  br: "┘",
  h: "─",
  v: "│",
  tick: "✓",
  cross: "✗",
  bar: "┃",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function termWidth(): number {
  return process.stdout.columns ?? 80;
}

function boxWidth(): number {
  return Math.min(termWidth() - 2, 80);
}

function rule(): string {
  return THEME.dim(SYM.h.repeat(boxWidth()));
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, "");
}

function padRight(text: string, width: number): string {
  const visible = stripAnsi(text).length;
  const pad = Math.max(0, width - visible);
  return text + " ".repeat(pad);
}

function truncateLines(text: string, max: number): { lines: string[]; truncated: number } {
  const all = text.split("\n");
  if (all.length <= max) return { lines: all, truncated: 0 };
  return { lines: all.slice(0, max), truncated: all.length - max };
}

function boxTop(label?: string | undefined): string {
  const w = boxWidth();
  if (label) {
    const tag = ` ${label} `;
    const after = w - 2 - tag.length; // 2 = corner + first dash
    return `  ${THEME.tool(SYM.tl + SYM.h)}${THEME.tool(tag)}${THEME.tool(SYM.h.repeat(Math.max(0, after)) + SYM.tr)}`;
  }
  return `  ${THEME.tool(SYM.tl + SYM.h.repeat(w - 2) + SYM.tr)}`;
}

function boxLine(text: string): string {
  const inner = boxWidth() - 4; // 4 = "│  " + " │"
  const visible = stripAnsi(text).length;
  if (visible > inner) {
    // Truncate visible content
    text = text.slice(0, inner - 1) + "…";
  }
  return `  ${THEME.tool(SYM.v)}  ${padRight(text, inner)} ${THEME.tool(SYM.v)}`;
}

function boxBottom(): string {
  const w = boxWidth();
  return `  ${THEME.tool(SYM.bl + SYM.h.repeat(w - 2) + SYM.br)}`;
}

// ── Exports ──────────────────────────────────────────────────────────────────

export function toolHeader(name: string, args: string): string {
  return boxTop(name) + "\n" + boxLine(THEME.dim(args));
}

export function toolResult(output: string): string {
  const trimmed = output.trim();
  if (!trimmed || trimmed === "(no output)") {
    return boxLine(THEME.dim("(No content)")) + "\n" + boxBottom();
  }
  const { lines, truncated } = truncateLines(trimmed, 15);
  const body = lines.map((l) => boxLine(l)).join("\n");
  const more = truncated > 0 ? "\n" + boxLine(THEME.dim(`... +${truncated} more lines`)) : "";
  return body + more + "\n" + boxBottom();
}

export function toolError(msg: string): string {
  return boxLine(THEME.error(msg)) + "\n" + boxBottom();
}

export function responseInfo(elapsed: number, toolNames: string[]): string {
  const time =
    elapsed < 1000 ? `${elapsed}ms` : `${(elapsed / 1000).toFixed(1)}s`;
  const toolCount = toolNames.length;
  if (toolCount === 0) {
    return THEME.dim(`${SYM.dot} ${time}`);
  }
  return THEME.dim(
    `${SYM.dot} ${time} · ${toolCount} tool call${toolCount > 1 ? "s" : ""}`,
  );
}

export function aiMessage(content: string): string {
  return (
    "\n" +
    THEME.accentBold(`${SYM.diamond} Assistant`) +
    "\n\n" +
    content +
    "\n\n" +
    rule() +
    "\n"
  );
}

export function userPrompt(): string {
  process.stdout.write("\x1b[5 q");
  return `${THEME.accentBold(SYM.chevron)} `;
}

export function statusText(text: string): string {
  return THEME.accent(`${SYM.dot} ${text}`);
}

export function welcomeBanner(
  model: string,
  provider: string,
  cwd: string,
): string {
  const shortCwd = cwd.replace(process.env.HOME ?? "", "~");
  const inner = boxWidth() - 4;

  const lines = [
    `${THEME.accentBold("HungPhu Code")}  ${THEME.dim("v1.0.0")}`,
    THEME.dim(`${model} · ${provider}`),
    THEME.dim(shortCwd),
    "",
    THEME.accent('Type "exit" to quit · /help for commands'),
  ];

  const top = `${THEME.accent(SYM.tl + SYM.h.repeat(inner + 2) + SYM.tr)}`;
  const bottom = `${THEME.accent(SYM.bl + SYM.h.repeat(inner + 2) + SYM.br)}`;
  const body = lines
    .map((l) => `${THEME.accent(SYM.v)}  ${padRight(l, inner)} ${THEME.accent(SYM.v)}`)
    .join("\n");

  return "\n" + top + "\n" + body + "\n" + bottom + "\n";
}

export function interactiveModelSelector(
  models: ModelConfig[],
  currentIndex: number,
  rl: ReadlineInterface,
): Promise<number> {
  console.log(THEME.accentBold("Select model"));
  for (let i = 0; i < models.length; i++) {
    const m = models[i]!;
    const num = THEME.dim(`${i + 1}.`);
    const label = m.recommended ? `${m.label} (recommended)` : m.label;
    const check = i === currentIndex ? THEME.success(" ✓") : "";
    const desc = THEME.dim(`${m.model} · ${m.description}`);
    console.log(`  ${num} ${label}${check}   ${desc}`);
  }
  return new Promise((resolve) => {
    rl.question(THEME.dim("Enter number (or 0 to cancel): "), (ans) => {
      const n = parseInt(ans, 10);
      if (n >= 1 && n <= models.length) resolve(n - 1);
      else resolve(-1);
    });
  });
}

export interface SlashCommand {
  name: string;
  description: string;
}

export function interactiveCommandSelector(
  commands: SlashCommand[],
  rl: ReadlineInterface,
): Promise<string | null> {
  console.log(THEME.accentBold("Commands"));
  const maxName = Math.max(...commands.map((c) => c.name.length));
  commands.forEach((cmd, i) => {
    const name = `/${cmd.name}`.padEnd(maxName + 2);
    console.log(
      `  ${THEME.dim(`${i + 1}.`)} ${THEME.accent(name)} ${THEME.dim(cmd.description)}`,
    );
  });
  return new Promise((resolve) => {
    rl.question(THEME.dim("Enter number (or 0 to cancel): "), (ans) => {
      const n = parseInt(ans, 10);
      if (n >= 1 && n <= commands.length) resolve(commands[n - 1]!.name);
      else resolve(null);
    });
  });
}

export function goodbye(): string {
  return THEME.accent("Bye!");
}

export function errorText(msg: string): string {
  const w = boxWidth();
  const inner = w - 4;
  const top = `  ${THEME.error(SYM.tl + SYM.h.repeat(w - 2) + SYM.tr)}`;
  const line = `  ${THEME.error(SYM.v)}  ${padRight(THEME.error(msg), inner)} ${THEME.error(SYM.v)}`;
  const bottom = `  ${THEME.error(SYM.bl + SYM.h.repeat(w - 2) + SYM.br)}`;
  return "\n" + top + "\n" + line + "\n" + bottom + "\n";
}

export function spinner(name: string): { stop: () => void } {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const start = Date.now();
  const interval = setInterval(() => {
    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    process.stdout.write(
      `\r${THEME.accent(frames[i % frames.length]!)} ${THEME.dim(`${name}… (${elapsed}s)`)}  `,
    );
    i++;
  }, 80);

  return {
    stop() {
      clearInterval(interval);
      process.stdout.write("\r" + " ".repeat(60) + "\r");
    },
  };
}
