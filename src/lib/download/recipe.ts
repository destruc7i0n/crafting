import { getBehaviorPackRecipeFileName } from "@/data/behavior-pack";
import { downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { MinecraftVersion } from "@/data/types";
import {
  bedrockIdentifierHint,
  isValidBedrockNamespacedIdentifier,
} from "@/lib/minecraft-identifier";
import { sanitizeRecipeName } from "@/lib/recipe-name";
import { SingleRecipeState } from "@/stores/recipe";

export const downloadRecipeJson = (
  recipe: SingleRecipeState,
  version: MinecraftVersion,
  target: string,
) => {
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
    const json = JSON.stringify(generate(recipe, version, generationContext), null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });

    downloadBlob(blob, fileName);
  } catch (error) {
    alert(error instanceof Error ? error.message : "Could not generate JSON for this recipe.");
  }
};
