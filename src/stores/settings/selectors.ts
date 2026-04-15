import { SettingsState } from "./index";

export const selectMinecraftVersion = (state: SettingsState) => state.minecraftVersion;
export const selectBedrockNamespace = (state: SettingsState) => state.bedrockNamespace;
