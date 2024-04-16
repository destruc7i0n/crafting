import { Header } from "./header";
import { Footer } from "../footer";

type LayoutProps = { children: React.ReactNode };

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />

        {children}
      </div>
      <Footer />
    </>
  );
}
