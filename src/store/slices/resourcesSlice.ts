import {
  Item as MinecraftTexturesItem,
  TexturesType as MinecraftTexturesType,
} from "minecraft-textures";

import { transformMinecraftTexturesItem } from "@/data/models/item/utilities";
import { Item } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

import { createAppSlice } from "../createAppSlice";
import { RootState } from "../store";

interface VersionResourceData {
  items: Item[];
  itemsById: Record<string, Item>;
  textures: Record<string, string>;
}

export type ResourcesSliceState = {
  [key in MinecraftVersion]?: VersionResourceData;
};

const initialState: ResourcesSliceState = {};

export const resourcesSlice = createAppSlice({
  name: "resources",
  initialState,
  reducers: (create) => ({
    fetchResources: create.asyncThunk(
      async (version: MinecraftVersion) => {
        const module: MinecraftTexturesType = await import(
          `../../../node_modules/minecraft-textures/dist/textures/json/${version}.json`
        );

        return module.items;
      },
      {
        pending: (state, action) => {
          state[action.meta.arg] = {
            items: [],
            itemsById: {},
            textures: {},
          };
        },
        fulfilled: (state, action) => {
          const mcTexturesItems = action.payload as MinecraftTexturesItem[];

          const items: Item[] = [];
          const itemsById: Record<string, Item> = {};
          const textures: Record<string, string> = {};

          for (const mcTexturesItem of mcTexturesItems) {
            const item = transformMinecraftTexturesItem(
              mcTexturesItem,
              action.meta.arg,
            );
            items.push(item);
            itemsById[item.id.raw] = item;
            textures[item.id.raw] = mcTexturesItem.texture;
          }

          state[action.meta.arg] = {
            items,
            itemsById,
            textures,
          };
        },
        options: {
          condition: (version: MinecraftVersion, { getState }): boolean => {
            return !(version in (getState() as RootState).resources);
          },
        },
      },
    ),
  }),
  selectors: {},
});

export const { fetchResources } = resourcesSlice.actions;
