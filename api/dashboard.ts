// dashboard.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get } from 'firebase/database';

const secret = process.env.FIREBASE_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://elraya.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, error: 'Missing email' });

    const accountsRef = ref(db, `secure_beacons/${secret}/accounts`);
    const snapshot = await get(accountsRef);

    if (!snapshot.exists()) {
      return res.status(200).json({ success: true, data: { points: 0, level: null } });
    }

    const accounts = snapshot.val() || {};
    const account = Object.values(accounts).find((u: any) => u && u.email === email) as any | undefined;

    if (!account) {
      return res.status(200).json({ success: true, data: { points: 0, level: null } });
    }

    return res.status(200).json({
      success: true,
      data: {
        points: typeof account.points === 'number' ? account.points : 0,
        level: typeof account.level === 'number' ? account.level : null,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}