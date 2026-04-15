import { getBehaviorPackRecipeFileName } from "@/data/behavior-pack";
import { downloadBlob } from "@/data/datapack";
import { MinecraftVersion } from "@/data/types";
import {
  bedrockIdentifierHint,
  isValidBedrockNamespacedIdentifier,
} from "@/lib/minecraft-identifier";
import { generate } from "@/recipes/generate";
import { sanitizeRecipeName } from "@/recipes/naming";
import { Recipe, SlotContext } from "@/stores/recipe/types";

export const downloadRecipeJson = ({
  recipe,
  version,
  slotContext,
  target,
}: {
  recipe: Recipe;
  version: MinecraftVersion;
  slotContext: SlotContext;
  target: string;
}) => {
  let fileName = target;
  let generationContext: { bedrockIdentifier: string } | undefined;

  if (version === MinecraftVersion.Bedrock) {
    if (
      recipe.bedrock.identifierMode === "manual" &&
      sanitizeRecipeName(recipe.bedrock.identifierName).length === 0
    ) {
      alert("Add a Bedrock name before downloading JSON.");
      return;
    }

    if (!isValidBedrockNamespacedIdentifier(target)) {
      alert(`Use a valid Bedrock identifier before downloading JSON (${bedrockIdentifierHint}).`);
      return;
    }

    fileName = getBehaviorPackRecipeFileName(target);
    generationContext = { bedrockIdentifier: target };
  } else {
    if (recipe.nameMode === "manual" && sanitizeRecipeName(recipe.name).length === 0) {
      alert("Add a file name before downloading JSON.");
      return;
    }
  }

  try {
    const generatedRecipe = generate({
      state: recipe,
      version,
      slotContext,
      options: generationContext,
    });
    const json = JSON.stringify(generatedRecipe, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });

    downloadBlob(blob, fileName);
  } catch (error) {
    alert(error instanceof Error ? error.message : "Could not generate JSON for this recipe.");
  }
};
