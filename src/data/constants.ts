import textureManifestIndex from "minecraft-textures/manifest/index.json";

import type {
  latestVersion as packageLatestMinecraftTextureVersion,
  versions as packageMinecraftTextureVersions,
} from "minecraft-textures";

import { MinecraftVersion } from "./types";

type JavaMinecraftVersion = `${Exclude<MinecraftVersion, MinecraftVersion.Bedrock>}`;

const { latestVersion: latestMinecraftTexturesVersion, versions: minecraftTextureVersions } =
  textureManifestIndex as unknown as {
    latestVersion: typeof packageLatestMinecraftTextureVersion;
    versions: typeof packageMinecraftTextureVersions;
  };

type Assert<T extends true> = T;
type IsExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

export const javaMinecraftVersions = [
  MinecraftVersion.V261,
  MinecraftVersion.V12111,
  MinecraftVersion.V1219,
  MinecraftVersion.V1217,
  MinecraftVersion.V1216,
  MinecraftVersion.V1215,
  MinecraftVersion.V1214,
  MinecraftVersion.V1212,
  MinecraftVersion.V121,
  MinecraftVersion.V120,
  MinecraftVersion.V119,
  MinecraftVersion.V118,
  MinecraftVersion.V117,
  MinecraftVersion.V116,
  MinecraftVersion.V115,
  MinecraftVersion.V114,
  MinecraftVersion.V113,
  MinecraftVersion.V112,
] as const satisfies readonly Exclude<MinecraftVersion, MinecraftVersion.Bedrock>[];

export type TextureVersionsMatchMinecraftVersions = Assert<
  IsExact<(typeof minecraftTextureVersions)[number], JavaMinecraftVersion>
>;

export const NoTextureTexture =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAt1BMVEX/AP//AP//AP/9AP0fAB8AAAABAAEAAAD/AP/9AP0fAB8BAAH/AP/+AP4YABgBAAH/AP/+AP4WABYBAAH+AP4XABcBAAH+AP4XABf/AP//AP/+AP4YABgBAAEAAAD/AP/+AP4ZABkDAAP+AP4SABL+AP4UABT+AP7+AP7+AP7+AP7+AP70APRXAFcUABQYABgXABcXABcXABceAB4VABUXABcSABJYAFj0APT+AP7+AP7+AP79AP2J1Tm8AAAAAWJLR0QF+G/pxwAAAAd0SU1FB+EJDhcOFGEzO8MAAAAJdnBBZwAAACIAAAAiAPgEXxQAAADzSURBVDjL1dDZkoIwEAXQy3IBBQVFUVHcd8d9G5f//64pCy0yqQrv3n5LnaTTDWTRdMAwSctmFojAAQpF0lUCDyiVSV8JAqBSJcM8UKuTUR5oNL8SaFlaMdDukEnXzgLd8YJ34h7QH5DDJEoT+q4FKaMx/0cGk6kMjMKsMm8sXtVejlY/681429k1X7WvHoomzGP5VE8PzoPL9Po7ufXv6YXao/Q0IL24WclNJXC5ycBy/fA9VTIkt0ugF38G9xwdwk66CXm+A3FL2J7Ywo7I3QIINMUfvgbs53kgJE+PPOCThxngKYFLHp+AowQWaRqALoI/Q50gLzlZBxIAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMDktMTVUMDE6MTQ6MjArMDI6MDDBw4POAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTA5LTE1VDAxOjE0OjIwKzAyOjAwsJ47cgAAAABJRU5ErkJggg==";

export const defaultMinecraftVersions = [MinecraftVersion.Bedrock, ...javaMinecraftVersions];

export const latestMinecraftVersion = latestMinecraftTexturesVersion as MinecraftVersion;
