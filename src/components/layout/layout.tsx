import { Header } from "./header";

export function Layout({ children }: { children: React.ReactNode }) {
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
