import { NoTextureTexture } from "@/data/constants";
import { getRawId, identifierUniqueKey } from "@/data/models/identifier/utilities";
import { IngredientItem, type MinecraftIdentifier } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import {
  getCustomTagIdentifier,
  getFirstAvailableTexture,
  getTagLabel,
  resolveTagValues,
} from "@/lib/tags";

import { RecipeSlotValue, SlotContext, SlotDisplay } from "./types";

const cloneIdentifier = (id: MinecraftIdentifier): MinecraftIdentifier => ({ ...id });

export const cloneRecipeSlotValue = (value: RecipeSlotValue): RecipeSlotValue => {
  switch (value.kind) {
    case "item":
      return {
        kind: "item",
        id: cloneIdentifier(value.id),
        ...(value.count !== undefined ? { count: value.count } : {}),
      };
    case "custom_item":
      return {
        kind: "custom_item",
        uid: value.uid,
        ...(value.count !== undefined ? { count: value.count } : {}),
      };
    case "vanilla_tag":
      return {
        kind: "vanilla_tag",
        id: cloneIdentifier(value.id),
      };
    case "custom_tag":
      return {
        kind: "custom_tag",
        uid: value.uid,
      };
  }
};

export const toRecipeSlotValue = (item: IngredientItem): RecipeSlotValue => {
  if (item.type === "default_item") {
    return {
      kind: "item",
      id: cloneIdentifier(item.id),
      ...(item.count !== undefined ? { count: item.count } : {}),
    };
  }

  if (item.type === "custom_item") {
    return {
      kind: "custom_item",
      uid: item.uid,
      ...(item.count !== undefined ? { count: item.count } : {}),
    };
  }

  if (item.tagSource === "custom" && item.uid) {
    return { kind: "custom_tag", uid: item.uid };
  }

  return { kind: "vanilla_tag", id: cloneIdentifier(item.id) };
};

export const isTagSlotValue = (value: RecipeSlotValue | undefined) =>
  value?.kind === "vanilla_tag" || value?.kind === "custom_tag";

export const canEditSlotCount = (value: RecipeSlotValue | undefined) =>
  value?.kind === "item" || value?.kind === "custom_item";

export const getSlotCount = (value: RecipeSlotValue | undefined) =>
  value?.kind === "item" || value?.kind === "custom_item" ? value.count : undefined;

export const hasMissingCustomRef = (value: RecipeSlotValue | undefined, ctx: SlotContext) => {
  if (!value) {
    return false;
  }

  if (value.kind === "custom_item") {
    return !ctx.customItemsByUid[value.uid];
  }

  if (value.kind === "custom_tag") {
    return !ctx.tagsByUid[value.uid];
  }

  return false;
};

export const getSlotIdentifier = (
  value: RecipeSlotValue | undefined,
  ctx: SlotContext,
): MinecraftIdentifier | undefined => {
  if (!value) {
    return undefined;
  }

  switch (value.kind) {
    case "item":
    case "vanilla_tag":
      return value.id;
    case "custom_item":
      return ctx.customItemsByUid[value.uid]?.id;
    case "custom_tag": {
      const tag = ctx.tagsByUid[value.uid];
      return tag ? getCustomTagIdentifier(tag) : undefined;
    }
  }
};

export const getRequiredSlotIdentifier = (
  value: RecipeSlotValue | undefined,
  ctx: SlotContext,
): MinecraftIdentifier => {
  const identifier = getSlotIdentifier(value, ctx);

  if (!value || !identifier) {
    throw new Error(
      value
        ? `Cannot generate output for unresolved ${value.kind} reference`
        : "Cannot generate output for empty slot",
    );
  }

  return identifier;
};

export const getSlotDisplay = (
  value: RecipeSlotValue | undefined,
  ctx: SlotContext,
): SlotDisplay | undefined => {
  if (!value) {
    return undefined;
  }

  switch (value.kind) {
    case "item": {
      const item = ctx.resources?.itemsById[identifierUniqueKey(value.id)];

      return {
        label: item?.displayName ?? value.id.id,
        texture: item?.texture ?? NoTextureTexture,
      };
    }
    case "custom_item": {
      const item = ctx.customItemsByUid[value.uid];

      return item
        ? {
            label: item.displayName,
            texture: item.texture,
          }
        : {
            label: "Missing custom item",
            texture: NoTextureTexture,
            missing: true,
          };
    }
    case "vanilla_tag": {
      const rawId = getRawId(value.id);
      const previewValues = ctx.vanillaTags[rawId] ?? [];

      return {
        label: getTagLabel(rawId),
        texture: getFirstAvailableTexture(previewValues, ctx.resources?.itemsById),
        previewValues,
      };
    }
    case "custom_tag": {
      const tag = ctx.tagsByUid[value.uid];
      if (!tag) {
        return {
          label: "Missing custom tag",
          texture: NoTextureTexture,
          previewValues: [],
          missing: true,
        };
      }

      const identifier = getCustomTagIdentifier(tag);
      const rawId = getRawId(identifier);
      const previewValues = resolveTagValues(tag.values, ctx.allTags, ctx.vanillaTags);

      return {
        label: getTagLabel(rawId),
        texture: getFirstAvailableTexture(previewValues, ctx.resources?.itemsById),
        previewValues,
      };
    }
  }
};

export const createEmptySlotContext = (version: MinecraftVersion): SlotContext => ({
  version,
  resources: undefined,
  customItemsByUid: {},
  tagsByUid: {},
  allTags: [],
  vanillaTags: {},
});
