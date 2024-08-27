import { Header } from "./header";
import { Footer } from "../footer";
import { ItemsList } from "../items-list/items-list";
import { Topbar } from "../topbar/topbar";

type LayoutProps = { children: React.ReactNode };

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />

        <div className="mx-auto grid h-full w-full max-w-screen-lg grid-cols-1 gap-4 p-4 [grid-template-areas:'topbar''left''items'] lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)] lg:[grid-template-areas:'topbar_topbar''left_items''left_items']">
          <div className="[grid-area:topbar]">
            <Topbar />
          </div>
          {children}
          <div className="flex [grid-area:items]">
            <ItemsList />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
