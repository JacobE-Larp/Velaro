import path from "node:path";
import { describe, expect, it } from "vitest";
import { withEnv } from "../test-utils/env.js";
import { formatPluginSourceForTable, resolvePluginSourceRoots } from "./source-display.js";

function createPluginSourceRoots() {
  const stockRoot = path.resolve(
    path.sep,
    "opt",
    "homebrew",
    "lib",
    "node_modules",
    "vilaro",
    "extensions",
  );
  const globalRoot = path.resolve(path.sep, "Users", "x", ".vilaro", "extensions");
  const workspaceRoot = path.resolve(path.sep, "Users", "x", "ws", ".vilaro", "extensions");
  return {
    stock: stockRoot,
    global: globalRoot,
    workspace: workspaceRoot,
  };
}

describe("formatPluginSourceForTable", () => {
  it("shortens bundled plugin sources under the stock root", () => {
    const roots = createPluginSourceRoots();
    const out = formatPluginSourceForTable(
      {
        origin: "bundled",
        source: path.join(roots.stock, "bluebubbles", "index.ts"),
      },
      roots,
    );
    expect(out.value).toBe("stock:bluebubbles/index.ts");
    expect(out.rootKey).toBe("stock");
  });

  it("shortens workspace plugin sources under the workspace root", () => {
    const roots = createPluginSourceRoots();
    const out = formatPluginSourceForTable(
      {
        origin: "workspace",
        source: path.join(roots.workspace, "matrix", "index.ts"),
      },
      roots,
    );
    expect(out.value).toBe("workspace:matrix/index.ts");
    expect(out.rootKey).toBe("workspace");
  });

  it("shortens global plugin sources under the global root", () => {
    const roots = createPluginSourceRoots();
    const out = formatPluginSourceForTable(
      {
        origin: "global",
        source: path.join(roots.global, "zalo", "index.js"),
      },
      roots,
    );
    expect(out.value).toBe("global:zalo/index.js");
    expect(out.rootKey).toBe("global");
  });

  it("resolves source roots from an explicit env override", () => {
    const ignoredHome = path.resolve(path.sep, "tmp", "ignored-home");
    const homeDir = path.resolve(path.sep, "tmp", "vilaro-home");
    const roots = withEnv(
      {
        VILARO_BUNDLED_PLUGINS_DIR: path.join(ignoredHome, "ignored-bundled"),
        VILARO_STATE_DIR: path.join(ignoredHome, "ignored-state"),
        HOME: ignoredHome,
      },
      () =>
        resolvePluginSourceRoots({
          env: {
            ...process.env,
            HOME: homeDir,
            VILARO_BUNDLED_PLUGINS_DIR: "~/bundled",
            VILARO_STATE_DIR: "~/state",
          },
          workspaceDir: "~/ws",
        }),
    );

    expect(roots).toEqual({
      stock: path.join(homeDir, "bundled"),
      global: path.join(homeDir, "state", "extensions"),
      workspace: path.join(homeDir, "ws", ".vilaro", "extensions"),
    });
  });
});
