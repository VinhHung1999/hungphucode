import * as readline from "readline";

export function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function ask(
  rl: readline.Interface,
  query: string
): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}
