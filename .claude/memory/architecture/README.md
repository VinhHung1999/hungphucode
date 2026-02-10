# Architecture

System structure, module boundaries, and key patterns. Read this before major refactoring or adding new modules.

## System Overview

TypeScript CLI chat application that mimics HungPhu Code. Uses LangChain + xAI/Grok with tool calling (agent loop pattern).

## Module Boundaries

### Module: index.ts (Entry point)
- Purpose: Initializes LLM, system messages, and starts chat loop
- Dependencies: chat.ts, tools/index.ts, prompts/system-prompt.ts

### Module: chat.ts (Chat loop)
- Purpose: REPL loop with agent loop for tool calling
- Dependencies: utils.ts, @langchain/core/messages
- Exports: `chatLoop(llm, messages, tools)`

### Module: utils.ts (Utilities)
- Purpose: Readline interface helpers
- Exports: `createReadlineInterface()`, `askQuestion()`

### Module: prompts/ (System prompts)
- Purpose: Holds hardcoded system prompts
- Files: `system-prompt.ts` (main system prompt from HungPhu Code)

### Module: tools/ (Tool implementations)
- Purpose: CLI tools for the agent to use
- Files: `bash.ts`, `glob.ts`, `grep.ts`, `ls.ts`, `index.ts`
- Pattern: Each tool uses `tool()` from `@langchain/core/tools` with zod schema

## Key Patterns

### Agent Loop
- LLM responds -> check `tool_calls` -> execute tools -> send `ToolMessage` -> repeat
- Continues until LLM responds without tool_calls

### Tool Definition
- Use `tool()` factory from `@langchain/core/tools`
- Input schema defined with `zod`
- Tools return string results (success or error messages)

## Cross-Cutting Concerns

### Error Handling
- Tools catch errors and return `Error: ...` strings (don't throw)
- Bash tool has timeout support (default 120s)
- Grep tool handles exit code 1 (no matches) gracefully
