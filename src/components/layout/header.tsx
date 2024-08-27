import { VersionSelector } from "../fields/version-selector";

export function Header() {
  return (
    <div className="px-4">
      <header className="mx-auto my-4 flex max-w-screen-lg flex-1 items-center justify-between rounded-md border bg-background p-2">
        <h1 className="text-2xl font-bold">Crafting Generator</h1>
        <VersionSelector />
      </header>
    </div>
  );
}
