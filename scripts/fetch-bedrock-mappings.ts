// Item mappings sourced from GeyserMC/mappings (MIT License)
// https://github.com/GeyserMC/mappings

import path from "node:path";

import { latestVersion } from "minecraft-textures";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(repoRoot, "src/data/generated/bedrock-mappings.json");
const geyserMappingsUrl = "https://raw.githubusercontent.com/GeyserMC/mappings/master/items.json";
const mojangBedrockSamplesUrl =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/metadata/vanilladata_modules/mojang-items.json";

type GeyserItemMapping = {
  bedrock_identifier: string;
  bedrock_data: number;
};

type BedrockSamplesMojangItem = {
  name: string;
  raw_id: number;
};
type BedrockSamplesMojangItemsFile = {
  data_items: BedrockSamplesMojangItem[];
};
type MinecraftTexturesFile = {
  items: Array<{
    id: string;
  }>;
};

type BedrockTranslation = {
  id: string;
  data?: number;
};

// Java items that have no real Bedrock equivalent (GeyserMC maps these to existing Bedrock items as fallbacks)
const ignoredJavaIds = new Set([
  "minecraft:debug_stick",
  "minecraft:furnace_minecart",
  "minecraft:knowledge_book",
  "minecraft:spectral_arrow",
]);

const fetchBedrockMappings = async () => {
  console.log("Fetching mappings...");

  const [geyserResponse, mojangResponse] = await Promise.all([
    fetch(geyserMappingsUrl),
    fetch(mojangBedrockSamplesUrl),
  ]);

  if (!geyserResponse.ok) {
    throw new Error(
      `Failed to fetch GeyserMC mappings: ${geyserResponse.status} ${geyserResponse.statusText}`,
    );
  }
  if (!mojangResponse.ok) {
    throw new Error(
      `Failed to fetch Mojang bedrock-samples: ${mojangResponse.status} ${mojangResponse.statusText}`,
    );
  }

  const raw = (await geyserResponse.json()) as Record<string, GeyserItemMapping>;
  const mojangData = (await mojangResponse.json()) as BedrockSamplesMojangItemsFile;
  const textureData = (
    await import(`minecraft-textures/dist/textures/json/${latestVersion}.json`, {
      with: { type: "json" },
    })
  ).default as MinecraftTexturesFile;
  const validBedrockIds = new Set(mojangData.data_items.map((item) => item.name));
  const textureItemIds = new Set(textureData.items.map((item) => item.id));
  const translations: Record<string, BedrockTranslation | null> = {};
  const candidates: Array<{
    javaId: string;
    bedrockId: string;
    bedrockData: number;
  }> = [];

  for (const [javaId, entry] of Object.entries(raw)) {
    if (entry.bedrock_identifier === javaId) {
      continue;
    }

    if (ignoredJavaIds.has(javaId)) {
      translations[javaId] = null;
      continue;
    }

    // write invalid remaps as null so bedrock mode hides them instead of
    // falling back to the java id.
    if (!validBedrockIds.has(entry.bedrock_identifier)) {
      translations[javaId] = null;
      continue;
    }

    // if bedrock now has the same id directly, let it pass through unchanged.
    if (validBedrockIds.has(javaId)) {
      continue;
    }

    candidates.push({
      javaId,
      bedrockId: entry.bedrock_identifier,
      bedrockData: entry.bedrock_data,
    });
  }

  const mappedTargetCounts = new Map<string, number>();

  // we need two passes here: first collect candidate remaps, then count shared
  // bedrock ids so we only keep `data` when necessary
  for (const candidate of candidates) {
    mappedTargetCounts.set(
      candidate.bedrockId,
      (mappedTargetCounts.get(candidate.bedrockId) ?? 0) + 1,
    );
  }

  const seenResolvedKeys = new Set<string>();

  for (const candidate of candidates) {
    const sharesMappedTarget = (mappedTargetCounts.get(candidate.bedrockId) ?? 0) > 1;
    const collidesWithDirectTextureItem = textureItemIds.has(candidate.bedrockId);
    const needsData = sharesMappedTarget || collidesWithDirectTextureItem;

    // keep `data` for shared bedrock item families like banners/beds
    const translation: BedrockTranslation = {
      id: candidate.bedrockId,
      ...(needsData ? { data: candidate.bedrockData } : {}),
    };

    const resolvedKey =
      translation.data === undefined ? translation.id : `${translation.id}:${translation.data}`;

    if (seenResolvedKeys.has(resolvedKey)) {
      translations[candidate.javaId] = null;
      continue;
    }

    seenResolvedKeys.add(resolvedKey);
    translations[candidate.javaId] = translation;
  }

  const sortedTranslations = Object.fromEntries(
    Object.entries(translations).sort(([left], [right]) => left.localeCompare(right)),
  );

  await Bun.write(outputPath, `${JSON.stringify(sortedTranslations, null, 2)}\n`);

  console.log(
    `Generated ${Object.keys(sortedTranslations).length} bedrock translations to ${path.relative(repoRoot, outputPath)}`,
  );
};

console.time("generate:bedrock");

try {
  await fetchBedrockMappings();
} finally {
  console.timeEnd("generate:bedrock");
}
