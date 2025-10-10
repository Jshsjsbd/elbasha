import { useState } from "react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../firebase";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ParticleBackground from "../components/BackgroundEffects";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const actionCode = params.get("oobCode");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!actionCode) {
      setError("Link is expired");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords are not matched");
      return;
    }

    try {
      await verifyPasswordResetCode(auth, actionCode);

      await confirmPasswordReset(auth, actionCode, newPassword);

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Error occured while changing the password");
    }
  }

  return (
    <>
      <ParticleBackground />
      <Header type="auth" />

      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-opacity-70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border"
          style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
        >
          <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: "var(--text-primary)" }}>
            Changing The Password
          </h1>

          <input
            type="password"
            placeholder="The New Password"
            className="w-full mb-4 rounded-full p-3 border"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Verify The Password"
            className="w-full mb-4 rounded-full p-3 border"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">The password changed successfuly🎉</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-full text-lg font-semibold transition transform hover:scale-105"
            style={{ backgroundColor: "var(--button-bg)", color: "var(--bg-primary)" }}
          >
            Change The Password
          </button>
        </form>
      </main>

      <Footer />
    </>
  );
}
