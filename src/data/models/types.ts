import { MinecraftVersion } from "../types";

export interface MinecraftIdentifier {
  namespace: string;
  id: string;
  data?: number;
}

export interface BaseItem {
  id: MinecraftIdentifier;
  displayName: string;
  texture: string;
  count?: number;
  _version: MinecraftVersion;
}

export interface Item extends BaseItem {
  type: "default_item";
}

export interface CustomItem extends BaseItem {
  type: "custom_item";
  uid: string;
}

export interface TagItem extends BaseItem {
  type: "tag_item";
  tagSource: "custom" | "vanilla";
  uid?: string;
  values: string[];
}

export type IngredientItem = Item | CustomItem | TagItem;

export interface Tag {
  uid: string;
  id: string;
  values: TagValue[];
}

/**
 * Vanilla entities are referenced by identifier because that is what a tag file contains and what
 * maps across versions and editions. User-authored entities are referenced by uid because their
 * identifier is mutable — the same split `RecipeSlotValue` makes.
 */
export type TagValue =
  | { type: "item"; id: MinecraftIdentifier }
  | { type: "tag"; id: MinecraftIdentifier }
  | { type: "custom_tag"; uid: string };
