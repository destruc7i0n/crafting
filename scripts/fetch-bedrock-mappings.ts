// Item mappings sourced from GeyserMC/mappings (MIT License)
// https://github.com/GeyserMC/mappings

import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(repoRoot, "src/data/generated/bedrock-mappings.json");
const geyserMappingsUrl = "https://raw.githubusercontent.com/GeyserMC/mappings/master/items.json";

type GeyserEntry = {
  bedrock_identifier: string;
  bedrock_data: number;
};

type BedrockTranslation = {
  id?: string;
  data?: number;
};

// Java items that have no real Bedrock equivalent
const ignoredJavaIds = new Set([
  "minecraft:debug_stick",
  "minecraft:furnace_minecart",
  "minecraft:knowledge_book",
  "minecraft:spectral_arrow",
]);

const ignoredBedrockIds = new Set(["minecraft:unknown"]);

const fetchBedrockMappings = async () => {
  console.log("Fetching GeyserMC item mappings...");

  const response = await fetch(geyserMappingsUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch GeyserMC mappings: ${response.status} ${response.statusText}`);
  }

  const raw = (await response.json()) as Record<string, GeyserEntry>;

  const translations: Record<string, BedrockTranslation | null> = {};
  const seenBedrockKeys = new Set<string>();

  for (const [javaId, entry] of Object.entries(raw)) {
    const idDiffers = entry.bedrock_identifier !== javaId;
    const hasData = entry.bedrock_data !== 0;

    // geyser sends the data as item "damage" for older client compatibility
    // we should only consider it if the id has changed (ex. white_banner -> banner:15)
    if (!idDiffers) {
      continue;
    }

    if (ignoredJavaIds.has(javaId)) {
      console.log(`Excluding ${javaId} (no Bedrock equivalent)`);
      translations[javaId] = null;
      continue;
    }

    if (ignoredBedrockIds.has(entry.bedrock_identifier)) {
      console.log(`Excluding ${javaId} (maps to ${entry.bedrock_identifier})`);
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
    if (hasData) translation.data = entry.bedrock_data;

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
