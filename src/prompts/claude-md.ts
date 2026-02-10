import { readFileSync, existsSync } from "fs";
import { join } from "path";

const claudeMdPath = join(process.cwd(), "CLAUDE.md");
const claudeMd = existsSync(claudeMdPath)
  ? readFileSync(claudeMdPath, "utf-8")
  : "";

export const claudeMdContext = claudeMd
  ? "<system-reminder>\nAs you answer the user's questions, you can use the following context:\n# claudeMd\nCodebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written.\n\nContents of /Users/hungphu/.claude/CLAUDE.md (user's private global instructions for all projects):\n\n## Development Workflow\nIMPORTANT: \n- ./sample_codes dir is reference code, only read when explicitly mentioned - not related to codebase\n- Before you make any change, create and checkout a feature branch named \"feature_some_short_name\". Make and then commit your changes in this branch.\n- Before committing, you must: write automated tests for all code, run linting, compile successfully, and ensure ALL tests pass - no basic errors allowed.\n- Use standard naming conventions and maintain organized structure - place new files in appropriate directories (docs in `docs/`, tests in `tests/`, etc.), creating folders as needed.\n\n## Python Workflow\n- prefer uv over pip if possible\n- don't test LLM related codes automatically, it's very costly\n# important-instruction-reminders\nDo what has been asked; nothing more, nothing less.\nNEVER create files unless they're absolutely necessary for achieving your goal.\nALWAYS prefer editing an existing file to creating a new one.\nNEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.\n\n      \n      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.\n</system-reminder>\n"
  : "";
