import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="rounded-md p-2 text-[hsl(var(--header-fg))] transition-colors hover:bg-white/10 active:bg-white/20"
    >
      {theme === "light" ? (
        <SunIcon size={16} />
      ) : theme === "dark" ? (
        <MoonIcon size={16} />
      ) : (
        <MonitorIcon size={16} />
      )}
    </button>
  );
};
