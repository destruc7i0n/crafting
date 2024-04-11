import { Item } from "../models/types";
import type { OutputItem, OutputItemWithData } from "../types";
import { MinecraftVersion } from "../types";

export const get112ItemOutputFormat = (
  item: Item,
  includeCount: boolean,
): OutputItemWithData => {
  return {
    item: item.id.id,
    count: (includeCount && item?.count) ?? 0 > 0 ? item.count : undefined,
    data: item.id.data,
  };
};

export const get113ItemOutputFormat = (
  item: Item,
  includeCount: boolean,
): OutputItem => {
  return {
    item: item.id.raw,
    count: (includeCount && item?.count) ?? 0 > 0 ? item.count : undefined,
  };
};

export const getItemOutputFormatterForVersion = (version: MinecraftVersion) => {
  const getOutputFormat =
    version === MinecraftVersion.V112
      ? get112ItemOutputFormat
      : get113ItemOutputFormat;
  return getOutputFormat;
};
