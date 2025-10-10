import { useEffect, useState } from "react";
import { login } from "../services/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedRoute1 from "../components/ProtectedRoute1";
import ParticleBackground from "../components/BackgroundEffects";
import ValidationService from "../services/validation";
import { useTranslation } from "react-i18next";

function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    // Rate limiting check
    if (ValidationService.isRateLimited('login', 5, 300000)) { // 5 attempts per 5 minutes
      setErr(t("toomanyattempts"));
      setLoading(false);
      return;
    }

    try {
      // Validate and sanitize input
      const validation = ValidationService.validateFormData({ email, password });
      if (!validation.isValid) {
        setErr(Object.values(validation.errors).flat().join(', '));
        setLoading(false);
        return;
      }

      await login(validation.sanitizedData.email, validation.sanitizedData.password);
      navigate("/");
    } catch (e: any) {
      setErr(e?.message || t("loginfailed"));
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg(t("passresetsent"));
    } catch (e: any) {
      setErr(e?.message || "Could not send reset email");
    }
  }

  return (
    <>
      <ParticleBackground />
      <Header type="auth" />
 
      <main className="min-h-screen flex items-center justify-center px-4 py-20 z-100">
        <form
          onSubmit={showReset ? onResetPassword : onSubmit}
          className="w-full max-w-md bg-opacity-70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h1
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            {showReset ? t("passreset") : t("welcomeback")}
          </h1>

          <input
            type="email"
            placeholder={t("email")}
            className="w-full mb-4 rounded-full p-3 border focus:ring-4 focus:outline-none z-1000"
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-color)",
              "--tw-ring-color": "var(--accent-color)",
            } as React.CSSProperties}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {!showReset && (
            <input
              type="password"
              placeholder={t("password")}
              className="w-full mb-4 rounded-full p-3 border focus:ring-4 focus:outline-none z-1000"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
                "--tw-ring-color": "var(--accent-color)",
              } as React.CSSProperties}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {err && <p className="text-red-500 text-sm mb-4">{err}</p>}
          {msg && <p className="text-green-500 text-sm mb-4">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-lg font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-4"
            style={{
              backgroundColor: "var(--button-bg)",
              color: "var(--bg-primary)",
              "--tw-ring-color": "var(--accent-color)",
              boxShadow:
                "0 20px 25px -5px var(--shadow-color), 0 10px 10px -5px var(--shadow-color-light)",
            } as React.CSSProperties}
          >
            {loading
              ? showReset
                ? t("sending")
                : t("loggingin")
              : showReset
              ? t("sendreset")
              : t("login")}
          </button>

          {!showReset ? (
            <p
              className="text-center mt-4 text-sm cursor-pointer"
              style={{ color: "var(--text-accent)" }}
              onClick={() => setShowReset(true)}
            >
              {t("forgotpass")}
            </p>
          ) : (
            <p
              className="text-center mt-4 text-sm cursor-pointer"
              style={{ color: "var(--text-accent)" }}
              onClick={() => setShowReset(false)}
            >
              {t("backtologin")}
            </p>
          )}

          {!showReset && (
            <p
              className="text-center mt-6 text-sm opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              {t("donthaveacc")}{" "}
              <Link
                to="/signup"
                className="underline font-medium"
                style={{ color: "var(--text-accent)" }}
              >
                {t("signup")}
              </Link>
            </p>
          )}
        </form>
      </main>

      <Footer />
    </>
  );
}

export default function ProtectedLogin() {
  return (
    <ProtectedRoute1>
      <LoginPage />
    </ProtectedRoute1>
  );
}