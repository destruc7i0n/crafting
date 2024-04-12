import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { Ingredient } from "../ingredient/ingredient";
import { Slot } from "../slot/slot";

export const Ingredients = () => {
  const { resources } = useResourcesForVersion();

  if (!resources) return <div>items</div>;

  return (
    <div className="flex max-h-[calc(100vh-6rem)] flex-1 flex-wrap overflow-auto">
      {resources.items.map((item) => {
        return (
          <Slot key={item.id.raw}>
            <Ingredient key={item.id.raw} item={item} container="ingredients" />
          </Slot>
        );
      })}
    </div>
  );
};
