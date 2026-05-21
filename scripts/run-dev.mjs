import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const REQUIRED_ABI = "127"; // Node 22 LTS
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

function nodeCandidates() {
  const fromEnv = process.env.NODE_22_EXE;
  return [
    fromEnv,
    "C:\\Program Files\\cursor\\resources\\app\\resources\\helpers\\node.exe",
    path.join(process.env.LOCALAPPDATA ?? "", "fnm_multishells", "current", "node.exe"),
    path.join(process.env.APPDATA ?? "", "nvm", "current", "node.exe"),
  ].filter((p) => typeof p === "string" && p.length > 0);
}

function probeAbi(nodeExe) {
  const result = spawnSync(nodeExe, ["-p", "process.versions.modules"], {
    encoding: "utf8",
  });
  return result.stdout?.trim();
}

function runDev(nodeExe) {
  const child = spawn(nodeExe, [nextBin, "dev"], {
    stdio: "inherit",
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
}

const abi = process.versions.modules;
if (abi === REQUIRED_ABI) {
  runDev(process.execPath);
} else {
  let launched = false;
  for (const candidate of nodeCandidates()) {
    if (!existsSync(candidate)) continue;
    if (probeAbi(candidate) !== REQUIRED_ABI) continue;
    console.warn(
      `Using Node 22 at ${candidate} (current Node ${process.version} ABI ${abi} is unsupported for better-sqlite3).`
    );
    runDev(candidate);
    launched = true;
    break;
  }

  if (!launched) {
    console.error(
      [
        `Unsupported Node ${process.version} (ABI ${abi}).`,
        `cozycrime requires Node 22 LTS (ABI ${REQUIRED_ABI}) for better-sqlite3.`,
        "",
        "Fix options:",
        "  1. Install Node 22 LTS from https://nodejs.org/ then run: npm rebuild better-sqlite3",
        "  2. Set NODE_22_EXE to your Node 22 binary and run: npm run dev",
        "  3. Put Node 22 earlier in PATH than Node 26+",
      ].join("\n")
    );
    process.exit(1);
  }
}
