import { useState } from "react";

import { ChevronDownIcon } from "lucide-react";

import { RecipeType } from "@/data/types";
import { sanitizeRecipeName } from "@/lib/recipe-name";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

const cookingRecipeTypes = [
  RecipeType.Smelting,
  RecipeType.Blasting,
  RecipeType.CampfireCooking,
  RecipeType.Smoking,
] as const;

const bedrockPriorityRecipeTypes = [
  RecipeType.Crafting,
  RecipeType.Stonecutter,
  RecipeType.Smithing,
  RecipeType.SmithingTrim,
  RecipeType.SmithingTransform,
] as const;

export const RecipeOptions = () => {
  const [mobileOpen, setMobileOpen] = useState(true);

  const textInputClassName =
    "rounded-md border border-input bg-background px-2 py-1 text-foreground outline-none transition-colors hover:bg-accent focus:ring-2 focus:ring-inset focus:ring-ring";
  const compoundInputClassName =
    "flex items-center rounded-md border border-input bg-background transition-colors hover:bg-accent focus-within:ring-2 focus-within:ring-ring";

  const recipe = useRecipeStore(selectCurrentRecipe);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  const setRecipeName = useRecipeStore((state) => state.setRecipeName);
  const setRecipeGroup = useRecipeStore((state) => state.setRecipeGroup);
  const setRecipeCraftingShapeless = useRecipeStore((state) => state.setRecipeCraftingShapeless);
  const setRecipeCraftingKeepWhitespace = useRecipeStore(
    (state) => state.setRecipeCraftingKeepWhitespace,
  );
  const setRecipeCraftingTwoByTwo = useRecipeStore((state) => state.setRecipeCraftingTwoByTwo);
  const setRecipeCookingTime = useRecipeStore((state) => state.setRecipeCookingTime);
  const setRecipeCoolingExperience = useRecipeStore((state) => state.setRecipeCoolingExperience);
  const setRecipeBedrockIdentifier = useRecipeStore((state) => state.setRecipeBedrockIdentifier);
  const setRecipeBedrockPriority = useRecipeStore((state) => state.setRecipeBedrockPriority);

  if (!recipe) return null;

  const isBedrock = minecraftVersion === "bedrock";
  const isCrafting = recipe.recipeType === RecipeType.Crafting;
  const isCooking = cookingRecipeTypes.includes(
    recipe.recipeType as (typeof cookingRecipeTypes)[number],
  );

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <ChevronDownIcon
          size={14}
          className={`transition-transform ${mobileOpen ? "" : "-rotate-90"}`}
        />
        Options
      </button>

      {mobileOpen && (
        <div className="flex flex-col gap-3 border-t px-4 py-3">
          {isCrafting && (
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={recipe.crafting.shapeless}
                  onChange={(e) => setRecipeCraftingShapeless(e.target.checked)}
                />
                Shapeless
              </label>

              {!isBedrock && (
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={recipe.crafting.twoByTwo === true}
                    onChange={(e) => setRecipeCraftingTwoByTwo(e.target.checked)}
                  />
                  2x2 Grid
                </label>
              )}

              {!recipe.crafting.shapeless && (
                <label
                  className="flex items-center gap-2 text-sm text-foreground"
                  title="Keep items in their exact grid positions"
                >
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={recipe.crafting.keepWhitespace}
                    onChange={(e) => setRecipeCraftingKeepWhitespace(e.target.checked)}
                  />
                  Exact position
                </label>
              )}
            </div>
          )}

          {!isBedrock && isCooking && (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-foreground">
                <span>Experience</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={recipe.cooking.experience}
                  onChange={(e) =>
                    setRecipeCoolingExperience(Math.max(0, Number(e.target.value || 0)))
                  }
                  className={textInputClassName}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-foreground">
                <span>Cooking time</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={recipe.cooking.time}
                  onChange={(e) => setRecipeCookingTime(Math.max(0, Number(e.target.value || 0)))}
                  className={textInputClassName}
                />
              </label>
            </div>
          )}

          {isBedrock && (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="text-foreground">Identifier</span>
                <input
                  type="text"
                  value={recipe.bedrock?.identifier ?? ""}
                  onChange={(e) => setRecipeBedrockIdentifier(e.target.value)}
                  className={textInputClassName}
                  placeholder="namespace:name"
                />
              </label>

              {bedrockPriorityRecipeTypes.includes(
                recipe.recipeType as (typeof bedrockPriorityRecipeTypes)[number],
              ) && (
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-foreground">Priority</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={recipe.bedrock?.priority ?? 0}
                    onChange={(e) =>
                      setRecipeBedrockPriority(Math.max(0, Math.floor(Number(e.target.value || 0))))
                    }
                    className={textInputClassName}
                  />
                </label>
              )}
            </div>
          )}

          {(isCrafting || isCooking) && !isBedrock && <div className="border-t border-border" />}

          {!isBedrock && (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-foreground">
                <span>File name</span>
                <div className={compoundInputClassName}>
                  <input
                    type="text"
                    value={recipe.recipeName ?? ""}
                    onChange={(e) => setRecipeName(sanitizeRecipeName(e.target.value))}
                    className="w-full bg-transparent px-2 py-1 text-foreground outline-none"
                  />
                  <span className="shrink-0 border-l border-input px-2 py-1 text-xs text-muted-foreground">
                    .json
                  </span>
                </div>
              </label>

              <label className="flex flex-col gap-1 text-sm text-foreground">
                <span>Group</span>
                <input
                  type="text"
                  value={recipe.group}
                  onChange={(e) => setRecipeGroup(e.target.value)}
                  className={textInputClassName}
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
