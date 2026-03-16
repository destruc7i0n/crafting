// Item mappings sourced from GeyserMC/mappings (MIT License)
// https://github.com/GeyserMC/mappings

import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(repoRoot, "src/data/generated/bedrock-mappings.json");
const geyserMappingsUrl =
  "https://raw.githubusercontent.com/GeyserMC/mappings/master/items.json";

type GeyserEntry = {
  bedrock_identifier: string;
  bedrock_data: number;
};

type BedrockTranslation = {
  id?: string;
  data?: number;
};

const fetchBedrockMappings = async () => {
  console.log("Fetching GeyserMC item mappings...");

  const response = await fetch(geyserMappingsUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch GeyserMC mappings: ${response.status} ${response.statusText}`);
  }

  const raw = (await response.json()) as Record<string, GeyserEntry>;

  const translations: Record<string, BedrockTranslation> = {};

  for (const [javaId, entry] of Object.entries(raw)) {
    const idDiffers = entry.bedrock_identifier !== javaId;
    const hasData = entry.bedrock_data !== 0;

    if (!idDiffers) {
      continue;
    }

    const translation: BedrockTranslation = {};

    if (idDiffers) {
      translation.id = entry.bedrock_identifier;
    }

    if (hasData) {
      translation.data = entry.bedrock_data;
    }

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
