import { memo, useState } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { RecipeSidebar } from "@/components/recipes/sidebar/recipe-sidebar";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";

import { Footer } from "../footer";
import { ItemsList } from "../items-list/items-list";
import { Header } from "./header";
import { HelpDialog } from "./help-dialog";

import styles from "./creator-layout.module.css";

type CreatorLayoutProps = { children: React.ReactNode };

const CreatorLayout = memo(({ children }: CreatorLayoutProps) => {
  const isMobileRecipeSidebarOpen = useUIStore((state) => state.isMobileRecipeSidebarOpen);
  const isRecipeSidebarExpanded = useUIStore((state) => state.isRecipeSidebarExpanded);
  const setMobileRecipeSidebarOpen = useUIStore((state) => state.setMobileRecipeSidebarOpen);
  const [isMobileTrayExpanded, setMobileTrayExpanded] = useState(true);

  const handleMobileTrayToggle = () => {
    if (isMobileTrayExpanded) {
      useUIStore.getState().clearInteractionState();
    }

    setMobileTrayExpanded(!isMobileTrayExpanded);
  };

  return (
    <>
      <div className={styles.shell}>
        <Header />
        <HelpDialog />

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
            <div className={styles.contentBody}>
              <main className={styles.mainContent}>{children}</main>
            </div>
            <div className={styles.mobileFooter}>
              <Footer />
            </div>
          </div>

          <div
            className={cn(styles.itemsColumn, isMobileTrayExpanded && styles.itemsColumnExpanded)}
          >
            <button
              type="button"
              onClick={handleMobileTrayToggle}
              className={styles.trayToggle}
              aria-expanded={isMobileTrayExpanded}
            >
              <span>Items & Tags</span>
              {isMobileTrayExpanded ? (
                <ChevronDownIcon size={16} className="text-muted-foreground" />
              ) : (
                <ChevronUpIcon size={16} className="text-muted-foreground" />
              )}
            </button>

            <div
              className={cn(styles.itemsBody, isMobileTrayExpanded ? "flex" : "hidden", "md:flex")}
            >
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

      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
});

CreatorLayout.displayName = "CreatorLayout";

export { CreatorLayout };
