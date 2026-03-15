const currentYear = new Date().getFullYear();

export const Footer = () => (
  <footer className="mx-auto hidden w-full max-w-screen-lg flex-col items-center justify-center gap-1 bg-background px-4 py-10 text-center text-sm text-muted-foreground lg:flex">
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
    <div className="h-2" />
    <p>The Minecraft item icons are copyright © 2009-{currentYear} Mojang Studios</p>
    <p>This site is not affiliated with Mojang Studios</p>
  </footer>
);
