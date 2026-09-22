import { getRawId, getFullId } from "@/data/models/identifier/utilities";
import { lookupPotion } from "@/data/potions";
import { MinecraftVersion } from "@/data/types";
import { resolveBedrockPotionItem } from "@/lib/resolve-item-id";
import { getBrewingIssues } from "@/recipes/brewing/validation";
import { SLOTS } from "@/recipes/slots";
import {
  getRequiredSlotIdentifier,
  getSlotCount,
  isTagSlotValue,
} from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue, SlotContext } from "@/stores/recipe/types";

import { BedrockBrewingBody, JavaBrewingRecipe } from "./types";

const raw = (value: RecipeSlotValue, ctx: SlotContext) =>
  getRawId(getRequiredSlotIdentifier(value, ctx));
const javaIngredient = (value: RecipeSlotValue, ctx: SlotContext) => {
  const item = isTagSlotValue(value) ? `#${raw(value, ctx)}` : raw(value, ctx);
  const potion = value.kind === "item" && value.potion;
  if (!potion) return { item };
  return { item, potion_contents: { potions: potion } };
};

const assertValid = (recipe: Recipe, version: MinecraftVersion, ctx: SlotContext) => {
  const issue = getBrewingIssues(recipe, version, ctx)[0];
  if (issue) throw new Error(issue.message);
};

export const buildJava = (
  recipe: Recipe,
  version: MinecraftVersion,
  ctx: SlotContext,
): JavaBrewingRecipe => {
  assertValid(recipe, version, ctx);
  const input = recipe.slots[SLOTS.brewing.input]!;
  const reagent = recipe.slots[SLOTS.brewing.reagent]!;
  const output = recipe.slots[SLOTS.brewing.result]!;
  const result: JavaBrewingRecipe["output"] = { id: raw(output, ctx) };
  const count = getSlotCount(output) ?? 1;
  if (count > 1) result.count = count;
  if (output.kind === "item" && output.potion)
    result.components = { "minecraft:potion_contents": { potion: output.potion } };
  return {
    type: "minecraft:brewing",
    input: javaIngredient(input, ctx),
    reagent: javaIngredient(reagent, ctx),
    output: result,
  };
};

const bedrockItem = (value: RecipeSlotValue, ctx: SlotContext) => {
  if (value.kind === "item" && value.potion) {
    const resolved = resolveBedrockPotionItem(raw(value, ctx), value.potion);
    if (!resolved) throw new Error("Unknown Bedrock item variant");
    return `${resolved.id}:${resolved.data}`;
  }
  return getFullId(getRequiredSlotIdentifier(value, ctx));
};
const bedrockPotion = (value: RecipeSlotValue, ctx: SlotContext) => {
  const id = raw(value, ctx);
  const potion = value.kind === "item" ? value.potion : undefined;
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
  if (recipe.recipeType === "brewing_mix") {
    return {
      input: bedrockPotion(input, ctx),
      reagent: bedrockItem(reagent, ctx),
      output: resolveBedrockPotionItem(
        raw(output, ctx),
        output.kind === "item" ? (output.potion ?? "") : "",
      )
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
