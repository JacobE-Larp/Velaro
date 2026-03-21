import {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "vilaro/plugin-sdk/pipeline";

type SpawnTarget = {
  command: string;
  argv: string[];
  windowsHide?: boolean;
};

export function resolveWindowsVilaroSpawn(
  execPath: string,
  argv: string[],
  env: NodeJS.ProcessEnv,
): SpawnTarget {
  const candidate = resolveWindowsSpawnProgramCandidate({
    command: execPath,
    env,
    packageName: "velaro",
  });
  const program = applyWindowsSpawnProgramPolicy({
    candidate,
    allowShellFallback: false,
  });
  const resolved = materializeWindowsSpawnProgram(program, argv);
  if (resolved.shell) {
    throw new Error("velaro wrapper resolved to shell fallback unexpectedly");
  }
  return {
    command: resolved.command,
    argv: resolved.argv,
    windowsHide: resolved.windowsHide,
  };
}
