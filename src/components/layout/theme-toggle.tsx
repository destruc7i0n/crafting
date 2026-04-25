import { ChevronDownIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/hooks/use-theme";
import { trackThemeChange } from "@/lib/analytics";

type Theme = "light" | "dark" | "system";

const icons: Record<Theme, React.ReactNode> = {
  light: <SunIcon size={14} />,
  dark: <MoonIcon size={14} />,
  system: <MonitorIcon size={14} />,
};

export const ThemeToggle = () => {
  const { theme, setTheme: setAppTheme } = useTheme();

  const handleThemeChange = (nextTheme: Theme) => {
    if (nextTheme === theme) {
      return;
    }

    trackThemeChange(theme, nextTheme);
    setAppTheme(nextTheme);
  };

  return (
    <div className="relative">
      <div className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
        {icons[theme as Theme]}
      </div>
      <select
        aria-label="Theme"
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value as Theme)}
        className="border-input bg-background text-foreground hover:bg-accent focus:ring-ring h-9 appearance-none rounded-md border py-2 pr-8 pl-8 text-sm leading-tight outline-hidden transition-colors focus:ring-2 focus:ring-inset"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <ChevronDownIcon
        size={16}
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2"
      />
    </div>
  );
};
