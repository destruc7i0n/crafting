import { memo } from "react";

import { Header } from "./header";
import { Footer } from "../footer";
import { ItemsList } from "../items-list/items-list";
import { RecipeSidebar } from "../recipes/recipe-sidebar";
import { useUIStore } from "@/stores/ui";

type LayoutProps = { children: React.ReactNode };

const Layout = memo(({ children }: LayoutProps) => {
  const isRecipeSidebarOpen = useUIStore((state) => state.isRecipeSidebarOpen);
  const setRecipeSidebarOpen = useUIStore((state) => state.setRecipeSidebarOpen);

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden">
        <Header />

        <div className="mx-auto grid min-h-0 flex-1 w-full max-w-screen-2xl grid-cols-1 gap-4 overflow-hidden p-4 [grid-template-areas:'content''items'] lg:grid-cols-[260px_minmax(0,1fr)_360px] lg:[grid-template-areas:'recipes_content_items']">
          <div className="hidden min-h-0 [grid-area:recipes] lg:flex">
            <RecipeSidebar />
          </div>

          <div className="min-h-0 overflow-y-auto pr-1 [grid-area:content]">{children}</div>

          <div className="flex min-h-0 [grid-area:items]">
            <ItemsList />
          </div>
        </div>

        {isRecipeSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-black/40"
              onClick={() => setRecipeSidebarOpen(false)}
            />

            <div className="relative h-full w-[320px] max-w-[85vw] bg-background p-4 shadow-xl">
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
