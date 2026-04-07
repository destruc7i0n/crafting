import { MinecraftVersion } from "@/data/types";
import { sanitizeBedrockIdentifierPart } from "@/lib/minecraft-identifier";
import { getRecipeDefinition } from "@/recipes/definitions";
import { getSlotDisplay } from "@/stores/recipe/slot-value";
import { Recipe, SlotContext } from "@/stores/recipe/types";

export interface NamingContext {
  bedrockNamespace: string;
}

export interface RecipeNaming {
  sidebarTitle: string;
  javaName?: string;
  bedrockName?: string;
  bedrockIdentifier?: string;
}

export interface ResolvedRecipeNames {
  byId: Record<string, RecipeNaming>;
}

export interface CurrentRecipeName {
  autoName: string;
  autoBedrockName: string;
  resolvedJavaName?: string;
  resolvedBedrockName?: string;
  resolvedBedrockIdentifier?: string;
}

const FALLBACK_NAME = "recipe";

type NameEntry = {
  recipe: Recipe;
  fixedName?: string;
  possibleNames: string[];
  skipAssignment?: boolean;
};

const unique = (values: string[]) => {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const sanitizeRecipeName = (value: string) => sanitizeBedrockIdentifierPart(value);
export const getCommittedRecipeName = (value: string, fallbackName: string) =>
  sanitizeRecipeName(value) || ensureName(fallbackName);

export const toJavaRecipeFileName = (name: string) => `${name}.json`;
export const toPreviewFileName = (name: string) => `${name}.png`;

export const getPreviewBaseName = (naming: CurrentRecipeName, version: MinecraftVersion) =>
  version === MinecraftVersion.Bedrock
    ? (naming.resolvedBedrockName ?? naming.autoBedrockName)
    : (naming.resolvedJavaName ?? naming.autoName);

export const getRecipeExportDetail = (
  naming: RecipeNaming | undefined,
  version: MinecraftVersion,
) => {
  if (!naming) {
    return "Recipe";
  }

  if (version === MinecraftVersion.Bedrock) {
    return naming.bedrockIdentifier ?? "Missing Bedrock name";
  }

  if (naming.javaName) {
    return toJavaRecipeFileName(naming.javaName);
  }

  return "Missing file name";
};

const ensureName = (value: string | undefined) => {
  const sanitized = sanitizeRecipeName(value ?? "");
  return sanitized || FALLBACK_NAME;
};

const getResultSlotValue = (recipe: Recipe) => {
  const resultSlot = getRecipeDefinition(recipe.recipeType).naming.resultSlot;
  return resultSlot ? recipe.slots[resultSlot] : undefined;
};

const getSidebarBaseTitle = (recipe: Recipe, slotContext: SlotContext) => {
  const definition = getRecipeDefinition(recipe.recipeType);
  const result = getResultSlotValue(recipe);
  const displayName = getSlotDisplay(result, slotContext)?.label.trim();

  if (displayName) {
    return displayName;
  }

  return definition.naming.sidebarFallbackLabel;
};

const getRecipeNameCandidates = (recipe: Recipe, slotContext: SlotContext) =>
  getRecipeDefinition(recipe.recipeType).naming.getAutoNames(recipe, slotContext);

export const getAutoRecipeName = (recipe: Recipe, slotContext: SlotContext) =>
  getRecipeNameCandidates(recipe, slotContext)[0] ?? FALLBACK_NAME;

const getManualJavaName = (recipe: Recipe) => {
  const manualName = sanitizeRecipeName(recipe.name);

  return manualName || undefined;
};

const getSelectedJavaName = (recipe: Recipe, slotContext: SlotContext) => {
  if (recipe.nameMode === "manual") {
    return getManualJavaName(recipe);
  }

  return getAutoRecipeName(recipe, slotContext);
};

const getManualBedrockName = (recipe: Recipe) => {
  const manualIdentifierName = sanitizeRecipeName(recipe.bedrock.identifierName);

  return manualIdentifierName || undefined;
};

const getAutoBedrockName = (recipe: Recipe, slotContext: SlotContext) =>
  getSelectedJavaName(recipe, slotContext) ?? getAutoRecipeName(recipe, slotContext);

const getBedrockIdentifier = (bedrockName: string | undefined, context: NamingContext) =>
  bedrockName ? `${context.bedrockNamespace}:${bedrockName}` : undefined;

const assignUniqueNames = (entries: NameEntry[]) => {
  const namesById: Record<string, string> = {};
  const usedNames = new Set<string>();

  for (const entry of entries) {
    if (!entry.fixedName) {
      continue;
    }

    namesById[entry.recipe.id] = entry.fixedName;
    usedNames.add(entry.fixedName);
  }

  for (const entry of entries) {
    if (entry.fixedName || entry.skipAssignment) {
      continue;
    }

    const possibleNames = unique(
      entry.possibleNames.length > 0 ? entry.possibleNames : [FALLBACK_NAME],
    );
    let selectedName = possibleNames.find((name) => !usedNames.has(name));

    if (!selectedName) {
      const base = possibleNames[possibleNames.length - 1] ?? FALLBACK_NAME;
      let index = 2;

      do {
        selectedName = `${base}_${index}`;
        index += 1;
      } while (usedNames.has(selectedName));
    }

    namesById[entry.recipe.id] = selectedName;
    usedNames.add(selectedName);
  }

  return namesById;
};

const buildSidebarTitles = (recipes: Recipe[], slotContext: SlotContext) => {
  const titleCounts = new Map<string, number>();
  const titleIndexes = new Map<string, number>();
  const labels: Record<string, string> = {};

  for (const recipe of recipes) {
    const title = getSidebarBaseTitle(recipe, slotContext);
    titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
  }

  for (const recipe of recipes) {
    const title = getSidebarBaseTitle(recipe, slotContext);
    const occurrence = (titleIndexes.get(title) ?? 0) + 1;
    titleIndexes.set(title, occurrence);

    labels[recipe.id] =
      (titleCounts.get(title) ?? 0) > 1 && occurrence > 1 ? `${title} (${occurrence})` : title;
  }

  return labels;
};

const getJavaNameEntry = (recipe: Recipe, slotContext: SlotContext): NameEntry => {
  const manualName = getManualJavaName(recipe);

  return {
    recipe,
    fixedName: recipe.nameMode === "manual" ? manualName : undefined,
    possibleNames: recipe.nameMode === "manual" ? [] : getRecipeNameCandidates(recipe, slotContext),
    skipAssignment: recipe.nameMode === "manual" && !manualName,
  };
};

const getBedrockNameEntry = (recipe: Recipe, slotContext: SlotContext): NameEntry => {
  const manualIdentifierName = getManualBedrockName(recipe);
  const manualJavaName = getManualJavaName(recipe);
  const autoNames = getRecipeNameCandidates(recipe, slotContext);
  const autoBedrockName = getAutoBedrockName(recipe, slotContext);

  return {
    recipe,
    fixedName: recipe.bedrock.identifierMode === "manual" ? manualIdentifierName : undefined,
    possibleNames:
      recipe.bedrock.identifierMode === "manual"
        ? []
        : unique([autoBedrockName, ...(!manualJavaName ? autoNames.slice(1) : [])]),
    skipAssignment: recipe.bedrock.identifierMode === "manual" && !manualIdentifierName,
  };
};

export const resolveRecipeNames = (
  recipes: Recipe[],
  context: NamingContext,
  slotContext: SlotContext,
): ResolvedRecipeNames => {
  const sidebarTitles = buildSidebarTitles(recipes, slotContext);
  const javaAssignments = assignUniqueNames(
    recipes.map((recipe) => getJavaNameEntry(recipe, slotContext)),
  );
  const bedrockAssignments = assignUniqueNames(
    recipes.map((recipe) => getBedrockNameEntry(recipe, slotContext)),
  );

  const byId: Record<string, RecipeNaming> = {};

  for (const recipe of recipes) {
    const javaName = javaAssignments[recipe.id];
    const bedrockName = bedrockAssignments[recipe.id];

    byId[recipe.id] = {
      sidebarTitle: sidebarTitles[recipe.id] ?? getSidebarBaseTitle(recipe, slotContext),
      javaName,
      bedrockName,
      bedrockIdentifier: getBedrockIdentifier(bedrockName, context),
    };
  }

  return { byId };
};

export const getCurrentRecipeName = ({
  recipes,
  selectedRecipeId,
  context,
  slotContext,
}: {
  recipes: Recipe[];
  selectedRecipeId: string;
  context: NamingContext;
  slotContext: SlotContext;
}): CurrentRecipeName | undefined => {
  const recipe = recipes.find((currentRecipe) => currentRecipe.id === selectedRecipeId);

  if (!recipe) {
    return undefined;
  }

  const resolvedNaming = resolveRecipeNames(recipes, context, slotContext).byId[recipe.id];

  return {
    autoName: getAutoRecipeName(recipe, slotContext),
    autoBedrockName: getAutoBedrockName(recipe, slotContext),
    resolvedJavaName: resolvedNaming?.javaName,
    resolvedBedrockName: resolvedNaming?.bedrockName,
    resolvedBedrockIdentifier: resolvedNaming?.bedrockIdentifier,
  };
};
