import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import admin from './firebase';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});
export const config = {
  api: {
    bodyParser: false, // Disable body parsing for webhook signature verification
  },
};
async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).json({ error: 'No signature' });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(Webhook Error: ${err.message});
  }
  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const purchaseId = session.metadata?.purchaseId;
    if (purchaseId) {
      try {
        const db = admin.firestore();

        // Update purchase status to "paid" - plugin will pick it up
        await db.collection('purchases').doc(purchaseId).update({
          status: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          stripePaymentIntent: session.payment_intent,
        });
        console.log(✅ Payment successful for purchase ${purchaseId});
      } catch (error) {
        console.error(❌ Error updating purchase ${purchaseId}:, error);
      }
    } else {
      console.warn('⚠️  No purchaseId in session metadata');
    }
  }
  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
}