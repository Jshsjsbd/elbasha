import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

const secret = process.env.FIREBASE_SECRET!;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL, // ADD THIS!
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://mystic1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = admin.database();

    if (req.method === 'GET') {
      const newsRef = db.ref(`secure_beacons/${secret}/news`);
      const snapshot = await newsRef.orderByChild('createdAt').once('value');
      const value = snapshot.val() || {};
      const items = Object.keys(value)
        .map((key) => ({ id: key, ...value[key] }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      res.status(200).json(items);
      return;
    }    

    if (req.method === 'POST') {
      const { title, description, assets } = req.body || {};
      if (!title || !description) {
        res.status(400).json({ success: false, error: 'title and description are required' });
        return;
      }

      let normalizedAssets: string[] = [];
      if (Array.isArray(assets)) {
        for (const item of assets) {
          if (typeof item !== 'string' || item.trim().length === 0) continue;
          normalizedAssets.push(item);
        }
      }

      const newsRef = db.ref(`secure_beacons/${secret}/news`);
      const result = await newsRef.push({
        title: String(title),
        description: String(description),
        assets: normalizedAssets,
        createdAt: Date.now(),
      });

      res.status(201).json({ success: true, id: result.key });
      return;
    }

    res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  } catch (err: any) {
    console.error('API Error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' });
  }
}
