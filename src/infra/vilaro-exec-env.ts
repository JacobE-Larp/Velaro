export const VILARO_CLI_ENV_VAR = "VILARO_CLI";
export const VILARO_CLI_ENV_VALUE = "1";

export function markVilaroExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [VILARO_CLI_ENV_VAR]: VILARO_CLI_ENV_VALUE,
  };
}

export function ensureVilaroExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[VILARO_CLI_ENV_VAR] = VILARO_CLI_ENV_VALUE;
  return env;
}
