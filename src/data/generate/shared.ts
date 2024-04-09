import { Item as ItemModel } from "../models/item/Item";
import type { Item, ItemWithData } from "../types";
import { MinecraftVersion } from "../types";

export const get112ItemOutputFormat = (
  item: ItemModel,
  includeCount: boolean,
): ItemWithData => {
  return {
    item: item.id.id,
    count: includeCount && item.count > 0 ? item.count : undefined,
    data: item.id.rest.length > 0 ? Number(item.id.rest[0]) : undefined,
  };
};

export const get113ItemOutputFormat = (
  item: ItemModel,
  includeCount: boolean,
): Item => {
  return {
    item: item.id.toString(),
    count: includeCount && item.count > 0 ? item.count : undefined,
  };
};

export const getItemOutputFormatterForVersion = (version: MinecraftVersion) => {
  const getOutputFormat =
    version === MinecraftVersion.V112
      ? get112ItemOutputFormat
      : get113ItemOutputFormat;
  return getOutputFormat;
};
