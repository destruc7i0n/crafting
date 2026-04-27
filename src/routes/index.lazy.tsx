import { createLazyFileRoute } from "@tanstack/react-router";

import { Layout } from "@/components/layout/layout";
import { useDndMonitor } from "@/hooks/use-dnd-monitor";
import { Main } from "@/views/main";

export const Route = createLazyFileRoute("/")({
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
