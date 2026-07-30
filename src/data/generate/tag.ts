import { TagContext, tagValueExportRef } from "@/lib/tags";

import { Tag } from "../models/types";

interface OutputTag {
  replace: boolean;
  values: string[];
}

export function generateTag(tag: Tag, ctx: TagContext): OutputTag {
  return {
    replace: false,
    values: tag.values
      .map((value) => tagValueExportRef(value, ctx))
      .filter((ref): ref is string => ref !== undefined),
  };
}
