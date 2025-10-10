import { useState, useEffect } from "react";
import { applyActionCode } from "firebase/auth";
import { auth } from "../firebase";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ParticleBackground from "../components/BackgroundEffects";
import { useAuthState } from "react-firebase-hooks/auth";

export default function VerifyEmailPage() {
  const [user] = useAuthState(auth);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const actionCode = params.get("oobCode");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newVerify, setNewVerify] = useState(true);

  useEffect(() => {
    async function verifyEmail() {
      if (!actionCode) {
        setError("Invalid or expired link.");
        setLoading(false);
        return;
      }
      if (!user) return;

      try {
        await applyActionCode(auth, actionCode);
        
        const response = await fetch('https://noturbusiness.vercel.app/api/account?action=change-verifying', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, newVerify: newVerify })
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.warn('Database update failed:', error.error);
        }

        setSuccess(true);
        setLoading(false);



      } catch (err: any) {
        setError(err.message || "Failed to verify email.");
        setLoading(false);
      }
    }

    verifyEmail();
  }, [actionCode, navigate]);

  return (
    <>
      <ParticleBackground />
      <Header type="auth" />

      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div
          className="w-full max-w-md bg-opacity-70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border text-center"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
        >
          <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            Email Verification
          </h1>

          {loading && <p className="text-gray-500">Verifying your email…</p>}
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">Your email has been successfully verified! 🎉</p>}
        </div>
      </main>

      <Footer />
    </>
  );
}
