import { useState } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { RecipeTypeSelector } from "@/components/fields/recipe-type-selector";
import { Footer } from "@/components/footer";
import { ItemsList } from "@/components/items-list/items-list";
import { AppShell } from "@/components/layout/app-shell";
import { HeaderNavLink } from "@/components/layout/header";
import { RecipeOptions } from "@/components/options/recipe-options";
import { ItemOutput } from "@/components/output/item-output";
import { Preview } from "@/components/preview/preview";
import { MobileRecipeSwitcher } from "@/components/recipes/sidebar/mobile-recipe-switcher";
import { RecipeSidebar } from "@/components/recipes/sidebar/recipe-sidebar";
import { useDndMonitor } from "@/hooks/use-dnd-monitor";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";

import styles from "./creator.module.css";

const navLink = (
  <HeaderNavLink
    to="/recipes/{-$version}"
    params={{ version: undefined }}
    search={{ q: "", recipeType: "all" }}
  >
    Recipes List
  </HeaderNavLink>
);

export function CreatorView() {
  useDndMonitor();
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
      <AppShell title="Crafting Generator" navLink={navLink} className={styles.shell} footer={null}>
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
              <main className={styles.mainContent}>
                <div className="flex flex-col gap-2 lg:h-full lg:min-h-0 lg:gap-4">
                  <MobileRecipeSwitcher />

                  <div className="bg-card rounded-lg border p-4">
                    <div className="flex flex-col items-center gap-2">
                      <RecipeTypeSelector />
                      <Preview />
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border">
                    <RecipeOptions />
                  </div>

                  <div className="lg:flex lg:min-h-0 lg:flex-col">
                    <ItemOutput />
                  </div>
                </div>
              </main>
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

        {isMobileRecipeSidebarOpen ? (
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
        ) : null}
      </AppShell>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
}
