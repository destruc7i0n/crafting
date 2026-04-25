import { useEffect } from "react";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { useTheme } from "@/hooks/use-theme";
import { trackAnalyticsProperties, trackInitialPageView } from "@/lib/analytics";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const Analytics = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const { theme } = useTheme();
  const isTouchDevice = useIsTouchDevice();

  useEffect(() => {
    trackAnalyticsProperties({
      minecraft_version: minecraftVersion,
      theme,
      pointer: isTouchDevice ? "coarse" : "fine",
    });
    trackInitialPageView();
  }, [isTouchDevice, minecraftVersion, theme]);

  return null;
};
