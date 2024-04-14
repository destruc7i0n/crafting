import { RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";

export const RecipeTypeSelector = () => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const setRecipeType = useRecipeStore((state) => state.setRecipeType);

  return (
    <select
      className="focus:shadow-outline appearance-none rounded-md border px-3 py-2 text-center text-sm leading-tight text-gray-700 focus:outline-none"
      onChange={(e) => setRecipeType(e.target.value as RecipeType)}
      value={recipeType}
    >
      <option value={RecipeType.Crafting}>Crafting</option>
      <option value={RecipeType.Smelting}>Smelting</option>
      <option value={RecipeType.Blasting}>Blasting</option>
      <option value={RecipeType.CampfireCooking}>Campfire Cooking</option>
      <option value={RecipeType.Smithing}>Smithing</option>
      <option value={RecipeType.SmithingTransform}>Smithing Transform</option>
      <option value={RecipeType.SmithingTrim}>Smithing Trim</option>
      <option value={RecipeType.Stonecutter}>Stonecutter</option>
    </select>
  );
};
