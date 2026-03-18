import { createDatapackBlob, downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { Tag } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

import { validateDatapackExport } from "../validate-datapack-export";

export const downloadDatapack = async (
  recipes: SingleRecipeState[],
  version: MinecraftVersion,
  tags: Tag[],
) => {
  if (version === MinecraftVersion.Bedrock) {
    alert("Datapack export is only available for Java versions.");
    return;
  }

  if (version === MinecraftVersion.V112) {
    alert("Datapack export is only available for Java 1.13 and newer.");
    return;
  }

  const invalidRecipes = validateDatapackExport(recipes, version).map(
    (recipe) => `${recipe.name}: ${recipe.errors.join(", ")}`,
  );

  if (invalidRecipes.length > 0) {
    alert(
      `Please finish all recipes before downloading the datapack:\n\n- ${invalidRecipes.join("\n- ")}`,
    );
    return;
  }

  const recipeFiles: { name: string; json: object }[] = [];

  for (const recipe of recipes) {
    try {
      const recipeName = recipe.recipeName.trim();

      if (!recipeName) {
        invalidRecipes.push("(unnamed): Add a file name");
        continue;
      }

      recipeFiles.push({
        name: recipeName,
        json: generate(recipe, version),
      });
    } catch (error) {
      invalidRecipes.push(
        `${recipe.recipeName.trim() || "(unnamed)"}: ${error instanceof Error ? error.message : "Failed to generate recipe"}`,
      );
    }
  }

  if (invalidRecipes.length > 0) {
    alert(`Failed to generate all recipes for the datapack:\n\n- ${invalidRecipes.join("\n- ")}`);
    return;
  }

  const blob = await createDatapackBlob(version, recipeFiles, tags);
  downloadBlob(blob, "datapack.zip");
};
