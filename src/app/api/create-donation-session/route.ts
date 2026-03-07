import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY?.trim();
const FALLBACK_BASE = (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");

const MIN_AMOUNT_CENTS = 50;

function isValidOrigin(origin: unknown): origin is string {
  if (typeof origin !== "string") return false;
  try {
    const u = new URL(origin);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!STRIPE_SECRET) {
    return NextResponse.json(
      { error: "Donations are not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { amount: amountEur, currency = "eur", origin } = body as {
      amount?: number;
      currency?: string;
      origin?: string;
    };
    const baseUrl = isValidOrigin(origin) ? origin.replace(/\/$/, "") : FALLBACK_BASE;

    const amountNum = typeof amountEur === "number" ? amountEur : parseFloat(String(amountEur ?? 0));
    if (!Number.isFinite(amountNum) || amountNum < MIN_AMOUNT_CENTS / 100) {
      return NextResponse.json(
        { error: "Invalid amount." },
        { status: 400 }
      );
    }

    const amountCents = Math.round(amountNum * 100);
    if (amountCents < MIN_AMOUNT_CENTS) {
      return NextResponse.json(
        { error: "Amount too small." },
        { status: 400 }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: String(currency).toLowerCase(),
            product_data: {
              name: "Donation - Vinted Analyzer",
              description: "Support the development of Vinted Analyzer",
              images: [],
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?donation=success`,
      cancel_url: `${baseUrl}/?donation=canceled`,
    });

    const url = session.url;
    if (!url) {
      return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[create-donation-session]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
