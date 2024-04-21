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
}
