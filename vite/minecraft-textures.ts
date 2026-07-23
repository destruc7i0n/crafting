import path from "node:path";
import { fileURLToPath } from "node:url";

import texturePackageJson from "minecraft-textures/package.json";
import { normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const manifestIndexPath = fileURLToPath(
  import.meta.resolve("minecraft-textures/manifest/index.json"),
);
const textureAssetsDir = path.join(path.dirname(manifestIndexPath), "../assets");
const textureFiles = normalizePath(path.join(textureAssetsDir, "**/*.png"));
const minecraftTexturesPackageVersion = (texturePackageJson as { version: string }).version;
const textureAssetsDest = `assets/textures/${minecraftTexturesPackageVersion}`;

function renameTextureAsset(_name: string, _extension: string, fullPath: string) {
  return {
    stripBase: true,
    name: normalizePath(path.relative(textureAssetsDir, fullPath)),
  } as const;
}

// serve textures in dev and copy them into the client build (dist/client/assets/textures/<version>)
export const minecraftTextures = viteStaticCopy({
  targets: [
    {
      src: textureFiles,
      dest: textureAssetsDest,
      rename: renameTextureAsset,
    },
  ],
  environment: "client",
});
