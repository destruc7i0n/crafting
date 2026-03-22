import { ThemeToggle } from "@/components/layout/theme-toggle";

const currentYear = new Date().getFullYear();

export const Footer = () => (
  <footer className="bg-background text-muted-foreground mx-auto flex w-full max-w-screen-lg flex-col items-center justify-center gap-1 px-4 py-10 text-center text-sm">
    <p>
      Website by{" "}
      <a
        href="https://thedestruc7i0n.ca"
        target="_blank"
        rel="noopener"
        className="text-primary underline-offset-2 hover:underline"
      >
        destruc7i0n
      </a>{" "}
      ·{" "}
      <a
        href="https://twitter.com/TheDestruc7i0n"
        target="_blank"
        rel="noopener"
        className="text-primary underline-offset-2 hover:underline"
      >
        Twitter
      </a>{" "}
      ·{" "}
      <a
        href="https://github.com/destruc7i0n/crafting"
        target="_blank"
        rel="noopener"
        className="text-primary underline-offset-2 hover:underline"
      >
        GitHub
      </a>
    </p>
    <p>
      Support me on{" "}
      <a
        href="https://ko-fi.com/destruc7i0n"
        target="_blank"
        rel="noopener"
        className="text-primary underline-offset-2 hover:underline"
      >
        Ko-Fi
      </a>
    </p>
    <div className="py-3">
      <ThemeToggle />
    </div>
    <p>The Minecraft item icons are copyright © 2009-{currentYear} Mojang Studios</p>
    <p>This site is not affiliated with Mojang Studios</p>
  </footer>
);
