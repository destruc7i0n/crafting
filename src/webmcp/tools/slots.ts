import { z } from "zod";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { clearSelectedRecipeAndSlotSelection } from "@/lib/editor-actions";
import { getSlotContext } from "@/lib/slot-context";
import { RecipeSlot, SLOTS } from "@/recipes/slots";
import { useRecipeStore } from "@/stores/recipe";
import { Recipe, RecipeSlotValue } from "@/stores/recipe/types";
import { ensureResources } from "@/stores/resources/loader";
import { useSettingsStore } from "@/stores/settings";
import { useUIStore } from "@/stores/ui";

import { defineTool } from "../define-tool";
import { CRAFTING_GRID_GUIDE, INGREDIENT_REF_GUIDE, SLOTS_BY_TYPE_GUIDE } from "../guide";
import { resolveIngredientRef } from "../ingredient-ref";
import {
  ALL_RECIPE_SLOTS,
  assertSlotAllowed,
  assertSlotValueAllowed,
  isRecipeSlot,
} from "../slot-rules";
import { summarizeSelectedRecipe } from "../summary";
import {
  assertRecipeTypeSupported,
  changeSelectedRecipeType,
  getSelectedRecipeOrThrow,
} from "./recipes";

const GRID_WIDTH = 3;
const TWO_BY_TWO_SIZE = 2;
const EMPTY_CELL = " ";

const CRAFTING_GRID_SLOTS: RecipeSlot[] = [
  SLOTS.crafting.slot1,
  SLOTS.crafting.slot2,
  SLOTS.crafting.slot3,
  SLOTS.crafting.slot4,
  SLOTS.crafting.slot5,
  SLOTS.crafting.slot6,
  SLOTS.crafting.slot7,
  SLOTS.crafting.slot8,
  SLOTS.crafting.slot9,
];

type SlotWrite = { slot: RecipeSlot; value: RecipeSlotValue | undefined };

const countSchema = z
  .int()
  .min(1)
  .max(64)
  .describe(
    "Stack size, 1-64. Only allowed on the result slot of recipe types with editable counts.",
  );

const withCount = (value: RecipeSlotValue, count: number | undefined): RecipeSlotValue => {
  if (count === undefined || (value.kind !== "item" && value.kind !== "custom_item")) {
    return value;
  }

  return { ...value, count };
};

const parseSlotId = (key: string): RecipeSlot => {
  if (!isRecipeSlot(key)) {
    throw new Error(`Unknown slot "${key}". Valid slots: ${ALL_RECIPE_SLOTS.join(", ")}`);
  }

  return key;
};

const applySlotWrites = (writes: SlotWrite[]): void => {
  const store = useRecipeStore.getState();

  for (const { slot, value } of writes) {
    store.setRecipeSlot(slot, value);
  }

  useUIStore.getState().clearInteractionState();
};

const setSlotsInput = z.object({
  slots: z
    .record(
      z.string().describe('Slot id, e.g. "crafting.1" or "cooking.result".'),
      z.union([
        z.string().describe("Ingredient ref."),
        z.object({
          item: z.string().describe("Ingredient ref."),
          count: countSchema.optional(),
        }),
        z.null().describe("Clear the slot."),
      ]),
    )
    .describe("Map of slot id to ingredient ref, { item, count } object, or null to clear."),
});

export type SetSlotsInput = z.output<typeof setSlotsInput>;

export const setSlotsTool = defineTool({
  name: "set_slots",
  title: "Set recipe slots",
  description: `Set, replace or clear individual slots of the selected recipe by slot id. Use this for cooking, stonecutter and smithing recipes, or to tweak single crafting cells; for a whole crafting grid prefer set_crafting_pattern. Slots not mentioned are left untouched. Every slot and ref is validated before anything is written, so an error means nothing changed.

Each value is an ingredient ref string, an object { "item": ref, "count": n } to also set a stack size (result slots only, where the recipe type allows it), or null to clear the slot. Result slots must hold an item, not a tag. Example: { "slots": { "cooking.ingredient": "minecraft:iron_ore", "cooking.result": { "item": "minecraft:iron_ingot" } } }.

${SLOTS_BY_TYPE_GUIDE}

${CRAFTING_GRID_GUIDE}

${INGREDIENT_REF_GUIDE}`,
  input: setSlotsInput,
  execute: async ({ slots }, { signal }) => {
    const entries = Object.entries(slots);

    if (entries.length === 0) {
      throw new Error("No slots provided");
    }

    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    if (signal.aborted) {
      throw new Error("Cancelled");
    }

    const recipe = getSelectedRecipeOrThrow();
    const slotContext = getSlotContext();
    const writes: SlotWrite[] = [];

    for (const [key, rawValue] of entries) {
      const slot = parseSlotId(key);
      assertSlotAllowed(recipe, slot);

      if (rawValue === null) {
        writes.push({ slot, value: undefined });
        continue;
      }

      const { ref, count } =
        typeof rawValue === "string"
          ? { ref: rawValue, count: undefined }
          : { ref: rawValue.item, count: rawValue.count };
      const value = resolveIngredientRef({ ref, slotContext });

      assertSlotValueAllowed({ recipe, slot, value, count, version });
      writes.push({ slot, value: withCount(value, count) });
    }

    applySlotWrites(writes);

    return summarizeSelectedRecipe();
  },
});

const setCraftingPatternInput = z.object({
  pattern: z
    .array(z.string().max(GRID_WIDTH))
    .min(1)
    .max(GRID_WIDTH)
    .describe("1-3 rows of up to 3 characters each, anchored top-left. Spaces are empty cells."),
  key: z
    .record(z.string().length(1), z.string().describe("Ingredient ref."))
    .describe("Maps each pattern character to an ingredient ref (items or tags)."),
  result: z.string().describe("Ingredient ref of the result item (tags are not allowed)."),
  resultCount: z
    .int()
    .min(1)
    .max(64)
    .optional()
    .describe("Stack size of the result, 1-64. Defaults to 1."),
  shapeless: z
    .boolean()
    .optional()
    .describe("Set crafting.shapeless; omit to keep the current setting."),
});

export type SetCraftingPatternInput = z.output<typeof setCraftingPatternInput>;

const getPatternWidth = (pattern: string[]): number =>
  pattern.reduce((width, row) => Math.max(width, row.length), 0);

const isEmptyRow = (row: string): boolean => row.trim().length === 0;

const isEmptyColumn = (pattern: string[], column: number): boolean =>
  pattern.every((row) => (row[column] ?? EMPTY_CELL) === EMPTY_CELL);

const hasTrimmableWhitespace = (pattern: string[]): boolean => {
  const width = getPatternWidth(pattern);
  const firstRow = pattern[0] ?? "";
  const lastRow = pattern[pattern.length - 1] ?? "";

  if (isEmptyRow(firstRow) || isEmptyRow(lastRow)) {
    return true;
  }

  return width > 0 && (isEmptyColumn(pattern, 0) || isEmptyColumn(pattern, width - 1));
};

const validatePatternKeys = (pattern: string[], key: Record<string, string>): string[] => {
  const warnings: string[] = [];
  const usedChars = new Set<string>();

  for (const row of pattern) {
    for (const char of row) {
      if (char === EMPTY_CELL) {
        continue;
      }

      if (!(char in key)) {
        throw new Error(`Pattern character "${char}" is not defined in key`);
      }

      usedChars.add(char);
    }
  }

  for (const char of Object.keys(key)) {
    if (!usedChars.has(char)) {
      warnings.push(`Key "${char}" is not used in the pattern`);
    }
  }

  return warnings;
};

const assertPatternFitsTwoByTwo = (recipe: Recipe, pattern: string[]): void => {
  if (!recipe.crafting.twoByTwo) {
    return;
  }

  if (pattern.length > TWO_BY_TWO_SIZE || getPatternWidth(pattern) > TWO_BY_TWO_SIZE) {
    throw new Error(
      "twoByTwo is enabled: pattern must be at most 2x2 (or disable it with update_recipe)",
    );
  }
};

const resolvePatternWrites = ({
  pattern,
  key,
  recipe,
  version,
}: {
  pattern: string[];
  key: Record<string, string>;
  recipe: Recipe;
  version: MinecraftVersion;
}): SlotWrite[] => {
  const slotContext = getSlotContext();
  const valuesByChar = new Map<string, RecipeSlotValue>();

  for (const [char, ref] of Object.entries(key)) {
    const value = resolveIngredientRef({ ref, slotContext });
    assertSlotValueAllowed({ recipe, slot: SLOTS.crafting.slot1, value, version });
    valuesByChar.set(char, value);
  }

  const writes: SlotWrite[] = CRAFTING_GRID_SLOTS.map((slot) => ({ slot, value: undefined }));

  pattern.forEach((row, rowIndex) => {
    for (const [columnIndex, char] of Array.from(row).entries()) {
      if (char === EMPTY_CELL) {
        continue;
      }

      const write = writes[rowIndex * GRID_WIDTH + columnIndex];

      if (write) {
        write.value = valuesByChar.get(char);
      }
    }
  });

  return writes;
};

export const setCraftingPatternTool = defineTool({
  name: "set_crafting_pattern",
  title: "Set crafting pattern",
  description: `Fill the selected recipe's crafting grid from a vanilla-style shaped pattern, in the same shape as Minecraft's crafting JSON: "pattern" rows, a "key" mapping characters to ingredient refs, and a "result". This replaces the entire grid and result slot; cells not covered by the pattern become empty. If the selected recipe is not a crafting recipe it is switched to crafting (slots of the old type are cleared, reported as warnings).

Rows are anchored to the top-left of the 3x3 grid and spaces mean empty cells; use up to 3 rows of up to 3 characters. Every non-space character must appear in "key". When crafting.twoByTwo is enabled the pattern must fit in 2x2. Nothing is written if any ref or the pattern is invalid. Example: { "pattern": ["###", " / ", " / "], "key": { "#": "#minecraft:planks", "/": "minecraft:stick" }, "result": "minecraft:wooden_pickaxe" }.

${CRAFTING_GRID_GUIDE}

${INGREDIENT_REF_GUIDE}`,
  input: setCraftingPatternInput,
  execute: async ({ pattern, key, result, resultCount, shapeless }, { signal }) => {
    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    if (signal.aborted) {
      throw new Error("Cancelled");
    }

    const current = getSelectedRecipeOrThrow();
    const warnings: string[] = [];
    const needsTypeChange = current.recipeType !== RecipeType.Crafting;

    if (needsTypeChange) {
      assertRecipeTypeSupported(RecipeType.Crafting, version);
    }

    const recipe: Recipe = needsTypeChange
      ? { ...current, recipeType: RecipeType.Crafting }
      : current;

    warnings.push(...validatePatternKeys(pattern, key));
    assertPatternFitsTwoByTwo(recipe, pattern);

    const gridWrites = resolvePatternWrites({ pattern, key, recipe, version });
    const resultValue = resolveIngredientRef({ ref: result, slotContext: getSlotContext() });

    assertSlotValueAllowed({
      recipe,
      slot: SLOTS.crafting.result,
      value: resultValue,
      count: resultCount,
      version,
    });

    if (needsTypeChange) {
      warnings.push(`Recipe type changed from ${current.recipeType} to ${RecipeType.Crafting}`);
      changeSelectedRecipeType({ recipeType: RecipeType.Crafting, version, warnings });
    }

    applySlotWrites([
      ...gridWrites,
      { slot: SLOTS.crafting.result, value: withCount(resultValue, resultCount) },
    ]);

    if (shapeless !== undefined) {
      useRecipeStore.getState().setRecipeCraftingShapeless(shapeless);
    }

    if (!recipe.crafting.keepWhitespace && hasTrimmableWhitespace(pattern)) {
      warnings.push(
        "Whitespace rows/columns are trimmed in the generated JSON unless crafting.keepWhitespace is true",
      );
    }

    return summarizeSelectedRecipe(warnings);
  },
});

const clearRecipeSlotsInput = z.object({});

export type ClearRecipeSlotsInput = z.output<typeof clearRecipeSlotsInput>;

export const clearRecipeSlotsTool = defineTool({
  name: "clear_recipe_slots",
  title: "Clear recipe slots",
  description: `Empty every slot of the selected recipe while keeping its type, name and options. Use this to start the ingredients over; to remove the whole recipe use delete_recipe instead. Takes no arguments. Example: {}.`,
  input: clearRecipeSlotsInput,
  execute: async () => {
    const version = useSettingsStore.getState().minecraftVersion;
    await ensureResources(version);

    getSelectedRecipeOrThrow();
    clearSelectedRecipeAndSlotSelection();

    return summarizeSelectedRecipe();
  },
});
