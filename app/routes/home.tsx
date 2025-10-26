import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import Chart from 'chart.js/auto';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router';
import WelcomeSVG from '../components/welcome-not-css.svg';
import ParticleBackground from '../components/BackgroundEffects';
import TextType from '~/components/TypingText';
import { useTranslation } from "react-i18next";

// Type definitions for API response
interface PlayerData {
  playerName: string;
  playerUUID: string;
  playtimeActive: number;
  extensionValues?: {
    primaryGroup?: {
      value: string;
    };
  };
}

interface PlayersTableResponse {
  players: PlayerData[];
}

function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [javaCopied, setJavaCopied] = useState(false);
  const [bedrockCopied, setBedrockCopied] = useState(false);

  // Preload video
  useEffect(() => {
    const videoPreload = document.createElement('video');
    videoPreload.src = '/videos/hero.mp4';
    videoPreload.load();
  }, []);
  const [newsItems, setNewsItems] = useState<Array<{ id: string; title: string; description: string; assets?: string[]; createdAt?: number }>>([]);
  const [newsPage, setNewsPage] = useState(1);
  const pageSize = 5;
  const [topJoin, setTopJoin] = useState<Array<{ id: string; name: string; playtime: string; rank: string }>>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);

  // Format milliseconds to readable time
  function formatPlaytime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  function renderFormattedDescription(description: string) {
    if (!description) return null;

    function renderInline(text: string, keyPrefix: string) {
      const underlineParts = text.split(/(__[^_]+__)/g);
      const underlineNodes = underlineParts.map((part, i) => {
        if (part.startsWith('__') && part.endsWith('__') && part.length > 4) {
          const inner = part.slice(2, -2);
          return <u key={`${keyPrefix}-u-${i}`}>{renderBold(inner, `${keyPrefix}-u-inner-${i}`)}</u>;
        }
        return renderBold(part, `${keyPrefix}-plain-${i}`);
      });
      return underlineNodes;
    }

    function renderBold(text: string, keyPrefix: string) {
      const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, j) => {
        if (bp.startsWith('**') && bp.endsWith('**') && bp.length > 4) {
          return <strong key={`${keyPrefix}-b-${j}`}>{bp.slice(2, -2)}</strong>;
        }
        return <span key={`${keyPrefix}-t-${j}`}>{bp}</span>;
      });
    }

    const lines = description.split(/\r?\n/);
    return (
      <div>
        {lines.map((line, idx) => {
          const isBullet = line.trim().startsWith('- ');
          const content = isBullet ? line.trim().slice(2) : line;
          if (isBullet) {
            return (
              <div key={`l-${idx}`} style={{ display: 'flex', gap: 8, paddingLeft: 12, alignItems: 'flex-start' }}>
                <span style={{ lineHeight: 1.6 }}>•</span>
                <span style={{ lineHeight: 1.6 }}>{renderInline(content, `li-${idx}`)}</span>
              </div>
            );
          }
          return (
            <div key={`l-${idx}`} style={{ lineHeight: 1.6 }}>{renderInline(content, `ln-${idx}`)}</div>
          );
        })}
      </div>
    );
  }

  useEffect(() => {
    let isMounted = true;

    // Fetch news
    async function fetchNews() {
      try {
        const res = await fetch('https://elbasha-backend.vercel.app/api/news', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setNewsItems(data);
          }
        }
      } catch {}
    }
    fetchNews();
    const intervalId = setInterval(() => { fetchNews(); }, 5000);
    

    // Fetch top players from Plan API
    async function fetchTopPlayers() {
      try {
        setIsLoadingPlayers(true);
        const res = await fetch('https://elbasha-backend.vercel.app/api/players');
        if (res.ok) {
          const data: PlayersTableResponse = await res.json();
          if (isMounted && data.players && Array.isArray(data.players)) {
            const sorted = [...data.players]
              .sort((a, b) => b.playtimeActive - a.playtimeActive)
              .slice(0, 5)
              .map((p) => ({
                id: p.playerUUID,
                name: p.playerName,
                playtime: formatPlaytime(p.playtimeActive),
                rank:
  (
    p.extensionValues?.primaryGroup?.value
      ?.replace(/_/g, ' ')
      ?.replace(/\b\w/g, (c) => c.toUpperCase())
  ) === "Default"
    ? "Member"
    : (
        p.extensionValues?.primaryGroup?.value
          ?.replace(/_/g, ' ')
          ?.replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown"
      )
              }));
            setTopJoin(sorted);
          }
        }
      } catch (err) {
        console.error("Error fetching players:", err);
      } finally {
        if (isMounted) setIsLoadingPlayers(false);
      }
    }

    fetchTopPlayers();
    const playersInterval = setInterval(fetchTopPlayers, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearInterval(playersInterval);
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(newsItems.length / pageSize));
  const currentPage = Math.min(newsPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleNews = newsItems.slice(pageStart, pageStart + pageSize);

  function PaginationTabs({ position }: { position: 'top' | 'bottom' }) {
    if (totalPages <= 1) return null;
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 ${position === 'top' ? 'mb-6' : 'mt-6'}`}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={`page-${position}-${p}`}
            aria-label={`Go to page ${p}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-2 ${
              p === currentPage ? 'scale-105' : 'hover:scale-105'
            }`}
            style={{
              backgroundColor: p === currentPage ? 'var(--button-hover)' : 'var(--button-bg)',
              color: 'var(--bg-primary)',
              '--tw-ring-color': 'var(--accent-color)'
            } as React.CSSProperties}
            onMouseEnter={(e) => { if (p !== currentPage) e.currentTarget.style.backgroundColor = 'var(--button-hover)'; }}
            onMouseLeave={(e) => { if (p !== currentPage) e.currentTarget.style.backgroundColor = 'var(--button-bg)'; }}
            onClick={() => setNewsPage(p)}
          >
            {p}
          </button>
        ))}
      </div>
    );
  }

  async function handleCopy(text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) {
    try {
      if (navigator.clipboard && (window as any).isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <>
    {/* <ParticleBackground /> */}
    <Header type='home' />
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <div className='relative flex justify-center items-center flex-col'>
        {!isVideoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900/80 to-black/90 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
          </div>
        )}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          style={{ opacity: isVideoLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
        >
          <source src="https://r2.guns.lol/c5f9338a-a38f-4419-a55c-711c6e9ecb05.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex flex-col items-center justify-center pt-16 pb-16 min-h-[40vh] px-4">
          <h2
            className="max-w-[calc(100vw-3px)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-5 text-center leading-tight tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            <span className="whitespace-normal md:whitespace-nowrap">
                {/* {t("welcome")} */}
                <span style={{ display: "inline", color: "var(--text-accent)" }} className='text-shadow-lg'>
                  <TextType 
                    text="Mystic Network!"
                    typingSpeed={55}
                    pauseDuration={1500}
                    showCursor={true}
                    cursorCharacter="|"
                  />
                </span>
              </span>
          </h2>
          <p className="max-w-[calc(100vw-3px)] text-base sm:text-lg md:text-xl md:max-w-2xl mx-auto opacity-90 text-center text-shadow-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            The best minecraft minigames network ever.
          </p>
          <div className="flex flex-col items-center">
            <div className="mb-3 mt-10 opacity-70 animate-bounce">
              <i className="fas fa-chevron-down text-3xl" style={{ color: "var(--text-accent)" }}></i>
            </div>
            <a
              href="#join"
              className="mt-1 px-8 py-4 rounded-full text-lg font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-4"
              style={{ 
                backgroundColor: "var(--button-bg)", 
                color: "var(--bg-primary)",
                "--tw-ring-color": "var(--accent-color)",
                boxShadow: "0 20px 25px -5px var(--shadow-color), 0 10px 10px -5px var(--shadow-color-light)"
              } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--button-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--button-bg)"}
            >
              Join Now
            </a>
          </div>
        </div>
      </div>

      {/* Server Info Section */}
      <section id="join" className="w-full flex justify-center items-center py-14 px-4">
        <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Join Mystic Network</h3>
              <p className="opacity-90" style={{ color: "var(--text-secondary)" }}>Connect using Java or Bedrock. See details below and click to copy.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col items-start sm:items-center sm:flex-row gap-2 sm:gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <div>
                  <span className="text-sm uppercase tracking-wide opacity-80" style={{ color: "var(--text-secondary)" }}>Java</span>
                  <div className="font-mono text-lg" style={{ color: "var(--text-primary)" }}>mystic.mc-dns.com</div>
                </div>
                <button
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--button-bg)",
                    color: "var(--bg-primary)",
                    "--tw-ring-color": "var(--accent-color)"
                  } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--button-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--button-bg)"}
                  onClick={() => handleCopy("mystic.mc-dns.com", setJavaCopied)}
                >
                  {javaCopied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex flex-col items-start sm:items-center sm:flex-row gap-2 sm:gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <div>
                  <span className="text-sm uppercase tracking-wide opacity-80" style={{ color: "var(--text-secondary)" }}>Bedrock</span>
                  <div className="font-mono text-lg" style={{ color: "var(--text-primary)" }}>mystic.mc-dns.com</div>
                  <div className="font-mono text-xs opacity-80" style={{ color: "var(--text-secondary)" }}>Port: 25597</div>
                </div>
                <button
                  className="px-3 py-2 rounded-lg text-sm font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--button-bg)",
                    color: "var(--bg-primary)",
                    "--tw-ring-color": "var(--accent-color)"
                  } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--button-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--button-bg)"}
                  onClick={() => handleCopy("mystic.mc-dns.com:25597", setBedrockCopied)}
                >
                  {bedrockCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News + Top Join Section */}
      <section className="w-full flex justify-center items-center py-14 px-4">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* News Card */}
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>News</h3>
              {newsItems.length > 0 && (
                <span className="text-sm opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  {newsItems.length} update{newsItems.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {visibleNews.length === 0 ? (
                <div className="text-center opacity-80" style={{ color: 'var(--text-secondary)' }}>No news yet.</div>
              ) : (
                visibleNews.map((item) => (
                  <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <h4 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                      {item.createdAt ? (
                        <time className="text-sm opacity-80 font-mono" style={{ color: 'var(--text-secondary)' }}>{new Date(item.createdAt).toLocaleString()}</time>
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm md:text-base opacity-90" style={{ color: 'var(--text-secondary)' }}>
                      {renderFormattedDescription(item.description)}
                    </div>
                    {Array.isArray(item.assets) && item.assets.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {item.assets.slice(0, 6).map((url, idx) => (
                          <img key={idx} src={url} alt="news asset" className="w-full h-28 object-cover rounded-lg border border-white/10" />
                        ))}
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>

            <PaginationTabs position="bottom" />
          </div>

          {/* Top Join Card */}
          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Top Players</h3>
              {isLoadingPlayers && (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
              )}
            </div>
            <ul className="divide-y divide-white/10">
              {topJoin.length === 0 ? (
                <li className="py-3 text-sm opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  {isLoadingPlayers ? 'Loading...' : 'No players yet.'}
                </li>
              ) : (
                topJoin.map((p, index) => (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-3">
  <div className="flex items-center gap-3 min-w-0">
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
      <img
        src={`https://mc-heads.net/avatar/${p.name.trim()}/64`}
        alt={p.name}
        className="w-full h-full object-cover"
        onError={(e) => (e.currentTarget.src = '/default-skin.png')}
      />
    </div>
    <div className="min-w-0">
      <div className="truncate font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
      <div className="text-xs opacity-80 font-mono" style={{ color: 'var(--text-secondary)' }}>{p.playtime} • <span style={{ backgroundColor: "var(--button-bg)", color: "var(--bg-primary)", padding: "3px", fontWeight: "bold", borderRadius: "20px"}}>{p.rank}</span></div>
    </div>
  </div>
  <div className="flex items-center gap-1">
    <i className="fas fa-clock text-xs" style={{ color: 'var(--text-accent)', opacity: 0.6 }}></i>
  </div>
</li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
    </>
  );
}

export default Home;
