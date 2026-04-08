import { getRawId } from "@/data/models/identifier/utilities";
import { RecipeType, SLOTS } from "@/data/types";
import { sanitizeBedrockIdentifierPart } from "@/lib/minecraft-identifier";
import { uniqueNonEmpty } from "@/recipes/utils";
import { getSlotIdentifier } from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue, SlotContext } from "@/stores/recipe/types";

const FALLBACK_NAME = "recipe";

const sanitizeRecipeNameValue = (value: string) => sanitizeBedrockIdentifierPart(value);

const ensureName = (value: string | undefined) => {
  const sanitized = sanitizeRecipeNameValue(value ?? "");
  return sanitized || FALLBACK_NAME;
};

const toNames = (...values: Array<string | undefined>) =>
  uniqueNonEmpty(
    values.flatMap((value) => {
      if (!value) {
        return [];
      }

      const name = sanitizeRecipeNameValue(value);
      return name ? [name] : [];
    }),
  );

const itemSlug = (slot: RecipeSlotValue | undefined, slotContext: SlotContext) => {
  const identifier = getSlotIdentifier(slot, slotContext);
  if (!identifier) return undefined;

  const raw = getRawId(identifier);
  const base = raw.startsWith("minecraft:")
    ? raw.slice("minecraft:".length)
    : raw.replace(":", "_");
  const slug = sanitizeRecipeNameValue(base.replace(/[:/.-]+/g, "_"));

  if (!slug) {
    return undefined;
  }

  if (identifier.data === undefined || identifier.data === 0) {
    return slug;
  }

  return `${slug}_data_${identifier.data}`;
};

const buildCookingNames = (
  result: string | undefined,
  ingredient: string | undefined,
  {
    fallback,
    resultSuffix,
    ingredientSuffix,
    extras = [],
  }: {
    fallback: string;
    resultSuffix: string;
    ingredientSuffix: string;
    extras?: Array<string | undefined>;
  },
) => {
  let base = fallback;

  if (result) {
    base = `${result}${resultSuffix}`;
  } else if (ingredient) {
    base = `${ingredient}${ingredientSuffix}`;
  }

  return toNames(ensureName(base), ...extras);
};

export const getCraftingAutoNames = (recipe: Recipe, slotContext: SlotContext) =>
  toNames(itemSlug(recipe.slots[SLOTS.crafting.result], slotContext) ?? "crafting_recipe");

export const getTransmuteAutoNames = (recipe: Recipe, slotContext: SlotContext) =>
  toNames(
    itemSlug(recipe.slots[SLOTS.crafting.result], slotContext) ?? "crafting_transmute_recipe",
  );

export const getCookingAutoNames = (recipe: Recipe, slotContext: SlotContext) => {
  const result = itemSlug(recipe.slots[SLOTS.cooking.result], slotContext);
  const ingredient = itemSlug(recipe.slots[SLOTS.cooking.ingredient], slotContext);

  switch (recipe.recipeType) {
    case RecipeType.Smelting:
      return buildCookingNames(result, ingredient, {
        fallback: "smelting",
        resultSuffix: "_from_smelting",
        ingredientSuffix: "_smelting",
        extras: [
          result && ingredient ? `${result}_from_smelting_${ingredient}` : undefined,
          result,
        ],
      });
    case RecipeType.Blasting:
      return buildCookingNames(result, ingredient, {
        fallback: "blasting",
        resultSuffix: "_from_blasting",
        ingredientSuffix: "_blasting",
        extras: [result && ingredient ? `${result}_from_blasting_${ingredient}` : undefined],
      });
    case RecipeType.Smoking:
      return buildCookingNames(result, ingredient, {
        fallback: "smoking",
        resultSuffix: "_from_smoking",
        ingredientSuffix: "_smoking",
      });
    case RecipeType.CampfireCooking:
      return buildCookingNames(result, ingredient, {
        fallback: "campfire_cooking",
        resultSuffix: "_from_campfire_cooking",
        ingredientSuffix: "_campfire_cooking",
      });
    default:
      return [FALLBACK_NAME];
  }
};

export const getStonecuttingAutoNames = (recipe: Recipe, slotContext: SlotContext) => {
  const result = itemSlug(recipe.slots[SLOTS.stonecutter.result], slotContext);
  const ingredient = itemSlug(recipe.slots[SLOTS.stonecutter.ingredient], slotContext);
  let base = "stonecutting_recipe";

  if (result && ingredient) {
    base = `${result}_from_${ingredient}_stonecutting`;
  } else if (result) {
    base = `${result}_stonecutting`;
  } else if (ingredient) {
    base = `${ingredient}_stonecutting`;
  }

  return toNames(ensureName(base));
};

export const getSmithingAutoNames = (recipe: Recipe, slotContext: SlotContext) => {
  const result = itemSlug(recipe.slots[SLOTS.smithing.result], slotContext);
  const template = itemSlug(recipe.slots[SLOTS.smithing.template], slotContext);
  const baseItem = itemSlug(recipe.slots[SLOTS.smithing.base], slotContext);

  if (recipe.recipeType === RecipeType.SmithingTrim) {
    return toNames(template ? `${template}_smithing_trim` : "smithing_trim");
  }

  let base = "smithing_recipe";

  if (result) {
    base = `${result}_smithing`;
  } else if (baseItem) {
    base = `${baseItem}_smithing`;
  }

  return toNames(base);
};
