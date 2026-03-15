import { memo } from "react";

import { Header } from "./header";
import { Footer } from "../footer";
import { ItemsList } from "../items-list/items-list";
import { RecipeSidebar } from "../recipes/recipe-sidebar";
import { useUIStore } from "@/stores/ui";
import { cn } from "@/lib/utils";

type LayoutProps = { children: React.ReactNode };

const Layout = memo(({ children }: LayoutProps) => {
  const isRecipeSidebarOpen = useUIStore((state) => state.isRecipeSidebarOpen);
  const isSidebarExpanded = useUIStore((state) => state.isSidebarExpanded);
  const setRecipeSidebarOpen = useUIStore((state) => state.setRecipeSidebarOpen);

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden">
        <Header />

        <div
          className={cn(
            "mx-auto grid min-h-0 flex-1 w-full max-w-screen-2xl grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-x-4 gap-y-0 overflow-hidden px-0 lg:gap-4 lg:p-4 lg:grid-rows-[minmax(0,1fr)]",
            "[grid-template-areas:'content''items']",
            isSidebarExpanded
              ? "lg:grid-cols-[260px_minmax(0,1fr)_400px]"
              : "lg:grid-cols-[52px_minmax(0,1fr)_400px]",
            "lg:[grid-template-areas:'recipes_content_items']",
          )}
        >
          <div className="hidden min-h-0 [grid-area:recipes] lg:flex">
            <RecipeSidebar collapsed={!isSidebarExpanded} />
          </div>

          <div className="min-h-0 overflow-y-auto px-2 pt-2 pb-2 [grid-area:content] lg:p-0">
            {children}
          </div>

          <div className="mt-1 flex min-h-0 px-2 pt-1 pb-1 [grid-area:items] lg:m-0 lg:p-0">
            <ItemsList />
          </div>
        </div>

        {isRecipeSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-black/40"
              onClick={() => setRecipeSidebarOpen(false)}
            />

            <div className="relative h-full w-[320px] max-w-[85vw] bg-background shadow-xl">
              <RecipeSidebar mobile />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
});

export { Layout };
