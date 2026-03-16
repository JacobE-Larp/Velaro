import * as extensionApi from "vilaro/extension-api";
import * as compatSdk from "vilaro/plugin-sdk/compat";
import * as coreSdk from "vilaro/plugin-sdk/core";
import * as discordSdk from "vilaro/plugin-sdk/discord";
import * as imessageSdk from "vilaro/plugin-sdk/imessage";
import * as lineSdk from "vilaro/plugin-sdk/line";
import * as msteamsSdk from "vilaro/plugin-sdk/msteams";
import * as nostrSdk from "vilaro/plugin-sdk/nostr";
import * as signalSdk from "vilaro/plugin-sdk/signal";
import * as slackSdk from "vilaro/plugin-sdk/slack";
import * as telegramSdk from "vilaro/plugin-sdk/telegram";
import * as whatsappSdk from "vilaro/plugin-sdk/whatsapp";
import { describe, expect, it } from "vitest";
import { pluginSdkSubpaths } from "./entrypoints.js";

const importPluginSdkSubpath = (specifier: string) => import(/* @vite-ignore */ specifier);

const bundledExtensionSubpathLoaders = pluginSdkSubpaths.map((id: string) => ({
  id,
  load: () => importPluginSdkSubpath(`vilaro/plugin-sdk/${id}`),
}));

const asExports = (mod: object) => mod as Record<string, unknown>;

describe("plugin-sdk subpath exports", () => {
  it("exports compat helpers", () => {
    expect(typeof compatSdk.emptyPluginConfigSchema).toBe("function");
    expect(typeof compatSdk.resolveControlCommandGate).toBe("function");
  });

  it("exports core routing helpers", () => {
    expect(typeof coreSdk.buildAgentSessionKey).toBe("function");
    expect(typeof coreSdk.resolveThreadSessionKeys).toBe("function");
    expect(typeof coreSdk.runPassiveAccountLifecycle).toBe("function");
    expect(typeof coreSdk.createLoggerBackedRuntime).toBe("function");
  });

  it("exports Discord helpers", () => {
    expect(typeof discordSdk.buildChannelConfigSchema).toBe("function");
    expect(typeof discordSdk.DiscordConfigSchema).toBe("object");
    expect(typeof discordSdk.projectCredentialSnapshotFields).toBe("function");
    expect("resolveDiscordAccount" in asExports(discordSdk)).toBe(false);
  });

  it("exports Slack helpers", () => {
    expect(typeof slackSdk.buildChannelConfigSchema).toBe("function");
    expect(typeof slackSdk.SlackConfigSchema).toBe("object");
    expect(typeof slackSdk.looksLikeSlackTargetId).toBe("function");
    expect("resolveSlackAccount" in asExports(slackSdk)).toBe(false);
  });

  it("exports Telegram helpers", () => {
    expect(typeof telegramSdk.buildChannelConfigSchema).toBe("function");
    expect(typeof telegramSdk.TelegramConfigSchema).toBe("object");
    expect(typeof telegramSdk.projectCredentialSnapshotFields).toBe("function");
    expect("resolveTelegramAccount" in asExports(telegramSdk)).toBe(false);
  });

  it("exports Signal helpers", () => {
    expect(typeof signalSdk.buildBaseAccountStatusSnapshot).toBe("function");
    expect(typeof signalSdk.SignalConfigSchema).toBe("object");
    expect(typeof signalSdk.normalizeSignalMessagingTarget).toBe("function");
    expect("resolveSignalAccount" in asExports(signalSdk)).toBe(false);
  });

  it("exports iMessage helpers", () => {
    expect(typeof imessageSdk.IMessageConfigSchema).toBe("object");
    expect(typeof imessageSdk.resolveIMessageConfigAllowFrom).toBe("function");
    expect(typeof imessageSdk.looksLikeIMessageTargetId).toBe("function");
    expect("resolveIMessageAccount" in asExports(imessageSdk)).toBe(false);
  });

  it("exports IRC helpers", async () => {
    const ircSdk = await import("vilaro/plugin-sdk/irc");
    expect(typeof ircSdk.resolveIrcAccount).toBe("function");
    expect(typeof ircSdk.ircSetupWizard).toBe("object");
    expect(typeof ircSdk.ircSetupAdapter).toBe("object");
  });

  it("exports WhatsApp helpers", () => {
    // WhatsApp-specific functions (resolveWhatsAppAccount, whatsappOnboardingAdapter) moved to extensions/whatsapp/src/
    expect(typeof whatsappSdk.WhatsAppConfigSchema).toBe("object");
    expect(typeof whatsappSdk.resolveWhatsAppOutboundTarget).toBe("function");
    expect(typeof whatsappSdk.resolveWhatsAppMentionStripRegexes).toBe("function");
    expect("resolveWhatsAppMentionStripPatterns" in whatsappSdk).toBe(false);
  });

  it("exports Feishu helpers", async () => {
    const feishuSdk = await import("vilaro/plugin-sdk/feishu");
    expect(typeof feishuSdk.feishuSetupWizard).toBe("object");
    expect(typeof feishuSdk.feishuSetupAdapter).toBe("object");
  });

  it("exports LINE helpers", () => {
    expect(typeof lineSdk.processLineMessage).toBe("function");
    expect(typeof lineSdk.createInfoCard).toBe("function");
    expect(typeof lineSdk.lineSetupWizard).toBe("object");
    expect(typeof lineSdk.lineSetupAdapter).toBe("object");
  });

  it("exports Microsoft Teams helpers", () => {
    expect(typeof msteamsSdk.resolveControlCommandGate).toBe("function");
    expect(typeof msteamsSdk.loadOutboundMediaFromUrl).toBe("function");
    expect(typeof msteamsSdk.msteamsSetupWizard).toBe("object");
    expect(typeof msteamsSdk.msteamsSetupAdapter).toBe("object");
  });

  it("exports Nostr helpers", () => {
    expect(typeof nostrSdk.nostrSetupWizard).toBe("object");
    expect(typeof nostrSdk.nostrSetupAdapter).toBe("object");
  });

  it("exports Google Chat helpers", async () => {
    const googlechatSdk = await import("vilaro/plugin-sdk/googlechat");
    expect(typeof googlechatSdk.googlechatSetupWizard).toBe("object");
    expect(typeof googlechatSdk.googlechatSetupAdapter).toBe("object");
  });

  it("exports Zalo helpers", async () => {
    const zaloSdk = await import("vilaro/plugin-sdk/zalo");
    expect(typeof zaloSdk.zaloSetupWizard).toBe("object");
    expect(typeof zaloSdk.zaloSetupAdapter).toBe("object");
  });

  it("exports Synology Chat helpers", async () => {
    const synologyChatSdk = await import("vilaro/plugin-sdk/synology-chat");
    expect(typeof synologyChatSdk.synologyChatSetupWizard).toBe("object");
    expect(typeof synologyChatSdk.synologyChatSetupAdapter).toBe("object");
  });

  it("exports Zalouser helpers", async () => {
    const zalouserSdk = await import("vilaro/plugin-sdk/zalouser");
    expect(typeof zalouserSdk.zalouserSetupWizard).toBe("object");
    expect(typeof zalouserSdk.zalouserSetupAdapter).toBe("object");
  });

  it("exports Tlon helpers", async () => {
    const tlonSdk = await import("vilaro/plugin-sdk/tlon");
    expect(typeof tlonSdk.fetchWithSsrFGuard).toBe("function");
    expect(typeof tlonSdk.tlonSetupWizard).toBe("object");
    expect(typeof tlonSdk.tlonSetupAdapter).toBe("object");
  });

  it("exports acpx helpers", async () => {
    const acpxSdk = await import("vilaro/plugin-sdk/acpx");
    expect(typeof acpxSdk.listKnownProviderAuthEnvVarNames).toBe("function");
    expect(typeof acpxSdk.omitEnvKeysCaseInsensitive).toBe("function");
  });

  it("resolves bundled extension subpaths", async () => {
    for (const { id, load } of bundledExtensionSubpathLoaders) {
      const mod = await load();
      expect(typeof mod).toBe("object");
      expect(mod, `subpath ${id} should resolve`).toBeTruthy();
    }
  });

  it("keeps the newly added bundled plugin-sdk contracts available", async () => {
    const bluebubbles = await import("vilaro/plugin-sdk/bluebubbles");
    expect(typeof bluebubbles.parseFiniteNumber).toBe("function");

    const matrix = await import("vilaro/plugin-sdk/matrix");
    expect(typeof matrix.matrixSetupWizard).toBe("object");
    expect(typeof matrix.matrixSetupAdapter).toBe("object");

    const mattermost = await import("vilaro/plugin-sdk/mattermost");
    expect(typeof mattermost.parseStrictPositiveInteger).toBe("function");

    const nextcloudTalk = await import("vilaro/plugin-sdk/nextcloud-talk");
    expect(typeof nextcloudTalk.waitForAbortSignal).toBe("function");

    const twitch = await import("vilaro/plugin-sdk/twitch");
    expect(typeof twitch.DEFAULT_ACCOUNT_ID).toBe("string");
    expect(typeof twitch.normalizeAccountId).toBe("function");
    expect(typeof twitch.twitchSetupWizard).toBe("object");
    expect(typeof twitch.twitchSetupAdapter).toBe("object");

    const zalo = await import("vilaro/plugin-sdk/zalo");
    expect(typeof zalo.resolveClientIp).toBe("function");
  });

  it("exports the extension api bridge", () => {
    expect(typeof extensionApi.runEmbeddedPiAgent).toBe("function");
  });
});
