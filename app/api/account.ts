import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore
import { db } from './firebase.js';
import { ref, get, update, remove } from 'firebase/database';
import bcrypt from 'bcryptjs';

const secret = process.env.FIREBASE_SECRET!;

// Helper function to find user by email
async function findUserByEmail(email: string) {
  const accountsRef = ref(db, `secure_beacons/${secret}/accounts`);
  const snapshot = await get(accountsRef);
  
  if (!snapshot.exists()) {
    return null;
  }

  const accounts = snapshot.val();
  
  for (const [key, user] of Object.entries(accounts)) {
    if ((user as any).email === email) {
      return { userKey: key, userData: user };
    }
  }
  
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://mystic1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  // Handle different actions based on query parameter
  switch (action) {
    case 'change-name':
      return await handleChangeName(req, res);
    case 'change-password':
      return await handleChangePassword(req, res);
    case 'change-verifying':
      return await handleChangeVerifying(req, res);
    case 'delete':
      return await handleDeleteAccount(req, res);
    default:
      return res.status(400).json({ 
        success: false, 
        error: "Invalid action. Use: change-name, change-password, change-verifying, or delete" 
      });
  }
}

// Handle name change
async function handleChangeName(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://mystic1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "PUT") return res.status(405).end("Method not allowed");

  const { email, newName } = req.body;

  if (!email || !newName) {
    return res.status(400).json({ success: false, error: "Missing email or newName" });
  }

  try {
    const userResult = await findUserByEmail(email);
    
    if (!userResult) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    // Update name
    const userRef = ref(db, `secure_beacons/${secret}/accounts/${userResult.userKey}`);
    await update(userRef, { name: newName });

    res.status(200).json({ success: true, message: "Name updated successfully" });
  } catch (err) {
    console.error("Update name error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

// Handle password change
async function handleChangePassword(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://mystic1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "PUT") return res.status(405).end("Method not allowed");

  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ success: false, error: "Missing email or newPassword" });
  }

  try {
    const userResult = await findUserByEmail(email);
    
    if (!userResult) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const userRef = ref(db, `secure_beacons/${secret}/accounts/${userResult.userKey}`);
    await update(userRef, { password: hashedPassword });

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

// Handle verification status change
async function handleChangeVerifying(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://mystic1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "PUT") return res.status(405).end("Method not allowed");

  const { email, newVerify } = req.body;

  if (!email || newVerify === undefined) {
    return res.status(400).json({ success: false, error: "Missing email or newVerify" });
  }

  try {
    const userResult = await findUserByEmail(email);
    
    if (!userResult) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    // Update verification status
    const userRef = ref(db, `secure_beacons/${secret}/accounts/${userResult.userKey}`);
    await update(userRef, { verified: newVerify });

    res.status(200).json({ success: true, message: "Verification status updated successfully" });
  } catch (err) {
    console.error("Update verify error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}

// Handle account deletion (assuming you have this functionality)
async function handleDeleteAccount(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://mystic1.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== "DELETE") return res.status(405).end("Method not allowed");

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Missing email" });
  }

  try {
    const accountsRef = ref(db, `secure_beacons/${secret}/accounts`);
    const snapshot = await get(accountsRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    const accounts = snapshot.val();
    let userKey = null;
    
    // Find user by email
    for (const [key, user] of Object.entries(accounts)) {
      if ((user as any).email === email) {
        userKey = key;
        break;
      }
    }

    if (!userKey) {
      return res.status(404).json({ success: false, error: "Account not found" });
    }

    // Delete account
    const userRef = ref(db, `secure_beacons/${secret}/accounts/${userKey}`);
    await remove(userRef);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}