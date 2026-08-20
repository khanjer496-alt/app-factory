import type { Env } from "../env";

function wrap(title: string, body: string, actionLabel?: string, actionUrl?: string) {
  const action = actionUrl ? `<p><a href="${actionUrl}" style="display:inline-block;padding:12px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px">${actionLabel}</a></p>` : "";
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#111"><div style="max-width:560px;margin:0 auto;padding:32px 20px"><h1>${title}</h1><p>${body}</p>${action}</div></body></html>`;
}

export async function sendEmail(env: Env, input: { to: string; subject: string; text: string; html?: string }) {
  if (!env.EMAIL) {
    if (env.APP_ENV !== "production") console.info("[email:dev]", input.subject, input.to, input.text);
    return;
  }
  await env.EMAIL.send({ to: input.to, from: env.EMAIL_FROM, subject: input.subject, text: input.text, html: input.html });
}

export function sendVerification(env: Env, to: string, url: string) {
  return sendEmail(env, { to, subject: `Verify your email for ${env.APP_NAME}`, text: `Verify your email: ${url}`, html: wrap(`Verify your email`, `Confirm this email address to finish setting up ${env.APP_NAME}.`, "Verify email", url) });
}
export function sendReset(env: Env, to: string, url: string) {
  return sendEmail(env, { to, subject: `Reset your ${env.APP_NAME} password`, text: `Reset your password: ${url}`, html: wrap("Reset your password", "Use this link to choose a new password. If you did not request this, ignore this message.", "Reset password", url) });
}
export function sendPaymentFailed(env: Env, to: string) {
  return sendEmail(env, { to, subject: `${env.APP_NAME} payment failed`, text: `Your latest payment failed. Visit ${env.APP_URL}/app to update billing.`, html: wrap("Payment failed", "Update your billing details to avoid interruption.", "Manage billing", `${env.APP_URL}/app`) });
}

export function sendDeleteVerification(env: Env, to: string, url: string) {
  return sendEmail(env, { to, subject: `Confirm deletion of your ${env.APP_NAME} account`, text: `Confirm permanent account deletion: ${url}`, html: wrap("Confirm account deletion", "This permanently deletes your account and product data. If you did not request this, ignore this message.", "Delete my account", url) });
}
