import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { config } from '../config/config';
import logger from '../utils/logger';
import { supabase } from '../config/supabase';

const stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2023-10-16' as any,
});

export const PaymentController = {
    /**
     * Creates a Stripe Checkout Session for deposits.
     */
    createCheckoutSession: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { amount, userId, userEmail } = req.body;

            if (!amount || !userId) {
                return res.status(400).json({ success: false, error: 'Missing amount or userId' });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'P3 Protocol Deposit',
                                description: `Deposit for user ${userId}`,
                            },
                            unit_amount: Math.round(amount * 100), // Stripe uses cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${req.headers.origin}/profile?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${req.headers.origin}/profile`,
                customer_email: userEmail,
                metadata: {
                    userId,
                    amount: amount.toString(),
                },
            });

            return res.status(200).json({ success: true, url: session.url });
        } catch (error: any) {
            logger.error({ error: error.message }, 'Stripe Session Creation Failed');
            next(error);
        }
    },

    /**
     * Handles Stripe Webhooks.
     */
    handleWebhook: async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                (req as any).rawBody,
                sig,
                config.stripe.webhookSecret
            );
        } catch (err: any) {
            logger.error({ error: err.message }, 'Webhook Signature Verification Failed');
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const amount = parseFloat(session.metadata?.amount || '0');

            if (userId && amount > 0) {
                logger.info({ userId, amount }, 'Processing successful deposit via webhook');

                try {
                    // Update user balance in Supabase
                    // Note: We need to fetch the existing data blob and update the balance
                    const { data: userData, error: fetchError } = await supabase
                        .from('users')
                        .select('data')
                        .eq('id', userId)
                        .single();

                    if (fetchError || !userData) {
                        throw new Error(`User ${userId} not found for balance update`);
                    }

                    const profile = userData.data;
                    profile.balance = (profile.balance || 0) + amount;

                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ data: profile })
                        .eq('id', userId);

                    if (updateError) throw updateError;

                    logger.info({ userId, newBalance: profile.balance }, 'User balance updated successfully');
                } catch (dbError: any) {
                    logger.error({ error: dbError.message, userId }, 'Failed to update user balance after successful payment');
                    // Stripe will retry if we don't return 200, but we should probably log this critically
                    return res.status(500).json({ received: true, error: 'DB Update Failed' });
                }
            }
        }

        res.json({ received: true });
    },
};
