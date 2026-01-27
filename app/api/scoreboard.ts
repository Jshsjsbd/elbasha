// scoreboard.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get } from 'firebase/database';

const secret = process.env.FIREBASE_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://mystic1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== "GET") return res.status(405).end("Method not allowed");

  try {
    // Fetch all accounts from the database
    const accountsRef = ref(db, `secure_beacons/${secret}/accounts`);
    const snapshot = await get(accountsRef);

    if (!snapshot.exists()) {
      return res.status(200).json({ 
        success: true, 
        accounts: [],
        message: "No accounts found" 
      });
    }

    const accountsData = snapshot.val();
    
    // Transform the data and filter out accounts without points
    const accounts = Object.entries(accountsData).map(([id, data]: [string, any]) => ({
      id,
      name: data.name || 'Unknown User',
      email: data.email || '',
      points: parseInt(data.Points || data.points || 0), // Handle both 'Points' and 'points'
      verified: data.verified || false
    })).filter(account => account.points >= 0); // Include accounts with 0 points but exclude undefined/null

    // Sort by points in descending order
    accounts.sort((a, b) => b.points - a.points);

    // Optional: Log the activity for analytics
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0];

    res.status(200).json({ 
      success: true, 
      accounts,
      total_accounts: accounts.length,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Scoreboard fetch error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch scoreboard data",
      details: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined
    });
  }
}