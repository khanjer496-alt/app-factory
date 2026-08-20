/**
 * Minimal inbound Email Routing handler pattern.
 *
 * Route addresses such as support@yourdomain.com to this Worker in the
 * Cloudflare dashboard. The destination used by message.forward() must be a
 * verified destination address in the Cloudflare account.
 */

export interface ForwardableEmailMessage {
  from: string;
  to: string;
  raw: ReadableStream;
  headers: Headers;
  forward(destination: string): Promise<void>;
  setReject(reason: string): void;
}

export async function handleInboundEmail(
  message: ForwardableEmailMessage,
  options: { supportForwardTo: string; allowedDomain?: string },
): Promise<void> {
  if (options.allowedDomain && !message.to.toLowerCase().endsWith(`@${options.allowedDomain.toLowerCase()}`)) {
    message.setReject("Recipient not accepted");
    return;
  }

  // Keep v1 intentionally simple: Cloudflare handles receipt and this adapter
  // forwards to a verified support mailbox. Add parsing/AI workflows only when
  // a product has a real need and appropriate prompt-injection/data controls.
  await message.forward(options.supportForwardTo);
}
