import { z } from "zod";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { trackRecipeTypeChange } from "@/lib/analytics";
import {
  createRecipeAndClearInteraction,
  deleteRecipeAndClearInteraction,
  selectRecipeAndClearInteraction,
} from "@/lib/editor-actions";
import { getSlotContext } from "@/lib/slot-context";
import {
  getRecipeDefinition,
  getRecipeTypeLabel,
  getSupportedRecipeTypesForVersion,
  recipeDefinitions,
} from "@/recipes/definitions";
import { resolveRecipeNames } from "@/recipes/naming";
import { RecipeSlot } from "@/recipes/slots";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { Recipe } from "@/stores/recipe/types";
import { ensureResources } from "@/stores/resources/loader";
import { useSettingsStore } from "@/stores/settings";
import {
  getMinecraftVersionLabel,
  getRecipeCategoryOptions,
  supportsRecipeCategory,
  supportsShowNotification,
  supportsSmithingTrimPattern,
} from "@/versioning";

import { defineTool } from "../define-tool";
import { summarizeSelectedRecipe } from "../summary";

const COOKING_RECIPE_TYPES = new Set<RecipeType>([
  RecipeType.Smelting,
  RecipeType.Blasting,
  RecipeType.CampfireCooking,
  RecipeType.Smoking,
]);

/** Recipe types the editor exposes; disabled types (transmute, brewing) are excluded. */
const ENABLED_RECIPE_TYPES = Object.values(recipeDefinitions)
  .filter((definition) => definition.availability.enabled !== false)
  .map((definition) => definition.type);

const recipeTypeSchema = z
  .enum(ENABLED_RECIPE_TYPES)
  .describe(
    `Recipe type id. One of: ${ENABLED_RECIPE_TYPES.map((type) => `"${type}"`).join(", ")}. Availability depends on the Minecraft version (e.g. "smithing" is Java 1.16-1.18 only, "smithing_transform"/"smithing_trim" are 1.19.4+), so check get_editor_state.supportedRecipeTypes first.`,
  );

/** Reads the selected recipe from the live store. Throws if none is selected. */
export const getSelectedRecipeOrThrow = (): Recipe => {
  const recipe = selectCurrentRecipe(useRecipeStore.getState());

  if (!recipe) {
    throw new Error("No recipe is selected");
  }

  return recipe;
};

const findRecipeOrThrow = (recipeId: string): Recipe => {
  const recipe = useRecipeStore.getState().recipes.find((candidate) => candidate.id === recipeId);

  if (!recipe) {
    throw new Error(`Unknown recipeId "${recipeId}". Call get_editor_state to list recipes.`);
  }

  return recipe;
};

export const assertRecipeTypeSupported = (recipeType: RecipeType, version: MinecraftVersion) => {
  const supportedTypes = getSupportedRecipeTypesForVersion(version);

  if (!supportedTypes.includes(recipeType)) {
    throw new Error(
      `Recipe type "${recipeType}" is not supported in ${getMinecraftVersionLabel(version)}. Supported types: ${supportedTypes.join(", ")}`,
    );
  }
};

/**
 * Switches the selected recipe to `recipeType`, clearing every filled slot that
 * is not part of the new layout. Pushes one warning per cleared slot.
 * The caller must have validated that the type is supported.
 */
export const changeSelectedRecipeType = ({
  recipeType,
  version,
  warnings,
}: {
  recipeType: RecipeType;
  version: MinecraftVersion;
  warnings: string[];
}): void => {
  const previous = getSelectedRecipeOrThrow();

  if (previous.recipeType === recipeType) {
    return;
  }

  const store = useRecipeStore.getState();
  store.setRecipeType(recipeType);

  const updated = getSelectedRecipeOrThrow();
  const { slots: slotRules } = getRecipeDefinition(recipeType);
  const layout = new Set<RecipeSlot>(slotRules.getAutoPlace(updated));
  const label = getRecipeTypeLabel(recipeType);

  for (const slot of Object.keys(previous.slots) as RecipeSlot[]) {
    if (!previous.slots[slot]) {
      continue;
    }

    if (!layout.has(slot) || slotRules.isDisabled(updated, slot)) {
      store.setRecipeSlot(slot, undefined);
      warnings.push(`Cleared slot "${slot}" because it is not part of a ${label} recipe`);
    }
  }

  trackRecipeTypeChange({
    prev_recipe_type: previous.recipeType,
    recipe_type: recipeType,
    minecraft_version: version,
  });
};

const applyName = (name: string | null) => {
  const store = useRecipeStore.getState();

  if (name === null) {
    store.setRecipeNameMode("auto");
    return;
  }

  store.setRecipeNameMode("manual");
  store.setRecipeName(name);
};

const createRecipeInput = z.object({
  recipeType: recipeTypeSchema.optional(),
  name: z
    .string()
    .optional()
    .describe(
      "Manual recipe name (file name on Java, identifier on Bedrock). Omit for an auto-generated name.",
    ),
});

export type CreateRecipeInput = z.output<typeof createRecipeInput>;

export const createRecipeTool = defineTool({
  name: "create_recipe",
  title: "Create recipe",
  description: `Create a new, empty recipe, select it and return its summary. Use this to start a new recipe instead of overwriting the selected one; subsequent slot and option tools act on the newly created recipe.

Optionally set the recipe type and a manual name right away; both can be changed later with update_recipe. Recipe types: crafting (default), smelting, blasting, smoking, campfire_cooking, stonecutter, smithing (Java 1.16-1.18), smithing_transform and smithing_trim (1.19.4+); the type must be supported by the current Minecraft version (see get_editor_state.supportedRecipeTypes). Example: { "recipeType": "smelting", "name": "iron_from_ore" }.`,
  input: createRecipeInput,
  execute: async ({ recipeType, name }, { signal }) => {
    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    if (signal.aborted) {
      throw new Error("Cancelled");
    }

    if (recipeType !== undefined) {
      assertRecipeTypeSupported(recipeType, version);
    }

    createRecipeAndClearInteraction();

    if (recipeType !== undefined) {
      useRecipeStore.getState().setRecipeType(recipeType);
    }

    if (name !== undefined) {
      applyName(name);
    }

    return summarizeSelectedRecipe();
  },
});

const selectRecipeInput = z.object({
  recipeId: z.string().describe("Id of the recipe to select, as listed by get_editor_state."),
});

export type SelectRecipeInput = z.output<typeof selectRecipeInput>;

export const selectRecipeTool = defineTool({
  name: "select_recipe",
  title: "Select recipe",
  description: `Select an existing recipe by id and return its summary. All other editing tools operate on the selected recipe, so call this before editing a recipe that is not currently selected. Recipe ids come from get_editor_state. Example: { "recipeId": "recipe-abc123" }.`,
  input: selectRecipeInput,
  execute: async ({ recipeId }) => {
    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    findRecipeOrThrow(recipeId);
    selectRecipeAndClearInteraction(recipeId);

    return summarizeSelectedRecipe();
  },
});

const deleteRecipeInput = z.object({
  recipeId: z.string().describe("Id of the recipe to delete, as listed by get_editor_state."),
});

export type DeleteRecipeInput = z.output<typeof deleteRecipeInput>;

export const deleteRecipeTool = defineTool({
  name: "delete_recipe",
  title: "Delete recipe",
  description: `Delete a recipe by id. This is irreversible: the recipe and its slots are removed immediately without confirmation. The editor always keeps at least one recipe, so the last remaining recipe cannot be deleted (create another one first). If the deleted recipe was selected, the next recipe becomes selected. Returns the deleted id and title plus the summary of the now-selected recipe. Example: { "recipeId": "recipe-abc123" }.`,
  input: deleteRecipeInput,
  execute: async ({ recipeId }, { signal }) => {
    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    if (signal.aborted) {
      throw new Error("Cancelled");
    }

    findRecipeOrThrow(recipeId);

    const { recipes } = useRecipeStore.getState();

    if (recipes.length <= 1) {
      throw new Error("Cannot delete the last recipe; create another recipe first");
    }

    const { bedrockNamespace } = useSettingsStore.getState();
    const naming = resolveRecipeNames(recipes, { bedrockNamespace }, getSlotContext());
    const deletedTitle = naming.byId[recipeId]?.sidebarTitle ?? "";

    deleteRecipeAndClearInteraction(recipeId);

    return {
      deletedId: recipeId,
      deletedTitle,
      selectedRecipe: summarizeSelectedRecipe(),
    };
  },
});

const updateRecipeInput = z.object({
  recipeType: recipeTypeSchema.optional(),
  name: z
    .string()
    .nullable()
    .optional()
    .describe("Manual recipe name. Pass null to switch back to the auto-generated name."),
  group: z
    .string()
    .optional()
    .describe(
      'Recipe book group; recipes sharing a group are collapsed together. Pass "" to clear.',
    ),
  category: z
    .string()
    .optional()
    .describe(
      'Recipe book category (Java 1.19.4+). Allowed values depend on the recipe type, see get_editor_state.categoryOptions. Pass "" to clear.',
    ),
  showNotification: z
    .boolean()
    .optional()
    .describe(
      "Whether unlocking the recipe shows a toast (Java 1.19.4+ shaped crafting; 26.1+ for most other types).",
    ),
  crafting: z
    .object({
      shapeless: z
        .boolean()
        .optional()
        .describe("true for a shapeless recipe (grid positions ignored)."),
      keepWhitespace: z
        .boolean()
        .optional()
        .describe(
          "Keep empty leading/trailing rows and columns in the generated pattern instead of trimming them.",
        ),
      twoByTwo: z
        .boolean()
        .optional()
        .describe("Restrict the grid to 2x2 (inventory crafting). Java only."),
    })
    .optional()
    .describe("Crafting-only options."),
  cooking: z
    .object({
      time: z
        .int()
        .min(0)
        .nullable()
        .optional()
        .describe("Cooking time in ticks. Pass null for the type's default."),
      experience: z.number().min(0).optional().describe("Experience granted, e.g. 0.7."),
    })
    .optional()
    .describe("Options for smelting, blasting, smoking and campfire_cooking recipes."),
  smithing: z
    .object({
      trimPattern: z
        .string()
        .optional()
        .describe(
          'Trim pattern id for smithing_trim recipes on Java 1.21.5+, e.g. "minecraft:sentry".',
        ),
    })
    .optional()
    .describe("Smithing-only options."),
  bedrock: z
    .object({
      identifierName: z
        .string()
        .nullable()
        .optional()
        .describe(
          "Manual Bedrock recipe identifier (without namespace). Pass null for an auto-generated identifier.",
        ),
      priority: z.int().optional().describe("Bedrock recipe priority (crafting only)."),
    })
    .optional()
    .describe("Bedrock-only options."),
});

export type UpdateRecipeInput = z.output<typeof updateRecipeInput>;

const collectUpdateWarnings = ({
  input,
  recipe,
  recipeType,
  version,
}: {
  input: UpdateRecipeInput;
  recipe: Recipe;
  recipeType: RecipeType;
  version: MinecraftVersion;
}): string[] => {
  const warnings: string[] = [];
  const label = getRecipeTypeLabel(recipeType);
  const versionLabel = getMinecraftVersionLabel(version);
  const isBedrock = version === MinecraftVersion.Bedrock;

  if (input.category !== undefined && !supportsRecipeCategory(version, recipeType)) {
    warnings.push(`category is ignored for ${label} recipes in ${versionLabel}`);
  }

  if (input.showNotification !== undefined) {
    const shapeless = input.crafting?.shapeless ?? recipe.crafting.shapeless;

    if (!supportsShowNotification(version, recipeType, shapeless)) {
      warnings.push(`showNotification is ignored for ${label} recipes in ${versionLabel}`);
    }
  }

  if (input.crafting !== undefined && recipeType !== RecipeType.Crafting) {
    warnings.push(`crafting options are ignored for ${label} recipes`);
  }

  if (input.cooking !== undefined && !COOKING_RECIPE_TYPES.has(recipeType)) {
    warnings.push(`cooking options are ignored for ${label} recipes`);
  }

  if (input.smithing?.trimPattern !== undefined) {
    if (recipeType !== RecipeType.SmithingTrim) {
      warnings.push(`smithing.trimPattern is ignored for ${label} recipes`);
    } else if (!supportsSmithingTrimPattern(version)) {
      warnings.push(`smithing.trimPattern is ignored in ${versionLabel}`);
    }
  }

  if (input.bedrock !== undefined && !isBedrock) {
    warnings.push(`bedrock options are ignored in ${versionLabel}`);
  }

  return warnings;
};

const validateUpdate = ({
  input,
  recipeType,
  version,
}: {
  input: UpdateRecipeInput;
  recipeType: RecipeType;
  version: MinecraftVersion;
}): void => {
  if (input.recipeType !== undefined) {
    assertRecipeTypeSupported(input.recipeType, version);
  }

  if (input.category !== undefined && input.category !== "") {
    const options = getRecipeCategoryOptions(recipeType);

    if (options && !options.includes(input.category)) {
      throw new Error(
        `Unknown category "${input.category}" for ${getRecipeTypeLabel(recipeType)} recipes. Options: ${options.join(", ")}`,
      );
    }
  }

  if (input.crafting?.twoByTwo !== undefined && version === MinecraftVersion.Bedrock) {
    throw new Error("2x2 crafting is Java only");
  }
};

const applyUpdate = (input: UpdateRecipeInput): void => {
  const store = useRecipeStore.getState();

  if (input.name !== undefined) {
    applyName(input.name);
  }

  if (input.group !== undefined) {
    store.setRecipeGroup(input.group);
  }

  if (input.category !== undefined) {
    store.setRecipeCategory(input.category);
  }

  if (input.showNotification !== undefined) {
    store.setRecipeShowNotification(input.showNotification);
  }

  if (input.crafting?.shapeless !== undefined) {
    store.setRecipeCraftingShapeless(input.crafting.shapeless);
  }

  if (input.crafting?.keepWhitespace !== undefined) {
    store.setRecipeCraftingKeepWhitespace(input.crafting.keepWhitespace);
  }

  if (input.crafting?.twoByTwo !== undefined) {
    store.setRecipeCraftingTwoByTwo(input.crafting.twoByTwo);
  }

  if (input.cooking?.time !== undefined) {
    store.setRecipeCookingTime(input.cooking.time);
  }

  if (input.cooking?.experience !== undefined) {
    store.setRecipeCookingExperience(input.cooking.experience);
  }

  if (input.smithing?.trimPattern !== undefined) {
    store.setRecipeSmithingTrimPattern(input.smithing.trimPattern);
  }

  if (input.bedrock?.identifierName !== undefined) {
    if (input.bedrock.identifierName === null) {
      store.setRecipeBedrockIdentifierMode("auto");
    } else {
      store.setRecipeBedrockIdentifierMode("manual");
      store.setRecipeBedrockIdentifierName(input.bedrock.identifierName);
    }
  }

  if (input.bedrock?.priority !== undefined) {
    store.setRecipeBedrockPriority(input.bedrock.priority);
  }
};

export const updateRecipeTool = defineTool({
  name: "update_recipe",
  title: "Update recipe options",
  description: `Update options of the selected recipe: type, name, group, category, notification flag and the type-specific crafting/cooking/smithing/bedrock settings. Only the fields you pass are changed; at least one field is required. Use set_slots or set_crafting_pattern to change ingredients.

Recipe types: crafting, smelting, blasting, smoking, campfire_cooking, stonecutter, smithing (Java 1.16-1.18), smithing_transform and smithing_trim (1.19.4+); check get_editor_state.supportedRecipeTypes before changing "recipeType". Changing "recipeType" clears every slot that is not part of the new type's layout (reported as warnings). Fields that do not apply to the recipe type or Minecraft version are still stored but reported as warnings, except "crafting.twoByTwo" on Bedrock and an invalid "category", which are rejected. Pass null for "name" or "bedrock.identifierName" to return to auto-generated values. Example: { "recipeType": "smelting", "name": "iron_from_ore", "cooking": { "time": 200, "experience": 0.7 } }.`,
  input: updateRecipeInput,
  execute: async (input, { signal }) => {
    if (Object.keys(input).length === 0) {
      throw new Error("No fields provided");
    }

    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    if (signal.aborted) {
      throw new Error("Cancelled");
    }

    const recipe = getSelectedRecipeOrThrow();
    const recipeType = input.recipeType ?? recipe.recipeType;

    validateUpdate({ input, recipeType, version });

    const warnings: string[] = [];

    if (input.recipeType !== undefined) {
      changeSelectedRecipeType({ recipeType: input.recipeType, version, warnings });
    }

    warnings.push(...collectUpdateWarnings({ input, recipe, recipeType, version }));
    applyUpdate(input);

    return summarizeSelectedRecipe(warnings);
  },
});
