import { describe, expect, it } from "vitest";
import type { VilaroConfig } from "../config/config.js";
import { withEnvAsync } from "../test-utils/env.js";
import { resolveNodeHostGatewayCredentials } from "./runner.js";

function createRemoteGatewayTokenRefConfig(tokenId: string): VilaroConfig {
  return {
    secrets: {
      providers: {
        default: { source: "env" },
      },
    },
    gateway: {
      mode: "remote",
      remote: {
        token: { source: "env", provider: "default", id: tokenId },
      },
    },
  } as VilaroConfig;
}

async function expectNoGatewayCredentials(
  config: VilaroConfig,
  env: Record<string, string | undefined>,
) {
  await withEnvAsync(env, async () => {
    const credentials = await resolveNodeHostGatewayCredentials({ config });
    expect(credentials.token).toBeUndefined();
    expect(credentials.password).toBeUndefined();
  });
}

describe("resolveNodeHostGatewayCredentials", () => {
  it("does not inherit gateway.remote token in local mode", async () => {
    const config = {
      gateway: {
        mode: "local",
        remote: { token: "remote-only-token" },
      },
    } as VilaroConfig;

    await expectNoGatewayCredentials(config, {
      VILARO_GATEWAY_TOKEN: undefined,
    });
  });

  it("ignores unresolved gateway.remote token refs in local mode", async () => {
    const config = {
      secrets: {
        providers: {
          default: { source: "env" },
        },
      },
      gateway: {
        mode: "local",
        remote: {
          token: { source: "env", provider: "default", id: "MISSING_REMOTE_GATEWAY_TOKEN" },
        },
      },
    } as VilaroConfig;

    await expectNoGatewayCredentials(config, {
      VILARO_GATEWAY_TOKEN: undefined,
      MISSING_REMOTE_GATEWAY_TOKEN: undefined,
    });
  });

  it("resolves remote token SecretRef values", async () => {
    const config = createRemoteGatewayTokenRefConfig("REMOTE_GATEWAY_TOKEN");

    await withEnvAsync(
      {
        VILARO_GATEWAY_TOKEN: undefined,
        REMOTE_GATEWAY_TOKEN: "token-from-ref",
      },
      async () => {
        const credentials = await resolveNodeHostGatewayCredentials({ config });
        expect(credentials.token).toBe("token-from-ref");
      },
    );
  });

  it("prefers VILARO_GATEWAY_TOKEN over configured refs", async () => {
    const config = createRemoteGatewayTokenRefConfig("REMOTE_GATEWAY_TOKEN");

    await withEnvAsync(
      {
        VILARO_GATEWAY_TOKEN: "token-from-env",
        REMOTE_GATEWAY_TOKEN: "token-from-ref",
      },
      async () => {
        const credentials = await resolveNodeHostGatewayCredentials({ config });
        expect(credentials.token).toBe("token-from-env");
      },
    );
  });

  it("throws when a configured remote token ref cannot resolve", async () => {
    const config = createRemoteGatewayTokenRefConfig("MISSING_REMOTE_GATEWAY_TOKEN");

    await withEnvAsync(
      {
        VILARO_GATEWAY_TOKEN: undefined,
        MISSING_REMOTE_GATEWAY_TOKEN: undefined,
      },
      async () => {
        await expect(resolveNodeHostGatewayCredentials({ config })).rejects.toThrow(
          "gateway.remote.token",
        );
      },
    );
  });

  it("does not resolve remote password refs when token auth is already available", async () => {
    const config = {
      secrets: {
        providers: {
          default: { source: "env" },
        },
      },
      gateway: {
        mode: "remote",
        remote: {
          token: { source: "env", provider: "default", id: "REMOTE_GATEWAY_TOKEN" },
          password: { source: "env", provider: "default", id: "MISSING_REMOTE_GATEWAY_PASSWORD" },
        },
      },
    } as VilaroConfig;

    await withEnvAsync(
      {
        VILARO_GATEWAY_TOKEN: undefined,
        REMOTE_GATEWAY_TOKEN: "token-from-ref",
        MISSING_REMOTE_GATEWAY_PASSWORD: undefined,
      },
      async () => {
        const credentials = await resolveNodeHostGatewayCredentials({ config });
        expect(credentials.token).toBe("token-from-ref");
        expect(credentials.password).toBeUndefined();
      },
    );
  });
});
