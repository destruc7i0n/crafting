import { createCustomItemTool } from "./custom-items";
import { getEditorStateTool } from "./editor-state";
import { getRecipeJsonTool } from "./recipe-json";
import { createRecipeTool, deleteRecipeTool, selectRecipeTool, updateRecipeTool } from "./recipes";
import { searchItemsTool } from "./search";
import { clearRecipeSlotsTool, setCraftingPatternTool, setSlotsTool } from "./slots";
import { setMinecraftVersionTool } from "./version";

import type { ModelContextTool } from "../types";

/**
 * Every tool the editor exposes over WebMCP, in the order agents see them:
 * orientation/read tools first, then the common write flow, then rarer ones.
 */
export const editorTools: ModelContextTool[] = [
  getEditorStateTool,
  searchItemsTool,
  getRecipeJsonTool,
  createRecipeTool,
  selectRecipeTool,
  deleteRecipeTool,
  updateRecipeTool,
  setSlotsTool,
  setCraftingPatternTool,
  clearRecipeSlotsTool,
  setMinecraftVersionTool,
  createCustomItemTool,
];
