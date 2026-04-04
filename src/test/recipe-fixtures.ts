import { IngredientItem, MinecraftIdentifier } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";
import { Recipe, RecipeSlotValue, recipeStateDefaults } from "@/stores/recipe";
import { cloneRecipeSlotValue, toRecipeSlotValue } from "@/stores/recipe/slot-value";

type TestSlotInput = IngredientItem | RecipeSlotValue;

type TestRecipeInput = Partial<Omit<Recipe, "slots" | "crafting" | "cooking" | "bedrock">> & {
  slots?: Partial<Record<RecipeSlot, TestSlotInput | undefined>>;
  crafting?: Partial<Recipe["crafting"]>;
  cooking?: Partial<Recipe["cooking"]>;
  bedrock?: Partial<Recipe["bedrock"]>;
};

let recipeCounter = 0;

const nextRecipeId = () => {
  recipeCounter += 1;
  return `recipe-${recipeCounter}`;
};

const cloneIdentifier = (id: MinecraftIdentifier): MinecraftIdentifier => ({ ...id });

const normalizeTestSlot = (value: TestSlotInput | undefined): RecipeSlotValue | undefined => {
  if (!value) {
    return undefined;
  }

  return "kind" in value ? cloneRecipeSlotValue(value) : toRecipeSlotValue(value);
};

export const itemSlot = (id: MinecraftIdentifier, count?: number): RecipeSlotValue => ({
  kind: "item",
  id: cloneIdentifier(id),
  ...(count !== undefined ? { count } : {}),
});

export const vanillaTagSlot = (id: MinecraftIdentifier): RecipeSlotValue => ({
  kind: "vanilla_tag",
  id: cloneIdentifier(id),
});

export const customItemSlot = (uid: string, count?: number): RecipeSlotValue => ({
  kind: "custom_item",
  uid,
  ...(count !== undefined ? { count } : {}),
});

export const customTagSlot = (uid: string): RecipeSlotValue => ({
  kind: "custom_tag",
  uid,
});

export const makeRecipe = (input: TestRecipeInput = {}): Recipe => ({
  ...recipeStateDefaults,
  ...input,
  id: input.id ?? nextRecipeId(),
  slots: Object.fromEntries(
    Object.entries(input.slots ?? {})
      .map(([slot, value]) => [slot, normalizeTestSlot(value)])
      .filter(([, value]) => value !== undefined),
  ),
  crafting: {
    ...recipeStateDefaults.crafting,
    ...input.crafting,
  },
  cooking: {
    ...recipeStateDefaults.cooking,
    ...input.cooking,
  },
  bedrock: {
    ...recipeStateDefaults.bedrock,
    ...input.bedrock,
  },
});
