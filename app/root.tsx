import { isRouteErrorResponse, Link, useLocation, useRouteError } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "./app.css";
import Loader from "./components/loader";
import React, { useEffect } from "react";
import { NavigationProvider } from "./components/MobileNav";
import ThemeToggle from "./components/ThemeToggle";
import SecurityMiddleware from "./components/SecurityMiddleware";
import SecurityAudit from "./components/SecurityAudit";
import AppRoutes from "./AppRoutes";
import "./i18n";

export default function App() {
  const location = useLocation();
  const [showLoader, setShowLoader] = React.useState(true);

  useEffect(() => {
    setShowLoader(true);
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/banned") return;
    fetch("/api/ip-check")
      .then(res => {
        console.log("🎯 ip-check status:", res.status);
        if (res.status === 403) {
          window.location.href = "/banned";
        }
      })
      .catch((err) => console.error("IP check failed", err));
  }, [location.pathname]);

  return (
    <SecurityMiddleware>
      <NavigationProvider>
        {showLoader && <Loader />}
        {!showLoader && <Outlet />}
        <ThemeToggle className="z-1000000"/>
      </NavigationProvider>
    </SecurityMiddleware>
  );
}

// في root.tsx
export function ErrorBoundary({ error }: { error?: any }) { 
  // خلي error اختياري بدل ما يكون required
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "Looks like you've ventured into uncharted territory!"
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#d4a35d] to-[#000000] p-4">
      {/* ... باقي الكود */}
    </main>
  );
}
