import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readFileSync, statSync } from "fs";

export const readTool = tool(
  async ({ file_path, offset, limit }) => {
    try {
      const stat = statSync(file_path);
      if (stat.isDirectory()) {
        return `Error: ${file_path} is a directory, not a file. Use the LS tool to list directory contents.`;
      }

      const content = readFileSync(file_path, "utf-8");
      const lines = content.split("\n");

      const start = offset ?? 0;
      const end = limit ? start + limit : lines.length;
      const selected = lines.slice(start, end);

      const numbered = selected
        .map((line, i) => {
          const lineNum = (start + i + 1).toString().padStart(6, " ");
          const truncated = line.length > 2000 ? line.slice(0, 2000) + "…" : line;
          return `${lineNum}\t${truncated}`;
        })
        .join("\n");

      return numbered || "(empty file)";
    } catch (err: unknown) {
      return `Error: ${(err as Error).message}`;
    }
  },
  {
    name: "Read",
    description:
      "Reads a file from the local filesystem.\n\nUsage:\n- The file_path parameter must be an absolute path, not a relative path.\n- By default, it reads the entire file. You can optionally specify a line offset and limit for long files.\n- Results are returned with line numbers (1-indexed) for easy reference.\n- Lines longer than 2000 characters will be truncated.\n- This tool can only read files, not directories. To list a directory, use the LS tool.\n- You can call multiple tools in a single response. It is always better to speculatively read multiple potentially useful files in parallel.",
    schema: z.object({
      file_path: z
        .string()
        .describe("The absolute path to the file to read"),
      offset: z
        .number()
        .optional()
        .describe(
          "The line number to start reading from (0-indexed). Only provide if the file is too large to read at once.",
        ),
      limit: z
        .number()
        .optional()
        .describe(
          "The number of lines to read. Only provide if the file is too large to read at once.",
        ),
    }),
  },
);
