import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  let nextTheme: "light" | "dark" | "system" = "light";

  if (theme === "light") {
    nextTheme = "dark";
  } else if (theme === "dark") {
    nextTheme = "system";
  }

  let icon = <MonitorIcon size={16} />;

  if (theme === "light") {
    icon = <SunIcon size={16} />;
  } else if (theme === "dark") {
    icon = <MoonIcon size={16} />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="cursor-pointer rounded-md p-2 text-[hsl(var(--header-fg))] transition-colors hover:bg-white/10 active:bg-white/20"
    >
      {icon}
    </button>
  );
};
