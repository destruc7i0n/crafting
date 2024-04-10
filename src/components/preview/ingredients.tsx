import { useEffect, useState } from "react";

import { MinecraftIdentifier } from "@/data/models/identifier/MinecraftIdentifier";
import { Item } from "@/data/models/item/Item";
import { Registry } from "@/data/models/Registry";
import { getItemRegistryByVersion } from "@/data/registries/items";
import { MinecraftVersion } from "@/data/types";

import { Ingredient } from "./ingredient/ingredient";
import { GridItem } from "./minecraft/grid-item/grid-item";

export const Ingredients = () => {
  const [registry, setRegistry] = useState<Registry<
    MinecraftIdentifier,
    Item
  > | null>(null);

  useEffect(() => {
    (async () => {
      const itemRegistry = await getItemRegistryByVersion(
        MinecraftVersion.V120,
      );

      setRegistry(itemRegistry);
    })();
  }, []);

  if (!registry) return <div>items</div>;

  return (
    <div className="flex max-h-[calc(100vh-6rem)] flex-1 flex-wrap overflow-auto">
      {registry.map((_key, item) => {
        return (
          <GridItem>
            <Ingredient
              item={item}
              key={item.id.toString()}
              container="ingredients"
            />
          </GridItem>
        );
      })}
    </div>
  );
};
