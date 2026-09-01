import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { defineTool, setToolCallListener, ToolExecuteContext } from "./define-tool";

const searchInput = z.object({
  query: z.string().describe("Search text"),
  limit: z.number().int().min(1).default(10),
});

type SearchInput = z.output<typeof searchInput>;
type SearchExecute = (input: SearchInput, context: ToolExecuteContext) => Promise<SearchInput>;

const createSearchTool = (execute = vi.fn<SearchExecute>(async (input) => input)) =>
  ({
    tool: defineTool({
      name: "search_items",
      description: "Search items",
      input: searchInput,
      execute,
    }),
    execute,
  }) as const;

afterEach(() => {
  setToolCallListener(undefined);
});

describe("defineTool", () => {
  it("derives a JSON Schema object from the zod schema", () => {
    const { tool } = createSearchTool();

    expect(tool.name).toBe("search_items");
    expect(tool.description).toBe("Search items");
    expect(tool.inputSchema).toMatchObject({
      type: "object",
      properties: {
        query: { type: "string", description: "Search text" },
        limit: { type: "integer", default: 10 },
      },
      required: ["query"],
    });
    expect(tool.inputSchema).not.toHaveProperty("$schema");
  });

  it("passes through title and annotations", () => {
    const tool = defineTool({
      name: "noop",
      title: "No-op",
      description: "Does nothing",
      input: z.object({}),
      annotations: { readOnlyHint: true },
      execute: () => null,
    });

    expect(tool.title).toBe("No-op");
    expect(tool.annotations).toEqual({ readOnlyHint: true });
  });

  it("rejects invalid input with a message naming the tool and field", async () => {
    const { tool, execute } = createSearchTool();

    await expect(tool.execute({ query: 5 })).rejects.toThrow(
      /^Invalid input for search_items: query: /,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it("applies defaults and forwards parsed input to execute", async () => {
    const { tool, execute } = createSearchTool();

    await expect(tool.execute({ query: "stick" })).resolves.toEqual({
      query: "stick",
      limit: 10,
    });
    expect(execute).toHaveBeenCalledWith(
      { query: "stick", limit: 10 },
      { signal: expect.any(AbortSignal) },
    );
  });

  it("treats undefined raw input as an empty object", async () => {
    const execute = vi.fn<(input: { verbose: boolean }) => boolean>((input) => input.verbose);
    const tool = defineTool({
      name: "status",
      description: "Status",
      input: z.object({ verbose: z.boolean().default(false) }),
      execute,
    });

    await expect(tool.execute(undefined)).resolves.toBe(false);
  });

  it("forwards the caller's abort signal", async () => {
    const { tool, execute } = createSearchTool();
    const controller = new AbortController();

    await tool.execute({ query: "x" }, { signal: controller.signal });

    expect(execute.mock.calls[0]?.[1]).toEqual({ signal: controller.signal });
  });

  it("wraps non-Error throwables in an Error", async () => {
    const tool = defineTool({
      name: "explode",
      description: "Throws a string",
      input: z.object({}),
      execute: () => {
        throw "boom";
      },
    });

    const rejection = tool.execute({});
    await expect(rejection).rejects.toBeInstanceOf(Error);
    await expect(rejection).rejects.toThrow("boom");
  });

  it("notifies the tool call listener with the outcome", async () => {
    const listener = vi.fn<(event: { toolName: string; success: boolean }) => void>();
    setToolCallListener(listener);
    const { tool } = createSearchTool(
      vi.fn<SearchExecute>(async (input) => {
        if (input.query === "fail") {
          throw new Error("nope");
        }
        return input;
      }),
    );

    await tool.execute({ query: "ok" });
    await expect(tool.execute({ query: "fail" })).rejects.toThrow("nope");
    await expect(tool.execute({ query: 1 })).rejects.toThrow("Invalid input");

    expect(listener.mock.calls).toEqual([
      [{ toolName: "search_items", success: true }],
      [{ toolName: "search_items", success: false }],
      [{ toolName: "search_items", success: false }],
    ]);
  });

  it("throws at definition time for an invalid tool name", () => {
    expect(() =>
      defineTool({
        name: "bad name!",
        description: "Invalid",
        input: z.object({}),
        execute: () => null,
      }),
    ).toThrow(/Invalid WebMCP tool name/);
  });

  it("throws at definition time for an empty description", () => {
    expect(() =>
      defineTool({
        name: "empty_description",
        description: "   ",
        input: z.object({}),
        execute: () => null,
      }),
    ).toThrow(/non-empty description/);
  });
});
