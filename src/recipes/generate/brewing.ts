import { getRawId, getFullId } from "@/data/models/identifier/utilities";
import { lookupPotion } from "@/data/potions";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { resolveBedrockPotionItem } from "@/lib/resolve-item-id";
import { getBrewingIssues } from "@/recipes/brewing/validation";
import { SLOTS } from "@/recipes/slots";
import {
  getRequiredSlotIdentifier,
  getSlotCount,
  getSlotPotion,
  isTagSlotValue,
} from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue, SlotContext } from "@/stores/recipe/types";

import { BedrockBrewingBody, JavaBrewingRecipe } from "./types";

import type { GenerateArgs } from "../definitions/types";

const raw = (value: RecipeSlotValue, ctx: SlotContext) =>
  getRawId(getRequiredSlotIdentifier(value, ctx));
const javaIngredient = (value: RecipeSlotValue, ctx: SlotContext) => {
  const item = isTagSlotValue(value) ? `#${raw(value, ctx)}` : raw(value, ctx);
  const potion = getSlotPotion(value);
  if (!potion) return { item };
  return { item, potion_contents: { potions: potion } };
};

const assertValid = (recipe: Recipe, version: MinecraftVersion, ctx: SlotContext) => {
  const issue = getBrewingIssues(recipe, version, ctx)[0];
  if (issue) throw new Error(issue.message);
};

export const buildJava = ({
  recipe,
  version,
  formatter,
  slotContext: ctx,
}: GenerateArgs): JavaBrewingRecipe => {
  assertValid(recipe, version, ctx);
  const input = recipe.slots[SLOTS.brewing.input]!;
  const reagent = recipe.slots[SLOTS.brewing.reagent]!;
  const output = recipe.slots[SLOTS.brewing.result]!;
  const count = getSlotCount(output) ?? 1;
  const result = formatter.objectResult(
    getRequiredSlotIdentifier(output, ctx),
    count > 1 ? count : undefined,
    output.kind === "item" ? output.components : undefined,
  );
  if (!("id" in result)) throw new Error("Java brewing requires an item-stack result");
  return {
    type: "minecraft:brewing",
    input: javaIngredient(input, ctx),
    reagent: javaIngredient(reagent, ctx),
    output: result,
  };
};

const bedrockItem = (value: RecipeSlotValue, ctx: SlotContext) => {
  const potion = getSlotPotion(value);
  if (potion) {
    const resolved = resolveBedrockPotionItem(raw(value, ctx), potion);
    if (!resolved) throw new Error("Unknown Bedrock item variant");
    return `${resolved.id}:${resolved.data}`;
  }
  return getFullId(getRequiredSlotIdentifier(value, ctx));
};
const bedrockPotion = (value: RecipeSlotValue, ctx: SlotContext) => {
  const id = raw(value, ctx);
  const potion = getSlotPotion(value);
  const found =
    potion !== undefined && ctx.potionCatalog
      ? lookupPotion(ctx.potionCatalog, { id, potion }, true)
      : undefined;
  if (!found?.bedrockPotion) throw new Error("Unknown Bedrock potion");
  const suffix = found.bedrockPotion.replace(/^minecraft:/, "");
  return `minecraft:potion_type:${suffix}`;
};

export const buildBedrock = (recipe: Recipe, ctx: SlotContext): BedrockBrewingBody => {
  assertValid(recipe, MinecraftVersion.Bedrock, ctx);
  const input = recipe.slots[SLOTS.brewing.input]!;
  const reagent = recipe.slots[SLOTS.brewing.reagent]!;
  const output = recipe.slots[SLOTS.brewing.result]!;
  if (recipe.recipeType === RecipeType.BrewingMix) {
    return {
      input: bedrockPotion(input, ctx),
      reagent: bedrockItem(reagent, ctx),
      // mapped item variants like tipped arrows use native data values, potions use type aliases
      output: resolveBedrockPotionItem(raw(output, ctx), getSlotPotion(output) ?? "")
        ? bedrockItem(output, ctx)
        : bedrockPotion(output, ctx),
    };
  }
  return {
    input: bedrockItem(input, ctx),
    reagent: bedrockItem(reagent, ctx),
    output: bedrockItem(output, ctx),
  };
};
