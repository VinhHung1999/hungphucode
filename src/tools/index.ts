import { bashTool } from "./bash.js";
import { editTool } from "./edit.js";
import { globTool } from "./glob.js";
import { grepTool } from "./grep.js";
import { killBashTool } from "./kill-bash.js";
import { lsTool } from "./ls.js";
import { readTool } from "./read.js";
import { todoWriteTool } from "./todo-write.js";
import { writeTool } from "./write.js";
import { createTaskTool } from "./task.js";

const baseTools = [bashTool, editTool, globTool, grepTool, killBashTool, lsTool, readTool, todoWriteTool, writeTool];
const taskTool = createTaskTool(baseTools);

export const tools = [...baseTools, taskTool];
