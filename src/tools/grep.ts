import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { execSync } from "child_process";

function hasRg(): boolean {
  try {
    execSync("which rg", { encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

const useRg = hasRg();

function escapeShell(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`;
}

export interface GrepInput {
  pattern: string;
  path?: string | undefined;
  glob?: string | undefined;
  output_mode?: string | undefined;
  "-B"?: number | undefined;
  "-A"?: number | undefined;
  "-C"?: number | undefined;
  "-n"?: boolean | undefined;
  "-i"?: boolean | undefined;
  type?: string | undefined;
  head_limit?: number | undefined;
  multiline?: boolean | undefined;
}

function buildRgCmd(input: GrepInput): string {
  const args: string[] = [];
  const outputMode = input.output_mode ?? "files_with_matches";

  if (outputMode === "files_with_matches") args.push("--files-with-matches");
  else if (outputMode === "count") args.push("--count");

  if (input["-i"]) args.push("-i");
  if (input.multiline) args.push("-U", "--multiline-dotall");
  if (input["-n"] && outputMode === "content") args.push("-n");
  if (input["-B"] !== undefined && outputMode === "content")
    args.push(`-B${input["-B"]}`);
  if (input["-A"] !== undefined && outputMode === "content")
    args.push(`-A${input["-A"]}`);
  if (input["-C"] !== undefined && outputMode === "content")
    args.push(`-C${input["-C"]}`);
  if (input.glob) args.push("--glob", input.glob);
  if (input.type) args.push("--type", input.type);

  args.push("-e", input.pattern);
  if (input.path) args.push(input.path);

  let cmd = `rg ${args.map(escapeShell).join(" ")}`;
  if (input.head_limit) cmd += ` | head -n ${input.head_limit}`;
  return cmd;
}

function buildGrepCmd(input: GrepInput): string {
  const args: string[] = ["-r", "-E"];
  const outputMode = input.output_mode ?? "files_with_matches";

  if (outputMode === "files_with_matches") args.push("-l");
  else if (outputMode === "count") args.push("-c");

  if (input["-i"]) args.push("-i");
  if (input["-n"] && outputMode === "content") args.push("-n");
  if (input["-B"] !== undefined && outputMode === "content")
    args.push(`-B${input["-B"]}`);
  if (input["-A"] !== undefined && outputMode === "content")
    args.push(`-A${input["-A"]}`);
  if (input["-C"] !== undefined && outputMode === "content")
    args.push(`-C${input["-C"]}`);
  if (input.glob) args.push(`--include=${input.glob}`);

  args.push("-e", input.pattern);
  args.push(input.path ?? ".");

  let cmd = `grep ${args.map(escapeShell).join(" ")}`;
  if (input.head_limit) cmd += ` | head -n ${input.head_limit}`;
  return cmd;
}

export const grepTool = tool(
  async (input: GrepInput) => {
    try {
      const cmd = useRg ? buildRgCmd(input) : buildGrepCmd(input);
      const result = execSync(cmd, {
        encoding: "utf-8",
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024,
      });
      return result || "No matches found.";
    } catch (err: unknown) {
      const error = err as { status?: number; stdout?: string; message: string };
      if (error.status === 1) return "No matches found.";
      return `Error: ${error.stdout || error.message}`;
    }
  },
  {
    name: "Grep",
    description:
      'A powerful search tool built on ripgrep\n\n  Usage:\n  - ALWAYS use Grep for search tasks. NEVER invoke `grep` or `rg` as a Bash command. The Grep tool has been optimized for correct permissions and access.\n  - Supports full regex syntax (e.g., "log.*Error", "function\\s+\\w+")\n  - Filter files with glob parameter (e.g., "*.js", "**/*.tsx") or type parameter (e.g., "js", "py", "rust")\n  - Output modes: "content" shows matching lines, "files_with_matches" shows only file paths (default), "count" shows match counts\n  - Use Task tool for open-ended searches requiring multiple rounds\n  - Pattern syntax: Uses ripgrep (not grep) - literal braces need escaping (use `interface\\{\\}` to find `interface{}` in Go code)\n  - Multiline matching: By default patterns match within single lines only. For cross-line patterns like `struct \\{[\\s\\S]*?field`, use `multiline: true`',
    schema: z.object({
      pattern: z
        .string()
        .describe("The regular expression pattern to search for in file contents"),
      path: z
        .string()
        .optional()
        .describe(
          "File or directory to search in (rg PATH). Defaults to current working directory.",
        ),
      glob: z
        .string()
        .optional()
        .describe(
          'Glob pattern to filter files (e.g. "*.js", "*.{ts,tsx}") - maps to rg --glob',
        ),
      output_mode: z
        .enum(["content", "files_with_matches", "count"])
        .optional()
        .describe(
          'Output mode: "content" shows matching lines (supports -A/-B/-C context, -n line numbers, head_limit), "files_with_matches" shows file paths (supports head_limit), "count" shows match counts (supports head_limit). Defaults to "files_with_matches".',
        ),
      "-B": z
        .number()
        .optional()
        .describe(
          'Number of lines to show before each match (rg -B). Requires output_mode: "content", ignored otherwise.',
        ),
      "-A": z
        .number()
        .optional()
        .describe(
          'Number of lines to show after each match (rg -A). Requires output_mode: "content", ignored otherwise.',
        ),
      "-C": z
        .number()
        .optional()
        .describe(
          'Number of lines to show before and after each match (rg -C). Requires output_mode: "content", ignored otherwise.',
        ),
      "-n": z
        .boolean()
        .optional()
        .describe(
          'Show line numbers in output (rg -n). Requires output_mode: "content", ignored otherwise.',
        ),
      "-i": z
        .boolean()
        .optional()
        .describe("Case insensitive search (rg -i)"),
      type: z
        .string()
        .optional()
        .describe(
          "File type to search (rg --type). Common types: js, py, rust, go, java, etc. More efficient than include for standard file types.",
        ),
      head_limit: z
        .number()
        .optional()
        .describe(
          'Limit output to first N lines/entries, equivalent to "| head -N". Works across all output modes: content (limits output lines), files_with_matches (limits file paths), count (limits count entries). When unspecified, shows all results from ripgrep.',
        ),
      multiline: z
        .boolean()
        .optional()
        .describe(
          "Enable multiline mode where . matches newlines and patterns can span lines (rg -U --multiline-dotall). Default: false.",
        ),
    }),
  },
);
