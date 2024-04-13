import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { Item } from "./item/item";
import { Slot } from "./slot/slot";

export const Items = () => {
  const { resources } = useResourcesForVersion();

  if (!resources) return <div>items</div>;

  return (
    <div className="flex max-h-[calc(100vh-6rem)] flex-1 flex-wrap overflow-y-auto">
      {resources.items.map((item) => (
        <Slot key={item.id.raw}>
          <Item key={item.id.raw} item={item} container="ingredients" />
        </Slot>
      ))}
    </div>
  );
};
