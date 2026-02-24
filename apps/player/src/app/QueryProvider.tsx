"use client";
import React, { useState } from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AlertProvider } from "@tapestry/ui";

function QueryProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(
    new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          console.log(error);
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
