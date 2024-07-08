import { Item } from "../models/types";
import type {
  OutputItem112,
  OutputItem112WithData,
  OutputItem121,
} from "../types";

export const get112ItemOutputFormat = (
  item: Item,
  includeCount: boolean,
): OutputItem112WithData => {
  return {
    item: item.id.id,
    count: (includeCount && item?.count) ?? 0 > 0 ? item.count : undefined,
    data: item.id.data,
  };
};

export const get113ItemOutputFormat = (
  item: Item,
  includeCount: boolean,
): OutputItem112 => {
  return {
    item: item.id.raw,
    count: (includeCount && item?.count) ?? 0 > 0 ? item.count : undefined,
  };
};

export const get121ItemOutputFormat = (
  item: Item,
  includeCount: boolean,
): OutputItem121 => {
  return {
    id: item.id.raw,
    count: (includeCount && item?.count) ?? 0 > 0 ? item.count : undefined,
  };
};
