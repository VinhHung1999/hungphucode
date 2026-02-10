# Bugs & Lessons Learned

## Resolved Bugs

### exactOptionalPropertyTypes TS error
- **Cause:** `tsconfig.json` has `exactOptionalPropertyTypes: true`, so optional properties need explicit `| undefined`
- **Fix:** Added `| undefined` to all optional properties in interfaces (e.g., `GrepInput`)

### TypeScript rootDir error with test files
- **Cause:** `tests/tools.test.ts` not under `rootDir` (`src/`), causing TS compilation error
- **Fix:** Added `"exclude": ["tests"]` to `tsconfig.json`

### GrepInput not exported (TS4023)
- **Cause:** `tools` array in `index.ts` exposed `GrepInput` type, but it wasn't exported
- **Fix:** Added `export` to `interface GrepInput`

### ripgrep (rg) not available
- **Cause:** Grep tool assumed `rg` was installed, but it wasn't on this machine
- **Fix:** Added `hasRg()` detection at module load + `buildGrepCmd()` fallback using `grep -r -E`

## Lessons Learned

### Keep original param names from reference APIs
- When implementing tools from a reference (hello.json), user strongly prefers keeping exact original parameter names
- Don't rename params for "cleanliness" (e.g., keep `-B`, `-A`, `-C` instead of `before_context`)
- Zod supports quoted keys: `z.object({ "-B": z.number().optional() })`

### Keep full content, don't summarize
- When extracting/exporting data, preserve full information by default
- Only summarize when explicitly asked

### @langchain/openai v1.2.5+ breaking changes with custom baseURL
- Uses `ChatOpenAIResponses` internally: `openAIApiKey`/`modelName` silently fail → use `apiKey`/`model`
- `response.content` returns `[{type:"text", text:"..."}]` array instead of string → need `extractText()` helper
- Trailing slash in baseURL (`/v1/` vs `/v1`) can also cause issues

### OpenAI-compatible proxies silently ignore large tool schemas
- DTA Proxy (and likely other proxies) strip `tools` field when tool descriptions/schemas are too large
- Symptom: model responds with text instead of tool_calls, no error — raw fetch with simple schema works fine
- Debug: test each tool individually to isolate which schema is too large (e.g., Bash's multi-hundred-line description)
- Fix: shorten tool descriptions for proxy compatibility
