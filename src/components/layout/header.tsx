import { ListIcon } from "lucide-react";

import { useUIStore } from "@/stores/ui";

import { ThemeToggle } from "./theme-toggle";
import { VersionSelector } from "../fields/version-selector";

export function Header() {
  const setRecipeSidebarOpen = useUIStore((state) => state.setRecipeSidebarOpen);

  return (
    <header className="flex items-center justify-between bg-[hsl(var(--header-bg))] px-4 py-3 text-[hsl(var(--header-fg))]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setRecipeSidebarOpen(true)}
          className="rounded-md p-2 transition-colors hover:bg-white/10 active:bg-white/20 lg:hidden"
        >
          <ListIcon size={16} />
        </button>
        <h1 className="text-xl font-bold">Crafting</h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <VersionSelector />
      </div>
    </header>
  );
}
