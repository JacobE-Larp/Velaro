import type {
  AnyAgentTool,
  VilaroPluginApi,
  ProviderPlugin,
  WebSearchProviderPlugin,
} from "../plugins/types.js";

export type CapturedPluginRegistration = {
  api: VilaroPluginApi;
  providers: ProviderPlugin[];
  webSearchProviders: WebSearchProviderPlugin[];
  tools: AnyAgentTool[];
};

export function createCapturedPluginRegistration(): CapturedPluginRegistration {
  const providers: ProviderPlugin[] = [];
  const webSearchProviders: WebSearchProviderPlugin[] = [];
  const tools: AnyAgentTool[] = [];

  return {
    providers,
    webSearchProviders,
    tools,
    api: {
      registerProvider(provider: ProviderPlugin) {
        providers.push(provider);
      },
      registerWebSearchProvider(provider: WebSearchProviderPlugin) {
        webSearchProviders.push(provider);
      },
      registerTool(tool: AnyAgentTool) {
        tools.push(tool);
      },
    } as VilaroPluginApi,
  };
}

export function registerSingleProviderPlugin(params: {
  register(api: VilaroPluginApi): void;
}): ProviderPlugin {
  const captured = createCapturedPluginRegistration();
  params.register(captured.api);
  const provider = captured.providers[0];
  if (!provider) {
    throw new Error("provider registration missing");
  }
  return provider;
}
