import { useUIStore } from "@/stores/ui";

import { Main } from "./main";
import { TagCreation } from "./tag-creation";

export const Index = () => {
  const currentView = useUIStore((state) => state.currentView);

  return currentView === "tagCreation" ? <TagCreation /> : <Main />;
};
