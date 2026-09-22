// Server-only transactional email helpers.
// Uses the Resend REST API directly so it runs in edge or Node runtimes without dependencies.

const RESEND_API = "https://api.resend.com/emails";

// User-supplied strings (contact form name/subject/message, donor name, etc.)
// are interpolated into these HTML email templates below. Escape them so a
// submission like `<img src=x onerror=...>` can't inject markup or scripts
// into the rendered email.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailConfigured(): boolean {
  return Boolean(process.env["RESEND_API_KEY"]);
}

function defaultFrom(): string {
  return (
    process.env["EMAIL_FROM"] ||
    "Willow Student Wellbeing <notifications@your-campus-calm.lovable.app>"
  );
}

export function supportEmail(): string {
  return process.env["SUPPORT_EMAIL"] || "support.campuswell@gmail.com";
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const key = process.env["RESEND_API_KEY"];
  const recipient = Array.isArray(opts.to) ? opts.to.join(", ") : opts.to;

  if (!key) {
    // Graceful simulation: log email when keys are not configured
    console.info(
      `[Transactional Email (Simulated)] To: ${recipient} | Subject: "${opts.subject}"\n${opts.text}\n`,
    );
    return { ok: true, simulated: true };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: defaultFrom(),
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        reply_to: opts.replyTo,
      }),
    });

    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      console.error("[Transactional Email Error]", data);
      return { ok: false, error: String(data["message"] ?? "Failed to send email") };
    }

    return { ok: true, messageId: String(data["id"] ?? "") };
  } catch (err) {
    console.error("[Transactional Email Exception]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Reusable email wrapper styling
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willow Student Wellbeing</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8faf9; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px; background-color: #064e3b; color: #ffffff; text-align: left;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 600; letter-spacing: -0.02em;">Willow</h1>
              <p style="margin: 4px 0 0; font-size: 13px; color: #a7f3d0;">Student Mental Health & Counselling</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px; line-height: 1.6; font-size: 15px; color: #334155;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px;">Private & confidential student wellbeing support.</p>
              <p style="margin: 0;">If you are experiencing an emergency, please visit our <a href="https://your-campus-calm.lovable.app/get-help" style="color: #059669; text-decoration: underline;">Get Help Now</a> page.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 1. Appointment Notification (Booking requested or confirmed)
export async function sendAppointmentEmail(opts: {
  to: string;
  studentName?: string | null;
  counsellorName: string;
  counsellorKind: "professional" | "peer";
  startsAt: string;
  format: string;
  durationMinutes: number;
  status: "requested" | "confirmed";
  note?: string | null;
}) {
  const formattedDate = new Date(opts.startsAt).toLocaleString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject =
    opts.status === "confirmed"
      ? `Session Confirmed: ${opts.counsellorName} on ${formattedDate}`
      : `Session Requested: ${opts.counsellorName} on ${formattedDate}`;

  const greeting = opts.studentName ? `Hi ${escapeHtml(opts.studentName)},` : "Hello,";

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">
      ${opts.status === "confirmed" ? "Your session is confirmed" : "We received your session request"}
    </h2>
    <p style="margin: 0 0 20px;">${greeting}</p>
    <p style="margin: 0 0 20px;">
      ${
        opts.status === "confirmed"
          ? "Your counselling session has been confirmed. Below are your session details:"
          : "We have received your session request and will confirm it shortly. Below are your request details:"
      }
    </p>

    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Counsellor:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${escapeHtml(opts.counsellorName)} (${opts.counsellorKind === "peer" ? "Peer Counsellor" : "Professional Counsellor"})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Date & Time:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Duration:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${opts.durationMinutes} minutes</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Format:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; text-transform: capitalize;">${opts.format.replace("_", " ")}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
      You can manage, view, or reschedule your appointments directly in your private Willow dashboard.
    </p>

    <div style="text-align: center; margin: 30px 0 10px;">
      <a href="https://your-campus-calm.lovable.app/dashboard" style="background-color: #059669; color: #ffffff; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-weight: 500; display: inline-block;">
        Open Your Dashboard
      </a>
    </div>
  `);

  const text = `${greeting}\n\n${
    opts.status === "confirmed" ? "Your session is confirmed!" : "We received your session request."
  }\n\nCounsellor: ${opts.counsellorName}\nDate & Time: ${formattedDate}\nDuration: ${opts.durationMinutes} mins\nFormat: ${opts.format}\n\nAccess your dashboard: https://your-campus-calm.lovable.app/dashboard`;

  return sendEmail({ to: opts.to, subject, html, text });
}

// 2. Payment Receipt Email (M-Pesa or Card)
export async function sendPaymentReceiptEmail(opts: {
  to: string;
  studentName?: string | null;
  amount: number;
  currency: string;
  method: "mpesa" | "card" | string;
  reference: string;
  receiptNumber?: string | null;
}) {
  const subject = `Payment Receipt: ${opts.currency} ${opts.amount.toLocaleString()} (Ref: ${opts.reference})`;
  const greeting = opts.studentName ? `Hi ${escapeHtml(opts.studentName)},` : "Hello,";

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">Payment Received</h2>
    <p style="margin: 0 0 20px;">${greeting}</p>
    <p style="margin: 0 0 20px;">
      Thank you for your payment. Your counselling session payment has been successfully recorded.
    </p>

    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Amount Paid:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #059669;">${opts.currency} ${opts.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Payment Method:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; text-transform: uppercase;">${opts.method}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Reference:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${opts.reference}</td>
        </tr>
        ${
          opts.receiptNumber
            ? `<tr>
                <td style="padding: 6px 0; color: #64748b;">Receipt Number:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right;">${opts.receiptNumber}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Date:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${new Date().toLocaleDateString("en-KE")}</td>
        </tr>
      </table>
    </div>

    <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
      Your session is now confirmed. Please check your dashboard for scheduling details and links.
    </p>
  `);

  const text = `${greeting}\n\nPayment Received!\n\nAmount: ${opts.currency} ${opts.amount}\nMethod: ${opts.method}\nReference: ${opts.reference}\nReceipt: ${opts.receiptNumber ?? "N/A"}\n\nDashboard: https://your-campus-calm.lovable.app/dashboard`;

  return sendEmail({ to: opts.to, subject, html, text });
}

// 3. Donation Receipt Email
export async function sendDonationReceiptEmail(opts: {
  to: string;
  donorName?: string | null;
  amount: number;
  currency: string;
  tier: string;
  reference: string;
  receiptNumber?: string | null;
}) {
  const subject = `Thank you for supporting Willow! Donation Receipt (Ref: ${opts.reference})`;
  const greeting = opts.donorName ? `Dear ${escapeHtml(opts.donorName)},` : "Dear Supporter,";

  const html = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #064e3b;">Thank you for your generous support!</h2>
    <p style="margin: 0 0 20px;">${greeting}</p>
    <p style="margin: 0 0 20px;">
      Your donation directly funds subsidised counselling sessions and maintains our peer support network. Every single contribution helps university and college students access the compassionate care they deserve.
    </p>

    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #065f46;">Donation Amount:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #047857;">${opts.currency} ${opts.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #065f46;">Support Tier:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; text-transform: capitalize;">${opts.tier}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #065f46;">Reference:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${opts.reference}</td>
        </tr>
        ${
          opts.receiptNumber
            ? `<tr>
                <td style="padding: 6px 0; color: #065f46;">Receipt Number:</td>
                <td style="padding: 6px 0; font-weight: 600; text-align: right;">${opts.receiptNumber}</td>
              </tr>`
            : ""
        }
      </table>
    </div>

    <p style="margin: 0; font-size: 14px; color: #475569;">
      With gratitude,<br/>
      <strong>The Willow Student Wellbeing Team</strong>
    </p>
  `);

  const text = `${greeting}\n\nThank you for supporting Willow Student Wellbeing!\n\nAmount: ${opts.currency} ${opts.amount}\nTier: ${opts.tier}\nReference: ${opts.reference}\nReceipt: ${opts.receiptNumber ?? "N/A"}\n\nYour support helps keep mental health care accessible for students.`;

  return sendEmail({ to: opts.to, subject, html, text });
}

// 4. Contact Enquiry (Student acknowledgement + Support alert)
export async function sendContactNotificationEmails(opts: {
  studentName: string;
  studentEmail: string;
  subject: string;
  message: string;
}) {
  // 1. Acknowledgement to the sender
  const safeName = escapeHtml(opts.studentName);
  const safeSubject = escapeHtml(opts.subject);
  const safeMessage = escapeHtml(opts.message);

  const studentHtml = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">We received your enquiry</h2>
    <p style="margin: 0 0 20px;">Hi ${safeName},</p>
    <p style="margin: 0 0 20px;">
      Thank you for reaching out to Willow. We have received your message regarding "<strong>${safeSubject}</strong>" and our team will get back to you within one working day.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 14px; color: #475569;">
      <p style="margin: 0 0 6px; font-weight: 600; color: #1e293b;">Your message:</p>
      <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
    </div>

    <p style="margin: 0; font-size: 13px; color: #64748b;">
      Note: If you are in immediate distress, please do not wait for an email reply. Visit our <a href="https://your-campus-calm.lovable.app/get-help" style="color: #059669; text-decoration: underline;">Get Help Now</a> page for 24/7 emergency helplines.
    </p>
  `);

  await sendEmail({
    to: opts.studentEmail,
    subject: `We received your enquiry: ${opts.subject}`,
    html: studentHtml,
    text: `Hi ${opts.studentName},\n\nWe received your enquiry regarding "${opts.subject}". Our team will reply within one working day.\n\nYour message:\n${opts.message}`,
  });

  // 2. Alert to support inbox
  const supportHtml = emailWrapper(`
    <h2 style="margin: 0 0 16px; font-size: 18px; color: #064e3b;">New Student Enquiry Received</h2>
    <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 14px;">
      <p style="margin: 0 0 6px;"><strong>From:</strong> ${safeName} (${escapeHtml(opts.studentEmail)})</p>
      <p style="margin: 0 0 6px;"><strong>Subject:</strong> ${safeSubject}</p>
      <p style="margin: 0 0 6px;"><strong>Date:</strong> ${new Date().toISOString()}</p>
    </div>
    <div style="padding: 16px; border-left: 3px solid #059669; background-color: #f8fafc; font-size: 14px;">
      <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
    </div>
  `);

  await sendEmail({
    to: supportEmail(),
    replyTo: opts.studentEmail,
    subject: `[Contact Enquiry] ${opts.subject} — from ${opts.studentName}`,
    html: supportHtml,
    text: `New enquiry from ${opts.studentName} (${opts.studentEmail})\nSubject: ${opts.subject}\n\n${opts.message}`,
  });
}