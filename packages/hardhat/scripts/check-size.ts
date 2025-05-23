import path from "path";
import fs from "fs";
import glob from "glob";

function getBytecodeSize(bytecode: string): number {
  return (bytecode.startsWith("0x") ? bytecode.length - 2 : bytecode.length) / 2;
}

function formatKB(bytes: number): string {
  return (bytes / 1024).toFixed(2);
}

async function main() {
  const artifactPaths = glob.sync(path.join(__dirname, "../artifacts/contracts/**/*.json"));

  if (artifactPaths.length === 0) {
    console.warn("⚠️  No artifact files found.");
    return;
  }

  for (const artifactPath of artifactPaths) {
    const relativePath = path
      .relative(path.join(__dirname, "../artifacts/contracts"), artifactPath)
      .replace(".json", ".sol");

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    let bytecode: string | undefined;

    if (typeof artifact.deployedBytecode === "string") {
      bytecode = artifact.deployedBytecode;
    } else if (artifact.deployedBytecode?.object) {
      bytecode = artifact.deployedBytecode.object;
    }

    if (!bytecode || bytecode === "0x") continue;

    const sizeInBytes = getBytecodeSize(bytecode);
    const sizeInKB = sizeInBytes / 1024;

    const status = sizeInKB > 100 ? "🚨 OVER 100 KB" : sizeInKB > 80 ? "⚠️ Near limit" : "✅ OK";

    console.log(`${relativePath.padEnd(50)} — ${sizeInBytes} bytes (${formatKB(sizeInBytes)} KB) ${status}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
