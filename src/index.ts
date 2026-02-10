import "dotenv/config";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { chatLoop } from "./chat.js";
import { tools } from "./tools/index.js";
import { systemPrompt } from "./prompts/system-prompt.js";
import { claudeMdContext } from "./prompts/claude-md.js";
import { createLlm } from "./providers.js";

const llm = createLlm();

const messages = [
  new SystemMessage("You are HungPhu Code, Anthropic's official CLI for Claude."),
  new SystemMessage(systemPrompt()),
  ...(claudeMdContext ? [new HumanMessage(claudeMdContext)] : []),
];

await chatLoop(llm, messages, tools);
