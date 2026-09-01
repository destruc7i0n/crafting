import { z } from "zod";

import { getSlotContext } from "@/lib/slot-context";
import { ensureResources } from "@/stores/resources/loader";
import { useSettingsStore } from "@/stores/settings";

import { defineTool } from "../define-tool";
import { INGREDIENT_REF_GUIDE } from "../guide";
import { IngredientRefKind, searchIngredients } from "../ingredient-ref";

const INGREDIENT_REF_KINDS = [
  "item",
  "custom_item",
  "vanilla_tag",
  "custom_tag",
] as const satisfies readonly IngredientRefKind[];

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const input = z.object({
  query: z
    .string()
    .min(0)
    .describe(
      'Search text matched fuzzily against display names and ids, e.g. "oak planks" or "stick". An empty string lists the first results without filtering.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_LIMIT)
    .default(DEFAULT_LIMIT)
    .describe(`Maximum number of results to return (1-${MAX_LIMIT}, default ${DEFAULT_LIMIT}).`),
  kinds: z
    .array(z.enum(INGREDIENT_REF_KINDS))
    .optional()
    .describe(
      'Restrict results to these kinds. "item": vanilla items; "custom_item": items created in this editor; "vanilla_tag": built-in item tags like #minecraft:planks; "custom_tag": tags created in this editor. Omit to search everything.',
    ),
});

export type SearchItemsInput = z.output<typeof input>;

export const searchItemsTool = defineTool({
  name: "search_items",
  title: "Search items and tags",
  description: `Search the items and item tags available in the current Minecraft version by display name or id, returning ingredient refs. Use it to find the exact ref for an ingredient before filling a slot; the returned "ref" strings can be passed unchanged to set_slots or set_crafting_pattern. Matching is fuzzy, so "planks" finds every plank variant and "#planks" is not required for tags (filter with kinds instead). Results include the vanilla items of the current version plus custom items and tags created in this editor; tag results carry a "previewValues" sample of their members. Example: { "query": "diamond", "limit": 5, "kinds": ["item"] }.

${INGREDIENT_REF_GUIDE}`,
  input,
  annotations: { readOnlyHint: true },
  execute: async ({ query, limit, kinds }) => {
    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    return {
      version,
      results: searchIngredients({ query, slotContext: getSlotContext(), limit, kinds }),
    };
  },
});
