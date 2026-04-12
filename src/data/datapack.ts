import { strToU8, zipSync } from "fflate";

import { getJavaPackMetadata } from "@/versioning";

import { generateTag } from "./generate/tag";
import { parseStringToMinecraftIdentifier } from "./models/identifier/utilities";
import { Tag } from "./models/types";
import { MinecraftVersion } from "./types";

export interface DatapackRecipeFile {
  name: string;
  json: object;
}

type PackMetadata =
  | { pack_format: number }
  | { min_format: number | [number, number]; max_format: number | [number, number] };

const getPackMetadata = (version: MinecraftVersion): PackMetadata => {
  const { packFormat } = getJavaPackMetadata(version);

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
  const { recipeDir, tagDir } = getJavaPackMetadata(version);

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

  for (const recipeFile of recipeFiles) {
    files[`data/crafting/${recipeDir}/${recipeFile.name}.json`] = strToU8(
      JSON.stringify(recipeFile.json, null, 2),
    );
  }

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
