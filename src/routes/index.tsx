import { createFileRoute } from "@tanstack/react-router";

import { Layout } from "@/components/layout/layout";
import { useDndMonitor } from "@/hooks/use-dnd-monitor";
import { Main } from "@/views/main";

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://crafting.thedestruc7i0n.ca").replace(
  /\/$/,
  "",
);
const title = "Crafting Recipe Generator";
const description =
  "Create visual Minecraft crafting, smelting, blasting, smoking, campfire cooking, stonecutting, and smithing recipes.";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: `${siteUrl}/` }],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/` },
      { property: "og:description", content: description },
      { property: "og:site_name", content: "Crafting Recipe Generator" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Crafting Recipe Generator",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: `${siteUrl}/`,
          description,
        },
      },
    ],
  }),
  component: CreatorRoute,
});

function CreatorRoute() {
  useDndMonitor();

  return (
    <Layout>
      <Main />
    </Layout>
  );
}
