import { generate } from "@/data/generate/crafting";
import {
  selectMinecraftVersion,
  selectRecipe,
  useAppSelector,
} from "@/store/hooks";

export const Output = () => {
  const minecraftVersion = useAppSelector(selectMinecraftVersion);
  const recipeSlice = useAppSelector(selectRecipe);

  const result = generate(recipeSlice, minecraftVersion);

  return (
    <div>
      <h2>Output</h2>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};
