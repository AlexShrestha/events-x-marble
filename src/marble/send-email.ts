/**
 * SMTP send wrapper around nodemailer — used by the autonomous weekly cron.
 *
 * For Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER=<your_gmail>,
 * SMTP_PASS=<16-char App Password>. Generate App Password at
 * https://myaccount.google.com/apppasswords (requires 2-step verification).
 *
 * If SMTP_* env vars aren't set, sendEmail() returns { ok: false, error: 'not configured' }
 * — callers can decide whether to fail or fall back. This module never touches the marble KG.
 */
import nodemailer from "nodemailer";
import { env } from "../env.ts";

export interface SendInput {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface SendResult {
  ok: boolean;
  messageId?: string;
  accepted?: string[];
  rejected?: string[];
  error?: string;
}

export async function sendEmail(input: SendInput): Promise<SendResult> {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return { ok: false, error: "SMTP not configured (need SMTP_HOST + SMTP_USER + SMTP_PASS)" };
  }
  const from = env.SMTP_FROM || env.SMTP_USER;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // TLS for 465, STARTTLS for 587
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    // Short, predictable timeouts so a cron run doesn't hang forever.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  });

  try {
    const info = await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.textBody,
      html: input.htmlBody,
    });
    return {
      ok: true,
      messageId: info.messageId,
      accepted: (info.accepted as string[]) ?? [],
      rejected: (info.rejected as string[]) ?? [],
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    transporter.close();
  }
}
