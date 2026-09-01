import { z } from "zod";

import { defaultMinecraftVersions } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";
import { applyMinecraftVersionChange, isCrossPlatformVersionSwitch } from "@/lib/editor-actions";
import { getSlotContext } from "@/lib/slot-context";
import { getSupportedRecipeTypesForVersion } from "@/recipes/definitions";
import { resolveRecipeNames } from "@/recipes/naming";
import { useRecipeStore } from "@/stores/recipe";
import { ensureResources } from "@/stores/resources/loader";
import { useSettingsStore } from "@/stores/settings";
import { getMinecraftVersionLabel } from "@/versioning";

import { defineTool } from "../define-tool";
import { summarizeSelectedRecipe } from "../summary";

const versionList = defaultMinecraftVersions
  .map((version) => `"${version}" (${getMinecraftVersionLabel(version)})`)
  .join(", ");

const input = z.object({
  version: z
    .enum(Object.values(MinecraftVersion))
    .describe(`Target Minecraft version. One of: ${versionList}.`),
  confirmClearAllSlots: z
    .boolean()
    .default(false)
    .describe(
      "Set to true only after the user has agreed that switching between Java and Bedrock may clear every slot in every recipe. Ignored for Java-to-Java switches.",
    ),
});

export type SetMinecraftVersionInput = z.output<typeof input>;

/** Warns about recipes whose type does not exist in the new version. */
const collectUnsupportedTypeWarnings = (version: MinecraftVersion): string[] => {
  const { recipes } = useRecipeStore.getState();
  const { bedrockNamespace } = useSettingsStore.getState();
  const supported = new Set(getSupportedRecipeTypesForVersion(version));
  const naming = resolveRecipeNames(recipes, { bedrockNamespace }, getSlotContext());
  const label = getMinecraftVersionLabel(version);

  return recipes
    .filter((recipe) => !supported.has(recipe.recipeType))
    .map((recipe) => {
      const title = naming.byId[recipe.id]?.sidebarTitle ?? recipe.id;
      return `Recipe "${title}" uses ${recipe.recipeType}, which is not available in ${label}; change it with update_recipe`;
    });
};

const buildResult = ({
  version,
  clearedAllSlots,
  warnings,
}: {
  version: MinecraftVersion;
  clearedAllSlots: boolean;
  warnings: string[];
}) => ({
  version,
  versionLabel: getMinecraftVersionLabel(version),
  supportedRecipeTypes: getSupportedRecipeTypesForVersion(version),
  clearedAllSlots,
  selectedRecipe: summarizeSelectedRecipe(warnings),
});

export const setMinecraftVersionTool = defineTool({
  name: "set_minecraft_version",
  title: "Set Minecraft version",
  description: `Switch the editor to another Minecraft version, which changes the available items, tags, recipe types and the generated JSON format. Use it when the user targets a specific game version or platform. Versions: ${versionList}. Switching between Java and Bedrock (either direction) clears every slot in all recipes, so the call is rejected until you pass confirmClearAllSlots: true after asking the user; Java-to-Java switches keep slots. Recipes whose type does not exist in the new version are kept but reported as warnings and must be changed with update_recipe. Returns { version, versionLabel, supportedRecipeTypes, clearedAllSlots, selectedRecipe }. Example: { "version": "1.21" }.`,
  input,
  execute: async ({ version: next, confirmClearAllSlots }, { signal }) => {
    const current = useSettingsStore.getState().minecraftVersion;

    if (next === current) {
      await ensureResources(current);
      return buildResult({
        version: current,
        clearedAllSlots: false,
        warnings: ["Version unchanged", ...collectUnsupportedTypeWarnings(current)],
      });
    }

    const crossPlatform = isCrossPlatformVersionSwitch(current, next);

    if (crossPlatform && !confirmClearAllSlots) {
      const recipeCount = useRecipeStore.getState().recipes.length;
      throw new Error(
        `Switching between Java and Bedrock clears every slot in all ${recipeCount} recipes. Ask the user, then call again with confirmClearAllSlots: true.`,
      );
    }

    await ensureResources(next);

    if (signal.aborted) {
      throw new Error("Cancelled");
    }

    applyMinecraftVersionChange(next);

    return buildResult({
      version: next,
      clearedAllSlots: crossPlatform,
      warnings: collectUnsupportedTypeWarnings(next),
    });
  },
});
