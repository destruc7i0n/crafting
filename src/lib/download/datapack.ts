import { createDatapackBlob, downloadBlob } from "@/data/datapack";
import { generate } from "@/data/generate";
import { Tag } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { NamingContext, resolveRecipeNames } from "@/lib/recipe-name";
import { Recipe, SlotContext } from "@/stores/recipe/types";

import { validateDatapackExport } from "../validate-datapack-export";

interface DownloadDatapackOptions {
  tags: Tag[];
  context: NamingContext;
  slotContext: SlotContext;
}

export const downloadDatapack = async (
  recipes: Recipe[],
  version: MinecraftVersion,
  options: DownloadDatapackOptions,
) => {
  const { tags, context, slotContext } = options;
  if (version === MinecraftVersion.Bedrock) {
    alert("Datapack export is only available for Java versions.");
    return;
  }

  if (version === MinecraftVersion.V112) {
    alert("Datapack export is only available for Java 1.13 and newer.");
    return;
  }

  const invalidRecipes = validateDatapackExport({
    recipes,
    version,
    context,
    slotContext,
  }).map((recipe) => `${recipe.name}: ${recipe.errors.join(", ")}`);

  if (invalidRecipes.length > 0) {
    alert(
      `Please finish all recipes before downloading the datapack:\n\n- ${invalidRecipes.join("\n- ")}`,
    );
    return;
  }

  const recipeFiles: { name: string; json: object }[] = [];
  const resolvedNames = resolveRecipeNames(recipes, context, slotContext).byId;

  for (const recipe of recipes) {
    try {
      const recipeName = resolvedNames[recipe.id]?.javaName;

      if (!recipeName) continue;

      recipeFiles.push({
        name: recipeName,
        json: generate({ state: recipe, version, slotContext }),
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
