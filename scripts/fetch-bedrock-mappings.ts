// Item mappings sourced from GeyserMC/mappings (MIT License)
// https://github.com/GeyserMC/mappings

import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(repoRoot, "src/data/generated/bedrock-mappings.json");
const geyserMappingsUrl = "https://raw.githubusercontent.com/GeyserMC/mappings/master/items.json";
const mojangBedrockSamplesUrl =
  "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/metadata/vanilladata_modules/mojang-items.json";

type GeyserEntry = {
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

type BedrockTranslation = {
  id?: string;
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

  const raw = (await geyserResponse.json()) as Record<string, GeyserEntry>;
  const mojangData = (await mojangResponse.json()) as BedrockSamplesMojangItemsFile;
  const validBedrockIds = new Set(mojangData.data_items.map((item) => item.name));

  const translations: Record<string, BedrockTranslation | null> = {};
  const seenBedrockKeys = new Set<string>();

  for (const [javaId, entry] of Object.entries(raw)) {
    const idDiffers = entry.bedrock_identifier !== javaId;

    // geyser sends the data as item "damage" for older client compatibility
    // we should only consider it if the id has changed (ex. white_banner -> banner:15)
    if (!idDiffers) {
      continue;
    }

    if (ignoredJavaIds.has(javaId)) {
      translations[javaId] = null;
      continue;
    }

    if (!validBedrockIds.has(entry.bedrock_identifier)) {
      console.log(`Excluding ${javaId} → ${entry.bedrock_identifier} (not in Mojang item list)`);
      translations[javaId] = null;
      continue;
    }

    const bedrockKey = `${entry.bedrock_identifier}:${entry.bedrock_data}`;

    if (seenBedrockKeys.has(bedrockKey)) {
      console.log(
        `Excluding ${javaId} → ${entry.bedrock_identifier} (collision with already-mapped Bedrock ID)`,
      );
      translations[javaId] = null;
      continue;
    }

    seenBedrockKeys.add(bedrockKey);

    const translation: BedrockTranslation = {};

    translation.id = entry.bedrock_identifier;
    translation.data = entry.bedrock_data;

    translations[javaId] = translation;
  }

  const sortedTranslations = Object.fromEntries(
    Object.entries(translations).sort(([a], [b]) => a.localeCompare(b)),
  );

  await Bun.write(outputPath, `${JSON.stringify(sortedTranslations, null, 2)}\n`);

  console.log(
    `Generated ${Object.keys(sortedTranslations).length} bedrock translations to ${path.relative(repoRoot, outputPath)}`,
  );
};

await fetchBedrockMappings();
