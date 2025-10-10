// signup.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, set, get, push } from 'firebase/database';
import bcrypt from 'bcryptjs';

const secret = process.env.FIREBASE_SECRET!;


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

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  try {
    // نحدد مكان التخزين تحت الـ secret
    const accountsRef = ref(db, `secure_beacons/${secret}/accounts`);

    // نتحقق لو الايميل موجود مسبقاً
    const snapshot = await get(accountsRef);
    if (snapshot.exists()) {
      const accounts = snapshot.val();
      const exists = Object.values(accounts).some((u: any) => u.email === email);
      if (exists) return res.status(400).json({ success: false, error: "Email already exists" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);
    const newUserRef = push(accountsRef);
    await set(newUserRef, { name, email, password: hashed, verified: false, points: 0, level: 1 });

    // تسجيل الـ session حسب IP
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0];
    if (ip) {
      await set(ref(db, `sessions/${ip}`), true);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}
