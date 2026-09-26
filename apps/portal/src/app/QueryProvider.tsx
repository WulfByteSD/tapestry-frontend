"use client";
import React, { useState } from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AlertProvider, alertManager } from "@tapestry/ui";

function QueryProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(
    new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          // Use meta.errorMessage if provided, otherwise fall back to error message
          const message =
            (query.meta?.errorMessage as string) ||
            (error instanceof Error ? error.message : "An unknown error occurred");

          alertManager.addAlert({
            type: "error",
            message,
            duration: 5000,
          });
        },
      }),
    }),
  );

  return (
    <QueryClientProvider client={client}>
      <AlertProvider defaultDuration={5000} maxAlerts={10}>
        {children}
      </AlertProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default QueryProvider;
