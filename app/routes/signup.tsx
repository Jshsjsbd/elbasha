// src/pages/Signup.tsx
import { useEffect, useState } from "react";
import { signup } from "../services/auth";
import { sendEmailVerification, updateProfile } from "firebase/auth";
import { useNavigate, Link } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProtectedRoute1 from "../components/ProtectedRoute1";
import ParticleBackground from "../components/BackgroundEffects";
import ValidationService from "../services/validation";
import apiService from "../services/api";

function SignupPage() {
  const [name, setName] = useState("");  // ← Added name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    // Rate limiting check
    if (ValidationService.isRateLimited('signup', 3, 300000)) { // 3 attempts per 5 minutes
      setErr("Too many signup attempts. Please try again later.");
      setLoading(false);
      return;
    }

    try {
      // Validate and sanitize input
      const validation = ValidationService.validateFormData({ name, email, password });
      if (!validation.isValid) {
        setErr(Object.values(validation.errors).flat().join(', '));
        setLoading(false);
        return;
      }

      // Create Firebase Auth account
      const userCredential = await signup(validation.sanitizedData.email, validation.sanitizedData.password);
      
      // Update the user's profile with their name
      await updateProfile(userCredential.user, { displayName: validation.sanitizedData.name });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
  
      // Store user data
      const response = await fetch('https://noturbusiness.vercel.app/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.warn('Custom database save failed:', error.error);
      }
  
      setMsg("Account created successfully! Please check your email for verification.");
      navigate("/");
    } catch (e: any) {
      setErr(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ParticleBackground />
      <Header type="auth" />

      <main className="min-h-screen flex items-center justify-center px-4 py-20 z-100">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md bg-opacity-70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
        >
          <h1
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Create Account
          </h1>

          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-4 rounded-full p-3 border focus:ring-4 focus:outline-none z-1000"
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-color)",
              "--tw-ring-color": "var(--accent-color)",
            } as React.CSSProperties}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
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

          <input
            type="password"
            placeholder="Password"
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--button-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--button-bg)";
            }}
          >
            {loading ? "Signing up…" : "Sign Up"}
          </button>

          <p className="text-center mt-6 text-sm opacity-80" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" className="underline font-medium" style={{ color: "var(--text-accent)" }}>
              Login
            </Link>
          </p>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default function ProtectedSignup() {
  return (
    <ProtectedRoute1>
      <SignupPage />
    </ProtectedRoute1>
  );
}