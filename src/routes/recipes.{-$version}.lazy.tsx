import { createLazyFileRoute } from "@tanstack/react-router";

import { RecipesView } from "@/views/recipes";

export const Route = createLazyFileRoute("/recipes/{-$version}")({
  component: RecipesView,
});
