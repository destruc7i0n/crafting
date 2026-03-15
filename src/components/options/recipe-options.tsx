import { useState } from "react";

import { ChevronDownIcon, CircleHelpIcon } from "lucide-react";

import { isVersionAtLeast } from "@/data/generate/version-utils";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { Select } from "@/components/ui/select";
import {
  bedrockIdentifierHint,
  isValidBedrockNamespacedIdentifier,
} from "@/lib/minecraft-identifier";
import { sanitizeRecipeName } from "@/lib/recipe-name";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { Tooltip } from "@/components/tooltip/tooltip";

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

const craftingCategoryOptions = ["equipment", "building", "misc", "redstone"] as const;
const smeltingCategoryOptions = ["food", "blocks", "misc"] as const;
const blastingCategoryOptions = ["blocks", "misc"] as const;
const foodOnlyCategoryOptions = ["food"] as const;

const getCategoryOptions = (recipeType: RecipeType) => {
  switch (recipeType) {
    case RecipeType.Crafting:
    case RecipeType.CraftingTransmute:
      return craftingCategoryOptions;
    case RecipeType.Smelting:
      return smeltingCategoryOptions;
    case RecipeType.Blasting:
      return blastingCategoryOptions;
    case RecipeType.CampfireCooking:
    case RecipeType.Smoking:
      return foodOnlyCategoryOptions;
    default:
      return undefined;
  }
};

const getDefaultCategory = (recipeType: RecipeType) => {
  switch (recipeType) {
    case RecipeType.CampfireCooking:
    case RecipeType.Smoking:
      return "food";
    default:
      return "misc";
  }
};

const helpIconClassName =
  "shrink-0 text-muted-foreground/70 transition-colors hover:text-foreground";

const tooltips = {
  shapeless:
    "This will allow the items to be placed anywhere in the crafting table to get the output.",
  exactPosition:
    "If this is checked, the generator will ensure that the item is placed exactly where shown in the crafting table above. If this isn't checked, the recipe can be placed anywhere in the table, which is useful for 2x2 crafting.",
  group:
    "This groups related recipes together in the recipe book so they appear under the same entry.",
  category: "Controls which recipe book category the recipe belongs to.",
  pattern: "The trim pattern to apply to the base item, such as minecraft:silence.",
  showNotification:
    "Determines if a notification is shown when unlocking the recipe. Defaults to true.",
  priority: "Used to give priority if the same recipe exists in duplicate.",
} as const;

export const RecipeOptions = () => {
  const [mobileOpen, setMobileOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const textInputClassName =
    "h-9 rounded-md border border-input bg-background px-2 py-1 text-foreground outline-hidden transition-colors hover:bg-accent focus:ring-2 focus:ring-inset focus:ring-ring";
  const selectInputClassName = `${textInputClassName} pr-8`;
  const compoundInputClassName =
    "flex h-9 items-center rounded-md border border-input bg-background transition-colors hover:bg-accent focus-within:ring-2 focus-within:ring-ring";

  const recipe = useRecipeStore(selectCurrentRecipe);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  const setRecipeName = useRecipeStore((state) => state.setRecipeName);
  const setRecipeGroup = useRecipeStore((state) => state.setRecipeGroup);
  const setRecipeCategory = useRecipeStore((state) => state.setRecipeCategory);
  const setRecipeShowNotification = useRecipeStore((state) => state.setRecipeShowNotification);
  const setRecipeSmithingTrimPattern = useRecipeStore(
    (state) => state.setRecipeSmithingTrimPattern,
  );
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
  const supportsCategory =
    !isBedrock &&
    isVersionAtLeast(minecraftVersion, MinecraftVersion.V119) &&
    Boolean(getCategoryOptions(recipe.recipeType));
  const categoryOptions = getCategoryOptions(recipe.recipeType);
  const categoryValue = recipe.category ?? getDefaultCategory(recipe.recipeType);
  const supportsShowNotification =
    !isBedrock &&
    isCrafting &&
    !recipe.crafting.shapeless &&
    isVersionAtLeast(minecraftVersion, MinecraftVersion.V120);
  const supportsSmithingTrimPattern =
    !isBedrock &&
    recipe.recipeType === RecipeType.SmithingTrim &&
    isVersionAtLeast(minecraftVersion, MinecraftVersion.V1215);
  const supportsAdvancedOptions = !isBedrock;
  const showBedrockIdentifierError =
    isBedrock &&
    recipe.bedrock !== undefined &&
    recipe.bedrock.identifier.trim().length > 0 &&
    !isValidBedrockNamespacedIdentifier(recipe.bedrock.identifier);

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
              <div className="flex items-center gap-1.5">
                <label className="flex select-none items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={recipe.crafting.shapeless}
                    onChange={(e) => setRecipeCraftingShapeless(e.target.checked)}
                  />
                  Shapeless
                </label>

                <Tooltip content={tooltips.shapeless} placement="top">
                  <span className={helpIconClassName}>
                    <CircleHelpIcon size={14} />
                  </span>
                </Tooltip>
              </div>

              {!isBedrock && (
                <label className="flex select-none items-center gap-2 text-sm text-foreground">
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
                <div className="flex items-center gap-1.5">
                  <label className="flex select-none items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={recipe.crafting.keepWhitespace}
                      onChange={(e) => setRecipeCraftingKeepWhitespace(e.target.checked)}
                    />
                    Exact position
                  </label>

                  <Tooltip content={tooltips.exactPosition} placement="top">
                    <span className={helpIconClassName}>
                      <CircleHelpIcon size={14} />
                    </span>
                  </Tooltip>
                </div>
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

          {!isBedrock && (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-foreground">
                <span>File name</span>
                <div className={compoundInputClassName}>
                  <input
                    type="text"
                    value={recipe.recipeName ?? ""}
                    onChange={(e) => setRecipeName(sanitizeRecipeName(e.target.value))}
                    className="h-full w-full bg-transparent px-2 py-1 text-foreground outline-hidden"
                  />
                  <span className="flex h-full shrink-0 items-center border-l border-input px-2 py-1 text-xs text-muted-foreground">
                    .json
                  </span>
                </div>
              </label>
            </div>
          )}

          {supportsAdvancedOptions && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="border-t border-border/40" />

              <button
                type="button"
                className="flex items-center gap-1 self-start px-0.5 py-0 text-left text-xs font-medium text-muted-foreground/80 outline-hidden transition-colors hover:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-0"
                onClick={() => setAdvancedOpen((value) => !value)}
              >
                <ChevronDownIcon
                  size={10}
                  className={`transition-transform ${advancedOpen ? "" : "-rotate-90"}`}
                />
                Advanced
              </button>

              {advancedOpen && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1 text-sm text-foreground">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="recipe-group">Group</label>
                      <Tooltip content={tooltips.group} placement="top">
                        <span className={helpIconClassName}>
                          <CircleHelpIcon size={14} />
                        </span>
                      </Tooltip>
                    </div>
                    <input
                      id="recipe-group"
                      type="text"
                      value={recipe.group}
                      onChange={(e) => setRecipeGroup(e.target.value)}
                      className={textInputClassName}
                    />
                  </div>

                  {supportsCategory && categoryOptions && (
                    <div className="flex flex-col gap-1 text-sm text-foreground">
                      <div className="flex items-center gap-1.5">
                        <label htmlFor="recipe-category">Category</label>
                        <Tooltip content={tooltips.category} placement="top">
                          <span className={helpIconClassName}>
                            <CircleHelpIcon size={14} />
                          </span>
                        </Tooltip>
                      </div>
                      <Select
                        id="recipe-category"
                        value={recipe.category ?? ""}
                        onChange={(e) => setRecipeCategory(e.target.value || undefined)}
                        className={selectInputClassName}
                      >
                        <option value="">Default ({categoryValue})</option>
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {supportsSmithingTrimPattern && (
                    <div className="flex flex-col gap-1 text-sm text-foreground">
                      <div className="flex items-center gap-1.5">
                        <label htmlFor="recipe-pattern">Pattern</label>
                        <Tooltip content={tooltips.pattern} placement="top">
                          <span className={helpIconClassName}>
                            <CircleHelpIcon size={14} />
                          </span>
                        </Tooltip>
                      </div>
                      <input
                        id="recipe-pattern"
                        type="text"
                        value={recipe.smithingTrimPattern ?? ""}
                        onChange={(e) => setRecipeSmithingTrimPattern(e.target.value || undefined)}
                        className={textInputClassName}
                        placeholder="minecraft:silence"
                      />
                    </div>
                  )}

                  {supportsShowNotification && (
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <label className="flex select-none items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={recipe.showNotification ?? true}
                          onChange={(e) => setRecipeShowNotification(e.target.checked)}
                        />
                        Show notification
                      </label>

                      <Tooltip content={tooltips.showNotification} placement="top">
                        <span className={helpIconClassName}>
                          <CircleHelpIcon size={14} />
                        </span>
                      </Tooltip>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isBedrock && (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground">Identifier</span>
                <input
                  type="text"
                  value={recipe.bedrock?.identifier ?? ""}
                  onChange={(e) => setRecipeBedrockIdentifier(e.target.value)}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-invalid={showBedrockIdentifierError}
                  className={cn(
                    textInputClassName,
                    showBedrockIdentifierError && "border-destructive focus:ring-destructive",
                  )}
                  placeholder="namespace:name"
                />
                {showBedrockIdentifierError && (
                  <span className="text-[10px] text-destructive">{bedrockIdentifierHint}</span>
                )}
              </label>

              {bedrockPriorityRecipeTypes.includes(
                recipe.recipeType as (typeof bedrockPriorityRecipeTypes)[number],
              ) && (
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <label htmlFor="bedrock-priority">Priority</label>
                    <Tooltip content={tooltips.priority} placement="top">
                      <span className={helpIconClassName}>
                        <CircleHelpIcon size={14} />
                      </span>
                    </Tooltip>
                  </div>
                  <input
                    id="bedrock-priority"
                    type="number"
                    min={0}
                    step={1}
                    value={recipe.bedrock?.priority ?? 0}
                    onChange={(e) =>
                      setRecipeBedrockPriority(Math.max(0, Math.floor(Number(e.target.value || 0))))
                    }
                    className={textInputClassName}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
