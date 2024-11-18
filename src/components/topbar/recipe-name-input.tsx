import { useEffect, useState } from "react";

import { CheckIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";

const nonAlphanumericRegex = /[^a-zA-Z0-9_]/g;

export const RecipeNameInput = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [recipeInput, setRecipeInput] = useState("");
  const [isValid, setIsValid] = useState(true);

  const recipes = useRecipeStore((state) => state.recipes);
  const selectedRecipeIndex = useRecipeStore(
    (state) => state.selectedRecipeIndex,
  );
  const recipeName = recipes[selectedRecipeIndex].recipeName;
  const setRecipeName = useRecipeStore((state) => state.setRecipeName);

  useEffect(() => {
    setRecipeInput(recipeName);
  }, [recipeName]);

  const handleRecipeNameChange = (value: string) => {
    // replace all non-alphanumeric characters with nothing
    const formattedValue = value.replace(nonAlphanumericRegex, "");

    setRecipeInput(formattedValue);

    if (formattedValue.length === 0) {
      setIsValid(false);
      return;
    }

    const isDuplicate = recipes.some(
      (recipe, index) =>
        recipe.recipeName === formattedValue && index !== selectedRecipeIndex,
    );
    if (isDuplicate) {
      setIsValid(false);
      return;
    }

    setIsValid(true);
  };

  const onFocus = () => {
    setIsEditing(true);
  };

  const onBlur = () => {
    if (isValid) {
      setRecipeName(recipeInput);
    } else {
      setRecipeInput(recipeName);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        className={cn(
          "rounded-md border border-transparent px-2 py-1 hover:border-gray-300",
          !isValid && isEditing && "border-red-500",
        )}
        value={isEditing ? recipeInput : recipeName}
        onChange={({ target: { value } }) => handleRecipeNameChange(value)}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      {isEditing ? (
        isValid ? (
          <CheckIcon size={16} className="text-green-500" />
        ) : (
          <XIcon size={16} className="text-red-500" />
        )
      ) : null}
    </div>
  );
};
