import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "cmd" : "npm";
const npmArgs = isWindows ? ["/c", "npm", "run"] : ["run"];

const processes = [
  spawn(npmCommand, [...npmArgs, "dev:server"], { stdio: "inherit" }),
  spawn(npmCommand, [...npmArgs, "dev:client"], { stdio: "inherit" }),
];

const shutdown = () => {
  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown();
      process.exit(code);
    }
  });
}
