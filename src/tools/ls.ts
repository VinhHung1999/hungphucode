import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readdirSync } from "fs";
import { join } from "path";
import { statSync } from "fs";

export const lsTool = tool(
  async ({ path, ignore }) => {
    try {
      const entries = readdirSync(path);
      let results = entries;

      if (ignore && ignore.length > 0) {
        const ignorePatterns = ignore.map(
          (pattern) =>
            new RegExp(
              "^" +
                pattern
                  .replace(/\./g, "\\.")
                  .replace(/\*/g, ".*")
                  .replace(/\?/g, ".") +
                "$",
            ),
        );
        results = entries.filter(
          (entry) => !ignorePatterns.some((re) => re.test(entry)),
        );
      }

      const formatted = results.map((entry) => {
        try {
          const stat = statSync(join(path, entry));
          return stat.isDirectory() ? `${entry}/` : entry;
        } catch {
          return entry;
        }
      });

      return formatted.join("\n") || "(empty directory)";
    } catch (err: unknown) {
      return `Error: ${(err as Error).message}`;
    }
  },
  {
    name: "LS",
    description:
      "Lists files and directories in a given path. The path parameter must be an absolute path, not a relative path. You can optionally provide an array of glob patterns to ignore with the ignore parameter. You should generally prefer the Glob and Grep tools, if you know which directories to search.",
    schema: z.object({
      path: z
        .string()
        .describe(
          "The absolute path to the directory to list (must be absolute, not relative)",
        ),
      ignore: z
        .array(z.string())
        .optional()
        .describe("List of glob patterns to ignore"),
    }),
  },
);
