import { MinecraftVersion } from "@/data/types";

import { ResourcesState } from "./index";

export const selectResourcesForVersion =
  (minecraftVersion: MinecraftVersion) => (state: ResourcesState) =>
    state[minecraftVersion];
