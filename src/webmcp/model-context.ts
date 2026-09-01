import type { ModelContext, ModelContextTool } from "./types";

const TOOL_NAME_PATTERN = /^[a-zA-Z0-9_.-]{1,128}$/;

export const isValidToolName = (name: string): boolean => TOOL_NAME_PATTERN.test(name);

const isModelContext = (candidate: unknown): candidate is ModelContext =>
  typeof candidate === "object" &&
  candidate !== null &&
  typeof (candidate as Partial<ModelContext>).registerTool === "function";

/**
 * Returns the browser's WebMCP entry point, if any.
 * Safe to call during SSR/prerender and in node tests: returns `undefined` when
 * there is no `document`.
 */
export const getModelContext = (): ModelContext | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const candidate =
    document.modelContext ??
    (typeof navigator === "undefined" ? undefined : navigator.modelContext);

  return isModelContext(candidate) ? candidate : undefined;
};

const isInvalidStateError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  error.name === "InvalidStateError";

const unregisterQuietly = async (modelContext: ModelContext, name: string): Promise<void> => {
  try {
    await Promise.resolve(modelContext.unregisterTool(name));
  } catch {
    // Unregistering an unknown tool is not an error we care about.
  }
};

const registerSingleTool = async (
  modelContext: ModelContext,
  tool: ModelContextTool,
  isActive: () => boolean,
): Promise<void> => {
  try {
    await Promise.resolve(modelContext.registerTool(tool));
    return;
  } catch (error) {
    if (!isInvalidStateError(error)) {
      console.warn(`[webmcp] Failed to register tool "${tool.name}"`, error);
      return;
    }
  }

  // InvalidStateError: a tool with this name already exists (e.g. after a hot
  // reload). Replace it once.
  await unregisterQuietly(modelContext, tool.name);
  if (!isActive()) {
    return;
  }

  try {
    await Promise.resolve(modelContext.registerTool(tool));
  } catch (error) {
    console.warn(`[webmcp] Failed to re-register tool "${tool.name}"`, error);
  }
};

/**
 * Registers `tools` sequentially in the background and returns a cleanup
 * function that unregisters all of them. Cleanup does not rely on the
 * `{ signal }` option bag, which not every implementation honours.
 */
export const registerTools = (
  modelContext: ModelContext,
  tools: ModelContextTool[],
): (() => void) => {
  let active = true;
  const isActive = () => active;

  void (async () => {
    for (const tool of tools) {
      if (!active) {
        return;
      }

      await registerSingleTool(modelContext, tool, isActive);

      if (!active) {
        // Cleanup ran while this registration was still pending.
        void unregisterQuietly(modelContext, tool.name);
        return;
      }
    }
  })();

  return () => {
    active = false;
    for (const tool of tools) {
      void unregisterQuietly(modelContext, tool.name);
    }
  };
};
