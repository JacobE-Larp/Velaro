import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function readMarkdownDir(dirPath: string): string {
  if (!existsSync(dirPath)) return "";
  return readdirSync(dirPath)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => {
      try {
        return readFileSync(join(dirPath, f), "utf8").trim();
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export default {
  id: "knowledge-base",
  register(api: any) {
    const cfg = api.pluginConfig ?? {};
    if (cfg.enabled === false) return;

    const baseDir = join(api.rootDir, "knowledge", "base");

    api.on("before_agent_start", () => {
      const baseKnowledge = readMarkdownDir(baseDir);

      // Phase 2: client layer (loads if clientId is configured)
      const clientId = cfg.clientId as string | undefined;
      if (clientId) {
        const clientDir = join(api.rootDir, "knowledge", "clients", clientId);
        const clientKnowledge = readMarkdownDir(clientDir);
        if (clientKnowledge) {
          const combined = [baseKnowledge, clientKnowledge].filter(Boolean).join("\n\n---\n\n");
          if (!combined) return;
          return { appendSystemContext: combined };
        }
      }

      if (!baseKnowledge) return;
      return { appendSystemContext: baseKnowledge };
    });
  },
};
