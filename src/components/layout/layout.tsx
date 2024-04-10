import { Header } from "./header";

type LayoutProps = { children: React.ReactNode };

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex-col">{children}</main>
      </div>
      Test
    </div>
  );
}
