import { useEffect } from "react";

import { MinecraftVersion } from "@/data/types";
import { useResourcesStore } from "@/stores/resources";
import {
  getPotionCatalogSourceVersion,
  loadPotions,
  retryPotions,
} from "@/stores/resources/loader";

export const usePotionCatalogForMinecraftVersion = (version: MinecraftVersion) => {
  const sourceVersion = getPotionCatalogSourceVersion(version);
  const state = useResourcesStore((resources) =>
    sourceVersion ? resources.potionCatalogs[sourceVersion] : undefined,
  );

  useEffect(() => {
    loadPotions(version);
  }, [version]);

  return {
    catalog: state?.catalog,
    error: state?.error,
    loading: state?.status === "loading",
    retry: () => retryPotions(version),
  };
};
