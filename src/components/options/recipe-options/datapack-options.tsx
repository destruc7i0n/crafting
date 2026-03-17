import { useState } from "react";

import { MinecraftVersion } from "@/data/types";
import { sanitizeRecipeName } from "@/lib/recipe-name";
import { cn } from "@/lib/utils";
import { getDatapackRecipeFileName } from "@/lib/validate-datapack-export";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeName } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { Field } from "./shared";

const selectDatapackFileNameConflict = (state: ReturnType<typeof useRecipeStore.getState>) => {
  const recipeName = state.recipes[state.selectedRecipeIndex]?.recipeName?.trim();
  if (!recipeName) {
    return false;
  }

  const datapackFileName = getDatapackRecipeFileName(recipeName);

  return state.recipes.some((otherRecipe, index) => {
    const otherRecipeName = otherRecipe.recipeName?.trim();

    return (
      index !== state.selectedRecipeIndex &&
      otherRecipeName !== undefined &&
      otherRecipeName.length > 0 &&
      getDatapackRecipeFileName(otherRecipeName) === datapackFileName
    );
  });
};

const FileNameField = () => {
  const recipeName = useRecipeStore(selectCurrentRecipeName) ?? "";
  const showDatapackFileNameError = useRecipeStore(selectDatapackFileNameConflict);
  const setRecipeName = useRecipeStore((state) => state.setRecipeName);
  const [draft, setDraft] = useState(recipeName);

  const datapackFileName = recipeName.trim()
    ? getDatapackRecipeFileName(recipeName.trim())
    : undefined;

  const commit = () => setRecipeName(sanitizeRecipeName(draft));

  return (
    <Field
      label="File name"
      error={
        showDatapackFileNameError && datapackFileName ? (
          <span className="text-destructive text-[10px]">
            Another recipe already exports as {datapackFileName}
          </span>
        ) : undefined
      }
    >
      <div
        className={cn(
          "border-input bg-background hover:bg-accent focus-within:ring-ring flex h-9 items-center rounded-md border transition-colors focus-within:ring-2",
          showDatapackFileNameError && "border-destructive focus-within:ring-destructive",
        )}
      >
        <input
          type="text"
          value={draft}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
          }}
          aria-invalid={showDatapackFileNameError}
          className="text-foreground h-full w-full bg-transparent px-2 py-1 outline-hidden"
        />
        <span className="border-input text-muted-foreground flex h-full shrink-0 items-center border-l px-2 py-1 text-xs">
          .json
        </span>
      </div>
    </Field>
  );
};

export const DatapackOptions = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  if (minecraftVersion === MinecraftVersion.Bedrock) {
    return null;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <FileNameField />
    </div>
  );
};
