import { MinecraftVersion, RecipeSlot, RecipeType, SLOTS } from "@/data/types";
import {
  buildBedrock as buildBedrockSmithing,
  buildJava as buildJavaSmithing,
  extractSmithingInput,
  validateSmithing,
} from "@/recipes/generate/smithing";
import { BedrockFormatVersion } from "@/recipes/generate/types";

import { getSmithingAutoNames } from "./auto-naming";
import {
  BaseRecipeDefinition,
  BedrockSupportedRecipeDefinition,
  JavaOnlyRecipeDefinition,
} from "./types";

const BEDROCK_FORMAT_VERSION: BedrockFormatVersion = "1.20.10";

const canEditResultCount = (editable: boolean) => (slot: RecipeSlot) =>
  editable && slot === SLOTS.smithing.result;

const createCommonSmithingDefinition = ({
  type,
  label,
  autoPlace,
  resultSlot,
  editableResultCount,
}: {
  type: RecipeType.Smithing | RecipeType.SmithingTrim | RecipeType.SmithingTransform;
  label: string;
  autoPlace: RecipeSlot[];
  resultSlot?: RecipeSlot;
  editableResultCount: boolean;
}): Omit<BaseRecipeDefinition, "availability"> => ({
  type,
  family: "smithing",
  label,
  iconItemId: "minecraft:smithing_table",
  previewKind: "smithing",
  slots: {
    getAutoPlace: () => autoPlace,
    resultSlots: [SLOTS.smithing.result],
    canEditCount: canEditResultCount(editableResultCount),
    isDisabled: () => false,
  },
  naming: {
    ...(resultSlot ? { resultSlot } : {}),
    sidebarFallbackLabel: `${label} Recipe`,
    getAutoNames: getSmithingAutoNames,
  },
  validate: (recipe, version) => validateSmithing(recipe, version),
  generateJava: ({ recipe, formatter, version, slotContext }) =>
    buildJavaSmithing({
      state: extractSmithingInput(recipe),
      formatter,
      version,
      slotContext,
    }),
});

const createJavaOnlySmithingDefinition = ({
  availability,
  ...args
}: Parameters<typeof createCommonSmithingDefinition>[0] & {
  availability: BaseRecipeDefinition["availability"];
}): JavaOnlyRecipeDefinition => ({
  ...createCommonSmithingDefinition(args),
  availability,
});

const createBedrockSupportedSmithingDefinition = ({
  availability,
  bedrockWrapperKey,
  ...args
}: Parameters<typeof createCommonSmithingDefinition>[0] & {
  availability: BaseRecipeDefinition["availability"];
  bedrockWrapperKey:
    | "minecraft:recipe_shapeless"
    | "minecraft:recipe_smithing_trim"
    | "minecraft:recipe_smithing_transform";
}): BedrockSupportedRecipeDefinition => ({
  ...createCommonSmithingDefinition(args),
  availability,
  generateBedrock: ({ recipe, formatter, slotContext }) =>
    buildBedrockSmithing(extractSmithingInput(recipe), formatter, slotContext),
  getBedrockMeta: () => ({
    wrapperKey: bedrockWrapperKey,
    tags: ["smithing_table"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  }),
});

export const smithingDefinition = createJavaOnlySmithingDefinition({
  type: RecipeType.Smithing,
  label: "Smithing",
  availability: {
    minVersion: MinecraftVersion.V116,
    // V119 = 1.19.4, which still uses old smithing
    maxVersion: MinecraftVersion.V119,
  },
  autoPlace: [
    SLOTS.smithing.template,
    SLOTS.smithing.base,
    SLOTS.smithing.addition,
    SLOTS.smithing.result,
  ],
  resultSlot: SLOTS.smithing.result,
  editableResultCount: false,
});

export const smithingTrimDefinition = createBedrockSupportedSmithingDefinition({
  type: RecipeType.SmithingTrim,
  label: "Smithing Trim",
  availability: { minVersion: MinecraftVersion.V120 },
  autoPlace: [SLOTS.smithing.template, SLOTS.smithing.base, SLOTS.smithing.addition],
  editableResultCount: false,
  bedrockWrapperKey: "minecraft:recipe_smithing_trim",
});

export const smithingTransformDefinition = createBedrockSupportedSmithingDefinition({
  type: RecipeType.SmithingTransform,
  label: "Smithing Transform",
  availability: { minVersion: MinecraftVersion.V120 },
  autoPlace: [
    SLOTS.smithing.template,
    SLOTS.smithing.base,
    SLOTS.smithing.addition,
    SLOTS.smithing.result,
  ],
  resultSlot: SLOTS.smithing.result,
  editableResultCount: true,
  bedrockWrapperKey: "minecraft:recipe_smithing_transform",
});
