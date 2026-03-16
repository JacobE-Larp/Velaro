import { describe, expect, it } from "vitest";
import {
  ensureVilaroExecMarkerOnProcess,
  markVilaroExecEnv,
  VILARO_CLI_ENV_VALUE,
} from "./vilaro-exec-env.js";

describe("markVilaroExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", VILARO_CLI: "0" };
    const marked = markVilaroExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      VILARO_CLI: VILARO_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.VILARO_CLI).toBe("0");
  });
});

describe("ensureVilaroExecMarkerOnProcess", () => {
  it("mutates and returns the provided process env", () => {
    const env: NodeJS.ProcessEnv = { PATH: "/usr/bin" };

    expect(ensureVilaroExecMarkerOnProcess(env)).toBe(env);
    expect(env[VILARO_CLI_ENV_VAR]).toBe(VILARO_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[VILARO_CLI_ENV_VAR];
    delete process.env[VILARO_CLI_ENV_VAR];

    try {
      expect(ensureVilaroExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[VILARO_CLI_ENV_VAR]).toBe(VILARO_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[VILARO_CLI_ENV_VAR];
      } else {
        process.env[VILARO_CLI_ENV_VAR] = previous;
      }
    }
  });
});
