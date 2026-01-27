import {
  isRouteErrorResponse,
  Link,
  Outlet,
} from "react-router";
import "./app.css";
import Loader from "./components/loader";
import React, { useEffect } from "react";
import { useLocation } from "react-router";
import { NavigationProvider } from "./components/MobileNav";
import ThemeToggle from "./components/ThemeToggle";
import SecurityMiddleware from "./components/SecurityMiddleware";
import SecurityAudit from "./components/SecurityAudit";
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

export function ErrorBoundary({ error }: { error: any }) {
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
      <div className="text-center">
        <h1 className="text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f5f5dc] to-[#d4a35d] animate-pulse">
          {message}
        </h1>
        <p className="text-2xl text-[#f5f5dc] mb-8 max-w-md mx-auto">{details}</p>
        {typeof error === "object" && error !== null && "status" in error && (error as any).status === 404 && (
          <div className="space-y-4 mb-8">
            <p className="text-[#e6e6cc]">Don't worry, let's get you back on track!</p>
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <Link to='/' className="relative block">
                <button className="cursor-pointer px-8 py-4 bg-[#000000]/80 backdrop-blur-sm text-[#d4a35d] rounded-lg font-semibold transform hover:scale-105 transition-all duration-200 hover:bg-[#d4a35d]/20 border border-[#d4a35d]">
                  Return to Home Page →
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
      {stack && (
        <pre className="mt-8 p-4 bg-[#000000]/80 backdrop-blur-sm text-[#f5f5dc] rounded-lg overflow-x-auto max-w-full border border-[#d4a35d]/30">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}