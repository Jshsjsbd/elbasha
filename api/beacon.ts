import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get, update, remove, push } from 'firebase/database';
import { UAParser } from "ua-parser-js";
import bcrypt from 'bcryptjs';

const secret = process.env.FIREBASE_SECRET!;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
const logsRef = ref(db, `secure_beacons/${secret}/logs`);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://elraya.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  // Handle different actions based on query parameter
  switch (action) {
    case 'store-logs':
      return await handleStoreLogs(req, res);
    case 'show-logs':
      return await handleShowLogs(req, res);
    case 'send-logs':
      return await handleSendLogs(req, res);
    case 'delete-logs':
      return await handleDeleteLogs(req, res);
    default:
      return res.status(400).json({ 
        success: false, 
        error: "Invalid action. Use: show-logs, delete-logs, or send-logs" 
      });
  }
}


async function handleStoreLogs(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', 'https://elraya.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    console.log("📥 Beacon API triggered");

    const publicIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const forwardedFor = req.headers["x-forwarded-for"] as string;
    const ip = forwardedFor?.split(",")[0].trim() || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const source = req.query.source || "unknown";
    const localIP = req.query.local_ip || "N/A";

    console.log("🌐 IP:", ip, "| Source:", source);

    const secret = process.env.FIREBASE_SECRET!;

    // جلب قائمة الايبيهات المحظورة
    const bannedRef = ref(db, `secure_beacons/${secret}/banned`);
    const snapshot = await get(bannedRef);
    const bannedIPs = snapshot.exists() ? Object.keys(snapshot.val()!) : [];
    console.log("🚫 Banned IPs:", bannedIPs);

    if (bannedIPs.includes(ip)) {
        console.log("🚫 IP محظور. منع الوصول.");
        return res.status(403).send("🚫 Access denied.");
    }

    // تحليل الـ User-Agent للحصول على نوع الجهاز
    const parser = new UAParser(userAgent);
    const deviceModel = parser.getDevice().model || "Unknown";
    const deviceVendor = parser.getDevice().vendor || "";
    const finalModel = deviceVendor ? `${deviceVendor} ${deviceModel}` : deviceModel;

    const content = `📡 **Beacon Detected**
    > 🌐 **Public IP:** ${publicIP}
    > 🖥️ **Local IP:** ${localIP}
    > 📍 **Source:** ${source}
    > 🧭 **User-Agent:** \`${userAgent}\`
    > 📱 **Model:** ${finalModel}`;

    console.log("🌟 Logging beacon:", content);
    await push(ref(db, `secure_beacons/${secret}/logs`), {
        content,
        timestamp: Date.now()
    });
    console.log("✅ Beacon stored in Firebase");

    const pixel = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAokB9AcPjGgAAAAASUVORK5CYII=",
        "base64"
    );
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", pixel.length);
    res.status(200).end(pixel);
}


async function handleShowLogs(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', 'https://elraya.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== "GET") return res.status(405).end("Method not allowed");

    try {
        const snapshot = await get(logsRef);
        if (!snapshot.exists()) return res.status(200).json({ entries: [] });

        const data = snapshot.val();
        const entries = Object.values(data).map((item: any) => item.content);
        res.status(200).json({ entries });
    } catch (err) {
        console.error("❌ Error fetching logs:", err);
        res.status(500).json({ error: "Error reading logs" });
    }

}


async function handleSendLogs(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', 'https://elraya.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
    }

    if (req.method !== "POST") return res.status(405).end("Method not allowed");

    const secret = process.env.FIREBASE_SECRET!;
    const logsRef = ref(db, `secure_beacons/${secret}/logs`);


    try {
    const snapshot = await get(logsRef);
    if (!snapshot.exists()) return res.status(200).json({ success: false, message: "No logs" });

    const data = snapshot.val();
    const entries = Object.values(data).map((item: any) => item.content);

    const message = `📦 **Beacon Logs (${entries.length})**\n\n` + entries.join("\n\n");

    if (!webhookUrl) {
        throw new Error("DISCORD_WEBHOOK_URL environment variable is not set.");
    }
    await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message.slice(0, 2000) }) // Discord limit
    });

    await remove(logsRef);

    res.status(200).json({ success: true });
    } catch (err) {
    console.error("❌ Error sending logs:", err);
    res.status(500).json({ success: false });
    }
}


async function handleDeleteLogs(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', 'https://elraya.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
    }

    if (req.method !== "DELETE") return res.status(405).end("Method not allowed");

    try {
        await remove(logsRef);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ Error deleting logs:", err);
        res.status(500).json({ error: "Error deleting logs" });
    }
}