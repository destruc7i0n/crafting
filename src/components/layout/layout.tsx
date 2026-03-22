import { memo } from "react";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";

import { Footer } from "../footer";
import { ItemsList } from "../items-list/items-list";
import { RecipeSidebar } from "../recipes/recipe-sidebar";
import { Header } from "./header";

type LayoutProps = { children: React.ReactNode };

const Layout = memo(({ children }: LayoutProps) => {
  const isMobileRecipeSidebarOpen = useUIStore((state) => state.isMobileRecipeSidebarOpen);
  const isRecipeSidebarExpanded = useUIStore((state) => state.isRecipeSidebarExpanded);
  const setMobileRecipeSidebarOpen = useUIStore((state) => state.setMobileRecipeSidebarOpen);

  return (
    <>
      <div className="flex min-h-screen flex-col lg:h-screen lg:overflow-hidden [@media(min-height:1120px)]:lg:h-auto [@media(min-height:1120px)]:lg:min-h-0 [@media(min-height:1120px)]:lg:overflow-visible">
        <Header />

        <div
          className={cn(
            "mx-auto grid min-h-0 w-full max-w-screen-2xl flex-1 grid-cols-1 grid-rows-[50svh_50svh] gap-x-4 gap-y-0 px-0 lg:grid-rows-[minmax(0,1fr)] lg:gap-4 lg:p-4 [@media(min-height:1120px)]:lg:h-[920px] [@media(min-height:1120px)]:lg:max-h-[920px] [@media(min-height:1120px)]:lg:flex-none [@media(min-height:1120px)]:lg:overflow-hidden",
            "[grid-template-areas:'content''items']",
            isRecipeSidebarExpanded
              ? "lg:grid-cols-[260px_minmax(0,1fr)_clamp(400px,34vw,480px)]"
              : "lg:grid-cols-[52px_minmax(0,1fr)_clamp(420px,36vw,500px)]",
            "lg:[grid-template-areas:'recipes_content_items']",
          )}
        >
          <div className="hidden min-h-0 [grid-area:recipes] lg:flex">
            <RecipeSidebar collapsed={!isRecipeSidebarExpanded} />
          </div>

          <div className="min-h-0 overflow-y-auto px-2 pt-2 pb-6 [grid-area:content] lg:p-0">
            {children}
          </div>

          <div className="z-10 -mt-4 flex min-h-0 rounded-t-xl [grid-area:items] lg:mt-0 lg:rounded-none">
            <ItemsList />
          </div>
        </div>

        {isMobileRecipeSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileRecipeSidebarOpen(false)}
            />

            <div className="bg-background relative h-full w-[320px] max-w-[85vw] shadow-xl">
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
