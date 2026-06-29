"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { MSWProvider } from "@/components/msw-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: true,
            throwOnError: true,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="ascendra-theme"
    >
      <QueryClientProvider client={queryClient}>
        <MSWProvider>
          <TooltipProvider delayDuration={120}>{children}</TooltipProvider>
          <Toaster position="bottom-right" />
        </MSWProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
