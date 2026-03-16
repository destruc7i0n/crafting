import { getRawId } from "@/data/models/identifier/utilities";

import { Tag } from "../models/types";
import { OutputTag } from "../types";

export function generateTag(tag: Tag): OutputTag {
  return {
    replace: false,
    values: tag.values.map((value) =>
      value.type === "tag" ? `#${getRawId(value.id)}` : getRawId(value.id),
    ),
  };
}
