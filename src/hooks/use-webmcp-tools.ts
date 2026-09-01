import { useEffect } from "react";

import { registerEditorTools } from "@/webmcp/register-editor-tools";

/** Exposes the editor's WebMCP tools while the component is mounted. */
export const useWebMcpTools = () => {
  useEffect(() => registerEditorTools(), []);
};
