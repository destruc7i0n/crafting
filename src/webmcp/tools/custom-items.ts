import { z } from "zod";

import { identifierUniqueKey } from "@/data/models/identifier/utilities";
import { CustomItem } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import {
  bedrockIdentifierHint,
  isValidNamespacedIdentifier,
  javaIdentifierNamespaceHint,
  javaIdentifierPathHint,
  javaNamespacedIdentifierHint,
  parseMinecraftIdentifierInput,
} from "@/lib/minecraft-identifier";
import { getSlotContext } from "@/lib/slot-context";
import { useCustomItemStore } from "@/stores/custom-item";
import { ensureResources } from "@/stores/resources/loader";
import { useSettingsStore } from "@/stores/settings";

import { defineTool } from "../define-tool";
import { INGREDIENT_REF_GUIDE } from "../guide";
import { formatIngredientRef } from "../ingredient-ref";

const input = z.object({
  id: z
    .string()
    .min(1)
    .describe(
      'Namespaced identifier in the form "namespace:path", e.g. "mymod:ruby". Lowercase letters, digits and underscores; Java also allows ".", "-" and "/" in the path.',
    ),
  displayName: z.string().min(1).describe('Human-readable name shown in the editor, e.g. "Ruby".'),
  texture: z
    .string()
    .optional()
    .describe(
      "Optional image for the item: an https URL or a data URI (e.g. a base64 PNG). A placeholder texture is used when omitted.",
    ),
});

export type CreateCustomItemInput = z.output<typeof input>;

const getIdentifierHint = (version: MinecraftVersion): string =>
  version === MinecraftVersion.Bedrock
    ? `${javaNamespacedIdentifierHint}; both parts may only contain ${bedrockIdentifierHint}`
    : `${javaNamespacedIdentifierHint}; namespace may contain ${javaIdentifierNamespaceHint} and path may contain ${javaIdentifierPathHint}`;

const findCustomItemByKey = (key: string): CustomItem | undefined =>
  useCustomItemStore
    .getState()
    .customItems.findLast((item) => identifierUniqueKey(item.id) === key);

export const createCustomItemTool = defineTool({
  name: "create_custom_item",
  title: "Create custom item",
  description: `Create a custom (non-vanilla) item so it can be used as an ingredient or result. Use it when a recipe needs a modded or otherwise non-vanilla item that search_items cannot find; do not use it for vanilla items. The id must be unique among custom items and valid for the current Minecraft version. Returns { uid, ref, displayName }; "ref" is an ingredient ref that can be passed immediately to set_slots or set_crafting_pattern, and the item also appears in search_items with kind "custom_item". Example: { "id": "mymod:ruby", "displayName": "Ruby" }.

${INGREDIENT_REF_GUIDE}`,
  input,
  execute: async ({ id, displayName, texture }, { signal }) => {
    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    const trimmedId = id.trim();

    if (!isValidNamespacedIdentifier(trimmedId, version)) {
      throw new Error(`Invalid custom item id "${id}". ${getIdentifierHint(version)}`);
    }

    if (signal.aborted) {
      throw new Error("Cancelled");
    }

    const added = useCustomItemStore.getState().addCustomItem({
      name: displayName,
      rawId: trimmedId,
      texture: texture ?? "",
      version,
    });
    const key = identifierUniqueKey(parseMinecraftIdentifierInput(trimmedId, version));

    if (!added) {
      throw new Error(`A custom item with id "${trimmedId}" already exists`);
    }

    const item = findCustomItemByKey(key);

    if (!item) {
      throw new Error(`Custom item "${trimmedId}" was not created`);
    }

    return {
      uid: item.uid,
      ref: formatIngredientRef({ kind: "custom_item", uid: item.uid }, getSlotContext()),
      displayName: item.displayName,
    };
  },
});
