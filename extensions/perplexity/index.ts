import {
  createPluginBackedWebSearchProvider,
  getScopedCredentialValue,
  setScopedCredentialValue,
} from "../../src/agents/tools/web-search-plugin-factory.js";
import { emptyPluginConfigSchema } from "../../src/plugins/config-schema.js";
import type { VilaroPluginApi } from "../../src/plugins/types.js";

const perplexityPlugin = {
  id: "perplexity",
  name: "Perplexity Plugin",
  description: "Bundled Perplexity plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: VilaroPluginApi) {
    api.registerWebSearchProvider(
      createPluginBackedWebSearchProvider({
        id: "perplexity",
        label: "Perplexity Search",
        hint: "Structured results · domain/country/language/time filters",
        envVars: ["PERPLEXITY_API_KEY", "OPENROUTER_API_KEY"],
        placeholder: "pplx-...",
        signupUrl: "https://www.perplexity.ai/settings/api",
        docsUrl: "https://docs.vilaro.ai/perplexity",
        autoDetectOrder: 50,
        getCredentialValue: (searchConfig) => getScopedCredentialValue(searchConfig, "perplexity"),
        setCredentialValue: (searchConfigTarget, value) =>
          setScopedCredentialValue(searchConfigTarget, "perplexity", value),
      }),
    );
  },
};

export default perplexityPlugin;
