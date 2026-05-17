import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime:    1000 * 60 * 15,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

function handleAppError(error: Error) {
  /* Integration point: replace with Sentry.captureException(error) when available */
  console.error("[App]", error.message);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary onError={handleAppError}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router base={base}>
              <App />
            </Router>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  fontFamily: "var(--font-main)",
                  fontSize: "13px",
                  direction: "rtl",
                },
                duration: 3000,
              }}
            />
          </WishlistProvider>
        </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
