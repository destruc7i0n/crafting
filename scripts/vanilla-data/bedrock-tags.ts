import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const outputDir = path.join(repoRoot, "src/data/generated/vanilla-tags");

export async function fetchBedrockTags(): Promise<void> {
  console.log("Fetching Bedrock vanilla item tags");

  const url =
    "https://raw.githubusercontent.com/bedrock-dot-dev/vanilla-tags/refs/heads/main/stable/items.json";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch Bedrock tags: ${response.statusText}`);
  }

  const tags = await response.json();
  await Bun.write(path.join(outputDir, "bedrock.json"), `${JSON.stringify(tags, null, 2)}\n`);
}
