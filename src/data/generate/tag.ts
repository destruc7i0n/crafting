import { getRawId } from "@/data/models/identifier/utilities";
import { toTagRef } from "@/lib/tags";

import { Tag } from "../models/types";

interface OutputTag {
  replace: boolean;
  values: string[];
}

export function generateTag(tag: Tag): OutputTag {
  return {
    replace: false,
    values: tag.values.map((value) =>
      value.type === "tag" ? toTagRef(getRawId(value.id)) : getRawId(value.id),
    ),
  };
}
