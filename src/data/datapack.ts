import { strToU8, zipSync } from "fflate";

import { javaMinecraftVersions } from "./constants";
import { generateTag } from "./generate/tag";
import { isVersionAtLeast } from "./generate/version-utils";
import { parseStringToMinecraftIdentifier } from "./models/identifier/utilities";
import { Tag } from "./models/types";
import { MinecraftVersion } from "./types";

export interface DatapackRecipeFile {
  name: string;
  json: object;
}

type JavaPackFormatVersion = Exclude<(typeof javaMinecraftVersions)[number], MinecraftVersion.V112>;
type PackFormatVersion = number | [number, number];

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
  // 1.21.9+: pack format uses major.minor - [major, minor] tuple
  [MinecraftVersion.V1219]: [88, 0],
  [MinecraftVersion.V12111]: [94, 1],
  [MinecraftVersion.V261]: [101, 1],
} satisfies Record<JavaPackFormatVersion, PackFormatVersion>;

type PackMetadata =
  | { pack_format: number }
  | { min_format: PackFormatVersion; max_format: PackFormatVersion };

const getPackMetadata = (version: MinecraftVersion): PackMetadata => {
  const packFormat = packFormatByVersion[version as JavaPackFormatVersion];

  if (packFormat === undefined) {
    throw new Error(`Datapacks are not supported for ${version}`);
  }

  if (Array.isArray(packFormat)) {
    return { min_format: packFormat, max_format: packFormat };
  }

  return { pack_format: packFormat };
};

const generateTagFiles = (tags: Tag[]) => {
  return tags.map((tag) => {
    const identifier = parseStringToMinecraftIdentifier(tag.id);

    return {
      namespace: identifier.namespace,
      id: identifier.id,
      data: generateTag(tag),
    };
  });
};

export const createDatapackBlob = (
  version: MinecraftVersion,
  recipeFiles: DatapackRecipeFile[],
  tags: Tag[],
): Blob => {
  const files: Record<string, Uint8Array> = {};

  files["pack.mcmeta"] = strToU8(
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
    files[`data/crafting/${recipeDir}/${recipeFile.name}.json`] = strToU8(
      JSON.stringify(recipeFile.json, null, 2),
    );
  }

  const tagDir = isVersionAtLeast(version, MinecraftVersion.V121) ? "tags/item" : "tags/items";

  for (const tag of generateTagFiles(tags)) {
    files[`data/${tag.namespace}/${tagDir}/${tag.id}.json`] = strToU8(
      JSON.stringify(tag.data, null, 2),
    );
  }

  return new Blob([zipSync(files).buffer as ArrayBuffer]);
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};
