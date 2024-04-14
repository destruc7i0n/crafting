import { Header } from "./header";

type LayoutProps = { children: React.ReactNode };

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="flex flex-col lg:h-screen">
        <Header />
        <main className="mx-auto w-full max-w-screen-lg flex-1 gap-4 p-4 lg:flex lg:overflow-hidden">
          {children}
        </main>
      </div>
      Test
    </>
  );
}
