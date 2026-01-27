import { json, type Route } from "react-router";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export async function loader() {
  try {
    const response = await fetch("/api/server/status", {
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return json({
        serverStatus: {
          online: false,
          players: { online: 0, max: 0 },
          version: { name: "Unknown", protocol: 0 },
          description: "Server status unavailable",
        },
        topPlayers: [],
      });
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Failed to load server status:", error);
    return json({
      serverStatus: {
        online: false,
        players: { online: 0, max: 0 },
        version: { name: "Unknown", protocol: 0 },
        description: "Server status unavailable",
      },
      topPlayers: [],
    });
  }
}

interface ServerStatus {
  online: boolean;
  players: { online: number; max: number };
  version: { name: string; protocol: number };
  description: string;
}

interface Player {
  username: string;
  uuid: string;
  playtime: number;
  lastSeen: string;
  level?: number;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { serverStatus, topPlayers } = loaderData as {
    serverStatus: ServerStatus;
    topPlayers: Player[];
  };
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      setUser(JSON.parse(userSession));
    }
  }, []);

  return (
    <div className="w-full bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 text-white">
      <Header type="home" />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 relative overflow-hidden pt-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-600 bg-clip-text text-transparent">
            ⛏️ MYSTIC NETWORK
          </h1>
          <p className="text-2xl text-orange-200 mb-8 max-w-2xl mx-auto">
            The Ultimate Minecraft Experience Awaits
          </p>

          <div className="flex gap-4 justify-center mb-12 flex-wrap">
            {user ? (
              <>
                <a
                  href="/applications"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  🎮 View Applications
                </a>
                <a
                  href="/store"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border-2 border-orange-500 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  🛍️ Store
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
                    
                    if (!clientId || clientId === "YOUR_DISCORD_CLIENT_ID") {
                        alert("Discord login is not configured. Please contact the server administrator.");
                        return;
                    }

                    const redirectUri = encodeURIComponent(
                      `${window.location.origin}/auth/discord/callback`
                    );
                    const scope = encodeURIComponent("identify email guilds");
                    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
                  }}
                  className="px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 justify-center"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3671C18.7873 3.54588 17.147 2.98468 15.418 2.7649C15.4121 2.76383 15.4063 2.76274 15.3995 2.76164C15.1558 2.71569 14.9118 2.80219 14.8848 3.02501C14.6547 5.1625 14.3871 7.0951 13.9054 8.8559 13.2202 10.3281C11.7383 10.175 10.2854 10.175 8.84328 10.3281C8.15797 8.8559 7.6762 7.0951 7.44608 5.1625C7.41906 4.80561 7.04952 4.57055 6.68538 4.66309C5.30988 5.00238 3.80746 5.4082 2.25214 6.15625C2.08625 6.2473 1.96402 6.41141 1.94631 6.60547C0.704692 12.6851 1.7035 18.0711 5.18328 20.7257C5.32945 20.8404 5.51589 20.8959 5.69832 20.8783C7.13896 20.7712 8.54795 20.4441 9.86245 19.9265C10.0701 19.8451 10.2077 19.6788 10.2423 19.4878C10.5589 17.8035 10.8034 15.9363 10.8034 14.0227C10.8034 13.4743 11.2502 13.0274 11.7986 13.0274C12.3469 13.0274 12.7938 13.4743 12.7938 14.0227C12.7938 15.9363 13.0383 17.8035 13.3549 19.4878C13.3895 19.6788 13.527 19.8451 13.7347 19.9265C15.0492 20.4441 16.4582 20.7712 17.8989 20.8783C18.0813 20.8959 18.2677 20.8404 18.4139 20.7257C21.8936 18.0711 22.9925 12.6851 21.7509 6.60547C21.7332 6.41141 21.611 6.2473 21.4451 6.15625Z"/>
                  </svg>
                  Login with Discord
                </button>
                <a
                  href="/store"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border-2 border-orange-500 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  🛍️ Store
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Server Status Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-orange-400">
            🖥️ Server Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Online Status */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-orange-500 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Status</h3>
                <div
                  className={`w-4 h-4 rounded-full ${
                    serverStatus.online
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                />
              </div>
              <p className="text-3xl font-bold text-orange-400">
                {serverStatus.online ? "🟢 Online" : "🔴 Offline"}
              </p>
            </div>

            {/* Player Count */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-orange-500 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Players</h3>
              <p className="text-3xl font-bold text-orange-400">
                {serverStatus.players.online}/{serverStatus.players.max}
              </p>
              <p className="text-slate-400 mt-2">Online now</p>
            </div>

            {/* Version */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-orange-500 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Version</h3>
              <p className="text-3xl font-bold text-orange-400">
                {serverStatus.version.name}
              </p>
            </div>

            {/* IP Address */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-orange-500 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">IP Address</h3>
              <p className="text-2xl font-bold text-orange-400 break-all">
                store.mystic-mc.net
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("store.mystic-mc.net");
                  alert("Copied to clipboard!");
                }}
                className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition-colors"
              >
                Copy IP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Players Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-orange-400">
            🏆 Top Players by Playtime
          </h2>

          <div className="max-w-4xl mx-auto">
            {topPlayers.length > 0 ? (
              <div className="space-y-4">
                {topPlayers.map((player, index) => (
                  <div
                    key={player.uuid}
                    className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 border border-orange-500 hover:shadow-lg transition-all duration-300 transform hover:scale-102"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-orange-400 min-w-12">
                          #{index + 1}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-white">
                            {player.username}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            Last seen: {new Date(player.lastSeen).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-400">
                          {Math.floor(player.playtime)}h
                        </p>
                        <p className="text-slate-400 text-sm">playtime</p>
                        {player.level && (
                          <p className="text-orange-300 text-sm mt-2">
                            Level {player.level}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-12 text-center border border-orange-500">
                <p className="text-slate-300 text-lg">
                  No player data available yet
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Join Our Community
          </h2>
          <p className="text-xl text-orange-200 mb-8">
            Become part of the Mystic Network and enjoy an amazing Minecraft experience
          </p>
          <a
            href="/applications"
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            🎯 Apply Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

