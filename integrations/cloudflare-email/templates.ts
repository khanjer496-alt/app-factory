import type { EmailTemplate } from "./email";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function actionTemplate(input: {
  preview: string;
  title: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
}): EmailTemplate {
  const title = escapeHtml(input.title);
  const body = escapeHtml(input.body);
  const label = escapeHtml(input.actionLabel);
  const url = escapeHtml(input.actionUrl);

  return {
    subject: input.title,
    text: `${input.body}\n\n${input.actionLabel}: ${input.actionUrl}`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#111"><div style="max-width:560px;margin:0 auto;padding:32px 20px"><p style="font-size:12px;color:#666">${escapeHtml(input.preview)}</p><h1 style="font-size:24px">${title}</h1><p>${body}</p><p><a href="${url}" style="display:inline-block;padding:12px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px">${label}</a></p><p style="font-size:12px;color:#666;word-break:break-all">${url}</p></div></body></html>`,
  };
}

export function verificationEmail(input: { appName: string; verifyUrl: string }): EmailTemplate {
  return actionTemplate({
    preview: `Verify your ${input.appName} email`,
    title: `Verify your email for ${input.appName}`,
    body: "Confirm this email address to finish setting up your account.",
    actionLabel: "Verify email",
    actionUrl: input.verifyUrl,
  });
}

export function passwordResetEmail(input: { appName: string; resetUrl: string }): EmailTemplate {
  return actionTemplate({
    preview: `Reset your ${input.appName} password`,
    title: `Reset your ${input.appName} password`,
    body: "Use the link below to choose a new password. If you did not request this, you can ignore this email.",
    actionLabel: "Reset password",
    actionUrl: input.resetUrl,
  });
}

export function welcomeEmail(input: { appName: string; appUrl: string }): EmailTemplate {
  return actionTemplate({
    preview: `Welcome to ${input.appName}`,
    title: `Welcome to ${input.appName}`,
    body: "Your account is ready.",
    actionLabel: "Open app",
    actionUrl: input.appUrl,
  });
}

export function paymentFailedEmail(input: { appName: string; billingUrl: string }): EmailTemplate {
  return actionTemplate({
    preview: `${input.appName} billing needs attention`,
    title: "Payment failed",
    body: "We could not process your latest payment. Update your billing details to avoid interruption.",
    actionLabel: "Update billing",
    actionUrl: input.billingUrl,
  });
}
