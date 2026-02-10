import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { tools } from "../src/tools/index.js";

const llm = new ChatOpenAI({
  model: "gpt-5.3-codex",
  apiKey: process.env.PROXY_KEY!,
  configuration: {
    baseURL: "https://api.dta.business/v1",
  },
});

// Test each tool individually to find which one breaks it
for (const t of tools) {
  const bound = llm.bindTools([t], { strict: false });
  try {
    const res = await bound.invoke([
      new HumanMessage("List files in the current directory using any tool you have"),
    ]);
    const hasCalls = (res.tool_calls?.length ?? 0) > 0;
    console.log(`${hasCalls ? "OK" : "NO"} - ${t.name}`);
  } catch (err: any) {
    console.log(`ERR - ${t.name}: ${err.message.slice(0, 80)}`);
  }
}
