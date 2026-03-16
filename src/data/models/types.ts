import { MinecraftVersion } from "../types";

export interface MinecraftIdentifier {
  raw: string;

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
  name: string;
  namespace: string;
  values: TagValue[];
}

export interface TagValue {
  type: "item" | "tag";
  id: MinecraftIdentifier;
}
