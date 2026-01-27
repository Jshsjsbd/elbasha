import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import admin from './firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { minecraftName, email, items } = req.body;

    // Validate input
    if (!minecraftName || !email || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate Minecraft username (alphanumeric and underscore, 3-16 chars)
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(minecraftName)) {
      return res.status(400).json({ error: 'Invalid Minecraft username' });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Product catalog (MUST match frontend exactly)
    const products: Record<number, { name: string; price: number; commands: string[] }> = {
      1: {
        name: 'VIP Rank',
        price: 9.99,
        commands: [
          'lp user {player} parent set vip',
          'give {player} diamond 10',
        ],
      },
      2: {
        name: 'MVP Rank',
        price: 19.99,
        commands: [
          'lp user {player} parent set mvp',
          'give {player} diamond 20',
        ],
      },
      3: {
        name: 'LEGEND Rank',
        price: 34.99,
        commands: [
          'lp user {player} parent set legend',
          'give {player} diamond 50',
          'give {player} netherite_ingot 5',
        ],
      },
      4: {
        name: 'Starter Kit',
        price: 4.99,
        commands: [
          'give {player} diamond_sword 1',
          'give {player} diamond_helmet 1',
          'give {player} diamond_chestplate 1',
          'give {player} diamond_leggings 1',
          'give {player} diamond_boots 1',
          'give {player} golden_apple 64',
        ],
      },
      5: {
        name: 'Protection Bundle',
        price: 7.99,
        commands: [
          'lp user {player} permission set protection.claims 30',
          'eco give {player} 5000',
        ],
      },
    };

    // Calculate total and prepare line items
    let total = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const commandsToExecute: string[] = [];

    for (const item of items) {
      const product = products[item.id];
      if (!product) {
        return res.status(400).json({ error: `Invalid product ID: ${item.id}` });
      }

      // Validate quantity
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        return res.status(400).json({ error: 'Invalid quantity' });
      }

      total += product.price * item.quantity;

      // Add to Stripe line items
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `For Minecraft player: ${minecraftName}`,
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      });

      // Prepare commands (repeat for quantity)
      for (let i = 0; i < item.quantity; i++) {
        commandsToExecute.push(...product.commands);
      }
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Create pending purchase in Firebase
    const purchaseRef = await db.collection('purchases').add({
      minecraftName,
      email,
      items,
      total: Number(total.toFixed(2)),
      commands: commandsToExecute,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      deliveredAt: null,
      paidAt: null,
      stripeSessionId: null,
      stripePaymentIntent: null,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      customer_email: email,
      metadata: {
        purchaseId: purchaseRef.id,
        minecraftName,
      },
    });

    // Update purchase with Stripe session ID
    await purchaseRef.update({
      stripeSessionId: session.id,
    });

    console.log(`Created purchase ${purchaseRef.id} for ${minecraftName} - Total: $${total.toFixed(2)}`);

    return res.status(200).json({
      sessionId: session.id,
      purchaseId: purchaseRef.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    return res.status(500).json({ error: error.message });
  }
}