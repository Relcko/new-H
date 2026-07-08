"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ScrollProvider } from "@/components/scroll/scroll-provider";

function MotionPrefs() {
  useReducedMotion();
  return null;
}

/**
 * DevTools — dynamically imported only in development. In production,
 * `process.env.NODE_ENV !== 'production'` is statically false, so the
 * `dynamic()` call is never made and the entire dev module tree is
 * tree-shaken out of the production bundle. Zero production bundle impact.
 */
const DevTools =
  process.env.NODE_ENV !== "production"
    ? dynamic(() => import("@/components/dev/dev-tools").then((m) => m.DevTools), {
        ssr: false,
        loading: () => null,
      })
    : () => null;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MotionPrefs />
      <ScrollProvider>{children}</ScrollProvider>
      <DevTools />
    </QueryClientProvider>
  );
}
