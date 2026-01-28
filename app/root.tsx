import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import "./app.css";
import "./i18n";
import React, { useEffect } from "react";
import { NavigationProvider } from "./components/MobileNav";
import ThemeToggle from "./components/ThemeToggle";
import SecurityMiddleware from "./components/SecurityMiddleware";
import Loader from "./components/loader";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  const [showLoader, setShowLoader] = React.useState(true);

  useEffect(() => {
    setShowLoader(true);
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Commented out IP check until we set up API routes properly
  // useEffect(() => {
  //   if (typeof window !== "undefined" && window.location.pathname === "/banned")
  //     return;
  //   fetch("/api/ip-check")
  //     .then((res) => {
  //       console.log("🎯 ip-check status:", res.status);
  //       if (res.status === 403) {
  //         window.location.href = "/banned";
  //       }
  //     })
  //     .catch((err) => console.error("IP check failed", err));
  // }, []);

  return (
    <SecurityMiddleware>
      <NavigationProvider>
        {showLoader && <Loader />}
        {!showLoader && <Outlet />}
        <ThemeToggle className="z-1000000" />
      </NavigationProvider>
    </SecurityMiddleware>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The page you're looking for doesn't exist."
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#d4a35d] to-[#000000] p-4">
      <h1 className="text-4xl font-bold text-white mb-4">{message}</h1>
      <p className="text-xl text-white/80 mb-8">{details}</p>
      {stack && (
        <pre className="bg-black/50 text-white p-4 rounded max-w-2xl overflow-auto">
          {stack}
        </pre>
      )}
    </main>
  );
}