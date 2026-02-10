import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { backgroundProcesses } from "./bash.js";

export const killBashTool = tool(
  async ({ shell_id }) => {
    const proc = backgroundProcesses.get(shell_id);
    if (!proc) {
      return `Error: No background shell found with id: ${shell_id}`;
    }

    if (proc.done) {
      backgroundProcesses.delete(shell_id);
      return `Shell ${shell_id} already finished. Removed from list.`;
    }

    proc.child.kill("SIGTERM");
    backgroundProcesses.delete(shell_id);
    return `Successfully killed shell ${shell_id}.`;
  },
  {
    name: "KillBash",
    description:
      "\n- Kills a running background bash shell by its ID\n- Takes a shell_id parameter identifying the shell to kill\n- Returns a success or failure status \n- Use this tool when you need to terminate a long-running shell\n- Shell IDs can be found using the /bashes command\n",
    schema: z.object({
      shell_id: z
        .string()
        .describe("The ID of the background shell to kill"),
    }),
  },
);
