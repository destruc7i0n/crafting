import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { Ingredient } from "./ingredient/ingredient";
import { GridItem } from "./minecraft/grid-item/grid-item";

export const Ingredients = () => {
  const { resources } = useResourcesForVersion();

  if (!resources) return <div>items</div>;

  return (
    <div className="flex max-h-[calc(100vh-6rem)] flex-1 flex-wrap overflow-auto">
      {resources.items.map((item) => {
        return (
          <GridItem>
            <Ingredient item={item} key={item.id.raw} container="ingredients" />
          </GridItem>
        );
      })}
    </div>
  );
};
