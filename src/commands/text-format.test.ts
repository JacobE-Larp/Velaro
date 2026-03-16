import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("vilaro", 16)).toBe("vilaro");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("vilaro-status-output", 10)).toBe("vilaro-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
