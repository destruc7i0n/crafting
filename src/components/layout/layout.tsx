import { Header } from "./header";

type LayoutProps = { children: React.ReactNode };

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col xl:h-screen">
        <Header />

        {children}
      </div>
      Test
    </>
  );
}
