# Decisions

Key architecture and technology decisions made during development. Read this before making significant technical choices.

## Technology Choices

### LLM Provider: xAI (Grok)
- Model: `grok-4-fast-non-reasoning`
- Using `@langchain/xai` ChatXAI class
- API key from `.env` file (`XAI_API_KEY`)

### LangChain for tool calling
- Using `@langchain/core/tools` `tool()` function to define tools
- `zod` for input schema validation
- `llm.bindTools(tools)` + agent loop pattern for tool execution

### System prompt source: HungPhu Code API capture
- Extracted system prompt from `hello.json` (captured HungPhu Code API request)
- Hardcoded as template literal in `src/prompts/system-prompt.ts` (not runtime file reading)
- Split into 2 SystemMessages: identity line + detailed instructions

## Architecture Decisions

### Tool structure: one file per tool in `src/tools/`
- Each tool in its own file (bash.ts, glob.ts, grep.ts, ls.ts)
- `src/tools/index.ts` aggregates and exports all tools as array
- Adding a new tool = create file + import in index.ts

### Grep: rg with grep fallback
- `hasRg()` checks for ripgrep at module load time
- `buildRgCmd()` for rg, `buildGrepCmd()` for grep fallback
- Ensures portability across machines

### Prompts folder
- System prompts live in `src/prompts/` directory
- Keeps prompts separate from business logic
