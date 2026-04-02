import { recipeTypeToName } from "@/data/constants";
import { getRawId } from "@/data/models/identifier/utilities";
import { IngredientItem } from "@/data/models/types";
import { MinecraftVersion, RecipeType, SLOTS } from "@/data/types";
import { sanitizeBedrockIdentifierPart } from "@/lib/minecraft-identifier";
import { SingleRecipeState } from "@/stores/recipe";

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
  recipe: SingleRecipeState;
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

const toNames = (...values: Array<string | undefined>) =>
  unique(
    values.flatMap((value) => {
      if (!value) {
        return [];
      }

      const name = sanitizeRecipeName(value);
      return name ? [name] : [];
    }),
  );

const itemSlug = (item: IngredientItem | undefined) => {
  if (!item) return undefined;

  const raw = getRawId(item.id);
  const base = raw.startsWith("minecraft:")
    ? raw.slice("minecraft:".length)
    : raw.replace(":", "_");
  const slug = sanitizeRecipeName(base.replace(/[:/.-]+/g, "_"));

  if (!slug) {
    return undefined;
  }

  if (item.id.data === undefined || item.id.data === 0) {
    return slug;
  }

  return `${slug}_data_${item.id.data}`;
};

const getResultItem = (recipe: SingleRecipeState) => {
  switch (recipe.recipeType) {
    case RecipeType.Crafting:
    case RecipeType.CraftingTransmute:
      return recipe.slots[SLOTS.crafting.result];
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.Smoking:
    case RecipeType.CampfireCooking:
      return recipe.slots[SLOTS.cooking.result];
    case RecipeType.Stonecutter:
      return recipe.slots[SLOTS.stonecutter.result];
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
      return recipe.slots[SLOTS.smithing.result];
    case RecipeType.SmithingTrim:
      return undefined;
    default:
      return undefined;
  }
};

const getSidebarBaseTitle = (recipe: SingleRecipeState) => {
  const result = getResultItem(recipe);
  const displayName = result?.displayName.trim();

  if (displayName) {
    return displayName;
  }

  return `${recipeTypeToName[recipe.recipeType]} Recipe`;
};

const getCraftingNames = (recipe: SingleRecipeState) =>
  toNames(itemSlug(recipe.slots[SLOTS.crafting.result]) ?? "crafting_recipe");

const getTransmuteNames = (recipe: SingleRecipeState) =>
  toNames(itemSlug(recipe.slots[SLOTS.crafting.result]) ?? "crafting_transmute_recipe");

const buildCookingNames = (
  result: string | undefined,
  ingredient: string | undefined,
  {
    fallback,
    resultSuffix,
    ingredientSuffix,
    extras = [],
  }: {
    fallback: string;
    resultSuffix: string;
    ingredientSuffix: string;
    extras?: Array<string | undefined>;
  },
) => {
  let base = fallback;

  if (result) {
    base = `${result}${resultSuffix}`;
  } else if (ingredient) {
    base = `${ingredient}${ingredientSuffix}`;
  }

  return toNames(ensureName(base), ...extras);
};

const getCookingNames = (recipe: SingleRecipeState) => {
  const result = itemSlug(recipe.slots[SLOTS.cooking.result]);
  const ingredient = itemSlug(recipe.slots[SLOTS.cooking.ingredient]);

  switch (recipe.recipeType) {
    case RecipeType.Smelting:
      return buildCookingNames(result, ingredient, {
        fallback: "smelting",
        resultSuffix: "_from_smelting",
        ingredientSuffix: "_smelting",
        extras: [
          result && ingredient ? `${result}_from_smelting_${ingredient}` : undefined,
          result,
        ],
      });
    case RecipeType.Blasting:
      return buildCookingNames(result, ingredient, {
        fallback: "blasting",
        resultSuffix: "_from_blasting",
        ingredientSuffix: "_blasting",
        extras: [result && ingredient ? `${result}_from_blasting_${ingredient}` : undefined],
      });
    case RecipeType.Smoking:
      return buildCookingNames(result, ingredient, {
        fallback: "smoking",
        resultSuffix: "_from_smoking",
        ingredientSuffix: "_smoking",
      });
    case RecipeType.CampfireCooking:
      return buildCookingNames(result, ingredient, {
        fallback: "campfire_cooking",
        resultSuffix: "_from_campfire_cooking",
        ingredientSuffix: "_campfire_cooking",
      });
    default:
      return [FALLBACK_NAME];
  }
};

const getStonecuttingNames = (recipe: SingleRecipeState) => {
  const result = itemSlug(recipe.slots[SLOTS.stonecutter.result]);
  const ingredient = itemSlug(recipe.slots[SLOTS.stonecutter.ingredient]);
  let base = "stonecutting_recipe";

  if (result && ingredient) {
    base = `${result}_from_${ingredient}_stonecutting`;
  } else if (result) {
    base = `${result}_stonecutting`;
  } else if (ingredient) {
    base = `${ingredient}_stonecutting`;
  }

  return toNames(ensureName(base));
};

const getSmithingNames = (recipe: SingleRecipeState) => {
  const result = itemSlug(recipe.slots[SLOTS.smithing.result]);
  const template = itemSlug(recipe.slots[SLOTS.smithing.template]);
  const baseItem = itemSlug(recipe.slots[SLOTS.smithing.base]);

  if (recipe.recipeType === RecipeType.SmithingTrim) {
    return toNames(template ? `${template}_smithing_trim` : "smithing_trim");
  }

  let base = "smithing_recipe";

  if (result) {
    base = `${result}_smithing`;
  } else if (baseItem) {
    base = `${baseItem}_smithing`;
  }

  return toNames(base);
};

const getRecipeNameCandidates = (recipe: SingleRecipeState) => {
  switch (recipe.recipeType) {
    case RecipeType.Crafting:
      return getCraftingNames(recipe);
    case RecipeType.CraftingTransmute:
      return getTransmuteNames(recipe);
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.Smoking:
    case RecipeType.CampfireCooking:
      return getCookingNames(recipe);
    case RecipeType.Stonecutter:
      return getStonecuttingNames(recipe);
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
    case RecipeType.SmithingTrim:
      return getSmithingNames(recipe);
    default:
      return [FALLBACK_NAME];
  }
};

export const getAutoRecipeName = (recipe: SingleRecipeState) =>
  getRecipeNameCandidates(recipe)[0] ?? FALLBACK_NAME;

const getManualJavaName = (recipe: SingleRecipeState) => {
  const manualName = sanitizeRecipeName(recipe.name);

  return manualName || undefined;
};

const getSelectedJavaName = (recipe: SingleRecipeState) => {
  if (recipe.nameMode === "manual") {
    return getManualJavaName(recipe);
  }

  return getAutoRecipeName(recipe);
};

const getManualBedrockName = (recipe: SingleRecipeState) => {
  const manualIdentifierName = sanitizeRecipeName(recipe.bedrock.identifierName);

  return manualIdentifierName || undefined;
};

const getAutoBedrockName = (recipe: SingleRecipeState) =>
  getSelectedJavaName(recipe) ?? getAutoRecipeName(recipe);

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

const buildSidebarTitles = (recipes: SingleRecipeState[]) => {
  const titleCounts = new Map<string, number>();
  const titleIndexes = new Map<string, number>();
  const labels: Record<string, string> = {};

  for (const recipe of recipes) {
    const title = getSidebarBaseTitle(recipe);
    titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
  }

  for (const recipe of recipes) {
    const title = getSidebarBaseTitle(recipe);
    const occurrence = (titleIndexes.get(title) ?? 0) + 1;
    titleIndexes.set(title, occurrence);

    labels[recipe.id] =
      (titleCounts.get(title) ?? 0) > 1 && occurrence > 1 ? `${title} (${occurrence})` : title;
  }

  return labels;
};

const getJavaNameEntry = (recipe: SingleRecipeState): NameEntry => {
  const manualName = getManualJavaName(recipe);

  return {
    recipe,
    fixedName: recipe.nameMode === "manual" ? manualName : undefined,
    possibleNames: recipe.nameMode === "manual" ? [] : getRecipeNameCandidates(recipe),
    skipAssignment: recipe.nameMode === "manual" && !manualName,
  };
};

const getBedrockNameEntry = (recipe: SingleRecipeState): NameEntry => {
  const manualIdentifierName = getManualBedrockName(recipe);
  const manualJavaName = getManualJavaName(recipe);
  const autoNames = getRecipeNameCandidates(recipe);
  const autoBedrockName = getAutoBedrockName(recipe);

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
  recipes: SingleRecipeState[],
  context: NamingContext,
): ResolvedRecipeNames => {
  const sidebarTitles = buildSidebarTitles(recipes);
  const javaAssignments = assignUniqueNames(recipes.map(getJavaNameEntry));
  const bedrockAssignments = assignUniqueNames(recipes.map(getBedrockNameEntry));

  const byId: Record<string, RecipeNaming> = {};

  for (const recipe of recipes) {
    const javaName = javaAssignments[recipe.id];
    const bedrockName = bedrockAssignments[recipe.id];

    byId[recipe.id] = {
      sidebarTitle: sidebarTitles[recipe.id] ?? getSidebarBaseTitle(recipe),
      javaName,
      bedrockName,
      bedrockIdentifier: getBedrockIdentifier(bedrockName, context),
    };
  }

  return { byId };
};

export const getCurrentRecipeName = (
  recipes: SingleRecipeState[],
  selectedRecipeIndex: number,
  context: NamingContext,
): CurrentRecipeName | undefined => {
  const recipe = recipes[selectedRecipeIndex];

  if (!recipe) {
    return undefined;
  }

  const resolvedNaming = resolveRecipeNames(recipes, context).byId[recipe.id];

  return {
    autoName: getAutoRecipeName(recipe),
    autoBedrockName: getAutoBedrockName(recipe),
    resolvedJavaName: resolvedNaming?.javaName,
    resolvedBedrockName: resolvedNaming?.bedrockName,
    resolvedBedrockIdentifier: resolvedNaming?.bedrockIdentifier,
  };
};
