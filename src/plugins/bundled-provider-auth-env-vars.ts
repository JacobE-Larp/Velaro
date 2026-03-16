import ANTHROPIC_MANIFEST from "../../extensions/anthropic/vilaro.plugin.json" with { type: "json" };
import BYTEPLUS_MANIFEST from "../../extensions/byteplus/vilaro.plugin.json" with { type: "json" };
import CLOUDFLARE_AI_GATEWAY_MANIFEST from "../../extensions/cloudflare-ai-gateway/vilaro.plugin.json" with { type: "json" };
import COPILOT_PROXY_MANIFEST from "../../extensions/copilot-proxy/vilaro.plugin.json" with { type: "json" };
import GITHUB_COPILOT_MANIFEST from "../../extensions/github-copilot/vilaro.plugin.json" with { type: "json" };
import GOOGLE_MANIFEST from "../../extensions/google/vilaro.plugin.json" with { type: "json" };
import HUGGINGFACE_MANIFEST from "../../extensions/huggingface/vilaro.plugin.json" with { type: "json" };
import KILOCODE_MANIFEST from "../../extensions/kilocode/vilaro.plugin.json" with { type: "json" };
import KIMI_CODING_MANIFEST from "../../extensions/kimi-coding/vilaro.plugin.json" with { type: "json" };
import MINIMAX_MANIFEST from "../../extensions/minimax/vilaro.plugin.json" with { type: "json" };
import MISTRAL_MANIFEST from "../../extensions/mistral/vilaro.plugin.json" with { type: "json" };
import MODELSTUDIO_MANIFEST from "../../extensions/modelstudio/vilaro.plugin.json" with { type: "json" };
import MOONSHOT_MANIFEST from "../../extensions/moonshot/vilaro.plugin.json" with { type: "json" };
import NVIDIA_MANIFEST from "../../extensions/nvidia/vilaro.plugin.json" with { type: "json" };
import OLLAMA_MANIFEST from "../../extensions/ollama/vilaro.plugin.json" with { type: "json" };
import OPENAI_MANIFEST from "../../extensions/openai/vilaro.plugin.json" with { type: "json" };
import OPENCODE_GO_MANIFEST from "../../extensions/opencode-go/vilaro.plugin.json" with { type: "json" };
import OPENCODE_MANIFEST from "../../extensions/opencode/vilaro.plugin.json" with { type: "json" };
import OPENROUTER_MANIFEST from "../../extensions/openrouter/vilaro.plugin.json" with { type: "json" };
import QIANFAN_MANIFEST from "../../extensions/qianfan/vilaro.plugin.json" with { type: "json" };
import QWEN_PORTAL_AUTH_MANIFEST from "../../extensions/qwen-portal-auth/vilaro.plugin.json" with { type: "json" };
import SGLANG_MANIFEST from "../../extensions/sglang/vilaro.plugin.json" with { type: "json" };
import SYNTHETIC_MANIFEST from "../../extensions/synthetic/vilaro.plugin.json" with { type: "json" };
import TOGETHER_MANIFEST from "../../extensions/together/vilaro.plugin.json" with { type: "json" };
import VENICE_MANIFEST from "../../extensions/venice/vilaro.plugin.json" with { type: "json" };
import VERCEL_AI_GATEWAY_MANIFEST from "../../extensions/vercel-ai-gateway/vilaro.plugin.json" with { type: "json" };
import VLLM_MANIFEST from "../../extensions/vllm/vilaro.plugin.json" with { type: "json" };
import VOLCENGINE_MANIFEST from "../../extensions/volcengine/vilaro.plugin.json" with { type: "json" };
import XAI_MANIFEST from "../../extensions/xai/vilaro.plugin.json" with { type: "json" };
import XIAOMI_MANIFEST from "../../extensions/xiaomi/vilaro.plugin.json" with { type: "json" };
import ZAI_MANIFEST from "../../extensions/zai/vilaro.plugin.json" with { type: "json" };

type ProviderAuthEnvVarManifest = {
  id?: string;
  providerAuthEnvVars?: Record<string, string[]>;
};

function collectBundledProviderAuthEnvVars(
  manifests: readonly ProviderAuthEnvVarManifest[],
): Record<string, readonly string[]> {
  const entries: Record<string, readonly string[]> = {};
  for (const manifest of manifests) {
    const providerAuthEnvVars = manifest.providerAuthEnvVars;
    if (!providerAuthEnvVars) {
      continue;
    }
    for (const [providerId, envVars] of Object.entries(providerAuthEnvVars)) {
      const normalizedProviderId = providerId.trim();
      const normalizedEnvVars = envVars.map((value) => value.trim()).filter(Boolean);
      if (!normalizedProviderId || normalizedEnvVars.length === 0) {
        continue;
      }
      entries[normalizedProviderId] = normalizedEnvVars;
    }
  }
  return entries;
}

// Read bundled provider auth env metadata from manifests so env-based auth
// lookup stays cheap and does not need to boot plugin runtime code.
export const BUNDLED_PROVIDER_AUTH_ENV_VAR_CANDIDATES = collectBundledProviderAuthEnvVars([
  ANTHROPIC_MANIFEST,
  BYTEPLUS_MANIFEST,
  CLOUDFLARE_AI_GATEWAY_MANIFEST,
  COPILOT_PROXY_MANIFEST,
  GITHUB_COPILOT_MANIFEST,
  GOOGLE_MANIFEST,
  HUGGINGFACE_MANIFEST,
  KILOCODE_MANIFEST,
  KIMI_CODING_MANIFEST,
  MINIMAX_MANIFEST,
  MISTRAL_MANIFEST,
  MODELSTUDIO_MANIFEST,
  MOONSHOT_MANIFEST,
  NVIDIA_MANIFEST,
  OLLAMA_MANIFEST,
  OPENAI_MANIFEST,
  OPENCODE_GO_MANIFEST,
  OPENCODE_MANIFEST,
  OPENROUTER_MANIFEST,
  QIANFAN_MANIFEST,
  QWEN_PORTAL_AUTH_MANIFEST,
  SGLANG_MANIFEST,
  SYNTHETIC_MANIFEST,
  TOGETHER_MANIFEST,
  VENICE_MANIFEST,
  VERCEL_AI_GATEWAY_MANIFEST,
  VLLM_MANIFEST,
  VOLCENGINE_MANIFEST,
  XAI_MANIFEST,
  XIAOMI_MANIFEST,
  ZAI_MANIFEST,
]);
