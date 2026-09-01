import { afterEach, describe, expect, it, vi } from "vitest";

import { getModelContext, isValidToolName, registerTools } from "./model-context";

import type { ModelContext, ModelContextTool } from "./types";

const flush = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const createFakeContext = () => ({
  registerTool: vi.fn<ModelContext["registerTool"]>(),
  unregisterTool: vi.fn<ModelContext["unregisterTool"]>(),
});

const createTool = (name: string): ModelContextTool => ({
  name,
  description: `${name} description`,
  execute: async () => null,
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("isValidToolName", () => {
  it("accepts names matching the WebMCP grammar", () => {
    expect(isValidToolName("search_items")).toBe(true);
    expect(isValidToolName("recipe.set-slot_1")).toBe(true);
  });

  it("rejects empty, spaced, or overlong names", () => {
    expect(isValidToolName("")).toBe(false);
    expect(isValidToolName("has space")).toBe(false);
    expect(isValidToolName("a".repeat(129))).toBe(false);
  });
});

describe("getModelContext", () => {
  it("returns undefined when there is no document", () => {
    expect(typeof document).toBe("undefined");
    expect(getModelContext()).toBeUndefined();
  });

  it("returns document.modelContext", () => {
    const fake = createFakeContext();
    vi.stubGlobal("document", { modelContext: fake });

    expect(getModelContext()).toBe(fake);
  });

  it("falls back to navigator.modelContext", () => {
    const fake = createFakeContext();
    vi.stubGlobal("document", {});
    vi.stubGlobal("navigator", { modelContext: fake });

    expect(getModelContext()).toBe(fake);
  });

  it("prefers document over navigator", () => {
    const documentContext = createFakeContext();
    const navigatorContext = createFakeContext();
    vi.stubGlobal("document", { modelContext: documentContext });
    vi.stubGlobal("navigator", { modelContext: navigatorContext });

    expect(getModelContext()).toBe(documentContext);
  });

  it("ignores objects without a registerTool function", () => {
    vi.stubGlobal("document", { modelContext: { unregisterTool: vi.fn<() => void>() } });
    vi.stubGlobal("navigator", { modelContext: { registerTool: "nope" } });

    expect(getModelContext()).toBeUndefined();
  });
});

describe("registerTools", () => {
  it("registers every tool and unregisters them on cleanup", async () => {
    const context = createFakeContext();
    const tools = [createTool("a"), createTool("b"), createTool("c")];

    const cleanup = registerTools(context, tools);
    await flush();

    expect(context.registerTool.mock.calls.map(([tool]) => tool.name)).toEqual(["a", "b", "c"]);
    expect(context.unregisterTool).not.toHaveBeenCalled();

    cleanup();
    await flush();

    expect(context.unregisterTool.mock.calls.map(([name]) => name)).toEqual(["a", "b", "c"]);
  });

  it("swallows unregister failures during cleanup", async () => {
    const context = createFakeContext();
    context.unregisterTool
      .mockImplementationOnce(() => {
        throw new Error("sync failure");
      })
      .mockRejectedValueOnce(new Error("async failure"));

    const cleanup = registerTools(context, [createTool("a"), createTool("b")]);
    await flush();

    expect(() => cleanup()).not.toThrow();
    await flush();
    expect(context.unregisterTool).toHaveBeenCalledTimes(2);
  });

  it("replaces a duplicate registration on InvalidStateError", async () => {
    const context = createFakeContext();
    context.registerTool.mockRejectedValueOnce(
      Object.assign(new Error("dup"), { name: "InvalidStateError" }),
    );

    registerTools(context, [createTool("a"), createTool("b")]);
    await flush();

    expect(context.unregisterTool).toHaveBeenCalledTimes(1);
    expect(context.unregisterTool).toHaveBeenCalledWith("a");
    expect(context.registerTool.mock.calls.map(([tool]) => tool.name)).toEqual(["a", "a", "b"]);
  });

  it("warns and skips tools that fail for other reasons", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const context = createFakeContext();
    context.registerTool.mockImplementationOnce(() => {
      throw new TypeError("bad tool");
    });

    registerTools(context, [createTool("a"), createTool("b")]);
    await flush();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(context.unregisterTool).not.toHaveBeenCalled();
    expect(context.registerTool.mock.calls.map(([tool]) => tool.name)).toEqual(["a", "b"]);
  });

  it("stops registering once cleanup has been called", async () => {
    const context = createFakeContext();
    context.registerTool.mockImplementation(() => flush(5).then(() => undefined));
    const tools = [createTool("a"), createTool("b")];

    const cleanup = registerTools(context, tools);
    cleanup();
    await flush(20);

    expect(context.registerTool).toHaveBeenCalledTimes(1);
    expect(context.registerTool.mock.calls[0]?.[0].name).toBe("a");
    expect(context.unregisterTool).toHaveBeenCalledWith("a");
    expect(context.unregisterTool).toHaveBeenCalledWith("b");
  });
});
