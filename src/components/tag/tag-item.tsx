import { MinecraftIdentifier } from "@/data/models/types";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { Item } from "../item/item";

type TagItemProps = {
  id: MinecraftIdentifier;
};

export const TagItem = ({ id }: TagItemProps) => {
  const { resources } = useResourcesForVersion();

  const item = resources?.itemsById[id.raw];

  if (!item) {
    return null;
  }

  return <Item item={item} container="ingredients" />;
};
