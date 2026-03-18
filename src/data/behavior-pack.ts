import { isValidBedrockNamespacedIdentifier } from "@/lib/minecraft-identifier";

export interface BehaviorPackRecipeFile {
  identifier: string;
  json: object;
}

const PACK_VERSION = [1, 0, 0] as const;
const MIN_ENGINE_VERSION = [1, 21, 0] as const;

const sanitizeRecipeFileName = (identifier: string) => {
  return (
    identifier
      .trim()
      .replace(/[:/\\]+/g, "_")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "recipe"
  );
};

export const getBehaviorPackRecipeFileName = (identifier: string) => {
  return `${sanitizeRecipeFileName(identifier)}.json`;
};

export const createBehaviorPackBlob = async (
  recipeFiles: BehaviorPackRecipeFile[],
): Promise<Blob> => {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const headerUuid = crypto.randomUUID();
  const moduleUuid = crypto.randomUUID();
  const seenIdentifiers = new Set<string>();
  const seenFileNames = new Set<string>();

  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        format_version: 2,
        header: {
          name: "Crafting Generator Recipes",
          description: "Generated with TheDestruc7i0n's Crafting Generator",
          uuid: headerUuid,
          version: PACK_VERSION,
          min_engine_version: MIN_ENGINE_VERSION,
        },
        modules: [
          {
            type: "data",
            uuid: moduleUuid,
            version: PACK_VERSION,
          },
        ],
        metadata: {
          generated_with: {
            crafting_generator: ["0.0.0"],
          },
        },
      },
      null,
      2,
    ),
  );

  for (const recipeFile of recipeFiles) {
    const identifier = recipeFile.identifier.trim();

    if (!identifier) {
      throw new Error("Bedrock recipes must have an identifier");
    }

    if (!isValidBedrockNamespacedIdentifier(identifier)) {
      throw new Error(`Invalid identifier: ${identifier}`);
    }

    if (seenIdentifiers.has(identifier)) {
      throw new Error(`Duplicate identifier: ${identifier}`);
    }

    seenIdentifiers.add(identifier);

    const fileName = getBehaviorPackRecipeFileName(identifier);

    if (seenFileNames.has(fileName)) {
      throw new Error(`Duplicate behavior pack recipe filename: ${fileName}`);
    }

    seenFileNames.add(fileName);
    zip.file(`recipes/${fileName}`, JSON.stringify(recipeFile.json, null, 2));
  }

  return zip.generateAsync({ type: "blob" });
};
