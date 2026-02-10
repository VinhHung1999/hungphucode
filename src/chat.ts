import {
  HumanMessage,
  AIMessage,
  ToolMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { createReadlineInterface, ask } from "./utils.js";
import chalk from "chalk";
import {
  getCurrentModel,
  getCurrentProvider,
  switchProvider,
  setModelIndex,
  getModelIndex,
  createLlm,
} from "./providers.js";
import {
  toolHeader,
  toolResult,
  toolError,
  responseInfo,
  aiMessage,
  userPrompt,
  welcomeBanner,
  goodbye,
  errorText,
  spinner,
  statusText,
  interactiveModelSelector,
  interactiveCommandSelector,
  type SlashCommand,
} from "./ui.js";

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");
  }
  return String(content);
}

export async function chatLoop(
  llm: BaseChatModel,
  messages: BaseMessage[],
  tools: StructuredToolInterface[] = [],
) {
  const rl = createReadlineInterface();
  let currentLlm = llm;
  const bind = (m: BaseChatModel) =>
    tools.length > 0 && m.bindTools
      ? m.bindTools(tools, { strict: false } as any)
      : m;
  let boundLlm = bind(currentLlm);
  const toolMap = new Map(tools.map((t) => [t.name, t]));

  const rebind = () => {
    currentLlm = createLlm();
    boundLlm = bind(currentLlm);
  };

  const debugMessages = (msgs: BaseMessage[]) => {
    return;
    console.log(chalk.dim("\n── DEBUG: messages ──"));
    for (const m of msgs) {
      const type = m._getType();
      const content = typeof m.content === "string"
        ? (m.content.length > 120 ? m.content.slice(0, 120) + "…" : m.content)
        : JSON.stringify(m.content).slice(0, 120);
      const extra = type === "tool"
        ? ` [tool_call_id=${(m as ToolMessage).tool_call_id}]`
        : (m as any).tool_calls?.length
          ? ` [tool_calls=${(m as any).tool_calls.map((tc: any) => tc.name).join(",")}]`
          : "";
      console.log(chalk.dim(`  [${type}]${extra} ${content}`));
    }
    console.log(chalk.dim("────────────────────\n"));
  };

  const slashCommands: SlashCommand[] = [
    { name: "model", description: "Switch AI model within current provider" },
    { name: "provider", description: "Toggle between xAI and DTA Proxy providers" },
  ];

  console.log(welcomeBanner(getCurrentModel().model, getCurrentProvider().displayName, process.cwd()));

  while (true) {
    const input = await ask(rl, userPrompt());
    let trimmed = input.trim();
    if (!trimmed || trimmed === "exit") {
      console.log(goodbye());
      rl.close();
      break;
    }

    if (trimmed === "/") {
      const selected = await interactiveCommandSelector(slashCommands, rl);
      if (!selected) {
        console.log(statusText("Cancelled."));
        continue;
      }
      trimmed = `/${selected}`;
    }

    if (trimmed === "/provider") {
      const next = switchProvider();
      rebind();
      console.log(
        statusText(`Switched to ${next.displayName} · model: ${getCurrentModel().model}`),
      );
      continue;
    }

    if (trimmed === "/model") {
      const provider = getCurrentProvider();
      const selected = await interactiveModelSelector(
        provider.models,
        getModelIndex(),
        rl,
      );
      if (selected >= 0) {
        const model = setModelIndex(selected);
        rebind();
        console.log(statusText(`Switched to ${model.label} (${model.model})`));
      } else {
        console.log(statusText("Cancelled."));
      }
      continue;
    }

    messages.push(new HumanMessage(trimmed));

    try {
      let startTime = Date.now();
      debugMessages(messages);
      let spin = spinner("Thinking");
      let response = await boundLlm.invoke(messages);
      spin.stop();

      const toolNames = (response.tool_calls ?? []).map((tc) => tc.name);
      console.log(responseInfo(Date.now() - startTime, toolNames));

      while (response.tool_calls && response.tool_calls.length > 0) {
        messages.push(response as AIMessage);

        for (const tc of response.tool_calls) {
          const tool = toolMap.get(tc.name);
          if (!tool) {
            console.log(toolError(`Tool "${tc.name}" not found`));
            messages.push(
              new ToolMessage({
                tool_call_id: tc.id!,
                content: `Tool "${tc.name}" not found`,
              }),
            );
            continue;
          }

          const argsStr = Object.entries(tc.args as Record<string, unknown>)
            .map(([k, v]) => {
              const val = typeof v === "string"
                ? (v.length > 60 ? v.slice(0, 60) + "…" : v)
                : JSON.stringify(v);
              return `${k}: ${val}`;
            })
            .join(", ");
          console.log(toolHeader(tc.name, argsStr));

          const result = await tool.invoke(tc.args);
          const resultStr = typeof result === "string" ? result : JSON.stringify(result);

          if (resultStr.startsWith("Error:")) {
            console.log(toolError(resultStr));
          } else {
            console.log(toolResult(resultStr));
          }

          messages.push(
            new ToolMessage({
              tool_call_id: tc.id!,
              content: resultStr,
            }),
          );
        }

        startTime = Date.now();
        debugMessages(messages);
        spin = spinner("Thinking");
        response = await boundLlm.invoke(messages);
        spin.stop();

        const nextToolNames = (response.tool_calls ?? []).map((tc) => tc.name);
        console.log(responseInfo(Date.now() - startTime, nextToolNames));
      }

      const text = extractText(response.content);
      messages.push(new AIMessage(text));
      console.log(aiMessage(text));
    } catch (err) {
      console.error(errorText((err as Error).message));
    }
  }
}
