import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { createLlm } from "../providers.js";
import chalk from "chalk";

const SUB_AGENT_SYSTEM = `You are a sub-agent executing a specific task. You have access to tools to help you complete the task. Work efficiently, use tools as needed, and return a concise result when done.`;

const MAX_TURNS = 10;
const PREFIX = chalk.hex("#A78BFA")("  ┃ ");

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

export function createTaskTool(allTools: StructuredToolInterface[]) {
  const subAgentTools = allTools.filter((t) => t.name !== "Task");

  return tool(
    async ({ description, prompt, subagent_type }) => {
      console.log(
        `${PREFIX}${chalk.hex("#A78BFA")("▶")} Sub-agent [${chalk.hex("#93C5FD")(subagent_type)}]: ${chalk.bold(description)}`,
      );

      const llm = createLlm();
      const boundLlm =
        subAgentTools.length > 0 && llm.bindTools
          ? llm.bindTools(subAgentTools, { strict: false } as any)
          : llm;

      const toolMap = new Map(subAgentTools.map((t) => [t.name, t]));

      const messages: BaseMessage[] = [
        new SystemMessage(SUB_AGENT_SYSTEM),
        new HumanMessage(prompt),
      ];

      let lastText = "";

      for (let turn = 0; turn < MAX_TURNS; turn++) {
        const response = await boundLlm.invoke(messages);

        if (!response.tool_calls || response.tool_calls.length === 0) {
          lastText = extractText(response.content);
          break;
        }

        messages.push(response as AIMessage);

        for (const tc of response.tool_calls) {
          const t = toolMap.get(tc.name);
          if (!t) {
            console.log(
              `${PREFIX}${chalk.hex("#F87171")("✗")} Tool "${tc.name}" not found`,
            );
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
              const val =
                typeof v === "string"
                  ? v.length > 50
                    ? v.slice(0, 50) + "…"
                    : v
                  : JSON.stringify(v);
              return `${k}: ${val}`;
            })
            .join(", ");
          console.log(
            `${PREFIX}${chalk.hex("#93C5FD")("●")} ${chalk.bold(tc.name)}(${chalk.dim(argsStr)})`,
          );

          const result = await t.invoke(tc.args);
          const resultStr =
            typeof result === "string" ? result : JSON.stringify(result);

          messages.push(
            new ToolMessage({
              tool_call_id: tc.id!,
              content: resultStr,
            }),
          );
        }

        lastText = extractText(response.content);
      }

      console.log(
        `${PREFIX}${chalk.hex("#A78BFA")("◀")} Sub-agent done`,
      );

      return lastText || "(sub-agent returned no output)";
    },
    {
      name: "Task",
      description:
        "Launch a new agent to handle complex, multi-step tasks autonomously. \n\nAvailable agent types and the tools they have access to:\n- general-purpose: General-purpose agent for researching complex questions, searching for code, and executing multi-step tasks. When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries use this agent to perform the search for you. (Tools: *)\n- statusline-setup: Use this agent to configure the user's HungPhu Code status line setting. (Tools: Read, Edit)\n- output-style-setup: Use this agent to create a HungPhu Code output style. (Tools: Read, Write, Edit, Glob, LS, Grep)\n- octalysis-gamification-expert: Use this agent when you need to design or evaluate gamification strategies using the Octalysis Framework, create human-focused engagement systems, analyze user motivation patterns, or transform products/experiences to drive intrinsic motivation. Examples: <example>Context: User wants to improve user engagement in their learning app. user: 'Our learning app has low retention rates. Users complete the first few lessons but then drop off. How can we make it more engaging?' assistant: 'I'll use the octalysis-gamification-expert agent to analyze this retention problem and design a human-focused gamification strategy using the Octalysis Framework.' <commentary>The user needs gamification expertise to solve an engagement problem, which is exactly what this agent specializes in.</commentary></example> <example>Context: User is designing a fitness app and wants to avoid superficial gamification. user: 'I want to add gamification to my fitness app but I don't want it to feel cheap or gimmicky like just adding badges and points.' assistant: 'Let me engage the octalysis-gamification-expert agent to help you design meaningful, human-focused gamification that goes beyond surface-level mechanics.' <commentary>The user specifically wants to avoid shallow gamification, which aligns perfectly with this agent's expertise in human-focused design.</commentary></example> (Tools: *)\n- ui-ux-designer: Use this agent when you need expert guidance on user interface design, user experience optimization, design systems, accessibility, usability testing, or visual design decisions. Examples: <example>Context: User is working on a financial dashboard and needs design guidance. user: 'I'm building a portfolio summary page for our wealth management app. What's the best way to display portfolio performance data?' assistant: 'Let me use the ui-ux-designer agent to provide expert design guidance for your portfolio dashboard.' <commentary>The user needs UI/UX expertise for designing a financial interface, so use the ui-ux-designer agent.</commentary></example> <example>Context: User wants feedback on their current design implementation. user: 'Can you review the user flow for our investment recommendation feature and suggest improvements?' assistant: 'I'll use the ui-ux-designer agent to analyze your user flow and provide UX recommendations.' <commentary>This requires UX expertise to evaluate user flows and suggest improvements.</commentary></example> (Tools: Task, Bash, Glob, Grep, LS, ExitPlanMode, Read, NotebookRead, WebFetch, TodoWrite, WebSearch, mcp__ide__getDiagnostics, mcp__ide__executeCode)\n- faang-engineer-architect: Use this agent when you need expert-level software engineering and architecture guidance from someone with FAANG-level experience. This includes system design, code architecture decisions, performance optimization, scalability solutions, technical leadership advice, and solving complex engineering problems at scale. Examples:\n- <example>\n  Context: User needs help designing a distributed system\n  user: \"I need to design a real-time notification system that can handle millions of users\"\n  assistant: \"I'll use the Task tool to launch the faang-engineer-architect agent to help design this scalable system\"\n  <commentary>\n  Since this requires expertise in large-scale system design typical of FAANG companies, use the faang-engineer-architect agent.\n  </commentary>\n</example>\n- <example>\n  Context: User wants architectural review of their codebase\n  user: \"Can you review my microservices architecture and suggest improvements?\"\n  assistant: \"Let me use the faang-engineer-architect agent to provide an expert architectural review\"\n  <commentary>\n  Architectural reviews benefit from FAANG-level engineering experience, so use this specialized agent.\n  </commentary>\n</example> (Tools: *)\n- product-manager-faang-startup: Use this agent when you need strategic product guidance, feature prioritization, go-to-market strategies, user research insights, growth hacking tactics, or product roadmap development. This agent excels at balancing user needs with business objectives, defining MVPs, creating product specs, analyzing metrics, and making data-driven product decisions. Perfect for product strategy discussions, feature scoping, user story creation, A/B testing strategies, and product-market fit analysis. (Tools: *)\n- cpo-strategic-advisor: Use this agent when you need strategic product leadership insights, product vision development, roadmap prioritization, stakeholder alignment strategies, or executive-level product decisions. This agent provides CPO-level perspective on product strategy, team scaling, market positioning, and balancing innovation with execution. Examples:\n\n<example>\nContext: User needs help with product strategy decisions\nuser: \"How should I prioritize features for our Q2 roadmap given limited engineering resources?\"\nassistant: \"I'll use the Task tool to launch the cpo-strategic-advisor agent to provide executive-level guidance on roadmap prioritization.\"\n<commentary>\nSince the user needs strategic product prioritization advice, use the cpo-strategic-advisor agent for CPO-level insights.\n</commentary>\n</example>\n\n<example>\nContext: User is facing product-market fit challenges\nuser: \"We're struggling to find product-market fit in our B2B SaaS. What metrics should we focus on?\"\nassistant: \"Let me engage the cpo-strategic-advisor agent to provide strategic guidance on achieving product-market fit.\"\n<commentary>\nThe user needs high-level product strategy advice, which is perfect for the cpo-strategic-advisor agent.\n</commentary>\n</example>\n\n<example>\nContext: User needs help with product team structure\nuser: \"We're scaling from 10 to 50 engineers. How should I structure my product organization?\"\nassistant: \"I'll use the cpo-strategic-advisor agent to provide guidance on scaling product organizations effectively.\"\n<commentary>\nOrganizational scaling questions require CPO-level experience, making this ideal for the cpo-strategic-advisor agent.\n</commentary>\n</example> (Tools: *)\n\nWhen using the Task tool, you must specify a subagent_type parameter to select which agent type to use.\n\n\n\nWhen NOT to use the Agent tool:\n- If you want to read a specific file path, use the Read or Glob tool instead of the Agent tool, to find the match more quickly\n- If you are searching for a specific class definition like \"class Foo\", use the Glob tool instead, to find the match more quickly\n- If you are searching for code within a specific file or set of 2-3 files, use the Read tool instead of the Agent tool, to find the match more quickly\n- Other tasks that are not related to the agent descriptions above\n\n\nUsage notes:\n1. Launch multiple agents concurrently whenever possible, to maximize performance; to do that, use a single message with multiple tool uses\n2. When the agent is done, it will return a single message back to you. The result returned by the agent is not visible to the user. To show the user the result, you should send a text message back to the user with a concise summary of the result.\n3. Each agent invocation is stateless. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.\n4. The agent's outputs should generally be trusted\n5. Clearly tell the agent whether you expect it to write code or just to do research (search, file reads, web fetches, etc.), since it is not aware of the user's intent\n6. If the agent description mentions that it should be used proactively, then you should try your best to use it without the user having to ask for it first. Use your judgement.\n\nExample usage:\n\n<example_agent_descriptions>\n\"code-reviewer\": use this agent after you are done writing a signficant piece of code\n\"greeting-responder\": use this agent when to respond to user greetings with a friendly joke\n</example_agent_description>\n\n<example>\nuser: \"Please write a function that checks if a number is prime\"\nassistant: Sure let me write a function that checks if a number is prime\nassistant: First let me use the Write tool to write a function that checks if a number is prime\nassistant: I'm going to use the Write tool to write the following code:\n<code>\nfunction isPrime(n) {\n  if (n <= 1) return false\n  for (let i = 2; i * i <= n; i++) {\n    if (n % i === 0) return false\n  }\n  return true\n}\n</code>\n<commentary>\nSince a signficant piece of code was written and the task was completed, now use the code-reviewer agent to review the code\n</commentary>\nassistant: Now let me use the code-reviewer agent to review the code\nassistant: Uses the Task tool to launch the with the code-reviewer agent \n</example>\n\n<example>\nuser: \"Hello\"\n<commentary>\nSince the user is greeting, use the greeting-responder agent to respond with a friendly joke\n</commentary>\nassistant: \"I'm going to use the Task tool to launch the with the greeting-responder agent\"\n</example>\n",
      schema: z.object({
        description: z
          .string()
          .describe("Short description of what the sub-agent should do (3-5 words)"),
        prompt: z
          .string()
          .describe("Detailed task instructions for the sub-agent"),
        subagent_type: z
          .string()
          .describe("The type of specialized agent to use for this task"),
      }),
    },
  );
}
