import { Item } from "@/data/models/types";

import { useResourcesForVersion } from "./use-resources-for-version";

export const useResourceTexture = (resource: Item) => {
  const { resources } = useResourcesForVersion();
  return resources?.textures?.[resource.id.raw];
};
