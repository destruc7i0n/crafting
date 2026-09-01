import { z } from "zod";

import { ensureResources } from "@/stores/resources/loader";
import { useSettingsStore } from "@/stores/settings";

import { defineTool } from "../define-tool";
import { INGREDIENT_REF_GUIDE, SLOTS_BY_TYPE_GUIDE } from "../guide";
import { summarizeEditor } from "../summary";

const input = z.object({});

export type GetEditorStateInput = z.output<typeof input>;

export const getEditorStateTool = defineTool({
  name: "get_editor_state",
  title: "Get editor state",
  description: `Return the editor's current state: Minecraft version, supported recipe types, every recipe (id, title, type, selected, valid) and the selected recipe in full (options, slots as ingredient refs with labels, slot layout, validation errors). Call this first to orient, and after any change you did not make yourself.

Takes no arguments. The "selectedRecipe.slotLayout" lists the slots the selected recipe accepts (disabled entries cannot be filled); "selectedRecipe.slots" holds the current contents keyed by slot id. "exportName" is the file name (Java) or identifier (Bedrock) the recipe would be exported as. Example: {}.

${SLOTS_BY_TYPE_GUIDE}

${INGREDIENT_REF_GUIDE}`,
  input,
  annotations: { readOnlyHint: true },
  execute: async () => {
    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    return summarizeEditor();
  },
});
