import { MinecraftVersion } from "@/data/types";
import {
  bedrockIdentifierHint,
  isValidBedrockNamespacedIdentifier,
} from "@/lib/minecraft-identifier";
import { getRecipeDefinition, isRecipeTypeSupported } from "@/recipes/definitions";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { Recipe, SlotContext } from "@/stores/recipe/types";
import { getMinecraftVersionLabel } from "@/versioning";

import { createRecipeFormatter } from "./format/recipe-formatter";
import { GeneratedRecipe } from "./types";
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

  if (version === MinecraftVersion.Bedrock) {
    const identifier = options?.bedrockIdentifier?.trim();

    if (!identifier) {
      throw new Error("Bedrock recipes must have an identifier");
    }

    if (!isRecipeTypeSupported(definition, version)) {
      throw new Error(`Recipe type "${state.recipeType}" is not available in Bedrock`);
    }

    if (!isValidBedrockNamespacedIdentifier(identifier)) {
      throw new Error(
        `Bedrock recipes must use a valid identifier (namespace:name; ${bedrockIdentifierHint})`,
      );
    }

    const formatter = createRecipeFormatter(version);
    const inner = definition.generateBedrock({ recipe: state, formatter, slotContext });
    const meta = definition.getBedrockMeta(state);

    return wrapBedrockRecipe({
      inner,
      wrapperKey: meta.wrapperKey,
      tags: meta.tags,
      options: {
        identifier,
        priority: meta.supportsPriority ? state.bedrock.priority : 0,
        formatVersion: meta.formatVersion,
      },
    });
  }

  if (!isRecipeTypeSupported(definition, version)) {
    throw new Error(
      `Recipe type "${state.recipeType}" is not available in ${getMinecraftVersionLabel(version)}`,
    );
  }

  const formatter = createRecipeFormatter(version);
  return definition.generateJava({ recipe: state, version, formatter, slotContext });
}
