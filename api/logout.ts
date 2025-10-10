import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, remove } from 'firebase/database';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://elraya.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== "POST") return res.status(405).end("Method not allowed");
  const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0];
  if (!ip) return res.status(400).json({ success: false });

  try {
    await remove(ref(db, "sessions/" + ip));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false });
  }
}
