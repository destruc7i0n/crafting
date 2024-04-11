import { MinecraftVersion } from "../types";

export interface MinecraftIdentifier {
  raw: string;

  namespace: string;
  id: string;
  data?: number;
}

export interface Item {
  id: MinecraftIdentifier;
  displayName: string;
  count?: number;
  _version: MinecraftVersion;
}
