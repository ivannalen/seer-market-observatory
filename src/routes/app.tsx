import { createFileRoute, Outlet } from "@tanstack/react-router";

/*
 * Layout route for /app. The atlas lives at /app/ (app.index.tsx) and each
 * market detail page at /app/$slug (app.$slug.tsx); both render through this
 * <Outlet />.
 */
export const Route = createFileRoute("/app")({
  component: () => <Outlet />,
});
