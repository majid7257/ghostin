import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_stub', {
  apiVersion: '2025-02-24.acacia',
});

export const STRIPE_PRICES = {
  pro:    process.env.STRIPE_PRO_PRICE_ID    ?? 'price_pro_stub',
  agency: process.env.STRIPE_AGENCY_PRICE_ID ?? 'price_agency_stub',
} as const;

export type StripePlan = keyof typeof STRIPE_PRICES;
