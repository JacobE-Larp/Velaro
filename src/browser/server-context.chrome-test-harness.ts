import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/vilaro" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchVilaroChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveVilaroUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopVilaroChrome: vi.fn(async () => {}),
}));
