import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

type StaticCopyPlugin = ReturnType<typeof viteStaticCopy>[number] & {
  buildApp?: unknown;
};

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const manifestIndexPath = fileURLToPath(
  import.meta.resolve("minecraft-textures/manifest/index.json"),
);
const textureAssetsDir = path.join(path.dirname(manifestIndexPath), "../assets");
const textureFiles = normalizePath(path.join(textureAssetsDir, "**/*.png"));
const stripBase = normalizePath(path.relative(repoRoot, textureAssetsDir)).split("/").length;

const [serveTextures] = viteStaticCopy({
  targets: [
    {
      src: textureFiles,
      dest: "assets/textures",
      rename: { stripBase },
    },
  ],
  environment: "client",
}) as StaticCopyPlugin[];

const [, copyTextures] = viteStaticCopy({
  targets: [
    {
      src: textureFiles,
      dest: "../client/assets/textures",
      rename: { stripBase },
    },
  ],
  environment: "client",
  hook: "buildApp",
}) as StaticCopyPlugin[];

const buildApp = copyTextures.buildApp;

if (typeof buildApp === "function") {
  copyTextures.buildApp = {
    order: "post",
    handler: buildApp,
  };
}

export const minecraftTextures = [serveTextures, copyTextures];
