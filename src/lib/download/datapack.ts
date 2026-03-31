import { createDatapackBlob, downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { Tag } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { NamingContext, resolveRecipeNames } from "@/lib/recipe-name";
import { SingleRecipeState } from "@/stores/recipe";

import { validateDatapackExport } from "../validate-datapack-export";

interface DownloadDatapackOptions {
  tags: Tag[];
  context: NamingContext;
}

export const downloadDatapack = async (
  recipes: SingleRecipeState[],
  version: MinecraftVersion,
  { tags, context }: DownloadDatapackOptions,
) => {
  if (version === MinecraftVersion.Bedrock) {
    alert("Datapack export is only available for Java versions.");
    return;
  }

  if (version === MinecraftVersion.V112) {
    alert("Datapack export is only available for Java 1.13 and newer.");
    return;
  }

  const invalidRecipes = validateDatapackExport(recipes, version, context).map(
    (recipe) => `${recipe.name}: ${recipe.errors.join(", ")}`,
  );

  if (invalidRecipes.length > 0) {
    alert(
      `Please finish all recipes before downloading the datapack:\n\n- ${invalidRecipes.join("\n- ")}`,
    );
    return;
  }

  const recipeFiles: { name: string; json: object }[] = [];
  const resolvedNames = resolveRecipeNames(recipes, context).byId;

  for (const recipe of recipes) {
    try {
      const recipeName = resolvedNames[recipe.id]?.javaName;

      if (!recipeName) continue;

      recipeFiles.push({
        name: recipeName,
        json: generate(recipe, version),
      });
    } catch (error) {
      invalidRecipes.push(
        `${resolvedNames[recipe.id]?.sidebarTitle ?? "Recipe"}: ${error instanceof Error ? error.message : "Failed to generate recipe"}`,
      );
    }
  }

  if (invalidRecipes.length > 0) {
    alert(`Failed to generate all recipes for the datapack:\n\n- ${invalidRecipes.join("\n- ")}`);
    return;
  }

  const blob = createDatapackBlob(version, recipeFiles, tags);
  downloadBlob(blob, "datapack.zip");
};
