import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <p className="eyebrow text-ink-faint">Observatory — off the map</p>
      <h1 className="display mt-4 text-7xl text-ink">404</h1>
      <p className="mt-3 max-w-md text-center text-sm text-ink-soft">
        This coordinate does not exist in the instrument. Head back to the constellation.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="eyebrow inline-flex items-center gap-2 border-b border-ink pb-1 text-ink transition-colors hover:text-violet-deep"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <p className="eyebrow text-ink-faint">Instrument fault</p>
      <h1 className="display mt-4 text-4xl text-ink">This page didn’t load</h1>
      <p className="mt-3 max-w-md text-center text-sm text-ink-soft">
        Something went wrong on our end. Try again, or return to the home constellation.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="eyebrow border border-ink bg-ink px-4 py-2 text-paper transition-colors hover:bg-violet-deep"
        >
          Try again
        </button>
        <a
          href="/"
          className="eyebrow border border-ink px-4 py-2 text-ink transition-colors hover:bg-lavender"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Seer — The Observatory" },
      {
        name: "description",
        content:
          "Seer is an instrument for examining possible futures. Six connected instruments: market atlas, possibility fields, futarchy counterfactuals, selection forecasts and risk pricing.",
      },
      { name: "author", content: "Electric Foundation" },
      { property: "og:title", content: "Seer — The Observatory" },
      {
        property: "og:description",
        content:
          "An instrument for examining possible futures. A question enters the protocol and becomes a price, a distribution, a comparison of worlds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
