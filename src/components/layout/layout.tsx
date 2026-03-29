import { memo, useState } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";

import { Footer } from "../footer";
import { ItemsList } from "../items-list/items-list";
import { RecipeSidebar } from "../recipes/recipe-sidebar";
import { Header } from "./header";

import styles from "./layout.module.css";

type LayoutProps = { children: React.ReactNode };

const Layout = memo(({ children }: LayoutProps) => {
  const isMobileRecipeSidebarOpen = useUIStore((state) => state.isMobileRecipeSidebarOpen);
  const isRecipeSidebarExpanded = useUIStore((state) => state.isRecipeSidebarExpanded);
  const setMobileRecipeSidebarOpen = useUIStore((state) => state.setMobileRecipeSidebarOpen);
  const [isMobileTrayExpanded, setMobileTrayExpanded] = useState(false);

  return (
    <>
      <div className={styles.shell}>
        <Header />

        <div
          className={cn(
            styles.frame,
            isRecipeSidebarExpanded ? styles.desktopExpanded : styles.desktopCollapsed,
          )}
        >
          <div className={styles.recipeColumn}>
            <RecipeSidebar collapsed={!isRecipeSidebarExpanded} />
          </div>

          <div className={styles.contentColumn}>
            {children}
            <div className="md:hidden">
              <Footer />
            </div>
          </div>

          <div
            className={cn(
              styles.itemsColumn,
              isMobileTrayExpanded ? styles.itemsColumnExpanded : styles.itemsColumnCollapsed,
            )}
          >
            <button
              type="button"
              onClick={() => setMobileTrayExpanded((expanded) => !expanded)}
              className={styles.trayToggle}
              aria-expanded={isMobileTrayExpanded}
              aria-controls="mobile-items-tray"
            >
              <span>Items & Tags</span>
              {isMobileTrayExpanded ? (
                <ChevronDownIcon size={16} className="text-muted-foreground" />
              ) : (
                <ChevronUpIcon size={16} className="text-muted-foreground" />
              )}
            </button>

            <div id="mobile-items-tray" className={styles.itemsBody}>
              <ItemsList />
            </div>
          </div>
        </div>

        {isMobileRecipeSidebarOpen && (
          <div className={styles.sheetOverlay}>
            <button
              type="button"
              aria-label="Close recipe sidebar"
              className={styles.sheetBackdrop}
              onClick={() => setMobileRecipeSidebarOpen(false)}
            />

            <div className={styles.sheet}>
              <div className={styles.sheetBody}>
                <RecipeSidebar mobile />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
});

export { Layout };
