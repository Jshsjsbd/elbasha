// level-access.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get } from 'firebase/database';

const secret = process.env.FIREBASE_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://mystic1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  try {
    const { email, level } = req.body || {};
    const requestedLevel = Number(level);

    if (!email || !requestedLevel || !Number.isFinite(requestedLevel) || requestedLevel <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid email or level' });
    }

    const accountsRef = ref(db, `secure_beacons/${secret}/accounts`);
    const snapshot = await get(accountsRef);

    if (!snapshot.exists()) {
      return res.status(200).json({ success: true, allowed: false });
    }

    const accounts = snapshot.val() || {};
    const account = Object.values(accounts).find((u: any) => u && u.email === email) as any | undefined;

    const userLevel = typeof account?.level === 'number' ? account.level : null;
    const allowed = userLevel !== null && requestedLevel === userLevel;

    return res.status(200).json({ success: true, allowed });
  } catch (err) {
    console.error('Level access error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}