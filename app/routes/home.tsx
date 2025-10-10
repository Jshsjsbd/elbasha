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

function Home() {
  const { t } = useTranslation();
  const [javaCopied, setJavaCopied] = useState(false);
  const [bedrockCopied, setBedrockCopied] = useState(false);
  const [newsItems, setNewsItems] = useState<Array<{ id: string; title: string; date: string; summary: string }>>([]);
  const [newsPage, setNewsPage] = useState(1);
  const pageSize = 5;
  const [topJoin, setTopJoin] = useState<Array<{ id: string; name: string; date: string }>>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Try to fetch from backend if available
        const res = await fetch('/api/news', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setNewsItems(data);
            return;
          }
        }
      } catch {}
      // Fallback sample data
      if (isMounted) {
        setNewsItems([
          { id: '1', title: 'New Minigame Released', date: '2025-10-01', summary: 'Jump into our latest fast-paced minigame with new maps and kits.' },
          { id: '2', title: 'Double XP Weekend', date: '2025-09-28', summary: 'Earn double XP across all game modes this weekend. Don\'t miss out!' },
          { id: '3', title: 'Store Update', date: '2025-09-20', summary: 'Fresh cosmetics and seasonal bundles are now available in the store.' },
          { id: '4', title: 'Leaderboard Reset', date: '2025-09-15', summary: 'Seasonal leaderboards have been reset. Climb back to the top!' },
          { id: '5', title: 'Anti-Cheat Improvements', date: '2025-09-10', summary: 'We\'ve rolled out enhanced anti-cheat to keep matches fair.' },
          { id: '6', title: 'Community Event', date: '2025-09-05', summary: 'Join our build contest and win exclusive in-game rewards.' },
        ]);
      }
    })();
    (async () => {
      try {
        const res = await fetch('/api/top-join', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setTopJoin(data);
            return;
          }
        }
      } catch {}
      if (isMounted) {
        setTopJoin([
          { id: 'tj1', name: 'EnderKnight', date: '2025-10-08' },
          { id: 'tj2', name: 'SkyMiner', date: '2025-10-07' },
          { id: 'tj3', name: 'RedstoneGuru', date: '2025-10-07' },
          { id: 'tj4', name: 'CreeperTamer', date: '2025-10-06' },
          { id: 'tj5', name: 'MysticWolf', date: '2025-10-06' },
          { id: 'tj6', name: 'BlockMaster', date: '2025-10-05' },
        ]);
      }
    })();
    return () => { isMounted = false; };
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
              // @ts-ignore custom CSS var
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
      // Even if copy fails, briefly show the state to provide feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <>
      {/* <ParticleBackground /> */}
      <Header type='home' />
      <div className='relative flex justify-center items-center z-100 flex-col'>
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex flex-col md:flex-row items-center justify-center md:space-x-10 pt-38 pb-44 z-100 min-h-[100vh]">
          <div className="flex flex-col items-center justify-center">
            <h2
              className="max-w-[calc(100vw-3px)] mt-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-7 text-center leading-tight tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="whitespace-normal md:whitespace-nowrap">
                {/* {t("welcome")} */}
                <span style={{ display: "inline", color: "var(--text-accent)" }} className='text-shadow-lg'>
                  <TextType 
                    text="Mystic Network!"
                    typingSpeed={65}
                    pauseDuration={1500}
                    showCursor={true}
                    cursorCharacter="|"
                  />
                </span>
              </span>
            </h2>
            <div>
              <p className="max-w-[calc(100vw-3px)] relative text-base sm:text-lg md:text-xl md:max-w-2xl mx-auto opacity-90 text-center text-shadow-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                The best minecraft minigames network ever.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-3 mt-10 opacity-70 animate-bounce flex justify-center items-center text-center">
                <i className="fas fa-chevron-down text-3xl" style={{ color: "var(--text-accent)" }}></i>
              </div>
              <Link
                to="#join"
                className="mt-1 px-8 py-4 rounded-full text-lg font-semibold transition transform hover:scale-105 focus:outline-none focus:ring-4"
                style={{ 
                  backgroundColor: "var(--button-bg)", 
                  color: "var(--bg-primary)",
                  "--tw-ring-color": "var(--accent-color)",
                  boxShadow: "0 20px 25px -5px var(--shadow-color), 0 10px 10px -5px var(--shadow-color-light)"
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--button-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--button-bg)";
                }}
              >
                {/* {t("start")} */} Join Now
              </Link>
            </div>
          </div>
          {/* <div className="relative w-96 h-96 lg:h-[400px] rounded-3xl overflow-hidden shadow-2xl mt-6 md:mt-0 max-w-xs md:max-w-md">
            <img
              // src={WelcomePhoto}
              alt="Welcome Photo"
              className="w-full h-full object-cover"
            />
          </div> */}
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
                    // @ts-ignore custom CSS var
                    "--tw-ring-color": "var(--accent-color)"
                  } as React.CSSProperties}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--button-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--button-bg)"; }}
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
                    // @ts-ignore custom CSS var
                    "--tw-ring-color": "var(--accent-color)"
                  } as React.CSSProperties}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--button-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--button-bg)"; }}
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
                      <time className="text-sm opacity-80 font-mono" style={{ color: 'var(--text-secondary)' }}>{item.date}</time>
                    </div>
                    <p className="mt-2 text-sm md:text-base opacity-90" style={{ color: 'var(--text-secondary)' }}>{item.summary}</p>
                  </article>
                ))
              )}
            </div>

            <PaginationTabs position="bottom" />
          </div>

          {/* Top Join Card */}
          <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md shadow-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Top Join</h3>
            </div>
            <ul className="divide-y divide-white/10">
              {topJoin.length === 0 ? (
                <li className="py-3 text-sm opacity-80" style={{ color: 'var(--text-secondary)' }}>No joins yet.</li>
              ) : (
                topJoin.slice(0, 10).map((p) => (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: 'var(--button-bg)', color: 'var(--bg-primary)' }}>
                        {p.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                        <div className="text-xs opacity-80 font-mono" style={{ color: 'var(--text-secondary)' }}>{p.date}</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5" style={{ color: 'var(--text-secondary)' }}>Joined</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}


export default Home;