import { cn } from "@/lib/utils";
import { SingleRecipeState } from "@/stores/recipe";

export function RecipeSelectorTab({
  recipe,
  selected,
  select,
}: {
  recipe: SingleRecipeState;
  selected: boolean;
  select: () => void;
}) {
  return (
    <button
      className={cn(
        "max-w-48 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap rounded-md border p-2",
        {
          "border-2": selected,
        },
      )}
      onClick={select}
    >
      {recipe.recipeName}
    </button>
  );
}
