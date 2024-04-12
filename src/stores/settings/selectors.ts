import { SettingsState } from "./index";

export const selectMinecraftVersion = (state: SettingsState) =>
  state.minecraftVersion;
