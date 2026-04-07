import {
  bedrockIdentifierHint,
  isValidBedrockNamespacedIdentifier,
} from "@/lib/minecraft-identifier";
import { getRecipeDefinition } from "@/recipes/definitions";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { Recipe, SlotContext } from "@/stores/recipe/types";

import { MinecraftVersion } from "../types";
import { createRecipeFormatter } from "./format/recipe-formatter";
import { GeneratedRecipe } from "./recipes/types";
import { wrapBedrockRecipe } from "./wrapper/bedrock";

export interface GenerateOptions {
  bedrockIdentifier?: string;
}

export function generate({
  state,
  version,
  slotContext = createEmptySlotContext(version),
  options,
}: {
  state: Recipe;
  version: MinecraftVersion;
  slotContext?: SlotContext;
  options?: GenerateOptions;
}): GeneratedRecipe {
  const definition = getRecipeDefinition(state.recipeType);
  const formatter = createRecipeFormatter(version);

  if (version === MinecraftVersion.Bedrock) {
    const identifier = options?.bedrockIdentifier?.trim();

    if (!identifier) {
      throw new Error("Bedrock recipes must have an identifier");
    }

    if (!isValidBedrockNamespacedIdentifier(identifier)) {
      throw new Error(
        `Bedrock recipes must use a valid identifier (namespace:name; ${bedrockIdentifierHint})`,
      );
    }

    if (!definition.generateBedrock || !definition.getBedrockMeta) {
      throw new Error(`Unsupported Bedrock recipe type: ${state.recipeType}`);
    }

    const inner = definition.generateBedrock({ recipe: state, formatter, slotContext });
    const meta = definition.getBedrockMeta(state);

    return wrapBedrockRecipe({
      inner,
      wrapperKey: meta.wrapperKey,
      tags: meta.tags,
      options: {
        identifier,
        priority: state.bedrock.priority,
        formatVersion: meta.formatVersion,
      },
    });
  }

  return definition.generateJava({ recipe: state, version, formatter, slotContext });
}
