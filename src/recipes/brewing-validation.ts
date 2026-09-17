import { getPotionChoices, lookupPotion } from "@/data/potions";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { resolveBedrockPotionItem } from "@/lib/resolve-item-id";
import { RecipeSlot, SLOTS } from "@/recipes/slots";
import {
  getSlotIdentifier,
  getSlotCount,
  hasMissingCustomRef,
  isTagSlotValue,
} from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue, SlotContext } from "@/stores/recipe/types";

import { brewingCountLimit, isBrewingBottle } from "./brewing-options";

export type BrewingIssue = {
  message: string;
  slot?: RecipeSlot;
  kind: "incomplete" | "invalid" | "loading";
};

const slots = [SLOTS.brewing.input, SLOTS.brewing.reagent, SLOTS.brewing.result] as const;
const rawId = (value: RecipeSlotValue, ctx: SlotContext) => {
  const id = getSlotIdentifier(value, ctx);
  return id ? `${id.namespace}:${id.id}` : undefined;
};
const validIdentifier = (value: RecipeSlotValue, ctx: SlotContext) => {
  const id = getSlotIdentifier(value, ctx);
  return !!id && /^[a-z0-9_.-]+$/.test(id.namespace) && /^[a-z0-9_./-]+$/.test(id.id);
};

export function getBrewingIssues(
  recipe: Recipe,
  version: MinecraftVersion,
  ctx: SlotContext,
): BrewingIssue[] {
  if (
    ![RecipeType.Brewing, RecipeType.BrewingContainer, RecipeType.BrewingMix].includes(
      recipe.recipeType,
    )
  ) {
    return [];
  }
  const issues: (Omit<BrewingIssue, "kind"> & { kind?: BrewingIssue["kind"] })[] = [];
  const input = recipe.slots[SLOTS.brewing.input];
  const reagent = recipe.slots[SLOTS.brewing.reagent];
  const result = recipe.slots[SLOTS.brewing.result];
  for (const slot of slots) {
    const value = recipe.slots[slot];
    if (!value) issues.push({ message: "Choose an item", slot, kind: "incomplete" });
    else if (hasMissingCustomRef(value, ctx))
      issues.push({ message: "Recipe references an unresolved custom reference", slot });
    const count = value ? (getSlotCount(value) ?? 1) : 1;
    const limit = brewingCountLimit(recipe.recipeType, slot, value);
    if (!Number.isInteger(count) || count < 1 || count > limit)
      issues.push({
        message:
          limit === 1
            ? "Brewing slots must have count 1"
            : "Arrow count must be a whole number from 1 to 64",
        slot,
      });
    if (value && !validIdentifier(value, ctx))
      issues.push({ message: "Brewing recipes require valid item identifiers", slot });
    if (
      value &&
      getSlotIdentifier(value, ctx)?.data !== undefined &&
      !(
        version === MinecraftVersion.Bedrock &&
        slot === SLOTS.brewing.reagent &&
        rawId(value, ctx) === "minecraft:arrow" &&
        getSlotIdentifier(value, ctx)?.data === 0
      )
    )
      issues.push({ message: "Brewing recipes do not support item data values", slot });
  }
  if (
    ctx.potionCatalogError &&
    [input, reagent, result].some((value) => value?.kind === "item" && value.potion !== undefined)
  )
    issues.push({ message: "Potion catalog is unavailable" });

  if (version === MinecraftVersion.Bedrock) {
    if (recipe.recipeType === RecipeType.BrewingMix) {
      for (const [slot, value] of [
        [SLOTS.brewing.input, input],
        [SLOTS.brewing.result, result],
      ] as const) {
        if (!value) continue;
        if (value.kind !== "item")
          issues.push({ message: "Choose a regular, splash, or lingering potion bottle.", slot });
        else {
          if (
            (!isBrewingBottle(value.id.id) &&
              !(slot === SLOTS.brewing.result && value.id.id === "arrow")) ||
            value.id.namespace !== "minecraft"
          )
            issues.push({ message: "Choose a regular, splash, or lingering potion bottle.", slot });
          if (value.potion === undefined || value.potion.length === 0)
            issues.push({ message: "Choose a potion", slot, kind: "incomplete" });
          else if (
            !ctx.potionCatalog ||
            !lookupPotion(
              ctx.potionCatalog,
              { id: `${value.id.namespace}:${value.id.id}`, potion: value.potion },
              true,
            )
          )
            issues.push({
              message: "Unknown Bedrock potion",
              slot,
              kind: !ctx.potionCatalog && !ctx.potionCatalogError ? "loading" : "invalid",
            });
        }
      }
      if (
        input?.kind === "item" &&
        result?.kind === "item" &&
        isBrewingBottle(input.id.id) &&
        isBrewingBottle(result.id.id) &&
        (input.id.namespace !== result.id.namespace || input.id.id !== result.id.id)
      )
        issues.push({
          message: "Brewing mix input and output bottles must match",
          slot: SLOTS.brewing.result,
        });
    } else {
      for (const [slot, value] of [
        [SLOTS.brewing.input, input],
        [SLOTS.brewing.result, result],
      ] as const) {
        if (!value) continue;
        if (value.kind !== "item")
          issues.push({
            message: "Choose a regular, splash, or lingering potion bottle.",
            slot,
          });
        else if (value.id.namespace !== "minecraft" || !isBrewingBottle(value.id.id))
          issues.push({ message: "Choose a regular, splash, or lingering potion bottle.", slot });
        else if (value.potion !== undefined)
          issues.push({
            message: "Bedrock brewing container recipes do not support potion contents",
            slot,
          });
      }
    }
    if (
      reagent &&
      (isTagSlotValue(reagent) ||
        (reagent.kind === "item" &&
          reagent.potion !== undefined &&
          (recipe.recipeType !== RecipeType.BrewingMix ||
            !resolveBedrockPotionItem(rawId(reagent, ctx)!, reagent.potion) ||
            !ctx.potionCatalog ||
            !lookupPotion(
              ctx.potionCatalog,
              { id: rawId(reagent, ctx)!, potion: reagent.potion },
              true,
            ))))
    )
      issues.push({
        message: "Choose an ordinary item or a supported tipped arrow",
        slot: SLOTS.brewing.reagent,
      });
  } else {
    for (const [slot, value] of [
      [SLOTS.brewing.input, input],
      [SLOTS.brewing.reagent, reagent],
    ] as const) {
      if (
        value?.kind === "item" &&
        value.potion !== undefined &&
        (!ctx.potionCatalog ||
          !lookupPotion(ctx.potionCatalog, { id: rawId(value, ctx)!, potion: value.potion }))
      )
        issues.push({
          message: "Unknown Java potion",
          slot,
          kind: !ctx.potionCatalog && !ctx.potionCatalogError ? "loading" : "invalid",
        });
    }
    if (
      result?.kind === "item" &&
      result.potion !== undefined &&
      (!ctx.potionCatalog ||
        !lookupPotion(ctx.potionCatalog, { id: rawId(result, ctx)!, potion: result.potion }))
    )
      issues.push({
        message: "Unknown Java potion",
        slot: SLOTS.brewing.result,
        kind: !ctx.potionCatalog && !ctx.potionCatalogError ? "loading" : "invalid",
      });
    const resultId = result && getSlotIdentifier(result, ctx);
    // these vanilla items have potion contents by default, even before the catalog loads
    const requiresPotion =
      resultId?.namespace === "minecraft" &&
      (isBrewingBottle(resultId.id) ||
        resultId.id === "tipped_arrow" ||
        (ctx.potionCatalog &&
          getPotionChoices(ctx.potionCatalog, rawId(result!, ctx)!).length > 0));
    if (requiresPotion && (result?.kind !== "item" || result.potion === undefined)) {
      issues.push({
        message: "Choose a result potion",
        slot: SLOTS.brewing.result,
        kind: "incomplete",
      });
    }
    if (result && isTagSlotValue(result))
      issues.push({ message: "Brewing output must be an item", slot: SLOTS.brewing.result });
  }
  const seen = new Set<RecipeSlot | undefined>();
  return issues.flatMap((issue): BrewingIssue[] => {
    if (seen.has(issue.slot)) return [];
    seen.add(issue.slot);
    const awaitingCatalog = issue.kind === "loading";
    return [
      {
        ...issue,
        kind: awaitingCatalog ? "loading" : (issue.kind ?? "invalid"),
        message: awaitingCatalog ? "Loading potion choices…" : issue.message,
      },
    ];
  });
}
