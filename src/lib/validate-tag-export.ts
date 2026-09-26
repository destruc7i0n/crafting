import { getRawId } from "@/data/models/identifier/utilities";
import { Tag } from "@/data/models/types";
import {
  buildTagGraph,
  findCyclicTagNodes,
  getCustomTagIdentifier,
  TagContext,
  tagValueExportRef,
  unique,
} from "@/lib/tags";

export interface DatapackTagIssue {
  tag: Tag;
  name: string;
  errors: string[];
}

// both conditions reach the exported files unannounced: a dangling ref is dropped from the tag,
// and a cycle exports as tags referencing each other, which Minecraft will not load
export const validateTagsForExport = (tags: Tag[], ctx: TagContext): DatapackTagIssue[] => {
  const cyclicNodes = findCyclicTagNodes(buildTagGraph(ctx));

  return tags
    .map((tag) => {
      const rawId = getRawId(getCustomTagIdentifier(tag));

      const missingRefErrors = tag.values
        .filter((value) => tagValueExportRef(value, ctx) === undefined)
        .map((value) =>
          value.type === "custom_item"
            ? "Tag references a missing custom item"
            : "Tag references a missing custom tag",
        );

      const errors = unique(missingRefErrors);
      if (cyclicNodes.has(rawId)) {
        errors.push("Tag is part of a reference cycle");
      }

      return { tag, name: rawId, errors };
    })
    .filter((issue) => issue.errors.length > 0);
};
