import { trackWebMcpToolCall } from "@/lib/analytics";

import { setToolCallListener } from "./define-tool";
import { getModelContext, registerTools } from "./model-context";
import { editorTools } from "./tools";

/**
 * Registers the editor's WebMCP tools with the browser and wires tool-call
 * analytics. Returns a cleanup function, or `undefined` when the environment
 * has no model context (SSR/prerender, unsupported browsers).
 */
export const registerEditorTools = (): (() => void) | undefined => {
  const modelContext = getModelContext();

  if (!modelContext) {
    return undefined;
  }

  setToolCallListener(({ toolName, success }) =>
    trackWebMcpToolCall({ tool_name: toolName, success }),
  );

  const cleanup = registerTools(modelContext, editorTools);

  return () => {
    cleanup();
    setToolCallListener(undefined);
  };
};
