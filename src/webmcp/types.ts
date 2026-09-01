/**
 * Minimal typings for the WebMCP API (W3C draft).
 * Chrome 146+ exposes it on `navigator.modelContext`; Chrome 150+ moved it to
 * `document.modelContext`.
 */

export type JsonSchemaObject = Record<string, unknown>;

export interface ModelContextToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ModelContextExecuteOptions {
  signal?: AbortSignal;
}

export interface ModelContextRegisterOptions {
  signal?: AbortSignal;
}

export interface ModelContextTool {
  /** Must match `^[a-zA-Z0-9_.-]{1,128}$`. */
  name: string;
  title?: string;
  description: string;
  /** JSON Schema object describing `execute` input. */
  inputSchema?: JsonSchemaObject;
  /** The resolved value is stringified for the agent; a rejection surfaces as a tool error. */
  execute(input: unknown, options?: ModelContextExecuteOptions): Promise<unknown>;
  annotations?: ModelContextToolAnnotations;
}

export interface ModelContext {
  /** Throws/rejects with an `InvalidStateError` on duplicate name or empty name/description. */
  registerTool(tool: ModelContextTool, options?: ModelContextRegisterOptions): void | Promise<void>;
  unregisterTool(name: string): void | Promise<void>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }

  interface Navigator {
    modelContext?: ModelContext;
  }
}
