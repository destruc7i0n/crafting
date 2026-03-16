import { getBehaviorPackRecipeFileName } from "@/data/behavior-pack";
import { downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { MinecraftVersion } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

const getRecipeFileName = (recipe: SingleRecipeState, version: MinecraftVersion) => {
  if (version === MinecraftVersion.Bedrock) {
    const identifier = recipe.bedrock?.identifier?.trim();
    return identifier ? getBehaviorPackRecipeFileName(identifier) : undefined;
  }

  const recipeName = recipe.recipeName?.trim();
  return recipeName ? `${recipeName}.json` : undefined;
};

export const downloadRecipeJson = (recipe: SingleRecipeState, version: MinecraftVersion) => {
  const fileName = getRecipeFileName(recipe, version);

  if (!fileName) {
    alert(
      version === MinecraftVersion.Bedrock
        ? "Add a Bedrock identifier before downloading JSON."
        : "Add a file name before downloading JSON.",
    );
    return;
  }

  const json = JSON.stringify(generate(recipe, version), null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });

  downloadBlob(blob, fileName);
};
