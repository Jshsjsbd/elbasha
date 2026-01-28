import { json } from "../utils/response";import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Please log in to view your profile
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 py-20">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="bg-slate-900 rounded-lg p-8 border border-orange-500 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-20 h-20 rounded-full border-2 border-orange-500"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {user.username}
                </h1>
                <p className="text-orange-300">Discord ID: {user.discordId}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-orange-400 mb-2">
                Account Information
              </h2>
              <div className="bg-slate-800 rounded p-4">
                <p className="text-slate-300">
                  <span className="font-bold text-white">Username:</span>{" "}
                  {user.username}
                </p>
                <p className="text-slate-300">
                  <span className="font-bold text-white">Email:</span>{" "}
                  {user.email || "Not provided"}
                </p>
                <p className="text-slate-300">
                  <span className="font-bold text-white">Discord ID:</span>{" "}
                  {user.discordId}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-orange-400 mb-2">
                Quick Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/applications"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg text-center transition-colors"
                >
                  View Applications
                </a>
                <a
                  href="/"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-center border border-orange-500 transition-colors"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
