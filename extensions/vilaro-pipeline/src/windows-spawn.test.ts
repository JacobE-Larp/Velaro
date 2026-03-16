import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createWindowsCmdShimFixture,
  restorePlatformPathEnv,
  setProcessPlatform,
  snapshotPlatformPathEnv,
} from "./test-helpers.js";
import { resolveWindowsVilaroSpawn } from "./windows-spawn.js";

describe("resolveWindowsVilaroSpawn", () => {
  let tempDir = "";
  const originalProcessState = snapshotPlatformPathEnv();

  async function expectUnwrappedShim(params: {
    scriptPath: string;
    shimPath: string;
    shimLine: string;
  }) {
    await createWindowsCmdShimFixture(params);

    const target = resolveWindowsVilaroSpawn(params.shimPath, ["run", "noop"], process.env);
    expect(target.command).toBe(process.execPath);
    expect(target.argv).toEqual([params.scriptPath, "run", "noop"]);
    expect(target.windowsHide).toBe(true);
  }

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "vilaro-vilaro-win-spawn-"));
    setProcessPlatform("win32");
  });

  afterEach(async () => {
    restorePlatformPathEnv(originalProcessState);
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
      tempDir = "";
    }
  });

  it("unwraps cmd shim with %dp0% token", async () => {
    const scriptPath = path.join(tempDir, "shim-dist", "vilaro-cli.cjs");
    const shimPath = path.join(tempDir, "shim", "vilaro.cmd");
    await expectUnwrappedShim({
      shimPath,
      scriptPath,
      shimLine: `"%dp0%\\..\\shim-dist\\vilaro-cli.cjs" %*`,
    });
  });

  it("unwraps cmd shim with %~dp0% token", async () => {
    const scriptPath = path.join(tempDir, "shim-dist", "vilaro-cli.cjs");
    const shimPath = path.join(tempDir, "shim", "vilaro.cmd");
    await expectUnwrappedShim({
      shimPath,
      scriptPath,
      shimLine: `"%~dp0%\\..\\shim-dist\\vilaro-cli.cjs" %*`,
    });
  });

  it("ignores node.exe shim entries and picks vilaro script", async () => {
    const shimDir = path.join(tempDir, "shim-with-node");
    const scriptPath = path.join(tempDir, "shim-dist-node", "vilaro-cli.cjs");
    const shimPath = path.join(shimDir, "vilaro.cmd");
    await fs.mkdir(path.dirname(scriptPath), { recursive: true });
    await fs.mkdir(shimDir, { recursive: true });
    await fs.writeFile(path.join(shimDir, "node.exe"), "", "utf8");
    await fs.writeFile(scriptPath, "module.exports = {};\n", "utf8");
    await fs.writeFile(
      shimPath,
      `@echo off\r\n"%~dp0%\\node.exe" "%~dp0%\\..\\shim-dist-node\\vilaro-cli.cjs" %*\r\n`,
      "utf8",
    );

    const target = resolveWindowsVilaroSpawn(shimPath, ["run", "noop"], process.env);
    expect(target.command).toBe(process.execPath);
    expect(target.argv).toEqual([scriptPath, "run", "noop"]);
    expect(target.windowsHide).toBe(true);
  });

  it("resolves vilaro.cmd from PATH and unwraps npm layout shim", async () => {
    const binDir = path.join(tempDir, "node_modules", ".bin");
    const packageDir = path.join(tempDir, "node_modules", "vilaro");
    const scriptPath = path.join(packageDir, "dist", "cli.js");
    const shimPath = path.join(binDir, "vilaro.cmd");
    await fs.mkdir(path.dirname(scriptPath), { recursive: true });
    await fs.mkdir(binDir, { recursive: true });
    await fs.writeFile(shimPath, "@echo off\r\n", "utf8");
    await fs.writeFile(
      path.join(packageDir, "package.json"),
      JSON.stringify({ name: "vilaro", version: "0.0.0", bin: { vilaro: "dist/cli.js" } }),
      "utf8",
    );
    await fs.writeFile(scriptPath, "module.exports = {};\n", "utf8");

    const env = {
      ...process.env,
      PATH: `${binDir};${process.env.PATH ?? ""}`,
      PATHEXT: ".CMD;.EXE",
    };
    const target = resolveWindowsVilaroSpawn("vilaro", ["run", "noop"], env);
    expect(target.command).toBe(process.execPath);
    expect(target.argv).toEqual([scriptPath, "run", "noop"]);
    expect(target.windowsHide).toBe(true);
  });

  it("fails fast when wrapper cannot be resolved without shell execution", async () => {
    const badShimPath = path.join(tempDir, "bad-shim", "vilaro.cmd");
    await fs.mkdir(path.dirname(badShimPath), { recursive: true });
    await fs.writeFile(badShimPath, "@echo off\r\nREM no entrypoint\r\n", "utf8");

    expect(() => resolveWindowsVilaroSpawn(badShimPath, ["run", "noop"], process.env)).toThrow(
      /without shell execution/,
    );
  });
});
