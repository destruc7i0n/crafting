import { createRootRoute, HeadContent, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootRoute,
  notFoundComponent: NotFoundPage,
});

function RootRoute() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}

function NotFoundPage() {
  return <Navigate to="/" replace />;
}
