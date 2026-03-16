import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#vilaro",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#vilaro",
      rawTarget: "#vilaro",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "vilaro-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "vilaro-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "vilaro-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "vilaro-bot",
      rawTarget: "vilaro-bot",
    });
  });
});
