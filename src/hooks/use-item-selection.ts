import { useUIStore } from "@/stores/ui";

import { useIsTouchDevice } from "./use-is-touch-device";

export const useItemSelection = () => {
  const isTouchDevice = useIsTouchDevice();
  return useUIStore((state) => (isTouchDevice ? state.selection : undefined));
};
