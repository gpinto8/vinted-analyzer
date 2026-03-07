import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const ipCounts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry) return true;
  if (now > entry.resetAt) {
    ipCounts.delete(ip);
    return true;
  }
  return entry.count < RATE_LIMIT_MAX;
}

function incrementRateLimit(ip: string): void {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      email,
      features = [],
      customIdeas = "",
      website: honeypot,
    } = body as {
      name?: string;
      email?: string;
      features?: string[];
      customIdeas?: string;
      website?: string;
    };

    if (honeypot?.trim()) {
      incrementRateLimit(ip);
      return NextResponse.json({ success: true });
    }

    const hasContent = (Array.isArray(features) && features.length > 0) || (typeof customIdeas === "string" && customIdeas.trim().length > 0);
    if (!hasContent) {
      return NextResponse.json(
        { error: "Select at least one feature or add custom ideas." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const feedbackEmail = process.env.FEEDBACK_EMAIL?.trim();
    const feedbackFrom = process.env.FEEDBACK_FROM?.trim() || "Vinted Analyzer <onboarding@resend.dev>";

    if (!resendApiKey || !feedbackEmail) {
      console.warn("[feedback] Missing env: RESEND_API_KEY, FEEDBACK_EMAIL");
      return NextResponse.json(
        { error: "Feedback is not configured." },
        { status: 500 }
      );
    }

    const displayName = (name ?? "").trim() || "Anonymous";
    const displayEmail = (email ?? "").trim() || "—";

    const featureList = Array.isArray(features) ? features : [];
    const featureLines = featureList.length > 0
      ? featureList.map((f: string) => `  • ${f}`).join("\n")
      : "  (none)";

    const html = `
<h2>Vinted Analyzer — Feedback</h2>
<p><strong>Name:</strong> ${escapeHtml(displayName)}</p>
<p><strong>Email:</strong> ${escapeHtml(displayEmail)}</p>
<h3>Requested features</h3>
<pre>${escapeHtml(featureLines)}</pre>
${(customIdeas ?? "").trim() ? `<h3>Custom ideas</h3><pre>${escapeHtml(String(customIdeas).trim())}</pre>` : ""}
<p style="color:#888;font-size:12px;">IP: ${escapeHtml(ip)}</p>
`;

    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: feedbackFrom,
      to: feedbackEmail,
      subject: `[Vinted Analyzer] Feedback from ${displayName}`,
      html,
    });

    if (error) {
      console.error("[feedback]", error);
      return NextResponse.json(
        { error: "Failed to send feedback." },
        { status: 500 }
      );
    }

    incrementRateLimit(ip);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[feedback]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
