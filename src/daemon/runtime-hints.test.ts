import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          VILARO_STATE_DIR: "/tmp/vilaro-state",
          VILARO_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "vilaro-gateway",
        windowsTaskName: "Vilaro Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/vilaro-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/vilaro-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "vilaro-gateway",
        windowsTaskName: "Vilaro Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u vilaro-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "vilaro-gateway",
        windowsTaskName: "Vilaro Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "Vilaro Gateway" /V /FO LIST']);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "vilaro gateway install",
        startCommand: "vilaro gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.vilaro.gateway.plist",
        systemdServiceName: "vilaro-gateway",
        windowsTaskName: "Vilaro Gateway",
      }),
    ).toEqual([
      "vilaro gateway install",
      "vilaro gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.vilaro.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "vilaro gateway install",
        startCommand: "vilaro gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.vilaro.gateway.plist",
        systemdServiceName: "vilaro-gateway",
        windowsTaskName: "Vilaro Gateway",
      }),
    ).toEqual([
      "vilaro gateway install",
      "vilaro gateway",
      "systemctl --user start vilaro-gateway.service",
    ]);
  });
});
