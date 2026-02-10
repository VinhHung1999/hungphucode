import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readFileSync, writeFileSync } from "fs";

export const editTool = tool(
  async ({ file_path, old_string, new_string, replace_all }) => {
    try {
      const content = readFileSync(file_path, "utf-8");

      if (!content.includes(old_string)) {
        return `Error: old_string not found in ${file_path}`;
      }

      if (old_string === new_string) {
        return "Error: old_string and new_string are the same";
      }

      if (!replace_all) {
        const count = content.split(old_string).length - 1;
        if (count > 1) {
          return `Error: old_string appears ${count} times in ${file_path}. Use replace_all or provide more context to make it unique.`;
        }
      }

      const updated = replace_all
        ? content.split(old_string).join(new_string)
        : content.replace(old_string, new_string);

      writeFileSync(file_path, updated, "utf-8");

      const changes = replace_all
        ? content.split(old_string).length - 1
        : 1;
      return `Successfully edited ${file_path} (${changes} replacement${changes > 1 ? "s" : ""})`;
    } catch (err: unknown) {
      return `Error: ${(err as Error).message}`;
    }
  },
  {
    name: "Edit",
    description:
      "Performs exact string replacements in files. \n\nUsage:\n- You must use your `Read` tool at least once in the conversation before editing. This tool will error if you attempt an edit without reading the file. \n- When editing text from Read tool output, ensure you preserve the exact indentation (tabs/spaces) as it appears AFTER the line number prefix. The line number prefix format is: spaces + line number + tab. Everything after that tab is the actual file content to match. Never include any part of the line number prefix in the old_string or new_string.\n- ALWAYS prefer editing existing files in the codebase. NEVER write new files unless explicitly required.\n- Only use emojis if the user explicitly requests it. Avoid adding emojis to files unless asked.\n- The edit will FAIL if `old_string` is not unique in the file. Either provide a larger string with more surrounding context to make it unique or use `replace_all` to change every instance of `old_string`. \n- Use `replace_all` for replacing and renaming strings across the file. This parameter is useful if you want to rename a variable for instance.",
    schema: z.object({
      file_path: z
        .string()
        .describe("The absolute path to the file to modify"),
      old_string: z.string().describe("The text to replace"),
      new_string: z
        .string()
        .describe(
          "The text to replace it with (must be different from old_string)",
        ),
      replace_all: z
        .boolean()
        .default(false)
        .describe("Replace all occurences of old_string (default false)"),
    }),
  },
);
