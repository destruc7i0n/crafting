import { useState } from "react";

import { PencilIcon, RotateCcwIcon } from "lucide-react";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { useCurrentRecipeName } from "@/hooks/use-current-recipe-name";
import { isValidBedrockIdentifierPart } from "@/lib/minecraft-identifier";
import { getCommittedRecipeName, sanitizeRecipeName } from "@/lib/recipe-name";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { DEFAULT_BEDROCK_NAMESPACE, useSettingsStore } from "@/stores/settings";
import { selectBedrockNamespace, selectMinecraftVersion } from "@/stores/settings/selectors";

import { Field, IconActionButton, InputControl, ReadonlyValueRow } from "./shared";

const bedrockPriorityRecipeTypes = [
  RecipeType.Crafting,
  RecipeType.Stonecutter,
  RecipeType.Smithing,
  RecipeType.SmithingTrim,
  RecipeType.SmithingTransform,
] as const;

const NamespaceField = () => {
  const bedrockNamespace = useSettingsStore(selectBedrockNamespace);
  const setBedrockNamespace = useSettingsStore((state) => state.setBedrockNamespace);

  return (
    <Field
      label={
        <span className="flex items-center gap-2">
          <span>Namespace</span>
          <span className="bg-background text-muted-foreground shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
            Global
          </span>
        </span>
      }
      htmlFor="bedrock-namespace"
    >
      <InputControl
        id="bedrock-namespace"
        type="text"
        value={bedrockNamespace}
        onCommit={(value) =>
          setBedrockNamespace(getCommittedRecipeName(value, DEFAULT_BEDROCK_NAMESPACE))
        }
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="crafting"
      />
    </Field>
  );
};

const NameField = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);
  const setRecipeBedrockIdentifierMode = useRecipeStore(
    (state) => state.setRecipeBedrockIdentifierMode,
  );
  const setRecipeBedrockIdentifierName = useRecipeStore(
    (state) => state.setRecipeBedrockIdentifierName,
  );
  const naming = useCurrentRecipeName();
  const [showNameError, setShowNameError] = useState(false);

  if (!recipe || !naming) {
    return null;
  }

  const isManual = recipe.bedrock.identifierMode === "manual";
  const bedrockName = naming.resolvedBedrockName ?? naming.autoBedrockName;
  const bedrockIdentifier = naming.resolvedBedrockIdentifier ?? "Missing Bedrock name";

  return (
    <Field
      label="Name"
      htmlFor={isManual ? "bedrock-name" : undefined}
      error={
        showNameError ? (
          <span className="text-destructive text-[10px]">
            Use a name only. The namespace comes from the field above.
          </span>
        ) : undefined
      }
    >
      <div className="flex items-center gap-2">
        {isManual ? (
          <>
            <InputControl
              id="bedrock-name"
              type="text"
              value={recipe.bedrock.identifierName}
              onChange={(event) =>
                setShowNameError(
                  event.target.value.includes(":") ||
                    (event.target.value.trim().length > 0 &&
                      !isValidBedrockIdentifierPart(sanitizeRecipeName(event.target.value))),
                )
              }
              onCommit={(value) => {
                setRecipeBedrockIdentifierName(
                  getCommittedRecipeName(value, naming.autoBedrockName),
                );
                setShowNameError(false);
              }}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={showNameError}
              className={cn(
                "min-w-0 flex-1",
                showNameError && "border-destructive focus:ring-destructive",
              )}
              placeholder={naming.autoBedrockName}
            />

            <IconActionButton
              label="Use auto Bedrock name"
              onClick={() => {
                setRecipeBedrockIdentifierName("");
                setRecipeBedrockIdentifierMode("auto");
                setShowNameError(false);
              }}
            >
              <RotateCcwIcon size={14} />
            </IconActionButton>
          </>
        ) : (
          <>
            <ReadonlyValueRow value={bedrockName} badge="Auto" />

            <IconActionButton
              label="Customize Bedrock name"
              onClick={() => {
                setRecipeBedrockIdentifierName(bedrockName);
                setRecipeBedrockIdentifierMode("manual");
              }}
            >
              <PencilIcon size={14} />
            </IconActionButton>
          </>
        )}
      </div>
      <p className="text-muted-foreground truncate text-xs" title={bedrockIdentifier}>
        Identifier: {bedrockIdentifier}
      </p>
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
      tooltip="Sets the priority order of the recipe. Lower numbers represent a higher priority."
    >
      <InputControl
        id="bedrock-priority"
        type="number"
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
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <NamespaceField />
      </div>
      <NameField />
      {supportsPriority && <PriorityField />}
    </div>
  );
};
