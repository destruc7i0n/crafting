import { useState } from "react";

import { MinecraftVersion, RecipeType } from "@/data/types";
import {
  bedrockIdentifierHint,
  isValidBedrockNamespacedIdentifier,
} from "@/lib/minecraft-identifier";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { Field, InputControl } from "./shared";

const bedrockPriorityRecipeTypes = [
  RecipeType.Crafting,
  RecipeType.Stonecutter,
  RecipeType.Smithing,
  RecipeType.SmithingTrim,
  RecipeType.SmithingTransform,
] as const;

const IdentifierField = () => {
  const identifier = useRecipeStore(
    (state) => state.recipes[state.selectedRecipeIndex]?.bedrock.identifier ?? "",
  );
  const setRecipeBedrockIdentifier = useRecipeStore((state) => state.setRecipeBedrockIdentifier);
  const [showError, setShowError] = useState(false);

  return (
    <Field
      label="Identifier"
      htmlFor="bedrock-identifier"
      error={
        showError ? (
          <span className="text-destructive text-[10px]">{bedrockIdentifierHint}</span>
        ) : undefined
      }
    >
      <InputControl
        id="bedrock-identifier"
        type="text"
        value={identifier}
        onChange={(e) =>
          setShowError(
            e.target.value.trim().length > 0 && !isValidBedrockNamespacedIdentifier(e.target.value),
          )
        }
        onCommit={(v) => setRecipeBedrockIdentifier(v)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        aria-invalid={showError}
        className={cn(showError && "border-destructive focus:ring-destructive")}
        placeholder="namespace:name"
      />
    </Field>
  );
};

const PriorityField = () => {
  const priority = useRecipeStore(
    (state) => state.recipes[state.selectedRecipeIndex]?.bedrock.priority ?? 0,
  );
  const setRecipeBedrockPriority = useRecipeStore((state) => state.setRecipeBedrockPriority);

  return (
    <Field
      label="Priority"
      htmlFor="bedrock-priority"
      tooltip="Used to give priority if the same recipe exists in duplicate."
    >
      <InputControl
        id="bedrock-priority"
        type="number"
        min={0}
        step={1}
        value={priority}
        onCommit={(v) => setRecipeBedrockPriority(Math.max(0, Math.floor(Number(v || 0))))}
      />
    </Field>
  );
};

export const BedrockOptions = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeType = useRecipeStore(selectCurrentRecipeType);

  if (minecraftVersion !== MinecraftVersion.Bedrock) {
    return null;
  }

  const supportsPriority =
    recipeType !== undefined &&
    bedrockPriorityRecipeTypes.includes(recipeType as (typeof bedrockPriorityRecipeTypes)[number]);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <IdentifierField />
      {supportsPriority && <PriorityField />}
    </div>
  );
};
