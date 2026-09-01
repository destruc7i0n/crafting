import { afterEach, describe, expect, it, vi } from "vitest";

import { trackWebMcpToolCall } from "@/lib/analytics";

import { setToolCallListener, ToolCallListener } from "./define-tool";
import { registerEditorTools } from "./register-editor-tools";
import { editorTools } from "./tools";

import type { ModelContext } from "./types";

vi.mock("@/lib/analytics", () => ({
  trackWebMcpToolCall: vi.fn<(properties: { tool_name: string; success: boolean }) => void>(),
}));

vi.mock("./define-tool", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./define-tool")>()),
  setToolCallListener: vi.fn<(listener: ToolCallListener | undefined) => void>(),
}));

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const expectedNames = editorTools.map((tool) => tool.name);

const createFakeContext = () => ({
  registerTool: vi.fn<ModelContext["registerTool"]>(),
  unregisterTool: vi.fn<ModelContext["unregisterTool"]>(),
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("registerEditorTools", () => {
  it("returns undefined and installs no listener without a document", () => {
    expect(typeof document).toBe("undefined");

    expect(registerEditorTools()).toBeUndefined();
    expect(setToolCallListener).not.toHaveBeenCalled();
  });

  it("returns undefined when the browser has no model context", () => {
    vi.stubGlobal("document", {});

    expect(registerEditorTools()).toBeUndefined();
    expect(setToolCallListener).not.toHaveBeenCalled();
  });

  it("registers all editor tools and unregisters them on cleanup", async () => {
    const fake = createFakeContext();
    vi.stubGlobal("document", { modelContext: fake });

    const cleanup = registerEditorTools();
    expect(cleanup).toBeTypeOf("function");

    await flush();

    const registered = fake.registerTool.mock.calls.map(([tool]) => tool.name);
    expect(registered).toEqual(expectedNames);
    expect(registered).toHaveLength(12);

    cleanup?.();

    const unregistered = fake.unregisterTool.mock.calls.map(([name]) => name);
    expect(unregistered.sort()).toEqual([...expectedNames].sort());
    expect(setToolCallListener).toHaveBeenLastCalledWith(undefined);
  });

  it("forwards tool calls to analytics while registered", () => {
    vi.stubGlobal("document", { modelContext: createFakeContext() });

    registerEditorTools();

    const listener = vi.mocked(setToolCallListener).mock.calls[0]?.[0] as ToolCallListener;
    listener({ toolName: "set_slots", success: false });

    expect(trackWebMcpToolCall).toHaveBeenCalledWith({ tool_name: "set_slots", success: false });
  });
});
