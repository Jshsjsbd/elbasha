import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ParticleBackground from "../components/BackgroundEffects";
import ProtectedRoute from "../components/ProtectedRoute";
import { auth } from "../firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useNavigate, Link } from "react-router";
import "../app.css";

type DashboardApiResponse = {
  success: boolean;
  data?: {
    points: number | null;
    level: number | null;
  };
  error?: string;
};

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "";

function DashboardInner() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!authUser) return;
      setLoading(true);
      setAccountError(null);
      try {
        if (!authUser?.email) throw new Error("No user email available");
        const res = await fetch(`${API_BASE_URL}/dashboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authUser.email }),
        });
        const data: DashboardApiResponse = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load dashboard");
        setPoints(data.data?.points ?? null);
        setLevel(data.data?.level ?? null);
      } catch (e: any) {
        setAccountError(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (authUser) fetchDashboard();
  }, [authUser, API_BASE_URL, authUser?.email]);

  const levelCards = useMemo(() => {
    const total = 10;
    return Array.from({ length: total }).map((_, idx) => {
      const n = idx + 1;
      const isCurrentLevel = level === n;
      const isCompleted = level && n < level;
      const isLocked = level && n > level;
      
      const getLevelStyles = () => {
        if (isCurrentLevel) {
          return {
            backgroundColor: "var(--accent-color)",
            borderColor: "var(--accent-color)",
            color: "var(--bg-primary)",
            cursor: "pointer",
          };
        } else if (isCompleted) {
          return {
            backgroundColor: "var(--card-bg)",
            borderColor: "#10b981",
            color: "var(--text-primary)",
            cursor: "pointer",
          };
        } else if (isLocked) {
          return {
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
            cursor: "not-allowed",
            opacity: 0.5,
          };
        } else {
          return {
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
            cursor: "pointer",
          };
        }
      };

      const getStatusText = () => {
        if (isCurrentLevel) return "Current";
        if (isCompleted) return "Completed";
        if (isLocked) return "Locked";
        return "Available";
      };

      const getStatusIcon = () => {
        if (isCurrentLevel) return "fas fa-play";
        if (isCompleted) return "fas fa-check";
        if (isLocked) return "fas fa-lock";
        return "fas fa-circle";
      };

      return (
        <button
          key={n}
          onClick={() => {
            if (!isLocked) {
              navigate(`/level/${n}`);
            }
          }}
          className="px-4 py-3 rounded-lg border text-left transition-all hover:scale-[1.02]"
          style={getLevelStyles()}
          disabled={isLocked || false}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-70" style={{ color: isCurrentLevel ? "rgba(255,255,255,0.8)" : "var(--text-secondary)" }}>
                Level
              </div>
              <div className="text-xl font-semibold">{n}</div>
            </div>
            <div className="text-xs opacity-70 flex items-center gap-1" style={{ color: isCurrentLevel ? "rgba(255,255,255,0.8)" : "var(--text-secondary)" }}>
              <i className={getStatusIcon()}></i>
              {getStatusText()}
            </div>
          </div>
        </button>
      );
    });
  }, [navigate, level]);

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl mb-3" style={{ color: "var(--text-accent)" }}></i>
          <p style={{ color: "var(--text-primary)" }}>Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ParticleBackground />
      <Header type="dashboard" />

      <div className="min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-full lg:max-w-5xl p-8 w-full bg-opacity-70 backdrop-blur-lg rounded-3xl shadow-2xl border"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Dashboard
            </h1>
            <p className="opacity-80" style={{ color: "var(--text-secondary)" }}>
              Track your points and access your current level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div className="text-sm opacity-70 mb-1" style={{ color: "var(--text-secondary)" }}>Points</div>
              <div className="text-3xl font-bold" style={{ color: "var(--text-accent)" }}>
                {loading ? "—" : points !== null ? points.toLocaleString() : "N/A"}
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div className="text-sm opacity-70 mb-1" style={{ color: "var(--text-secondary)" }}>Current Level</div>
              <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                {loading ? "—" : level !== null ? level : "N/A"}
              </div>
            </div>
            <div className="p-5 rounded-2xl border flex items-end justify-between" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div>
                <div className="text-sm opacity-70 mb-1" style={{ color: "var(--text-secondary)" }}>Go to your level</div>
                <Link to={level ? `/level/${level}` : "#"} className="inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: "var(--button-bg)", color: "var(--bg-primary)", pointerEvents: level ? "auto" : "none", opacity: level ? 1 : 0.6 }}>
                  Open Level {level ?? "—"}
                </Link>
              </div>
              <i className="fas fa-level-up-alt text-3xl" style={{ color: "var(--text-accent)" }}></i>
            </div>
          </div>

          {accountError && (
            <div className="p-4 rounded-lg border mb-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-secondary)" }}>
              {accountError}
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Levels</h2>
            <p className="opacity-80 mb-4" style={{ color: "var(--text-secondary)" }}>
              Levels content is coming soon. For now, use the cards to navigate.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {levelCards}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardInner />
    </ProtectedRoute>
  );
}


