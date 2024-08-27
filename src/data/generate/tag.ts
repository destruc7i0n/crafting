import { Tag } from "../models/types";
import { OutputTag } from "../types";

export function generateTag(tag: Tag): OutputTag {
  return {
    values: tag.values.map((value) => value.id.raw),
  };
}
