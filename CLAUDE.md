# CLAUDE.md

This file provides guidance to HungPhu Code (claude.ai/code) when working with code in this repository.

## Project Overview

A CLI chat agent powered by xAI/Grok with LangChain tool calling. It implements the agent loop pattern: LLM responds → check `tool_calls` → execute tools → send `ToolMessage` → repeat until no more tool calls.

## Commands

```bash
npm start              # Run the chat app (tsx src/index.ts)
tsx tests/tools.test.ts  # Run tool tests (no test framework, custom assert)
npx tsc --noEmit       # Type-check without emitting
```

## Environment

Requires `XAI_API_KEY` in `.env` file. Model: `grok-4-fast-non-reasoning`.

## Architecture

```
src/
  index.ts              # Entry: init ChatXAI, system messages, start chatLoop()
  chat.ts               # Agent loop: REPL + tool calling cycle
  utils.ts              # Readline helpers
  prompts/
    system-prompt.ts    # Hardcoded system prompt (large template literal)
  tools/
    index.ts            # Aggregates all tools into exported array
    bash.ts             # Shell execution (sync + background via spawn)
    glob.ts             # File pattern matching (npm glob)
    grep.ts             # Text search (rg with grep -r fallback)
    ls.ts               # Directory listing with ignore patterns
```

**Adding a new tool:** Create `src/tools/newtool.ts` using `tool()` from `@langchain/core/tools` with zod schema, then import and add to the array in `src/tools/index.ts`.

## TypeScript Constraints

- **`exactOptionalPropertyTypes: true`** — optional interface properties must include `| undefined` (e.g., `path?: string | undefined`)
- **`verbatimModuleSyntax: true`** — use `import type` for type-only imports
- **ES modules** — all imports use `.js` extension (e.g., `./chat.js`)
- **Tests excluded** from tsconfig (`"exclude": ["tests"]`) — they run via tsx directly, not tsc

## Project Memory

`.claude/memory/` contains structured context (bugs, decisions, architecture). Use `--project-recall` before complex tasks, `--project-store` after meaningful work.
