import { MinecraftVersion } from "@/data/types";

import { compareMinecraftVersions, isVersionAtLeast } from "./versioning";

describe("compareMinecraftVersions", () => {
  it("compares versions with different lengths", () => {
    expect(compareMinecraftVersions("1.21", "1.21.2")).toBe(-1);
    expect(compareMinecraftVersions("1.21.2", "1.21")).toBe(1);
  });

  it("compares equal versions", () => {
    expect(compareMinecraftVersions("1.21.2", "1.21.2")).toBe(0);
  });

  it("treats missing trailing segments as zero", () => {
    expect(compareMinecraftVersions("1.21", "1.21.0")).toBe(0);
    expect(compareMinecraftVersions("1.21.0", "1.21")).toBe(0);
  });

  it("compares higher and lower versions", () => {
    expect(compareMinecraftVersions("1.21.4", "1.21.2")).toBe(1);
    expect(compareMinecraftVersions("1.20", "1.21")).toBe(-1);
  });
});

describe("isVersionAtLeast", () => {
  it("returns true for same version", () => {
    expect(isVersionAtLeast(MinecraftVersion.V1212, MinecraftVersion.V1212)).toBe(true);
  });

  it("returns false when minimum is Bedrock", () => {
    expect(isVersionAtLeast(MinecraftVersion.V121, MinecraftVersion.Bedrock)).toBe(false);
  });

  it("returns false for bedrock comparisons", () => {
    expect(isVersionAtLeast(MinecraftVersion.Bedrock, MinecraftVersion.V1212)).toBe(false);
  });

  it("returns expected values across versions", () => {
    expect(isVersionAtLeast(MinecraftVersion.V12111, MinecraftVersion.V1212)).toBe(true);
    expect(isVersionAtLeast(MinecraftVersion.V120, MinecraftVersion.V121)).toBe(false);
  });
});
