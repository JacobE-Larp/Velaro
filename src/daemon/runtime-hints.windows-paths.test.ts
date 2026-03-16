import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("./launchd.js");
});

describe("buildPlatformRuntimeLogHints", () => {
  it("strips windows drive prefixes from darwin display paths", async () => {
    vi.doMock("./launchd.js", () => ({
      resolveGatewayLogPaths: () => ({
        stdoutPath: "C:\\tmp\\vilaro-state\\logs\\gateway.log",
        stderrPath: "C:\\tmp\\vilaro-state\\logs\\gateway.err.log",
      }),
    }));

    const { buildPlatformRuntimeLogHints } = await import("./runtime-hints.js");

    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        systemdServiceName: "vilaro-gateway",
        windowsTaskName: "Vilaro Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/vilaro-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/vilaro-state/logs/gateway.err.log",
    ]);
  });
});
