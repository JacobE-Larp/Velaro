import { describe, expect, it, test } from "vitest";
import {
  applyVilaroManifestInstallCommonFields,
  getFrontmatterString,
  normalizeStringList,
  parseFrontmatterBool,
  parseVilaroManifestInstallBase,
  resolveVilaroManifestBlock,
  resolveVilaroManifestInstall,
  resolveVilaroManifestOs,
  resolveVilaroManifestRequires,
} from "./frontmatter.js";

describe("shared/frontmatter", () => {
  test("normalizeStringList handles strings, arrays, and non-list values", () => {
    expect(normalizeStringList("a, b,,c")).toEqual(["a", "b", "c"]);
    expect(normalizeStringList([" a ", "", "b", 42])).toEqual(["a", "b", "42"]);
    expect(normalizeStringList(null)).toEqual([]);
  });

  test("getFrontmatterString extracts strings only", () => {
    expect(getFrontmatterString({ a: "b" }, "a")).toBe("b");
    expect(getFrontmatterString({ a: 1 }, "a")).toBeUndefined();
  });

  test("parseFrontmatterBool respects explicit values and fallback", () => {
    expect(parseFrontmatterBool("true", false)).toBe(true);
    expect(parseFrontmatterBool("false", true)).toBe(false);
    expect(parseFrontmatterBool(undefined, true)).toBe(true);
    expect(parseFrontmatterBool("maybe", false)).toBe(false);
  });

  test("resolveVilaroManifestBlock reads current manifest keys and custom metadata fields", () => {
    expect(
      resolveVilaroManifestBlock({
        frontmatter: {
          metadata: "{ vilaro: { foo: 1, bar: 'baz' } }",
        },
      }),
    ).toEqual({ foo: 1, bar: "baz" });

    expect(
      resolveVilaroManifestBlock({
        frontmatter: {
          pluginMeta: "{ vilaro: { foo: 2 } }",
        },
        key: "pluginMeta",
      }),
    ).toEqual({ foo: 2 });
  });

  test("resolveVilaroManifestBlock returns undefined for invalid input", () => {
    expect(resolveVilaroManifestBlock({ frontmatter: {} })).toBeUndefined();
    expect(resolveVilaroManifestBlock({ frontmatter: { metadata: "not-json5" } })).toBeUndefined();
    expect(resolveVilaroManifestBlock({ frontmatter: { metadata: "123" } })).toBeUndefined();
    expect(resolveVilaroManifestBlock({ frontmatter: { metadata: "[]" } })).toBeUndefined();
    expect(
      resolveVilaroManifestBlock({ frontmatter: { metadata: "{ nope: { a: 1 } }" } }),
    ).toBeUndefined();
  });

  it("normalizes manifest requirement and os lists", () => {
    expect(
      resolveVilaroManifestRequires({
        requires: {
          bins: "bun, node",
          anyBins: [" ffmpeg ", ""],
          env: ["VILARO_TOKEN", " VILARO_URL "],
          config: null,
        },
      }),
    ).toEqual({
      bins: ["bun", "node"],
      anyBins: ["ffmpeg"],
      env: ["VILARO_TOKEN", "VILARO_URL"],
      config: [],
    });
    expect(resolveVilaroManifestRequires({})).toBeUndefined();
    expect(resolveVilaroManifestOs({ os: [" darwin ", "linux", ""] })).toEqual(["darwin", "linux"]);
  });

  it("parses and applies install common fields", () => {
    const parsed = parseVilaroManifestInstallBase(
      {
        type: " Brew ",
        id: "brew.git",
        label: "Git",
        bins: [" git ", "git"],
      },
      ["brew", "npm"],
    );

    expect(parsed).toEqual({
      raw: {
        type: " Brew ",
        id: "brew.git",
        label: "Git",
        bins: [" git ", "git"],
      },
      kind: "brew",
      id: "brew.git",
      label: "Git",
      bins: ["git", "git"],
    });
    expect(parseVilaroManifestInstallBase({ kind: "bad" }, ["brew"])).toBeUndefined();
    expect(
      applyVilaroManifestInstallCommonFields<{
        extra: boolean;
        id?: string;
        label?: string;
        bins?: string[];
      }>({ extra: true }, parsed!),
    ).toEqual({
      extra: true,
      id: "brew.git",
      label: "Git",
      bins: ["git", "git"],
    });
  });

  it("prefers explicit kind, ignores invalid common fields, and leaves missing ones untouched", () => {
    const parsed = parseVilaroManifestInstallBase(
      {
        kind: " npm ",
        type: "brew",
        id: 42,
        label: null,
        bins: [" ", ""],
      },
      ["brew", "npm"],
    );

    expect(parsed).toEqual({
      raw: {
        kind: " npm ",
        type: "brew",
        id: 42,
        label: null,
        bins: [" ", ""],
      },
      kind: "npm",
    });
    expect(
      applyVilaroManifestInstallCommonFields({ id: "keep", label: "Keep", bins: ["bun"] }, parsed!),
    ).toEqual({
      id: "keep",
      label: "Keep",
      bins: ["bun"],
    });
  });

  it("maps install entries through the parser and filters rejected specs", () => {
    expect(
      resolveVilaroManifestInstall(
        {
          install: [{ id: "keep" }, { id: "drop" }, "bad"],
        },
        (entry) => {
          if (
            typeof entry === "object" &&
            entry !== null &&
            (entry as { id?: string }).id === "keep"
          ) {
            return { id: "keep" };
          }
          return undefined;
        },
      ),
    ).toEqual([{ id: "keep" }]);
  });
});
