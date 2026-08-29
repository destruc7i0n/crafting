import { TagContext, tagValueExportRef, unique } from "@/lib/tags";

import { Tag } from "../models/types";

interface OutputTag {
  replace: boolean;
  values: string[];
}

export function generateTag(tag: Tag, ctx: TagContext): OutputTag {
  return {
    replace: false,
    // two distinct values can share an export ref, and resolveTagValues already dedupes in-app
    values: unique(
      tag.values
        .map((value) => tagValueExportRef(value, ctx))
        .filter((ref): ref is string => ref !== undefined),
    ),
  };
}
