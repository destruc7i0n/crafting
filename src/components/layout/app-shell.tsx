import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Footer } from "../footer";
import { Header } from "./header";
import { HelpDialog } from "./help-dialog";

type AppShellProps = {
  title: string;
  children: ReactNode;
  navLink?: ReactNode;
  showHelp?: boolean;
  versionSelector?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

const helpDismissedStorageKey = "crafting-help-dismissed";

export function AppShell({
  title,
  children,
  navLink,
  showHelp = true,
  versionSelector,
  footer = <Footer />,
  className,
}: AppShellProps) {
  const [isHelpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!showHelp) {
      return;
    }

    try {
      setHelpOpen(localStorage.getItem(helpDismissedStorageKey) !== "true");
    } catch {
      setHelpOpen(true);
    }
  }, [showHelp]);

  const closeHelp = () => {
    try {
      localStorage.setItem(helpDismissedStorageKey, "true");
    } catch {
      // Ignore storage failures; the dialog can still close for this session.
    }

    setHelpOpen(false);
  };

  return (
    <div className={cn("bg-background text-foreground flex flex-col", className)}>
      <Header
        title={title}
        navLink={navLink}
        showHelp={showHelp}
        versionSelector={versionSelector}
        onHelpClick={() => setHelpOpen(true)}
      />
      {showHelp ? <HelpDialog open={isHelpOpen} onClose={closeHelp} /> : null}
      {children}
      {footer}
    </div>
  );
}
