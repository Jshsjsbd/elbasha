import { useState, useEffect } from "react";
import Head from "next/head";

export default function SecretPage() {
  const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [unlocked, setUnlocked] = useState(false);
    const [pass, setPass] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState<string | null>(null);

    const tryUnlock = async () => {
        const res = await fetch("https://elbasha-backend.vercel.app/api/authenticate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: pass }),
        });

        const data = await res.json();
        if (data.success) {
        setUnlocked(true);
        } else {
        alert("❌ كلمة السر غلط");
        }
    };

    const submitNews = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitMsg(null);
        if (!title.trim() || !description.trim()) {
            setSubmitMsg('Title and description are required');
            return;
        }
        setSubmitting(true);
        try {
            let encodedAssets: string[] = [];
            if (files && files.length > 0) {
                const tasks = Array.from(files).map(async (file) => {
                    const arrayBuffer = await file.arrayBuffer();
                    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                    const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`;
                    return dataUrl;
                });
                encodedAssets = await Promise.all(tasks);
            }
            const body = {
                title: title.trim(),
                description: description.trim(),
                assets: encodedAssets,
            };
            const res = await fetch('https://elbasha-backend.vercel.app/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const ejson = await res.json().catch(() => ({}));
                throw new Error(ejson?.error || `Failed with ${res.status}`);
            }
            setSubmitMsg('News created successfully');
            setTitle('');
            setDescription('');
            setFiles(null);
        } catch (err: any) {
            setSubmitMsg(err?.message || 'Failed to create news');
        } finally {
            setSubmitting(false);
        }
    };

  return (
    <>
      <Head>
        <title>🚫 ممنوع</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ minHeight: "100vh", background: "linear-gradient(120deg, #181b22 0%, #2b3244 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ background: "rgba(34, 40, 49, 0.85)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", borderRadius: "18px", padding: "2.5rem 2rem", maxWidth: 480, width: "100%", color: "#ebeef5", border: "1.5px solid rgba(45, 212, 191, 0.18)", backdropFilter: "blur(8px)", margin: "2rem 0" }}>
          
          {!unlocked ? (
            <>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8, color: "#11ffd6", letterSpacing: 1 }}>
                🔒 الصفحة محمية
              </h2>
              <p style={{ marginBottom: 16, color: "#bebec6" }}>أدخل كلمة المرور للدخول:</p>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="كلمة السر"
                  style={{
                    padding: "0.7rem 1rem",
                    borderRadius: 8,
                    border: "1.5px solid #2dd4bf",
                    background: "#181b22",
                    color: "#ebeef5",
                    outline: "none",
                    fontSize: 16,
                    width: "60%",
                    boxShadow: "0 1px 4px 0 rgba(17,255,214,0.04)",
                  }}
                />
                <button
                  onClick={tryUnlock}
                  style={{
                    background: "linear-gradient(90deg, #11ffd6 0%, #6366f1 100%)",
                    color: "#181b22",
                    fontWeight: 700,
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.5rem",
                    cursor: "pointer",
                    fontSize: 16,
                    boxShadow: "0 2px 8px 0 rgba(17,255,214,0.08)",
                    transition: "transform 0.1s",
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  دخول
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>

                <h2 style={{ fontSize: "2rem", color: "#11ffd6", fontWeight: 900 }}>📰 News Control Panel</h2>
              <form onSubmit={submitNews} style={{ width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#bebec6' }}>New's title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    style={{ padding: '0.7rem 1rem', borderRadius: 8, border: '1.5px solid #2dd4bf', background: '#181b22', color: '#ebeef5', outline: 'none', fontSize: 16 }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#bebec6' }}>New's description</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write the description. Use - for bullet lines, **bold**, __underline__."
                    rows={6}
                    style={{ padding: '0.7rem 1rem', borderRadius: 8, border: '1.5px solid #2dd4bf', background: '#181b22', color: '#ebeef5', outline: 'none', fontSize: 16, resize: 'vertical' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontWeight: 700, color: '#bebec6' }}>Assets (choose files, optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    style={{ padding: '0.5rem', borderRadius: 8, border: '1.5px solid #2dd4bf', background: '#181b22', color: '#ebeef5', outline: 'none', fontSize: 16 }}
                  />
                  {files && files.length > 0 && (
                    <span style={{ color: '#bebec6', fontSize: 12 }}>{files.length} file(s) selected</span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: submitting ? '#0ea5a3' : 'linear-gradient(90deg, #11ffd6 0%, #6366f1 100%)',
                      color: '#181b22', fontWeight: 700, border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', cursor: 'pointer', fontSize: 16,
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Add News'}
                  </button>
                  {submitMsg && (
                    <span style={{ color: submitMsg.includes('success') ? '#2dd4bf' : '#f87171' }}>{submitMsg}</span>
                  )}
                </div>
              </form>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
