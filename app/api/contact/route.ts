import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { revalidateTag } from "@/lib/cache";

// Simple in-memory rate limiting map: ip -> lastSubmissionTime
const rateLimitMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // 1. Rate limiting check (max 1 submission every 15 seconds per IP)
    const now = Date.now();
    const lastSub = rateLimitMap.get(ip);
    if (lastSub && now - lastSub < 15000) {
      return NextResponse.json(
        { error: "Please wait a moment before sending another message." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      name,
      email,
      subject,
      description,
      projectType,
      budget,
      timeline,
      attachments,
      honeypot,
    } = body;

    // 2. Honeypot spam check (if honeypot field is filled, silently succeed without saving)
    if (honeypot && String(honeypot).trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    // 3. Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide at least 10 characters describing your project." },
        { status: 400 }
      );
    }

    // Update rate limit timestamp
    rateLimitMap.set(ip, now);

    const finalSubject =
      subject?.trim() ||
      (projectType ? `[Project Brief] ${projectType} — ${name.trim()}` : `New message from ${name.trim()}`);

    const briefDetails = {
      projectType: projectType || "General Inquiry",
      budget: budget || "Not specified",
      timeline: timeline || "Not specified",
      attachments: Array.isArray(attachments) ? attachments : [],
    };

    // 4. Save to PostgreSQL database
    const [inserted] = await db
      .insert(messages)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: finalSubject,
        content: description.trim(),
        briefDetails,
        status: "new",
        ipAddress: ip,
      })
      .returning();

    // Bust messages cache in admin
    revalidateTag("messages");

    // 5. Send Email via Resend REST API if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL || "contact@lonnex.dev";

    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "The Hive <portfolio@lonnex.dev>",
            to: [recipientEmail],
            reply_to: email.trim(),
            subject: `[Hive Brief] ${finalSubject}`,
            html: `
              <h2>New Project Brief Received</h2>
              <p><strong>From:</strong> ${name.trim()} (${email.trim()})</p>
              <p><strong>Project Type:</strong> ${briefDetails.projectType}</p>
              <p><strong>Budget:</strong> ${briefDetails.budget}</p>
              <p><strong>Timeline:</strong> ${briefDetails.timeline}</p>
              <hr/>
              <h3>Project Description:</h3>
              <p style="white-space: pre-wrap;">${description.trim()}</p>
              ${
                briefDetails.attachments.length > 0
                  ? `<p><strong>Attachments:</strong> ${briefDetails.attachments.join(", ")}</p>`
                  : ""
              }
            `,
          }),
        });
      } catch (emailErr) {
        console.error("[Resend Email Error]:", emailErr);
        // Do not fail the submission if email delivery errors; message is safe in DB
      }
    }

    return NextResponse.json({
      success: true,
      id: inserted.id,
      message: "Your project brief has been received. I will be in touch within 24-48 hours.",
    });
  } catch (error) {
    console.error("[Contact API Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
