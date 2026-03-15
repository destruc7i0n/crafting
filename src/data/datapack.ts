import JSZip from "jszip";

import { javaMinecraftVersions } from "./constants";
import { Tag } from "./models/types";
import { MinecraftVersion } from "./types";
import { generateTag } from "./generate/tag";
import { isVersionAtLeast } from "./generate/version-utils";

export interface DatapackRecipeFile {
  name: string;
  json: object;
}

type JavaPackFormatVersion = Exclude<(typeof javaMinecraftVersions)[number], MinecraftVersion.V112>;

const packFormatByVersion = {
  [MinecraftVersion.V113]: 4,
  [MinecraftVersion.V114]: 4,
  [MinecraftVersion.V115]: 5,
  [MinecraftVersion.V116]: 6,
  [MinecraftVersion.V117]: 7,
  [MinecraftVersion.V118]: 8,
  [MinecraftVersion.V119]: 10,
  [MinecraftVersion.V120]: 15,
  [MinecraftVersion.V121]: 48,
  [MinecraftVersion.V1212]: 57,
  [MinecraftVersion.V1214]: 61,
  [MinecraftVersion.V1215]: 71,
  [MinecraftVersion.V1216]: 80,
  [MinecraftVersion.V1217]: 81,
  [MinecraftVersion.V1219]: 88,
  [MinecraftVersion.V12111]: 94,
} satisfies Record<JavaPackFormatVersion, number>;

type PackMetadata = { pack_format: number } | { min_format: number; max_format: number };

const getPackMetadata = (version: MinecraftVersion): PackMetadata => {
  const packFormat = packFormatByVersion[version as JavaPackFormatVersion];

  if (packFormat === undefined) {
    throw new Error(`Datapacks are not supported for ${version}`);
  }

  if (isVersionAtLeast(version, MinecraftVersion.V1219)) {
    return {
      min_format: packFormat,
      max_format: packFormat,
    };
  }

  return {
    pack_format: packFormat,
  };
};

const generateTagFiles = (tags: Tag[]) => {
  return tags.map((tag) => ({
    namespace: tag.namespace,
    id: tag.name,
    data: generateTag(tag),
  }));
};

export const createDatapackBlob = async (
  version: MinecraftVersion,
  recipeFiles: DatapackRecipeFile[],
  tags: Tag[],
): Promise<Blob> => {
  const zip = new JSZip();

  zip.file(
    "pack.mcmeta",
    JSON.stringify(
      {
        pack: {
          description: "Generated with TheDestruc7i0n's Crafting Generator",
          ...getPackMetadata(version),
        },
      },
      null,
      2,
    ),
  );

  const recipeDir = isVersionAtLeast(version, MinecraftVersion.V121) ? "recipe" : "recipes";

  for (const recipeFile of recipeFiles) {
    zip.file(
      `data/crafting/${recipeDir}/${recipeFile.name}.json`,
      JSON.stringify(recipeFile.json, null, 2),
    );
  }

  const tagDir = isVersionAtLeast(version, MinecraftVersion.V121) ? "tags/item" : "tags/items";

  for (const tag of generateTagFiles(tags)) {
    zip.file(`data/${tag.namespace}/${tagDir}/${tag.id}.json`, JSON.stringify(tag.data, null, 2));
  }

  return zip.generateAsync({ type: "blob" });
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};
