"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "next-themes";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize QueryClient inside state to prevent data sharing across requests during SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute before refetching
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Fallback for development if env var is missing
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy-client-id";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
