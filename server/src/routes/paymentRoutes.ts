import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { publicApiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Create Checkout Session
router.post('/create-checkout-session', publicApiLimiter, PaymentController.createCheckoutSession);

// Webhook for Stripe (No limiter, Stripe will retry)
// Webhook needs raw body, handled in index.ts
router.post('/webhook', PaymentController.handleWebhook);

export default router;
