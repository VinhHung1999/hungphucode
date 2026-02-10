import { bashTool } from "../src/tools/bash.js";
import { backgroundProcesses } from "../src/tools/bash.js";
import { editTool } from "../src/tools/edit.js";
import { globTool } from "../src/tools/glob.js";
import { grepTool } from "../src/tools/grep.js";
import { killBashTool } from "../src/tools/kill-bash.js";
import { lsTool } from "../src/tools/ls.js";
import { todoWriteTool } from "../src/tools/todo-write.js";
import { writeTool } from "../src/tools/write.js";
import { tools } from "../src/tools/index.js";

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  console.log("Bash tool:");
  const echo = await bashTool.invoke({ command: "echo hello" });
  assert(echo.trim() === "hello", "echo hello");

  const multi = await bashTool.invoke({ command: "echo a && echo b" });
  assert(multi.trim() === "a\nb", "chained commands");

  const badCmd = await bashTool.invoke({ command: "nonexistent_cmd_xyz" });
  assert(badCmd.startsWith("Error:"), "handles bad command");

  console.log("\nGlob tool:");
  const tsFiles = await globTool.invoke({ pattern: "src/**/*.ts" });
  assert(tsFiles.includes("src/index.ts"), "finds src/index.ts");
  assert(tsFiles.includes("src/chat.ts"), "finds src/chat.ts");

  const noMatch = await globTool.invoke({ pattern: "**/*.nonexistent" });
  assert(noMatch === "No files matched the pattern.", "no match message");

  console.log("\nGrep tool:");
  const grepResult = await grepTool.invoke({
    pattern: "chatLoop",
    path: "src",
    output_mode: "files_with_matches",
  });
  assert(grepResult.includes("src/chat.ts"), "finds chatLoop in chat.ts");

  const grepNoMatch = await grepTool.invoke({
    pattern: "zzz_nonexistent_pattern_zzz",
    path: "src",
  });
  assert(grepNoMatch === "No matches found.", "no match returns message");

  console.log("\nLS tool:");
  const lsResult = await lsTool.invoke({ path: process.cwd() + "/src" });
  assert(lsResult.includes("index.ts"), "lists index.ts");
  assert(lsResult.includes("tools/"), "lists tools/ directory");

  const lsIgnore = await lsTool.invoke({
    path: process.cwd() + "/src",
    ignore: ["*.ts"],
  });
  assert(!lsIgnore.includes("index.ts"), "ignores *.ts files");
  assert(lsIgnore.includes("tools/"), "still shows directories");

  console.log("\nKillBash tool:");
  const bgResult = await bashTool.invoke({
    command: "sleep 60",
    run_in_background: true,
  });
  const bgId = bgResult.match(/id: (\S+)/)?.[1] ?? "";
  assert(bgId.startsWith("bg_"), "background process created");
  assert(backgroundProcesses.has(bgId), "process in map");

  const killResult = await killBashTool.invoke({ shell_id: bgId });
  assert(killResult.includes("Successfully killed"), "kills running process");
  assert(!backgroundProcesses.has(bgId), "process removed from map");

  const killMissing = await killBashTool.invoke({ shell_id: "bg_nonexistent" });
  assert(killMissing.includes("Error:"), "error on missing shell_id");

  console.log("\nWrite tool:");
  const tmpFile = "/tmp/hungphucode_test_write.txt";
  const writeResult = await writeTool.invoke({ file_path: tmpFile, content: "hello world" });
  assert(writeResult.includes("Successfully wrote"), "writes file");
  assert(writeResult.includes("11 characters"), "reports char count");

  console.log("\nEdit tool:");
  const editResult = await editTool.invoke({
    file_path: tmpFile,
    old_string: "hello",
    new_string: "goodbye",
  });
  assert(editResult.includes("Successfully edited"), "edits file");

  const editNotFound = await editTool.invoke({
    file_path: tmpFile,
    old_string: "nonexistent_string",
    new_string: "replacement",
  });
  assert(editNotFound.includes("not found"), "error when old_string missing");

  const editSame = await editTool.invoke({
    file_path: tmpFile,
    old_string: "goodbye",
    new_string: "goodbye",
  });
  assert(editSame.includes("same"), "error when old_string equals new_string");

  // Write duplicate content to test replace_all
  await writeTool.invoke({ file_path: tmpFile, content: "aaa bbb aaa" });
  const editDup = await editTool.invoke({
    file_path: tmpFile,
    old_string: "aaa",
    new_string: "ccc",
  });
  assert(editDup.includes("appears 2 times"), "error on non-unique without replace_all");

  const editAll = await editTool.invoke({
    file_path: tmpFile,
    old_string: "aaa",
    new_string: "ccc",
    replace_all: true,
  });
  assert(editAll.includes("2 replacements"), "replace_all works");

  console.log("\nTodoWrite tool:");
  const todoResult = await todoWriteTool.invoke({
    todos: [
      { content: "First task", status: "completed", activeForm: "Doing first task" },
      { content: "Second task", status: "in_progress", activeForm: "Doing second task" },
      { content: "Third task", status: "pending", activeForm: "Doing third task" },
    ],
  });
  assert(typeof todoResult === "string", "returns string");

  console.log("\nTools index:");
  assert(tools.length === 9, "exports 9 tools");
  assert(tools.some((t) => t.name === "Bash"), "has Bash");
  assert(tools.some((t) => t.name === "Edit"), "has Edit");
  assert(tools.some((t) => t.name === "Glob"), "has Glob");
  assert(tools.some((t) => t.name === "Grep"), "has Grep");
  assert(tools.some((t) => t.name === "KillBash"), "has KillBash");
  assert(tools.some((t) => t.name === "LS"), "has LS");
  assert(tools.some((t) => t.name === "TodoWrite"), "has TodoWrite");
  assert(tools.some((t) => t.name === "Write"), "has Write");
  assert(tools.some((t) => t.name === "Task"), "has Task");

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
