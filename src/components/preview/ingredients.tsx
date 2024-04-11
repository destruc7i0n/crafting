import { selectResourcesByVersion, useAppSelector } from "@/store/hooks";

import { Ingredient } from "./ingredient/ingredient";
import { GridItem } from "./minecraft/grid-item/grid-item";

export const Ingredients = () => {
  const ingredients = useAppSelector(selectResourcesByVersion);

  if (!ingredients) return <div>items</div>;

  return (
    <div className="flex max-h-[calc(100vh-6rem)] flex-1 flex-wrap overflow-auto">
      {ingredients.items.map((item) => {
        return (
          <GridItem>
            <Ingredient item={item} key={item.id.raw} container="ingredients" />
          </GridItem>
        );
      })}
    </div>
  );
};
