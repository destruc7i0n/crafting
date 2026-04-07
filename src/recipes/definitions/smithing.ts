import { BedrockFormatVersion } from "@/data/generate/recipes/types";
import {
  buildBedrock as buildBedrockSmithing,
  buildJava as buildJavaSmithing,
  extractSmithingInput,
  validateSmithing,
} from "@/data/generate/smithing";
import { MinecraftVersion, RecipeSlot, RecipeType, SLOTS } from "@/data/types";

import { getSmithingAutoNames } from "./naming";
import { RecipeDefinition } from "./types";

const BEDROCK_FORMAT_VERSION: BedrockFormatVersion = "1.20.10";

const canEditResultCount = (editable: boolean) => (slot: RecipeSlot) =>
  editable && slot === SLOTS.smithing.result;

const createSmithingDefinition = ({
  type,
  label,
  availability,
  autoPlace,
  resultSlot,
  editableResultCount,
  bedrockWrapperKey,
}: {
  type: RecipeType.Smithing | RecipeType.SmithingTrim | RecipeType.SmithingTransform;
  label: string;
  availability: RecipeDefinition["availability"];
  autoPlace: RecipeSlot[];
  resultSlot?: RecipeSlot;
  editableResultCount: boolean;
  bedrockWrapperKey:
    | "minecraft:recipe_shapeless"
    | "minecraft:recipe_smithing_trim"
    | "minecraft:recipe_smithing_transform";
}): RecipeDefinition => ({
  type,
  family: "smithing",
  label,
  iconItemId: "minecraft:smithing_table",
  previewKind: "smithing",
  availability,
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
  generateBedrock: ({ recipe, formatter, slotContext }) =>
    buildBedrockSmithing(extractSmithingInput(recipe), formatter, slotContext),
  getBedrockMeta: () => ({
    wrapperKey: bedrockWrapperKey,
    tags: ["smithing_table"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  }),
});

export const smithingDefinition = createSmithingDefinition({
  type: RecipeType.Smithing,
  label: "Smithing",
  availability: {
    minVersion: MinecraftVersion.V116,
    maxVersion: MinecraftVersion.V118,
    bedrock: false,
  },
  autoPlace: [
    SLOTS.smithing.template,
    SLOTS.smithing.base,
    SLOTS.smithing.addition,
    SLOTS.smithing.result,
  ],
  resultSlot: SLOTS.smithing.result,
  editableResultCount: false,
  bedrockWrapperKey: "minecraft:recipe_shapeless",
});

export const smithingTrimDefinition = createSmithingDefinition({
  type: RecipeType.SmithingTrim,
  label: "Smithing Trim",
  availability: { minVersion: MinecraftVersion.V119, bedrock: true },
  autoPlace: [SLOTS.smithing.template, SLOTS.smithing.base, SLOTS.smithing.addition],
  editableResultCount: false,
  bedrockWrapperKey: "minecraft:recipe_smithing_trim",
});

export const smithingTransformDefinition = createSmithingDefinition({
  type: RecipeType.SmithingTransform,
  label: "Smithing Transform",
  availability: { minVersion: MinecraftVersion.V119, bedrock: true },
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
