import { MinecraftVersion, RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { CheckboxField } from "./shared";

const selectCraftingShapeless = (state: ReturnType<typeof useRecipeStore.getState>) =>
  state.recipes[state.selectedRecipeIndex]?.crafting.shapeless ?? false;

const ShapelessField = () => {
  const shapeless = useRecipeStore(selectCraftingShapeless);
  const setRecipeCraftingShapeless = useRecipeStore((state) => state.setRecipeCraftingShapeless);

  return (
    <CheckboxField
      label="Shapeless"
      checked={shapeless}
      onCheckedChange={setRecipeCraftingShapeless}
      tooltip="This will allow the items to be placed anywhere in the crafting table to get the output."
    />
  );
};

const TwoByTwoField = () => {
  const twoByTwo = useRecipeStore(
    (state) => state.recipes[state.selectedRecipeIndex]?.crafting.twoByTwo === true,
  );
  const setRecipeCraftingTwoByTwo = useRecipeStore((state) => state.setRecipeCraftingTwoByTwo);

  return (
    <CheckboxField
      label="2x2 Grid"
      checked={twoByTwo}
      onCheckedChange={setRecipeCraftingTwoByTwo}
    />
  );
};

const ExactPositionField = () => {
  const keepWhitespace = useRecipeStore(
    (state) => state.recipes[state.selectedRecipeIndex]?.crafting.keepWhitespace ?? false,
  );
  const setRecipeCraftingKeepWhitespace = useRecipeStore(
    (state) => state.setRecipeCraftingKeepWhitespace,
  );

  return (
    <CheckboxField
      label="Exact position"
      checked={keepWhitespace}
      onCheckedChange={setRecipeCraftingKeepWhitespace}
      tooltip="If this is checked, the generator will ensure that the item is placed exactly where shown in the crafting table above. If this isn't checked, the recipe can be placed anywhere in the table, which is useful for 2x2 crafting."
    />
  );
};

export const CraftingOptions = () => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const shapeless = useRecipeStore(selectCraftingShapeless);

  if (recipeType !== RecipeType.Crafting) {
    return null;
  }

  const isBedrock = minecraftVersion === MinecraftVersion.Bedrock;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <ShapelessField />
      {!isBedrock && <TwoByTwoField />}
      {!shapeless && <ExactPositionField />}
    </div>
  );
};
